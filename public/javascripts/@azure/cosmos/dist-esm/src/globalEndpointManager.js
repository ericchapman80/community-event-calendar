// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { OperationType, ResourceType, isReadRequest } from "./common";
/**
 * @hidden
 * This internal class implements the logic for endpoint management for geo-replicated database accounts.
 */
export class GlobalEndpointManager {
    /**
     * @param options - The document client instance.
     */
    constructor(options, readDatabaseAccount) {
        this.readDatabaseAccount = readDatabaseAccount;
        this.writeableLocations = [];
        this.readableLocations = [];
        this.options = options;
        this.defaultEndpoint = options.endpoint;
        this.enableEndpointDiscovery = options.connectionPolicy.enableEndpointDiscovery;
        this.isRefreshing = false;
        this.preferredLocations = this.options.connectionPolicy.preferredLocations;
    }
    /**
     * Gets the current read endpoint from the endpoint cache.
     */
    async getReadEndpoint() {
        return this.resolveServiceEndpoint(ResourceType.item, OperationType.Read);
    }
    /**
     * Gets the current write endpoint from the endpoint cache.
     */
    async getWriteEndpoint() {
        return this.resolveServiceEndpoint(ResourceType.item, OperationType.Replace);
    }
    async getReadEndpoints() {
        return this.readableLocations.map((loc) => loc.databaseAccountEndpoint);
    }
    async getWriteEndpoints() {
        return this.writeableLocations.map((loc) => loc.databaseAccountEndpoint);
    }
    async markCurrentLocationUnavailableForRead(endpoint) {
        await this.refreshEndpointList();
        const location = this.readableLocations.find((loc) => loc.databaseAccountEndpoint === endpoint);
        if (location) {
            location.unavailable = true;
        }
    }
    async markCurrentLocationUnavailableForWrite(endpoint) {
        await this.refreshEndpointList();
        const location = this.writeableLocations.find((loc) => loc.databaseAccountEndpoint === endpoint);
        if (location) {
            location.unavailable = true;
        }
    }
    canUseMultipleWriteLocations(resourceType, operationType) {
        let canUse = this.options.connectionPolicy.useMultipleWriteLocations;
        if (resourceType) {
            canUse =
                canUse &&
                    (resourceType === ResourceType.item ||
                        (resourceType === ResourceType.sproc && operationType === OperationType.Execute));
        }
        return canUse;
    }
    async resolveServiceEndpoint(resourceType, operationType) {
        // If endpoint discovery is disabled, always use the user provided endpoint
        if (!this.options.connectionPolicy.enableEndpointDiscovery) {
            return this.defaultEndpoint;
        }
        // If getting the database account, always use the user provided endpoint
        if (resourceType === ResourceType.none) {
            return this.defaultEndpoint;
        }
        if (this.readableLocations.length === 0 || this.writeableLocations.length === 0) {
            const { resource: databaseAccount } = await this.readDatabaseAccount({
                urlConnection: this.defaultEndpoint,
            });
            this.writeableLocations = databaseAccount.writableLocations;
            this.readableLocations = databaseAccount.readableLocations;
        }
        const locations = isReadRequest(operationType)
            ? this.readableLocations
            : this.writeableLocations;
        let location;
        // If we have preferred locations, try each one in order and use the first available one
        if (this.preferredLocations && this.preferredLocations.length > 0) {
            for (const preferredLocation of this.preferredLocations) {
                location = locations.find((loc) => loc.unavailable !== true &&
                    normalizeEndpoint(loc.name) === normalizeEndpoint(preferredLocation));
                if (location) {
                    break;
                }
            }
        }
        // If no preferred locations or one did not match, just grab the first one that is available
        if (!location) {
            location = locations.find((loc) => {
                return loc.unavailable !== true;
            });
        }
        return location ? location.databaseAccountEndpoint : this.defaultEndpoint;
    }
    /**
     * Refreshes the endpoint list by retrieving the writable and readable locations
     *  from the geo-replicated database account and then updating the locations cache.
     *   We skip the refreshing if enableEndpointDiscovery is set to False
     */
    async refreshEndpointList() {
        if (!this.isRefreshing && this.enableEndpointDiscovery) {
            this.isRefreshing = true;
            const databaseAccount = await this.getDatabaseAccountFromAnyEndpoint();
            if (databaseAccount) {
                this.refreshEndpoints(databaseAccount);
            }
            this.isRefreshing = false;
        }
    }
    refreshEndpoints(databaseAccount) {
        for (const location of databaseAccount.writableLocations) {
            const existingLocation = this.writeableLocations.find((loc) => loc.name === location.name);
            if (!existingLocation) {
                this.writeableLocations.push(location);
            }
        }
        for (const location of databaseAccount.writableLocations) {
            const existingLocation = this.readableLocations.find((loc) => loc.name === location.name);
            if (!existingLocation) {
                this.readableLocations.push(location);
            }
        }
    }
    /**
     * Gets the database account first by using the default endpoint, and if that doesn't returns
     * use the endpoints for the preferred locations in the order they are specified to get
     * the database account.
     */
    async getDatabaseAccountFromAnyEndpoint() {
        try {
            const options = { urlConnection: this.defaultEndpoint };
            const { resource: databaseAccount } = await this.readDatabaseAccount(options);
            return databaseAccount;
            // If for any reason(non - globaldb related), we are not able to get the database
            // account from the above call to readDatabaseAccount,
            // we would try to get this information from any of the preferred locations that the user
            // might have specified (by creating a locational endpoint)
            // and keeping eating the exception until we get the database account and return None at the end,
            // if we are not able to get that info from any endpoints
        }
        catch (err) {
            // TODO: Tracing
        }
        if (this.preferredLocations) {
            for (const location of this.preferredLocations) {
                try {
                    const locationalEndpoint = GlobalEndpointManager.getLocationalEndpoint(this.defaultEndpoint, location);
                    const options = { urlConnection: locationalEndpoint };
                    const { resource: databaseAccount } = await this.readDatabaseAccount(options);
                    if (databaseAccount) {
                        return databaseAccount;
                    }
                }
                catch (err) {
                    // TODO: Tracing
                }
            }
        }
    }
    /**
     * Gets the locational endpoint using the location name passed to it using the default endpoint.
     *
     * @param defaultEndpoint - The default endpoint to use for the endpoint.
     * @param locationName    - The location name for the azure region like "East US".
     */
    static getLocationalEndpoint(defaultEndpoint, locationName) {
        // For defaultEndpoint like 'https://contoso.documents.azure.com:443/' parse it to generate URL format
        // This defaultEndpoint should be global endpoint(and cannot be a locational endpoint)
        // and we agreed to document that
        const endpointUrl = new URL(defaultEndpoint);
        // hostname attribute in endpointUrl will return 'contoso.documents.azure.com'
        if (endpointUrl.hostname) {
            const hostnameParts = endpointUrl.hostname.toString().toLowerCase().split(".");
            if (hostnameParts) {
                // globalDatabaseAccountName will return 'contoso'
                const globalDatabaseAccountName = hostnameParts[0];
                // Prepare the locationalDatabaseAccountName as contoso-EastUS for location_name 'East US'
                const locationalDatabaseAccountName = globalDatabaseAccountName + "-" + locationName.replace(" ", "");
                // Replace 'contoso' with 'contoso-EastUS' and
                // return locationalEndpoint as https://contoso-EastUS.documents.azure.com:443/
                const locationalEndpoint = defaultEndpoint
                    .toLowerCase()
                    .replace(globalDatabaseAccountName, locationalDatabaseAccountName);
                return locationalEndpoint;
            }
        }
        return null;
    }
}
function normalizeEndpoint(endpoint) {
    return endpoint.split(" ").join("").toLowerCase();
}
//# sourceMappingURL=globalEndpointManager.js.map