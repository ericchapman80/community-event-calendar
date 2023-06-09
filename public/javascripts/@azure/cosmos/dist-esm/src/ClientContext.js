// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { v4 } from "uuid";
const uuid = v4;
import { bearerTokenAuthenticationPolicy, createEmptyPipeline, } from "@azure/core-rest-pipeline";
import { Constants, HTTPMethod, OperationType, ResourceType } from "./common/constants";
import { getIdFromLink, getPathFromLink, parseLink } from "./common/helper";
import { StatusCodes, SubStatusCodes } from "./common/statusCodes";
import { ConsistencyLevel, DatabaseAccount } from "./documents";
import { PluginOn, executePlugins } from "./plugins/Plugin";
import { QueryIterator } from "./queryIterator";
import { getHeaders } from "./request/request";
import { RequestHandler } from "./request/RequestHandler";
import { SessionContainer } from "./session/sessionContainer";
import { sanitizeEndpoint } from "./utils/checkURL";
import { createClientLogger } from "@azure/logger";
const logger = createClientLogger("ClientContext");
const QueryJsonContentType = "application/query+json";
/**
 * @hidden
 * @hidden
 */
export class ClientContext {
    constructor(cosmosClientOptions, globalEndpointManager) {
        this.cosmosClientOptions = cosmosClientOptions;
        this.globalEndpointManager = globalEndpointManager;
        this.connectionPolicy = cosmosClientOptions.connectionPolicy;
        this.sessionContainer = new SessionContainer();
        this.partitionKeyDefinitionCache = {};
        this.pipeline = null;
        if (cosmosClientOptions.aadCredentials) {
            this.pipeline = createEmptyPipeline();
            const hrefEndpoint = sanitizeEndpoint(cosmosClientOptions.endpoint);
            const scope = `${hrefEndpoint}/.default`;
            this.pipeline.addPolicy(bearerTokenAuthenticationPolicy({
                credential: cosmosClientOptions.aadCredentials,
                scopes: scope,
                challengeCallbacks: {
                    async authorizeRequest({ request, getAccessToken }) {
                        const tokenResponse = await getAccessToken([scope], {});
                        const AUTH_PREFIX = `type=aad&ver=1.0&sig=`;
                        const authorizationToken = `${AUTH_PREFIX}${tokenResponse.token}`;
                        request.headers.set("Authorization", authorizationToken);
                    },
                },
            }));
        }
    }
    /** @hidden */
    async read({ path, resourceType, resourceId, options = {}, partitionKey, }) {
        try {
            const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.get, path, operationType: OperationType.Read, resourceId,
                options,
                resourceType,
                partitionKey });
            request.headers = await this.buildHeaders(request);
            this.applySessionToken(request);
            // read will use ReadEndpoint since it uses GET operation
            request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
            const response = await executePlugins(request, RequestHandler.request, PluginOn.operation);
            this.captureSessionToken(undefined, path, OperationType.Read, response.headers);
            return response;
        }
        catch (err) {
            this.captureSessionToken(err, path, OperationType.Upsert, err.headers);
            throw err;
        }
    }
    async queryFeed({ path, resourceType, resourceId, resultFn, query, options, partitionKeyRangeId, partitionKey, }) {
        // Query operations will use ReadEndpoint even though it uses
        // GET(for queryFeed) and POST(for regular query operations)
        const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.get, path, operationType: OperationType.Query, partitionKeyRangeId,
            resourceId,
            resourceType,
            options, body: query, partitionKey });
        const requestId = uuid();
        if (query !== undefined) {
            request.method = HTTPMethod.post;
        }
        request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
        request.headers = await this.buildHeaders(request);
        if (query !== undefined) {
            request.headers[Constants.HttpHeaders.IsQuery] = "true";
            request.headers[Constants.HttpHeaders.ContentType] = QueryJsonContentType;
            if (typeof query === "string") {
                request.body = { query }; // Converts query text to query object.
            }
        }
        this.applySessionToken(request);
        logger.info("query " +
            requestId +
            " started" +
            (request.partitionKeyRangeId ? " pkrid: " + request.partitionKeyRangeId : ""));
        logger.verbose(request);
        const start = Date.now();
        const response = await RequestHandler.request(request);
        logger.info("query " + requestId + " finished - " + (Date.now() - start) + "ms");
        this.captureSessionToken(undefined, path, OperationType.Query, response.headers);
        return this.processQueryFeedResponse(response, !!query, resultFn);
    }
    async getQueryPlan(path, resourceType, resourceId, query, options = {}) {
        const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.post, path, operationType: OperationType.Read, resourceId,
            resourceType,
            options, body: query });
        request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
        request.headers = await this.buildHeaders(request);
        request.headers[Constants.HttpHeaders.IsQueryPlan] = "True";
        request.headers[Constants.HttpHeaders.QueryVersion] = "1.4";
        request.headers[Constants.HttpHeaders.SupportedQueryFeatures] =
            "NonValueAggregate, Aggregate, Distinct, MultipleOrderBy, OffsetAndLimit, OrderBy, Top, CompositeAggregate, GroupBy, MultipleAggregates";
        request.headers[Constants.HttpHeaders.ContentType] = QueryJsonContentType;
        if (typeof query === "string") {
            request.body = { query }; // Converts query text to query object.
        }
        this.applySessionToken(request);
        const response = await RequestHandler.request(request);
        this.captureSessionToken(undefined, path, OperationType.Query, response.headers);
        return response;
    }
    queryPartitionKeyRanges(collectionLink, query, options) {
        const path = getPathFromLink(collectionLink, ResourceType.pkranges);
        const id = getIdFromLink(collectionLink);
        const cb = (innerOptions) => {
            return this.queryFeed({
                path,
                resourceType: ResourceType.pkranges,
                resourceId: id,
                resultFn: (result) => result.PartitionKeyRanges,
                query,
                options: innerOptions,
            });
        };
        return new QueryIterator(this, query, options, cb);
    }
    async delete({ path, resourceType, resourceId, options = {}, partitionKey, }) {
        try {
            const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.delete, operationType: OperationType.Delete, path,
                resourceType,
                options,
                resourceId,
                partitionKey });
            request.headers = await this.buildHeaders(request);
            this.applySessionToken(request);
            // deleteResource will use WriteEndpoint since it uses DELETE operation
            request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
            const response = await executePlugins(request, RequestHandler.request, PluginOn.operation);
            if (parseLink(path).type !== "colls") {
                this.captureSessionToken(undefined, path, OperationType.Delete, response.headers);
            }
            else {
                this.clearSessionToken(path);
            }
            return response;
        }
        catch (err) {
            this.captureSessionToken(err, path, OperationType.Upsert, err.headers);
            throw err;
        }
    }
    async patch({ body, path, resourceType, resourceId, options = {}, partitionKey, }) {
        try {
            const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.patch, operationType: OperationType.Patch, path,
                resourceType,
                body,
                resourceId,
                options,
                partitionKey });
            request.headers = await this.buildHeaders(request);
            this.applySessionToken(request);
            // patch will use WriteEndpoint
            request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
            const response = await executePlugins(request, RequestHandler.request, PluginOn.operation);
            this.captureSessionToken(undefined, path, OperationType.Patch, response.headers);
            return response;
        }
        catch (err) {
            this.captureSessionToken(err, path, OperationType.Upsert, err.headers);
            throw err;
        }
    }
    async create({ body, path, resourceType, resourceId, options = {}, partitionKey, }) {
        try {
            const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.post, operationType: OperationType.Create, path,
                resourceType,
                resourceId,
                body,
                options,
                partitionKey });
            request.headers = await this.buildHeaders(request);
            // create will use WriteEndpoint since it uses POST operation
            this.applySessionToken(request);
            request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
            const response = await executePlugins(request, RequestHandler.request, PluginOn.operation);
            this.captureSessionToken(undefined, path, OperationType.Create, response.headers);
            return response;
        }
        catch (err) {
            this.captureSessionToken(err, path, OperationType.Upsert, err.headers);
            throw err;
        }
    }
    processQueryFeedResponse(res, isQuery, resultFn) {
        if (isQuery) {
            return { result: resultFn(res.result), headers: res.headers, code: res.code };
        }
        else {
            const newResult = resultFn(res.result).map((body) => body);
            return { result: newResult, headers: res.headers, code: res.code };
        }
    }
    applySessionToken(requestContext) {
        const request = this.getSessionParams(requestContext.path);
        if (requestContext.headers && requestContext.headers[Constants.HttpHeaders.SessionToken]) {
            return;
        }
        const sessionConsistency = requestContext.headers[Constants.HttpHeaders.ConsistencyLevel];
        if (!sessionConsistency) {
            return;
        }
        if (sessionConsistency !== ConsistencyLevel.Session) {
            return;
        }
        if (request.resourceAddress) {
            const sessionToken = this.sessionContainer.get(request);
            if (sessionToken) {
                requestContext.headers[Constants.HttpHeaders.SessionToken] = sessionToken;
            }
        }
    }
    async replace({ body, path, resourceType, resourceId, options = {}, partitionKey, }) {
        try {
            const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.put, operationType: OperationType.Replace, path,
                resourceType,
                body,
                resourceId,
                options,
                partitionKey });
            request.headers = await this.buildHeaders(request);
            this.applySessionToken(request);
            // replace will use WriteEndpoint since it uses PUT operation
            request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
            const response = await executePlugins(request, RequestHandler.request, PluginOn.operation);
            this.captureSessionToken(undefined, path, OperationType.Replace, response.headers);
            return response;
        }
        catch (err) {
            this.captureSessionToken(err, path, OperationType.Upsert, err.headers);
            throw err;
        }
    }
    async upsert({ body, path, resourceType, resourceId, options = {}, partitionKey, }) {
        try {
            const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.post, operationType: OperationType.Upsert, path,
                resourceType,
                body,
                resourceId,
                options,
                partitionKey });
            request.headers = await this.buildHeaders(request);
            request.headers[Constants.HttpHeaders.IsUpsert] = true;
            this.applySessionToken(request);
            // upsert will use WriteEndpoint since it uses POST operation
            request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
            const response = await executePlugins(request, RequestHandler.request, PluginOn.operation);
            this.captureSessionToken(undefined, path, OperationType.Upsert, response.headers);
            return response;
        }
        catch (err) {
            this.captureSessionToken(err, path, OperationType.Upsert, err.headers);
            throw err;
        }
    }
    async execute({ sprocLink, params, options = {}, partitionKey, }) {
        // Accept a single parameter or an array of parameters.
        // Didn't add type annotation for this because we should legacy this behavior
        if (params !== null && params !== undefined && !Array.isArray(params)) {
            params = [params];
        }
        const path = getPathFromLink(sprocLink);
        const id = getIdFromLink(sprocLink);
        const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.post, operationType: OperationType.Execute, path, resourceType: ResourceType.sproc, options, resourceId: id, body: params, partitionKey });
        request.headers = await this.buildHeaders(request);
        // executeStoredProcedure will use WriteEndpoint since it uses POST operation
        request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
        return executePlugins(request, RequestHandler.request, PluginOn.operation);
    }
    /**
     * Gets the Database account information.
     * @param options - `urlConnection` in the options is the endpoint url whose database account needs to be retrieved.
     * If not present, current client's url will be used.
     */
    async getDatabaseAccount(options = {}) {
        const endpoint = options.urlConnection || this.cosmosClientOptions.endpoint;
        const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { endpoint, method: HTTPMethod.get, operationType: OperationType.Read, path: "", resourceType: ResourceType.none, options });
        request.headers = await this.buildHeaders(request);
        // await options.beforeOperation({ endpoint, request, headers: requestHeaders });
        const { result, headers } = await executePlugins(request, RequestHandler.request, PluginOn.operation);
        const databaseAccount = new DatabaseAccount(result, headers);
        return { result: databaseAccount, headers };
    }
    getWriteEndpoint() {
        return this.globalEndpointManager.getWriteEndpoint();
    }
    getReadEndpoint() {
        return this.globalEndpointManager.getReadEndpoint();
    }
    getWriteEndpoints() {
        return this.globalEndpointManager.getWriteEndpoints();
    }
    getReadEndpoints() {
        return this.globalEndpointManager.getReadEndpoints();
    }
    async batch({ body, path, partitionKey, resourceId, options = {}, }) {
        try {
            const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.post, operationType: OperationType.Batch, path,
                body, resourceType: ResourceType.item, resourceId,
                options,
                partitionKey });
            request.headers = await this.buildHeaders(request);
            request.headers[Constants.HttpHeaders.IsBatchRequest] = true;
            request.headers[Constants.HttpHeaders.IsBatchAtomic] = true;
            this.applySessionToken(request);
            request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
            const response = await executePlugins(request, RequestHandler.request, PluginOn.operation);
            this.captureSessionToken(undefined, path, OperationType.Batch, response.headers);
            return response;
        }
        catch (err) {
            this.captureSessionToken(err, path, OperationType.Upsert, err.headers);
            throw err;
        }
    }
    async bulk({ body, path, partitionKeyRangeId, resourceId, bulkOptions = {}, options = {}, }) {
        try {
            const request = Object.assign(Object.assign({}, this.getContextDerivedPropsForRequestCreation()), { method: HTTPMethod.post, operationType: OperationType.Batch, path,
                body, resourceType: ResourceType.item, resourceId,
                options });
            request.headers = await this.buildHeaders(request);
            request.headers[Constants.HttpHeaders.IsBatchRequest] = true;
            request.headers[Constants.HttpHeaders.PartitionKeyRangeID] = partitionKeyRangeId;
            request.headers[Constants.HttpHeaders.IsBatchAtomic] = false;
            request.headers[Constants.HttpHeaders.BatchContinueOnError] =
                bulkOptions.continueOnError || false;
            this.applySessionToken(request);
            request.endpoint = await this.globalEndpointManager.resolveServiceEndpoint(request.resourceType, request.operationType);
            const response = await executePlugins(request, RequestHandler.request, PluginOn.operation);
            this.captureSessionToken(undefined, path, OperationType.Batch, response.headers);
            return response;
        }
        catch (err) {
            this.captureSessionToken(err, path, OperationType.Upsert, err.headers);
            throw err;
        }
    }
    captureSessionToken(err, path, operationType, resHeaders) {
        const request = this.getSessionParams(path);
        request.operationType = operationType;
        if (!err ||
            (!this.isMasterResource(request.resourceType) &&
                (err.code === StatusCodes.PreconditionFailed ||
                    err.code === StatusCodes.Conflict ||
                    (err.code === StatusCodes.NotFound &&
                        err.substatus !== SubStatusCodes.ReadSessionNotAvailable)))) {
            this.sessionContainer.set(request, resHeaders);
        }
    }
    clearSessionToken(path) {
        const request = this.getSessionParams(path);
        this.sessionContainer.remove(request);
    }
    getSessionParams(resourceLink) {
        const resourceId = null;
        let resourceAddress = null;
        const parserOutput = parseLink(resourceLink);
        resourceAddress = parserOutput.objectBody.self;
        const resourceType = parserOutput.type;
        return {
            resourceId,
            resourceAddress,
            resourceType,
            isNameBased: true,
        };
    }
    isMasterResource(resourceType) {
        if (resourceType === Constants.Path.OffersPathSegment ||
            resourceType === Constants.Path.DatabasesPathSegment ||
            resourceType === Constants.Path.UsersPathSegment ||
            resourceType === Constants.Path.PermissionsPathSegment ||
            resourceType === Constants.Path.TopologyPathSegment ||
            resourceType === Constants.Path.DatabaseAccountPathSegment ||
            resourceType === Constants.Path.PartitionKeyRangesPathSegment ||
            resourceType === Constants.Path.CollectionsPathSegment) {
            return true;
        }
        return false;
    }
    buildHeaders(requestContext) {
        return getHeaders({
            clientOptions: this.cosmosClientOptions,
            defaultHeaders: Object.assign(Object.assign({}, this.cosmosClientOptions.defaultHeaders), requestContext.options.initialHeaders),
            verb: requestContext.method,
            path: requestContext.path,
            resourceId: requestContext.resourceId,
            resourceType: requestContext.resourceType,
            options: requestContext.options,
            partitionKeyRangeId: requestContext.partitionKeyRangeId,
            useMultipleWriteLocations: this.connectionPolicy.useMultipleWriteLocations,
            partitionKey: requestContext.partitionKey,
        });
    }
    /**
     * Returns collection of properties which are derived from the context for Request Creation
     * @returns
     */
    getContextDerivedPropsForRequestCreation() {
        return {
            globalEndpointManager: this.globalEndpointManager,
            requestAgent: this.cosmosClientOptions.agent,
            connectionPolicy: this.connectionPolicy,
            client: this,
            plugins: this.cosmosClientOptions.plugins,
            pipeline: this.pipeline,
        };
    }
}
//# sourceMappingURL=ClientContext.js.map