import { Constants, getIdFromLink, getPathFromLink, ResourceType, StatusCodes, SubStatusCodes, } from "../common";
import { DefaultQueryExecutionContext } from "./defaultQueryExecutionContext";
import { FetchResult, FetchResultType } from "./FetchResult";
import { getInitialHeader, mergeHeaders } from "./headerUtils";
/** @hidden */
export class DocumentProducer {
    /**
     * Provides the Target Partition Range Query Execution Context.
     * @param clientContext  - The service endpoint to use to create the client.
     * @param collectionLink - Represents collection link
     * @param query          - A SQL query.
     * @param targetPartitionKeyRange - Query Target Partition key Range
     * @hidden
     */
    constructor(clientContext, collectionLink, query, targetPartitionKeyRange, options) {
        this.clientContext = clientContext;
        this.generation = 0;
        this.fetchFunction = async (options) => {
            const path = getPathFromLink(this.collectionLink, ResourceType.item);
            const id = getIdFromLink(this.collectionLink);
            return this.clientContext.queryFeed({
                path,
                resourceType: ResourceType.item,
                resourceId: id,
                resultFn: (result) => result.Documents,
                query: this.query,
                options,
                partitionKeyRangeId: this.targetPartitionKeyRange["id"],
            });
        };
        // TODO: any options
        this.collectionLink = collectionLink;
        this.query = query;
        this.targetPartitionKeyRange = targetPartitionKeyRange;
        this.fetchResults = [];
        this.allFetched = false;
        this.err = undefined;
        this.previousContinuationToken = undefined;
        this.continuationToken = undefined;
        this.respHeaders = getInitialHeader();
        this.internalExecutionContext = new DefaultQueryExecutionContext(options, this.fetchFunction);
    }
    /**
     * Synchronously gives the contiguous buffered results (stops at the first non result) if any
     * @returns buffered current items if any
     * @hidden
     */
    peekBufferedItems() {
        const bufferedResults = [];
        for (let i = 0, done = false; i < this.fetchResults.length && !done; i++) {
            const fetchResult = this.fetchResults[i];
            switch (fetchResult.fetchResultType) {
                case FetchResultType.Done:
                    done = true;
                    break;
                case FetchResultType.Exception:
                    done = true;
                    break;
                case FetchResultType.Result:
                    bufferedResults.push(fetchResult.feedResponse);
                    break;
            }
        }
        return bufferedResults;
    }
    hasMoreResults() {
        return this.internalExecutionContext.hasMoreResults() || this.fetchResults.length !== 0;
    }
    gotSplit() {
        const fetchResult = this.fetchResults[0];
        if (fetchResult.fetchResultType === FetchResultType.Exception) {
            if (DocumentProducer._needPartitionKeyRangeCacheRefresh(fetchResult.error)) {
                return true;
            }
        }
        return false;
    }
    _getAndResetActiveResponseHeaders() {
        const ret = this.respHeaders;
        this.respHeaders = getInitialHeader();
        return ret;
    }
    _updateStates(err, allFetched) {
        // TODO: any Error
        if (err) {
            this.err = err;
            return;
        }
        if (allFetched) {
            this.allFetched = true;
        }
        if (this.internalExecutionContext.continuationToken === this.continuationToken) {
            // nothing changed
            return;
        }
        this.previousContinuationToken = this.continuationToken;
        this.continuationToken = this.internalExecutionContext.continuationToken;
    }
    static _needPartitionKeyRangeCacheRefresh(error) {
        // TODO: error
        return (error.code === StatusCodes.Gone &&
            "substatus" in error &&
            error["substatus"] === SubStatusCodes.PartitionKeyRangeGone);
    }
    /**
     * Fetches and bufferes the next page of results and executes the given callback
     */
    async bufferMore() {
        if (this.err) {
            throw this.err;
        }
        try {
            const { result: resources, headers: headerResponse } = await this.internalExecutionContext.fetchMore();
            ++this.generation;
            this._updateStates(undefined, resources === undefined);
            if (resources !== undefined) {
                // some more results
                resources.forEach((element) => {
                    // TODO: resources any
                    this.fetchResults.push(new FetchResult(element, undefined));
                });
            }
            // need to modify the header response so that the query metrics are per partition
            if (headerResponse != null && Constants.HttpHeaders.QueryMetrics in headerResponse) {
                // "0" is the default partition before one is actually assigned.
                const queryMetrics = headerResponse[Constants.HttpHeaders.QueryMetrics]["0"];
                // Wraping query metrics in a object where the keys are the partition key range.
                headerResponse[Constants.HttpHeaders.QueryMetrics] = {};
                headerResponse[Constants.HttpHeaders.QueryMetrics][this.targetPartitionKeyRange.id] =
                    queryMetrics;
            }
            return { result: resources, headers: headerResponse };
        }
        catch (err) {
            // TODO: any error
            if (DocumentProducer._needPartitionKeyRangeCacheRefresh(err)) {
                // Split just happend
                // Buffer the error so the execution context can still get the feedResponses in the itemBuffer
                const bufferedError = new FetchResult(undefined, err);
                this.fetchResults.push(bufferedError);
                // Putting a dummy result so that the rest of code flows
                return { result: [bufferedError], headers: err.headers };
            }
            else {
                this._updateStates(err, err.resources === undefined);
                throw err;
            }
        }
    }
    /**
     * Synchronously gives the bufferend current item if any
     * @returns buffered current item if any
     * @hidden
     */
    getTargetParitionKeyRange() {
        return this.targetPartitionKeyRange;
    }
    /**
     * Fetches the next element in the DocumentProducer.
     */
    async nextItem() {
        if (this.err) {
            this._updateStates(this.err, undefined);
            throw this.err;
        }
        try {
            const { result, headers } = await this.current();
            const fetchResult = this.fetchResults.shift();
            this._updateStates(undefined, result === undefined);
            if (fetchResult.feedResponse !== result) {
                throw new Error(`Expected ${fetchResult.feedResponse} to equal ${result}`);
            }
            switch (fetchResult.fetchResultType) {
                case FetchResultType.Done:
                    return { result: undefined, headers };
                case FetchResultType.Exception:
                    fetchResult.error.headers = headers;
                    throw fetchResult.error;
                case FetchResultType.Result:
                    return { result: fetchResult.feedResponse, headers };
            }
        }
        catch (err) {
            this._updateStates(err, err.item === undefined);
            throw err;
        }
    }
    /**
     * Retrieve the current element on the DocumentProducer.
     */
    async current() {
        // If something is buffered just give that
        if (this.fetchResults.length > 0) {
            const fetchResult = this.fetchResults[0];
            // Need to unwrap fetch results
            switch (fetchResult.fetchResultType) {
                case FetchResultType.Done:
                    return {
                        result: undefined,
                        headers: this._getAndResetActiveResponseHeaders(),
                    };
                case FetchResultType.Exception:
                    fetchResult.error.headers = this._getAndResetActiveResponseHeaders();
                    throw fetchResult.error;
                case FetchResultType.Result:
                    return {
                        result: fetchResult.feedResponse,
                        headers: this._getAndResetActiveResponseHeaders(),
                    };
            }
        }
        // If there isn't anymore items left to fetch then let the user know.
        if (this.allFetched) {
            return {
                result: undefined,
                headers: this._getAndResetActiveResponseHeaders(),
            };
        }
        // If there are no more bufferd items and there are still items to be fetched then buffer more
        const { result, headers } = await this.bufferMore();
        mergeHeaders(this.respHeaders, headers);
        if (result === undefined) {
            return { result: undefined, headers: this.respHeaders };
        }
        return this.current();
    }
}
//# sourceMappingURL=documentProducer.js.map