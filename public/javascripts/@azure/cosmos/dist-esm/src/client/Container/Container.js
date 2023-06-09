import { createDocumentCollectionUri, getIdFromLink, getPathFromLink, isResourceValid, ResourceType, } from "../../common";
import { ResourceResponse } from "../../request";
import { Conflict, Conflicts } from "../Conflict";
import { Item, Items } from "../Item";
import { Scripts } from "../Script/Scripts";
import { ContainerResponse } from "./ContainerResponse";
import { Offer } from "../Offer";
import { OfferResponse } from "../Offer/OfferResponse";
/**
 * Operations for reading, replacing, or deleting a specific, existing container by id.
 *
 * @see {@link Containers} for creating new containers, and reading/querying all containers; use `.containers`.
 *
 * Note: all these operations make calls against a fixed budget.
 * You should design your system such that these calls scale sublinearly with your application.
 * For instance, do not call `container(id).read()` before every single `item.read()` call, to ensure the container exists;
 * do this once on application start up.
 */
export class Container {
    /**
     * Returns a container instance. Note: You should get this from `database.container(id)`, rather than creating your own object.
     * @param database - The parent {@link Database}.
     * @param id - The id of the given container.
     * @hidden
     */
    constructor(database, id, clientContext) {
        this.database = database;
        this.id = id;
        this.clientContext = clientContext;
    }
    /**
     * Operations for creating new items, and reading/querying all items
     *
     * For reading, replacing, or deleting an existing item, use `.item(id)`.
     *
     * @example Create a new item
     * ```typescript
     * const {body: createdItem} = await container.items.create({id: "<item id>", properties: {}});
     * ```
     */
    get items() {
        if (!this.$items) {
            this.$items = new Items(this, this.clientContext);
        }
        return this.$items;
    }
    /**
     * All operations for Stored Procedures, Triggers, and User Defined Functions
     */
    get scripts() {
        if (!this.$scripts) {
            this.$scripts = new Scripts(this, this.clientContext);
        }
        return this.$scripts;
    }
    /**
     * Operations for reading and querying conflicts for the given container.
     *
     * For reading or deleting a specific conflict, use `.conflict(id)`.
     */
    get conflicts() {
        if (!this.$conflicts) {
            this.$conflicts = new Conflicts(this, this.clientContext);
        }
        return this.$conflicts;
    }
    /**
     * Returns a reference URL to the resource. Used for linking in Permissions.
     */
    get url() {
        return createDocumentCollectionUri(this.database.id, this.id);
    }
    /**
     * Used to read, replace, or delete a specific, existing {@link Item} by id.
     *
     * Use `.items` for creating new items, or querying/reading all items.
     *
     * @param id - The id of the {@link Item}.
     * @param partitionKeyValue - The value of the {@link Item} partition key
     * @example Replace an item
     * `const {body: replacedItem} = await container.item("<item id>", "<partition key value>").replace({id: "<item id>", title: "Updated post", authorID: 5});`
     */
    item(id, partitionKeyValue) {
        return new Item(this, id, partitionKeyValue, this.clientContext);
    }
    /**
     * Used to read, replace, or delete a specific, existing {@link Conflict} by id.
     *
     * Use `.conflicts` for creating new conflicts, or querying/reading all conflicts.
     * @param id - The id of the {@link Conflict}.
     */
    conflict(id, partitionKey) {
        return new Conflict(this, id, this.clientContext, partitionKey);
    }
    /** Read the container's definition */
    async read(options) {
        const path = getPathFromLink(this.url);
        const id = getIdFromLink(this.url);
        const response = await this.clientContext.read({
            path,
            resourceType: ResourceType.container,
            resourceId: id,
            options,
        });
        this.clientContext.partitionKeyDefinitionCache[this.url] = response.result.partitionKey;
        return new ContainerResponse(response.result, response.headers, response.code, this);
    }
    /** Replace the container's definition */
    async replace(body, options) {
        const err = {};
        if (!isResourceValid(body, err)) {
            throw err;
        }
        const path = getPathFromLink(this.url);
        const id = getIdFromLink(this.url);
        const response = await this.clientContext.replace({
            body,
            path,
            resourceType: ResourceType.container,
            resourceId: id,
            options,
        });
        return new ContainerResponse(response.result, response.headers, response.code, this);
    }
    /** Delete the container */
    async delete(options) {
        const path = getPathFromLink(this.url);
        const id = getIdFromLink(this.url);
        const response = await this.clientContext.delete({
            path,
            resourceType: ResourceType.container,
            resourceId: id,
            options,
        });
        return new ContainerResponse(response.result, response.headers, response.code, this);
    }
    /**
     * Gets the partition key definition first by looking into the cache otherwise by reading the collection.
     * @deprecated This method has been renamed to readPartitionKeyDefinition.
     */
    async getPartitionKeyDefinition() {
        return this.readPartitionKeyDefinition();
    }
    /**
     * Gets the partition key definition first by looking into the cache otherwise by reading the collection.
     * @hidden
     */
    async readPartitionKeyDefinition() {
        // $ISSUE-felixfan-2016-03-17: Make name based path and link based path use the same key
        // $ISSUE-felixfan-2016-03-17: Refresh partitionKeyDefinitionCache when necessary
        if (this.url in this.clientContext.partitionKeyDefinitionCache) {
            return new ResourceResponse(this.clientContext.partitionKeyDefinitionCache[this.url], {}, 0);
        }
        const { headers, statusCode } = await this.read();
        return new ResourceResponse(this.clientContext.partitionKeyDefinitionCache[this.url], headers, statusCode);
    }
    /**
     * Gets offer on container. If none exists, returns an OfferResponse with undefined.
     */
    async readOffer(options = {}) {
        const { resource: container } = await this.read();
        const path = "/offers";
        const url = container._self;
        const response = await this.clientContext.queryFeed({
            path,
            resourceId: "",
            resourceType: ResourceType.offer,
            query: `SELECT * from root where root.resource = "${url}"`,
            resultFn: (result) => result.Offers,
            options,
        });
        const offer = response.result[0]
            ? new Offer(this.database.client, response.result[0].id, this.clientContext)
            : undefined;
        return new OfferResponse(response.result[0], response.headers, response.code, offer);
    }
    async getQueryPlan(query) {
        const path = getPathFromLink(this.url);
        return this.clientContext.getQueryPlan(path + "/docs", ResourceType.item, getIdFromLink(this.url), query);
    }
    readPartitionKeyRanges(feedOptions) {
        feedOptions = feedOptions || {};
        return this.clientContext.queryPartitionKeyRanges(this.url, undefined, feedOptions);
    }
}
//# sourceMappingURL=Container.js.map