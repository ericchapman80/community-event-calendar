/**
 * @hidden
 */
export interface StatusCodesType {
    Ok: 200;
    Created: 201;
    Accepted: 202;
    NoContent: 204;
    NotModified: 304;
    BadRequest: 400;
    Unauthorized: 401;
    Forbidden: 403;
    NotFound: 404;
    MethodNotAllowed: 405;
    RequestTimeout: 408;
    Conflict: 409;
    Gone: 410;
    PreconditionFailed: 412;
    RequestEntityTooLarge: 413;
    TooManyRequests: 429;
    RetryWith: 449;
    InternalServerError: 500;
    ServiceUnavailable: 503;
    ENOTFOUND: "ENOTFOUND";
    OperationPaused: 1200;
    OperationCancelled: 1201;
}
/**
 * @hidden
 */
export declare const StatusCodes: StatusCodesType;
/**
 * @hidden
 */
export interface SubStatusCodesType {
    Unknown: 0;
    CrossPartitionQueryNotServable: 1004;
    PartitionKeyRangeGone: 1002;
    ReadSessionNotAvailable: 1002;
    WriteForbidden: 3;
    DatabaseAccountNotFound: 1008;
}
/**
 * @hidden
 */
export declare const SubStatusCodes: SubStatusCodesType;
//# sourceMappingURL=statusCodes.d.ts.map