import { JSONObject } from "../queryExecutionContext";
import { PartitionKeyDefinition } from "../documents";
import { RequestOptions } from "..";
import { PatchRequestBody } from "./patch";
export declare type Operation = CreateOperation | UpsertOperation | ReadOperation | DeleteOperation | ReplaceOperation | BulkPatchOperation;
export interface Batch {
    min: string;
    max: string;
    rangeId: string;
    indexes: number[];
    operations: Operation[];
}
export interface OperationResponse {
    statusCode: number;
    requestCharge: number;
    eTag?: string;
    resourceBody?: JSONObject;
}
/**
 * Options object used to modify bulk execution.
 * continueOnError (Default value: false) - Continues bulk execution when an operation fails ** NOTE THIS WILL DEFAULT TO TRUE IN the 4.0 RELEASE
 */
export interface BulkOptions {
    continueOnError?: boolean;
}
export declare function isKeyInRange(min: string, max: string, key: string): boolean;
export interface OperationBase {
    partitionKey?: string;
    ifMatch?: string;
    ifNoneMatch?: string;
}
export declare const BulkOperationType: {
    readonly Create: "Create";
    readonly Upsert: "Upsert";
    readonly Read: "Read";
    readonly Delete: "Delete";
    readonly Replace: "Replace";
    readonly Patch: "Patch";
};
export declare type OperationInput = CreateOperationInput | UpsertOperationInput | ReadOperationInput | DeleteOperationInput | ReplaceOperationInput | PatchOperationInput;
export interface CreateOperationInput {
    partitionKey?: string | number | null | Record<string, unknown> | undefined;
    ifMatch?: string;
    ifNoneMatch?: string;
    operationType: typeof BulkOperationType.Create;
    resourceBody: JSONObject;
}
export interface UpsertOperationInput {
    partitionKey?: string | number | null | Record<string, unknown> | undefined;
    ifMatch?: string;
    ifNoneMatch?: string;
    operationType: typeof BulkOperationType.Upsert;
    resourceBody: JSONObject;
}
export interface ReadOperationInput {
    partitionKey?: string | number | boolean | null | Record<string, unknown> | undefined;
    operationType: typeof BulkOperationType.Read;
    id: string;
}
export interface DeleteOperationInput {
    partitionKey?: string | number | null | Record<string, unknown> | undefined;
    operationType: typeof BulkOperationType.Delete;
    id: string;
}
export interface ReplaceOperationInput {
    partitionKey?: string | number | null | Record<string, unknown> | undefined;
    ifMatch?: string;
    ifNoneMatch?: string;
    operationType: typeof BulkOperationType.Replace;
    resourceBody: JSONObject;
    id: string;
}
export interface PatchOperationInput {
    partitionKey?: string | number | null | Record<string, unknown> | undefined;
    ifMatch?: string;
    ifNoneMatch?: string;
    operationType: typeof BulkOperationType.Patch;
    resourceBody: PatchRequestBody;
    id: string;
}
export declare type OperationWithItem = OperationBase & {
    resourceBody: JSONObject;
};
export declare type CreateOperation = OperationWithItem & {
    operationType: typeof BulkOperationType.Create;
};
export declare type UpsertOperation = OperationWithItem & {
    operationType: typeof BulkOperationType.Upsert;
};
export declare type ReadOperation = OperationBase & {
    operationType: typeof BulkOperationType.Read;
    id: string;
};
export declare type DeleteOperation = OperationBase & {
    operationType: typeof BulkOperationType.Delete;
    id: string;
};
export declare type ReplaceOperation = OperationWithItem & {
    operationType: typeof BulkOperationType.Replace;
    id: string;
};
export declare type BulkPatchOperation = OperationBase & {
    operationType: typeof BulkOperationType.Patch;
    id: string;
};
export declare function hasResource(operation: Operation): operation is CreateOperation | UpsertOperation | ReplaceOperation;
export declare function getPartitionKeyToHash(operation: Operation, partitionProperty: string): any;
export declare function decorateOperation(operation: OperationInput, definition: PartitionKeyDefinition, options?: RequestOptions): Operation;
export declare function decorateBatchOperation(operation: OperationInput, options?: RequestOptions): Operation;
/**
 * Util function for finding partition key values nested in objects at slash (/) separated paths
 * @hidden
 */
export declare function deepFind<T, P extends string>(document: T, path: P): string | JSONObject;
//# sourceMappingURL=batch.d.ts.map