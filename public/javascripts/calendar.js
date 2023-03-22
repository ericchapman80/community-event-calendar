'using strict';

const EventsList = require("../../routes/eventslist");

function include(file) {
      
    var script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    script.defer = true;
      
    document.getElementsByTagName('head').item(0).appendChild(script);
      
    }

 /* Include Many js files */
 /* include('/jquery/jquery.min.js');
 include('/bootstrap/js/bootstrap.min.js');
 include('/moment/moment-with-locales.min.js');
 include('/jquery-touchswipe/jquery.touchSwipe.min.js');
 include('javascripts/bootstrap-datetimepicker.min.js');
 include('/dist/js/jquery-calendar.min.js'); */
 //include('/javascripts/@azure/cosmos/');


 $(document).ready(function(){
    moment.locale('en');
      var now = moment();
      $('.dtp').datetimepicker();

      /**
       * Many events
       */
      var events = [
        {
          start: now.startOf('week').add(9, 'h').format('X'),
          end: now.startOf('week').add(10, 'h').format('X'),
          title: '1',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Professionnal'
        },
        {
          start: now.startOf('week').add(10, 'h').format('X'),
          end: now.startOf('week').add(11, 'h').format('X'),
          title: '2',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Professionnal'
        },
        {
          start: now.startOf('week').add(11, 'h').format('X'),
          end: now.startOf('week').add(12, 'h').format('X'),
          title: '3',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Personnal'
        },
        {
          start: now.startOf('week').add(1, 'days').add(9, 'h').format('X'),
          end: now.startOf('week').add(1, 'days').add(10, 'h').format('X'),
          title: '4',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Personnal'
        },
        {
          start: now.startOf('week').add(1, 'days').add(9, 'h').add(30, 'm').format('X'),
          end: now.startOf('week').add(1, 'days').add(10, 'h').add(30, 'm').format('X'),
          title: '5',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Arrobe'
        },
        {
          start: now.startOf('week').add(1, 'days').add(11, 'h').format('X'),
          end: now.startOf('week').add(1, 'days').add(12, 'h').format('X'),
          title: '6',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Another category'
        },
        {
          start: now.startOf('week').add(2, 'days').add(9, 'h').format('X'),
          end: now.startOf('week').add(2, 'days').add(10, 'h').format('X'),
          title: '7',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Personnal'
        },
        {
          start: now.startOf('week').add(2, 'days').add(9, 'h').add(30, 'm').format('X'),
          end: now.startOf('week').add(2, 'days').add(10, 'h').add(30, 'm').format('X'),
          title: '8',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Professionnal'
        },
        {
          start: now.startOf('week').add(2, 'days').add(10, 'h').format('X'),
          end: now.startOf('week').add(2, 'days').add(11, 'h').format('X'),
          title: '9',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Personnal'
        },
        {
          start: now.startOf('week').add(3, 'days').add(9, 'h').format('X'),
          end: now.startOf('week').add(3, 'days').add(10, 'h').format('X'),
          title: '10',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Professionnal'
        },
        {
          start: now.startOf('week').add(3, 'days').add(9, 'h').add(15, 'm').format('X'),
          end: now.startOf('week').add(3, 'days').add(10, 'h').add(15, 'm').format('X'),
          title: '11',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Personnal'
        },
        {
          start: now.startOf('week').add(3, 'days').add(9, 'h').add(30, 'm').format('X'),
          end: now.startOf('week').add(3, 'days').add(10, 'h').add(30, 'm').format('X'),
          title: '12',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Anything else'
        },
        {
          start: now.startOf('week').add(4, 'days').add(9, 'h').format('X'),
          end: now.startOf('week').add(4, 'days').add(12, 'h').format('X'),
          title: '13',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Private'
        },
        {
          start: now.startOf('week').add(4, 'days').add(9, 'h').add(30, 'm').format('X'),
          end: now.startOf('week').add(4, 'days').add(10, 'h').format('X'),
          title: '14',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'No more creative category name'
        },
        {
          start: now.startOf('week').add(4, 'days').add(11, 'h').format('X'),
          end: now.startOf('week').add(4, 'days').add(11, 'h').add(30, 'm').format('X'),
          title: '15',
          content: 'Hello World! <br> <p>Foo Bar</p>',
          category:'Professionnal'
        },
        {
         start: now.startOf('week').add(5, 'days').add(10, 'h').format('X'),
         end: now.startOf('week').add(5, 'days').add(12, 'h').format('X'),
         title: '17',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Private'
       },
       {
         start: now.startOf('week').add(5, 'days').add(9, 'h').add(30, 'm').format('X'),
         end: now.startOf('week').add(5, 'days').add(10, 'h').add(30, 'm').format('X'),
         title: '16',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Course'
       },
       {
         start: now.startOf('week').add(5, 'days').add(11, 'h').add(30, 'm').format('X'),
         end: now.startOf('week').add(5, 'days').add(12, 'h').add(30, 'm').format('X'),
         title: '18',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'No more creative category name'
       },
       {
         start: now.startOf('week').add(5, 'days').add(12, 'h').format('X'),
         end: now.startOf('week').add(5, 'days').add(13, 'h').format('X'),
         title: '19',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Another one'
       },
       {
         start: now.startOf('week').add(5, 'days').add(12, 'h').add(15, 'm').format('X'),
         end: now.startOf('week').add(5, 'days').add(13, 'h').format('X'),
         title: '21',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'One again'
       },
       {
         start: now.startOf('week').add(5, 'days').add(12, 'h').add(45, 'm').format('X'),
         end: now.startOf('week').add(5, 'days').add(13, 'h').add(45, 'm').format('X'),
         title: '22',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Encore'
       },
       {
         start: now.startOf('week').add(5, 'days').add(13, 'h').add(45, 'm').format('X'),
         end: now.startOf('week').add(5, 'days').add(14, 'h').format('X'),
         title: '23',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Professionnal'
       },
       {
         start: now.startOf('week').add(5, 'days').add(12, 'h').format('X'),
         end: now.startOf('week').add(5, 'days').add(14, 'h').add(30, 'm').format('X'),
         title: '20',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Private'
       },
       {
         start: now.startOf('week').add(5, 'days').add(13, 'h').add(45, 'm').format('X'),
         end: now.startOf('week').add(5, 'days').add(15, 'h').format('X'),
         title: '27',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Encore'
       },
       {
         start: now.startOf('week').add(5, 'days').add(14, 'h').add(30, 'm').format('X'),
         end: now.startOf('week').add(5, 'days').add(15, 'h').format('X'),
         title: '28',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Private'
       },
       {
         start: now.startOf('week').add(6, 'days').add(9, 'h').format('X'),
         end: now.startOf('week').add(6, 'days').add(11, 'h').format('X'),
         title: '24',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Foo'
       },
       {
         start: now.startOf('week').add(6, 'days').add(9, 'h').format('X'),
         end: now.startOf('week').add(6, 'days').add(11, 'h').format('X'),
         title: '25',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Bar'
       },
       {
         start: now.startOf('week').add(6, 'days').add(9, 'h').format('X'),
         end: now.startOf('week').add(6, 'days').add(11, 'h').format('X'),
         title: '26',
         content: 'Hello World! <br> <p>Foo Bar</p>',
         category:'Baz'
       },
      ];

      /**
       * A daynote
       */
      var daynotes = [
        {
          time: now.startOf('week').add(15, 'h').add(30, 'm').format('X'),
          title: 'Leo\'s holiday',
          content: 'yo',
          category: 'holiday'
        }
      ];

      /**
       * Init the calendar
       */
      var calendar = $('#calendar').Calendar({
        locale: 'en',
        weekday: {
          timeline: {
            intervalMinutes: 30,
            fromHour: 9
          }
        },
        events: events,
        daynotes: daynotes
      }).init();

      /**
       * Listening for events
       */

      $('#calendar').on('Calendar.init', function(event, instance, before, current, after){
        console.log('event : Calendar.init');
        console.log(instance);
        console.log(before);
        console.log(current);
        console.log(after);
      });
      $('#calendar').on('Calendar.daynote-mouseenter', function(event, instance, elem){
        console.log('event : Calendar.daynote-mouseenter');
        console.log(instance);
        console.log(elem);
      });
      $('#calendar').on('Calendar.daynote-mouseleave', function(event, instance, elem){
        console.log('event : Calendar.daynote-mouseleave');
        console.log(instance);
        console.log(elem);
      });
      $('#calendar').on('Calendar.event-mouseenter', function(event, instance, elem){
        console.log('event : Calendar.event-mouseenter');
        console.log(instance);
        console.log(elem);
      });
      $('#calendar').on('Calendar.event-mouseleave', function(event, instance, elem){
        console.log('event : Calendar.event-mouseleave');
        console.log(instance);
        console.log(elem);
      });
      $('#calendar').on('Calendar.daynote-click', function(event, instance, elem, evt){
        console.log('event : Calendar.daynote-click');
        console.log(instance);
        console.log(elem);
        console.log(evt);
      });
      $('#calendar').on('Calendar.event-click', function(event, instance, elem, evt){
        console.log('event : Calendar.event-click');
        console.log(instance);
        console.log(elem);
        console.log(evt);
      });


      //$('.dtp').datetimepicker();

      //var Calendar = $('#calendar').Calendar();
      //Calendar.init();
      //console.log(Calendar);

      var eventsDB = new PouchDB('events');

      function UUID4(){
        function S4() {
          return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
      }

      /**
       * GET
       */
      eventsDB.allDocs({
        include_docs: true
      }).then(function(result){
        var events = [];
        for (var i=0; i<result.rows.length; i++){
          events.push({
            _id: result.rows[i].doc._id,
            _rev: result.rows[i].doc._rev,
            start: result.rows[i].doc.start,
            end: result.rows[i].doc.end,
            title: result.rows[i].doc.title,
            content: result.rows[i].doc.content,
            category: result.rows[i].doc.category
          });
        }
        calendar.addEvents(events);
        calendar.init();
      }).catch(function (err){
        console.error(err);
      });

      /**
       * CREATE
       */
/*       $('#form-create').on('submit', function(event){
        event.preventDefault();
        var form = $(event.target);
        var e = {
          _id: UUID4(),
          start: form.find('.start').data("DateTimePicker").date().unix(),
          end: form.find('.end').data("DateTimePicker").date().unix(),
          title: form.find('.title').val(),
          content: form.find('.content').val().replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
          category: form.find('.category').val()
        };
        eventsDB.put(e).then(function(response){
          e._rev = response.rev;
          calendar.addEvents(e);
          calendar.init();
          $('#modal-create').modal('hide');
        }).catch(function(err){
          console.error(err);
        });
      }); */
var container = EventsList;
//const client = new CosmosClient({ endpoint: "<your endpoint>", key: "<your key>" });
//const container = client.database("<your database>").container("<your container>");

$('#form-create').on('submit', function(event){
  event.preventDefault();
  var form = $(event.target);
  var e = {
    id: UUID4(),
    start: form.find('.start').data("DateTimePicker").date().unix(),
    end: form.find('.end').data("DateTimePicker").date().unix(),
    title: form.find('.title').val(),
    content: form.find('.content').val().replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
    category: form.find('.category').val()
  };
  container.items.create(e).then(function(response){
    e._rev = response.resource._etag;
    calendar.addEvents(e);
    calendar.init();
    $('#modal-create').modal('hide');
  }).catch(function(err){
    console.error(err);
  });
});


      /**
       * UPDATE and DELETE event : replace the default modal by our modal (#modal-update)
       */
      $('#calendar').unbind('Calendar.event-click').on('Calendar.event-click', function(event, instance, elem, evt){
        $('#form-update').find('._id').val(evt._id);
        $('#form-update').find('._rev').val(evt._rev);
        $('#form-update').find('.start').data("DateTimePicker").date(moment.unix(evt.start));
        $('#form-update').find('.end').data("DateTimePicker").date(moment.unix(evt.end));
        $('#form-update').find('.title').val(evt.title);
        $('#form-update').find('.content').val(evt.content.replace(/<br>/g, '\n'));
        $('#form-update').find('.category').val(evt.category);
        $('#modal-update').modal('show');
      });

      /**
       * UPDATE
       */
      $('#form-update').on('submit', function(event){
        event.preventDefault();
        var form = $(event.target);
        var e = {
          _id: form.find('._id').val(),
          _rev: form.find('._rev').val(),
          start: form.find('.start').data("DateTimePicker").date().unix(),
          end: form.find('.end').data("DateTimePicker").date().unix(),
          title: form.find('.title').val(),
          content: form.find('.content').val().replace(/\n/g, '<br>'),
          category: form.find('.category').val()
        };
        eventsDB.put(e).then(function(response){
          var events = calendar.getEvents();
          for (var i=0; i<events.length; i++){
            if (events[i]._id == e._id){
              events[i]._rev = response.rev;
              events[i].start = e.start;
              events[i].end = e.end;
              events[i].title = e.title;
              events[i].content = e.content;
              events[i].category = e.category;
            }
          }
          calendar.init();
          $('#modal-update').modal('hide');
        }).catch(function(err){
          console.error(err);
        });
      });

      /**
       * DELETE
       */
      $('#form-update').find('.delete').click(function(){
        var form = $('#form-update');
        eventsDB.remove(form.find('._id').val(), form.find('._rev').val()).then(function(response){
          var events = calendar.getEvents();
          for (var i=0; i<events.length; i++){
            if (events[i]._id == response.id){
              events.splice(i, 1);
            }
          }
          calendar.init();
          $('#modal-update').modal('hide');
        }).catch(function(err){
          console.error(err);
        });
      });

      /**
       * Random event
       */
      $('#random').click(function(){
        $(this).attr("disabled", true);
        var titles = [
          'A New Hope',
          'The Empire Strikes Back',
          'Return of the Jedi',
          'The Phantom Menace',
          'Attack of the Clones',
          'Revenge of the Sith',
          'The Force Awakens',
          'The Last Jedi',
          'Darth Vader',
          'Obi-Wan Kenobi',
          'Luke Skywalker',
          'Han Solo',
          'Princess Leia'
        ];
        var contents = [
          'It is a period of civil war. Rebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire. During the battle, Rebel spies managed to steal secret plans to the Empire’s ultimate weapon, the DEATH STAR, an armored space station with enough power to destroy an entire planet.',
          'Pursued by the Empire’s sinister agents, Princess Leia races home aboard her starship, custodian of the stolen plans that can save her people and restore freedom to the galaxy…',
          'It is a dark time for the Rebellion. Although the Death Star has been destroyed, Imperial troops have driven the Rebel forces from their hidden base and pursued them across the galaxy.',
          'Evading the dreaded Imperial Starfleet, a group of freedom fighters led by Luke Skywalker has established a new secret base on the remote ice world of Hoth.',
          'The evil lord Darth Vader, obsessed with finding young Skywalker, has dispatched thousands of remote probes into the far reaches of space….',
          'Luke Skywalker has returned to his home planet of Tatooine in an attempt to rescue his friend Han Solo from the clutches of the vile gangster Jabba the Hutt.',
          'Little does Luke know that the GALACTIC EMPIRE has secretly begun construction on a new armored space station even more powerful than the first dreaded Death Star.',
          'When completed, this ultimate weapon will spell certain doom for the small band of rebels struggling to restore freedom to the galaxy...',
          'Turmoil has engulfed the Galactic Republic. The taxation of trade routes to outlying star systems is in dispute.',
          'Hoping to resolve the matter with a blockade of deadly battleships, the greedy Trade Federation has stopped all shipping to the small planet of Naboo.',
          'While the congress of the Republic endlessly debates this alarming chain of events, the Supreme Chancellor has secretly dispatched two Jedi Knights, the guardians of peace and justice in the galaxy, to settle the conflict....',
          'There is unrest in the Galactic Senate. Several thousand solar systems have declared their intentions to leave the Republic. This separatist movement, under the leadership of the mysterious Count Dooku, has made it difficult for the limited number of Jedi Knights to maintain peace and order in the galaxy.',
          'Senator Amidala, the former Queen of Naboo, is returning to the Galactic Senate to vote on the critical issue of creating an ARMY OF THE REPUBLIC to assist the overwhelmed Jedi....',
          'War! The Republic is crumbling under attacks by the ruthless Sith Lord, Count Dooku. There are heroes on both sides. Evil is everywhere. In a stunning move, the fiendish droid leader, General Grievous, has swept into the Republic capital and kidnapped Chancellor Palpatine, leader of the Galactic Senate.',
          'As the Separatist Droid Army attempts to flee the besieged capital with their valuable hostage, two Jedi Knights lead a desperate mission to rescue the captive Chancellor....'
        ];
        var categories = [
          'Alderaan',
          'Jedi',
          'Force',
          'Bespin',
          'Corellia',
          'Coruscant',
          'Dagobah',
          'Dantooine',
          'Dathomir',
          'Devaron',
          'Endor',
          'Géonosis',
          'Hoth',
          'Kamino',
          'Kashyyyk',
          'Kessel',
          'Mon Cala',
          'Mustafar',
          'Naboo',
          'Ryloth',
          'Tatooine',
          'Yavin IV'
        ];
        var interval = calendar.getViewInterval();
        var min = interval[0];
        var max = interval[1] - (30 * 60);
        var from = parseInt(Math.random() * (max - min) + min);
        var to = parseInt(Math.random() * (parseInt(moment.unix(from).endOf('day').subtract(1, 'h').format('X')) - (from + 30 * 60)) + (from + 600));
        var title = titles[parseInt(Math.random() * (titles.length - 1))];
        var content = contents[parseInt(Math.random() * (contents.length - 1))];
        var category = categories[parseInt(Math.random() * (categories.length - 1))];
        var e = {
          _id: UUID4(),
          start: from,
          end: to,
          title: title,
          content: content,
          category: category
        };
        eventsDB.put(e).then(function(response){
          e._rev = response.rev;
          calendar.addEvents(e);
          calendar.init();
          $('#random').removeAttr("disabled");
        }).catch(function(err){
          console.error(err);
        });
      });
    });