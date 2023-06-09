// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { extractPartitionKey } from "../extractPartitionKey";
import { v4 } from "uuid";
const uuid = v4;
export function isKeyInRange(min, max, key) {
    const isAfterMinInclusive = key.localeCompare(min) >= 0;
    const isBeforeMax = key.localeCompare(max) < 0;
    return isAfterMinInclusive && isBeforeMax;
}
export const BulkOperationType = {
    Create: "Create",
    Upsert: "Upsert",
    Read: "Read",
    Delete: "Delete",
    Replace: "Replace",
    Patch: "Patch",
};
export function hasResource(operation) {
    return (operation.operationType !== "Patch" &&
        operation.resourceBody !== undefined);
}
export function getPartitionKeyToHash(operation, partitionProperty) {
    const toHashKey = hasResource(operation)
        ? deepFind(operation.resourceBody, partitionProperty)
        : (operation.partitionKey && operation.partitionKey.replace(/[[\]"']/g, "")) ||
            operation.partitionKey;
    // We check for empty object since replace will stringify the value
    // The second check avoids cases where the partitionKey value is actually the string '{}'
    if (toHashKey === "{}" && operation.partitionKey === "[{}]") {
        return {};
    }
    if (toHashKey === "null" && operation.partitionKey === "[null]") {
        return null;
    }
    if (toHashKey === "0" && operation.partitionKey === "[0]") {
        return 0;
    }
    return toHashKey;
}
export function decorateOperation(operation, definition, options = {}) {
    if (operation.operationType === BulkOperationType.Create ||
        operation.operationType === BulkOperationType.Upsert) {
        if ((operation.resourceBody.id === undefined || operation.resourceBody.id === "") &&
            !options.disableAutomaticIdGeneration) {
            operation.resourceBody.id = uuid();
        }
    }
    if ("partitionKey" in operation) {
        const extracted = extractPartitionKey(operation, { paths: ["/partitionKey"] });
        return Object.assign(Object.assign({}, operation), { partitionKey: JSON.stringify(extracted) });
    }
    else if (operation.operationType === BulkOperationType.Create ||
        operation.operationType === BulkOperationType.Replace ||
        operation.operationType === BulkOperationType.Upsert) {
        const pk = extractPartitionKey(operation.resourceBody, definition);
        return Object.assign(Object.assign({}, operation), { partitionKey: JSON.stringify(pk) });
    }
    else if (operation.operationType === BulkOperationType.Read ||
        operation.operationType === BulkOperationType.Delete) {
        return Object.assign(Object.assign({}, operation), { partitionKey: "[{}]" });
    }
    return operation;
}
export function decorateBatchOperation(operation, options = {}) {
    if (operation.operationType === BulkOperationType.Create ||
        operation.operationType === BulkOperationType.Upsert) {
        if ((operation.resourceBody.id === undefined || operation.resourceBody.id === "") &&
            !options.disableAutomaticIdGeneration) {
            operation.resourceBody.id = uuid();
        }
    }
    return operation;
}
/**
 * Util function for finding partition key values nested in objects at slash (/) separated paths
 * @hidden
 */
export function deepFind(document, path) {
    const apath = path.split("/");
    let h = document;
    for (const p of apath) {
        if (p in h)
            h = h[p];
        else {
            console.warn(`Partition key not found, using undefined: ${path} at ${p}`);
            return "{}";
        }
    }
    return h;
}
//# sourceMappingURL=batch.js.map