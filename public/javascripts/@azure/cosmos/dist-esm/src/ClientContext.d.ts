import { PartitionKeyRange } from "./client/Container/PartitionKeyRange";
import { Resource } from "./client/Resource";
import { ResourceType } from "./common/constants";
import { CosmosClientOptions } from "./CosmosClientOptions";
import { DatabaseAccount, PartitionKey } from "./documents";
import { GlobalEndpointManager } from "./globalEndpointManager";
import { SqlQuerySpec } from "./queryExecutionContext";
import { QueryIterator } from "./queryIterator";
import { FeedOptions, RequestOptions, Response } from "./request";
import { PartitionedQueryExecutionInfo } from "./request/ErrorResponse";
import { BulkOptions } from "./utils/batch";
/**
 * @hidden
 * @hidden
 */
export declare class ClientContext {
    private cosmosClientOptions;
    private globalEndpointManager;
    private readonly sessionContainer;
    private connectionPolicy;
    private pipeline;
    partitionKeyDefinitionCache: {
        [containerUrl: string]: any;
    };
    constructor(cosmosClientOptions: CosmosClientOptions, globalEndpointManager: GlobalEndpointManager);
    /** @hidden */
    read<T>({ path, resourceType, resourceId, options, partitionKey, }: {
        path: string;
        resourceType: ResourceType;
        resourceId: string;
        options?: RequestOptions;
        partitionKey?: PartitionKey;
    }): Promise<Response<T & Resource>>;
    queryFeed<T>({ path, resourceType, resourceId, resultFn, query, options, partitionKeyRangeId, partitionKey, }: {
        path: string;
        resourceType: ResourceType;
        resourceId: string;
        resultFn: (result: {
            [key: string]: any;
        }) => any[];
        query: SqlQuerySpec | string;
        options: FeedOptions;
        partitionKeyRangeId?: string;
        partitionKey?: PartitionKey;
    }): Promise<Response<T & Resource>>;
    getQueryPlan(path: string, resourceType: ResourceType, resourceId: string, query: SqlQuerySpec | string, options?: FeedOptions): Promise<Response<PartitionedQueryExecutionInfo>>;
    queryPartitionKeyRanges(collectionLink: string, query?: string | SqlQuerySpec, options?: FeedOptions): QueryIterator<PartitionKeyRange>;
    delete<T>({ path, resourceType, resourceId, options, partitionKey, }: {
        path: string;
        resourceType: ResourceType;
        resourceId: string;
        options?: RequestOptions;
        partitionKey?: PartitionKey;
    }): Promise<Response<T & Resource>>;
    patch<T>({ body, path, resourceType, resourceId, options, partitionKey, }: {
        body: any;
        path: string;
        resourceType: ResourceType;
        resourceId: string;
        options?: RequestOptions;
        partitionKey?: PartitionKey;
    }): Promise<Response<T & Resource>>;
    create<T, U = T>({ body, path, resourceType, resourceId, options, partitionKey, }: {
        body: T;
        path: string;
        resourceType: ResourceType;
        resourceId: string;
        options?: RequestOptions;
        partitionKey?: PartitionKey;
    }): Promise<Response<T & U & Resource>>;
    private processQueryFeedResponse;
    private applySessionToken;
    replace<T>({ body, path, resourceType, resourceId, options, partitionKey, }: {
        body: any;
        path: string;
        resourceType: ResourceType;
        resourceId: string;
        options?: RequestOptions;
        partitionKey?: PartitionKey;
    }): Promise<Response<T & Resource>>;
    upsert<T, U = T>({ body, path, resourceType, resourceId, options, partitionKey, }: {
        body: T;
        path: string;
        resourceType: ResourceType;
        resourceId: string;
        options?: RequestOptions;
        partitionKey?: PartitionKey;
    }): Promise<Response<T & U & Resource>>;
    execute<T>({ sprocLink, params, options, partitionKey, }: {
        sprocLink: string;
        params?: any[];
        options?: RequestOptions;
        partitionKey?: PartitionKey;
    }): Promise<Response<T>>;
    /**
     * Gets the Database account information.
     * @param options - `urlConnection` in the options is the endpoint url whose database account needs to be retrieved.
     * If not present, current client's url will be used.
     */
    getDatabaseAccount(options?: RequestOptions): Promise<Response<DatabaseAccount>>;
    getWriteEndpoint(): Promise<string>;
    getReadEndpoint(): Promise<string>;
    getWriteEndpoints(): Promise<readonly string[]>;
    getReadEndpoints(): Promise<readonly string[]>;
    batch<T>({ body, path, partitionKey, resourceId, options, }: {
        body: T;
        path: string;
        partitionKey: string;
        resourceId: string;
        options?: RequestOptions;
    }): Promise<Response<any>>;
    bulk<T>({ body, path, partitionKeyRangeId, resourceId, bulkOptions, options, }: {
        body: T;
        path: string;
        partitionKeyRangeId: string;
        resourceId: string;
        bulkOptions?: BulkOptions;
        options?: RequestOptions;
    }): Promise<Response<any>>;
    private captureSessionToken;
    clearSessionToken(path: string): void;
    private getSessionParams;
    private isMasterResource;
    private buildHeaders;
    /**
     * Returns collection of properties which are derived from the context for Request Creation
     * @returns
     */
    private getContextDerivedPropsForRequestCreation;
}
//# sourceMappingURL=ClientContext.d.ts.map