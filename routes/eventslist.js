const EvenstDao = require("../models/EventsDao");

 class EventsList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {EvenstDao} eventDao
    */
   constructor(eventDao) {
     this.eventDao = eventDao;
   }
   async showEvents(req, res) {
     const querySpec = {
       //query: "SELECT * FROM root r WHERE r.completed=@completed",
       query: "SELECT * FROM root r",
       //parameters: [
         //{
           //name: "@completed",
           //value: false
         //}
       //]
     };

     const items = await this. eventDao.find(querySpec);
     res.render("index", {
       title: "SWVA Camps & Activities",
       events: items
     });
   }

   async addEvent(req, res) {
     const item = req.body;

     await this.eventDao.addItem(item);
     res.redirect("/");
   }

   async completeEvent(req, res) {
     const completedEvents = Object.keys(req.body);
     const events = [];

     completedEvents.forEach(event => {
       events.push(this.eventDao.updateItem(event));
     });

     await Promise.all(events);

     res.redirect("/");
   }

   async deleteEvent(req, res) {
    const deleteEvents = Object.keys(req.body);
    const events = [];

    deleteEvents.forEach(event => {
      events.push(this.eventDao.removeItem(event));
    });

    await Promise.all(events);

    res.redirect("/");
  }
 }

 module.exports = EventsList;