// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient
const debug = require('debug')('community-event-calendar:eventsDao')

// For simplicity we'll set a constant partition key
const partitionKey = undefined;
class EventsDao {
  /**
   * Manages reading, adding, and updating Events in Azure Cosmos DB
   * @param {CosmosClient} cosmosClient
   * @param {string} databaseId
   * @param {string} containerId
   */
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient
    this.databaseId = databaseId
    this.collectionId = containerId

    this.database = null
    this.container = null
  }

  async init() {
    debug('Setting up the database...')
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId
    })
    this.database = dbResponse.database
    debug('Setting up the database...done!')
    debug('Setting up the container...')
    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId
    })
    this.container = coResponse.container
    debug('Setting up the container...done!')
  }

  async find(querySpec) {
    debug('Querying for items from the database')
    if (!this.container) {
      throw new Error('Collection is not initialized.')
    }
    const { resources } = await this.container.items.query(querySpec).fetchAll()
    return resources
  }

  async addItem(item) {
    debug('Adding an item to the database')
    //item.date = Date.now()
    //item.completed = false
    const { resource: doc } = await this.container.items.create(item)
    return doc
  }

  async updateItem(itemId) {
    debug('Update an item in the database')
    const docToUpdate = await this.getItem(itemId)
    docToUpdate.completed = true
    
    
    console.log('================');
    console.log(docToUpdate);
    console.log(partitionKey);
    console.log(itemId);

    //const { id, category } = docToUpdate;
    //console.log(category);

    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(docToUpdate)
    return replaced
  }

  async getItem(itemId) {
    debug('Getting an item from the database')
    const { resource: dbItem } = await this.container.item(itemId, partitionKey).read()
    console.log("Item from DB");
    console.log(dbItem)
    return dbItem
  }

  async getAllItems() {
    debug('Get All items from the database.')
    const { resource } = await this.container.items.readAll()
    return resource
  }

  async removeItem(itemId) {
    debug('Removing an item to the database')
    var item = this.container.item(itemId.id);
    item.delete(itemId.id).catch(function(err){console.log(err);})
  }

}

module.exports = EventsDao