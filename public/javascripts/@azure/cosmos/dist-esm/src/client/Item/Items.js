// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { v4 } from "uuid";
const uuid = v4;
import { ChangeFeedIterator } from "../../ChangeFeedIterator";
import { getIdFromLink, getPathFromLink, isItemResourceValid, ResourceType } from "../../common";
import { extractPartitionKey } from "../../extractPartitionKey";
import { QueryIterator } from "../../queryIterator";
import { Item } from "./Item";
import { ItemResponse } from "./ItemResponse";
import { isKeyInRange, getPartitionKeyToHash, decorateOperation, decorateBatchOperation, } from "../../utils/batch";
import { hashV1PartitionKey } from "../../utils/hashing/v1";
import { hashV2PartitionKey } from "../../utils/hashing/v2";
/**
 * @hidden
 */
function isChangeFeedOptions(options) {
    const optionsType = typeof options;
    return (options && !(optionsType === "string" || optionsType === "boolean" || optionsType === "number"));
}
/**
 * Operations for creating new items, and reading/querying all items
 *
 * @see {@link Item} for reading, replacing, or deleting an existing container; use `.item(id)`.
 */
export class Items {
    /**
     * Create an instance of {@link Items} linked to the parent {@link Container}.
     * @param container - The parent container.
     * @hidden
     */
    constructor(container, clientContext) {
        this.container = container;
        this.clientContext = clientContext;
    }
    query(query, options = {}) {
        const path = getPathFromLink(this.container.url, ResourceType.item);
        const id = getIdFromLink(this.container.url);
        const fetchFunction = (innerOptions) => {
            return this.clientContext.queryFeed({
                path,
                resourceType: ResourceType.item,
                resourceId: id,
                resultFn: (result) => (result ? result.Documents : []),
                query,
                options: innerOptions,
                partitionKey: options.partitionKey,
            });
        };
        return new QueryIterator(this.clientContext, query, options, fetchFunction, this.container.url, ResourceType.item);
    }
    readChangeFeed(partitionKeyOrChangeFeedOptions, changeFeedOptions) {
        if (isChangeFeedOptions(partitionKeyOrChangeFeedOptions)) {
            return this.changeFeed(partitionKeyOrChangeFeedOptions);
        }
        else {
            return this.changeFeed(partitionKeyOrChangeFeedOptions, changeFeedOptions);
        }
    }
    changeFeed(partitionKeyOrChangeFeedOptions, changeFeedOptions) {
        let partitionKey;
        if (!changeFeedOptions && isChangeFeedOptions(partitionKeyOrChangeFeedOptions)) {
            partitionKey = undefined;
            changeFeedOptions = partitionKeyOrChangeFeedOptions;
        }
        else if (partitionKeyOrChangeFeedOptions !== undefined &&
            !isChangeFeedOptions(partitionKeyOrChangeFeedOptions)) {
            partitionKey = partitionKeyOrChangeFeedOptions;
        }
        if (!changeFeedOptions) {
            changeFeedOptions = {};
        }
        const path = getPathFromLink(this.container.url, ResourceType.item);
        const id = getIdFromLink(this.container.url);
        return new ChangeFeedIterator(this.clientContext, id, path, partitionKey, changeFeedOptions);
    }
    readAll(options) {
        return this.query("SELECT * from c", options);
    }
    /**
     * Create an item.
     *
     * Any provided type, T, is not necessarily enforced by the SDK.
     * You may get more or less properties and it's up to your logic to enforce it.
     *
     * There is no set schema for JSON items. They may contain any number of custom properties.
     *
     * @param body - Represents the body of the item. Can contain any number of user defined properties.
     * @param options - Used for modifying the request (for instance, specifying the partition key).
     */
    async create(body, options = {}) {
        // Generate random document id if the id is missing in the payload and
        // options.disableAutomaticIdGeneration != true
        if ((body.id === undefined || body.id === "") && !options.disableAutomaticIdGeneration) {
            body.id = uuid();
        }
        const { resource: partitionKeyDefinition } = await this.container.readPartitionKeyDefinition();
        const partitionKey = extractPartitionKey(body, partitionKeyDefinition);
        const err = {};
        if (!isItemResourceValid(body, err)) {
            throw err;
        }
        const path = getPathFromLink(this.container.url, ResourceType.item);
        const id = getIdFromLink(this.container.url);
        const response = await this.clientContext.create({
            body,
            path,
            resourceType: ResourceType.item,
            resourceId: id,
            options,
            partitionKey,
        });
        const ref = new Item(this.container, response.result.id, partitionKey, this.clientContext);
        return new ItemResponse(response.result, response.headers, response.code, response.substatus, ref);
    }
    async upsert(body, options = {}) {
        const { resource: partitionKeyDefinition } = await this.container.readPartitionKeyDefinition();
        const partitionKey = extractPartitionKey(body, partitionKeyDefinition);
        // Generate random document id if the id is missing in the payload and
        // options.disableAutomaticIdGeneration != true
        if ((body.id === undefined || body.id === "") && !options.disableAutomaticIdGeneration) {
            body.id = uuid();
        }
        const err = {};
        if (!isItemResourceValid(body, err)) {
            throw err;
        }
        const path = getPathFromLink(this.container.url, ResourceType.item);
        const id = getIdFromLink(this.container.url);
        const response = await this.clientContext.upsert({
            body,
            path,
            resourceType: ResourceType.item,
            resourceId: id,
            options,
            partitionKey,
        });
        const ref = new Item(this.container, response.result.id, partitionKey, this.clientContext);
        return new ItemResponse(response.result, response.headers, response.code, response.substatus, ref);
    }
    /**
     * Execute bulk operations on items.
     *
     * Bulk takes an array of Operations which are typed based on what the operation does.
     * The choices are: Create, Upsert, Read, Replace, and Delete
     *
     * Usage example:
     * ```typescript
     * // partitionKey is optional at the top level if present in the resourceBody
     * const operations: OperationInput[] = [
     *    {
     *       operationType: "Create",
     *       resourceBody: { id: "doc1", name: "sample", key: "A" }
     *    },
     *    {
     *       operationType: "Upsert",
     *       partitionKey: 'A',
     *       resourceBody: { id: "doc2", name: "other", key: "A" }
     *    }
     * ]
     *
     * await database.container.items.bulk(operations)
     * ```
     *
     * @param operations - List of operations. Limit 100
     * @param bulkOptions - Optional options object to modify bulk behavior. Pass \{ continueOnError: true \} to continue executing operations when one fails. (Defaults to false) ** NOTE: THIS WILL DEFAULT TO TRUE IN THE 4.0 RELEASE
     * @param options - Used for modifying the request.
     */
    async bulk(operations, bulkOptions, options) {
        const { resources: partitionKeyRanges } = await this.container
            .readPartitionKeyRanges()
            .fetchAll();
        const { resource: definition } = await this.container.getPartitionKeyDefinition();
        const batches = partitionKeyRanges.map((keyRange) => {
            return {
                min: keyRange.minInclusive,
                max: keyRange.maxExclusive,
                rangeId: keyRange.id,
                indexes: [],
                operations: [],
            };
        });
        operations
            .map((operation) => decorateOperation(operation, definition, options))
            .forEach((operation, index) => {
            const partitionProp = definition.paths[0].replace("/", "");
            const isV2 = definition.version && definition.version === 2;
            const toHashKey = getPartitionKeyToHash(operation, partitionProp);
            const hashed = isV2 ? hashV2PartitionKey(toHashKey) : hashV1PartitionKey(toHashKey);
            const batchForKey = batches.find((batch) => {
                return isKeyInRange(batch.min, batch.max, hashed);
            });
            batchForKey.operations.push(operation);
            batchForKey.indexes.push(index);
        });
        const path = getPathFromLink(this.container.url, ResourceType.item);
        const orderedResponses = [];
        await Promise.all(batches
            .filter((batch) => batch.operations.length)
            .map(async (batch) => {
            if (batch.operations.length > 100) {
                throw new Error("Cannot run bulk request with more than 100 operations per partition");
            }
            try {
                const response = await this.clientContext.bulk({
                    body: batch.operations,
                    partitionKeyRangeId: batch.rangeId,
                    path,
                    resourceId: this.container.url,
                    bulkOptions,
                    options,
                });
                response.result.forEach((operationResponse, index) => {
                    orderedResponses[batch.indexes[index]] = operationResponse;
                });
            }
            catch (err) {
                // In the case of 410 errors, we need to recompute the partition key ranges
                // and redo the batch request, however, 410 errors occur for unsupported
                // partition key types as well since we don't support them, so for now we throw
                if (err.code === 410) {
                    throw new Error("Partition key error. Either the partitions have split or an operation has an unsupported partitionKey type");
                }
                throw new Error(`Bulk request errored with: ${err.message}`);
            }
        }));
        return orderedResponses;
    }
    /**
     * Execute transactional batch operations on items.
     *
     * Batch takes an array of Operations which are typed based on what the operation does. Batch is transactional and will rollback all operations if one fails.
     * The choices are: Create, Upsert, Read, Replace, and Delete
     *
     * Usage example:
     * ```typescript
     * // partitionKey is required as a second argument to batch, but defaults to the default partition key
     * const operations: OperationInput[] = [
     *    {
     *       operationType: "Create",
     *       resourceBody: { id: "doc1", name: "sample", key: "A" }
     *    },
     *    {
     *       operationType: "Upsert",
     *       partitionKey: 'A',
     *       resourceBody: { id: "doc2", name: "other", key: "A" }
     *    }
     * ]
     *
     * await database.container.items.batch(operations)
     * ```
     *
     * @param operations - List of operations. Limit 100
     * @param options - Used for modifying the request
     */
    async batch(operations, partitionKey = "[{}]", options) {
        operations.map((operation) => decorateBatchOperation(operation, options));
        const path = getPathFromLink(this.container.url, ResourceType.item);
        if (operations.length > 100) {
            throw new Error("Cannot run batch request with more than 100 operations per partition");
        }
        try {
            const response = await this.clientContext.batch({
                body: operations,
                partitionKey,
                path,
                resourceId: this.container.url,
                options,
            });
            return response;
        }
        catch (err) {
            throw new Error(`Batch request error: ${err.message}`);
        }
    }
}
//# sourceMappingURL=Items.js.map