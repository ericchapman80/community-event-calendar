 const CosmosClient = require('@azure/cosmos').CosmosClient
 const config = require('./config')
 const EventList = require('./routes/eventslist')
 const EventDao = require('./models/eventsDao')

 const express = require('express')
 const path = require('path')
 const logger = require('morgan')
 const cookieParser = require('cookie-parser')
 const bodyParser = require('body-parser')

const EventsDao = require('./models/eventsDao')
const EventsList = require('./routes/eventslist')

 const app = express()

 // view engine setup
 app.set('views', path.join(__dirname, 'views'))
 app.set('view engine', 'jade')

 // uncomment after placing your favicon in /public
 //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
 app.use(logger('dev'))
 app.use(bodyParser.json())
 app.use(bodyParser.urlencoded({ extended: false }))
 app.use(cookieParser())
 app.use(express.static(path.join(__dirname, 'public')))

 // Serve bootstrap CSS & JS file
app.use('/bootstrap',
express.static(path.join(__dirname,
'node_modules/bootstrap/dist/')));

//Serve jquery
app.use('/jquery',
express.static(path.join(__dirname,
'node_modules/jquery/dist/')));

//Serve moments
app.use('/moment',
express.static(path.join(__dirname,
'node_modules/moment/min/')));

//Serve jQuerytouchswipe
app.use('/jquery-touchswipe',
express.static(path.join(__dirname,
'node_modules/jquery-touchswipe/')));

//Serve jquery-calendar 
app.use('/jquery-calendar',
express.static(path.join(__dirname,
'node_modules/arrobefr-jquery-calendar/')));

 //Todo App:
 const cosmosClient = new CosmosClient({
   endpoint: config.host,
   key: config.authKey
 })
 const eventDao = new EventsDao(cosmosClient, config.databaseId, config.containerId)
 const eventList = new EventsList(eventDao)
 eventDao
   .init(err => {
     console.error(err)
   })
   .catch(err => {
     console.error(err)
     console.error(
       'Shutting down because there was an error settinig up the database.'
     )
     process.exit(1)
   })

 app.get('/', (req, res, next) => eventList.showEvents(req, res).catch(next))
 app.post('/addevent', (req, res, next) => eventList.addEvent(req, res).catch(next))
 app.post('/completeevent', (req, res, next) =>
   eventList.completeEvent(req, res).catch(next)
 )
 app.set('view engine', 'jade')

 // catch 404 and forward to error handler
 app.use(function(req, res, next) {
   const err = new Error('Not Found')
   err.status = 404
   next(err)
 })

 // error handler
 app.use(function(err, req, res, next) {
   // set locals, only providing error in development
   res.locals.message = err.message
   res.locals.error = req.app.get('env') === 'development' ? err : {}

   // render the error page
   res.status(err.status || 500)
   res.render('error')
 })

 module.exports = app