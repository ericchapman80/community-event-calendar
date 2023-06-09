// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { isReadRequest } from "../common";
/**
 * This class implements the retry policy for session consistent reads.
 * @hidden
 */
export class SessionRetryPolicy {
    /**
     * @param globalEndpointManager - The GlobalEndpointManager instance.
     */
    constructor(globalEndpointManager, resourceType, operationType, connectionPolicy) {
        this.globalEndpointManager = globalEndpointManager;
        this.resourceType = resourceType;
        this.operationType = operationType;
        this.connectionPolicy = connectionPolicy;
        /** Current retry attempt count. */
        this.currentRetryAttemptCount = 0;
        /** Retry interval in milliseconds. */
        this.retryAfterInMs = 0;
    }
    /**
     * Determines whether the request should be retried or not.
     * @param err - Error returned by the request.
     * @param callback - The callback function which takes bool argument which specifies whether the request
     * will be retried or not.
     */
    async shouldRetry(err, retryContext) {
        if (!err) {
            return false;
        }
        if (!retryContext) {
            return false;
        }
        if (!this.connectionPolicy.enableEndpointDiscovery) {
            return false;
        }
        if (this.globalEndpointManager.canUseMultipleWriteLocations(this.resourceType, this.operationType)) {
            // If we can write to multiple locations, we should against every write endpoint until we succeed
            const endpoints = isReadRequest(this.operationType)
                ? await this.globalEndpointManager.getReadEndpoints()
                : await this.globalEndpointManager.getWriteEndpoints();
            if (this.currentRetryAttemptCount > endpoints.length) {
                return false;
            }
            else {
                this.currentRetryAttemptCount++;
                retryContext.retryCount++;
                retryContext.retryRequestOnPreferredLocations = this.currentRetryAttemptCount > 1;
                retryContext.clearSessionTokenNotAvailable =
                    this.currentRetryAttemptCount === endpoints.length;
                return true;
            }
        }
        else {
            if (this.currentRetryAttemptCount > 1) {
                return false;
            }
            else {
                this.currentRetryAttemptCount++;
                retryContext.retryCount++;
                retryContext.retryRequestOnPreferredLocations = false; // Forces all operations to primary write endpoint
                retryContext.clearSessionTokenNotAvailable = true;
                return true;
            }
        }
    }
}
//# sourceMappingURL=sessionRetryPolicy.js.map