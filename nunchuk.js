
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes/nunchuk');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.nunchuk);

var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(socket) {
  var five = require("johnny-five"),
  board, nunchuk;

  board = new five.Board();

  board.on("ready", function() {

    console.log('made it');
    new five.Pin("A4").low(); //DATA
    new five.Pin("A5").low(); //CLK
    console.log('made it');

    // Create a new `nunchuk` hardware instance.
    nunchuk = new five.Wii.Nunchuk({
      freq: 25
    });
    nunchuk.joystick.on( "change", function( err, event ) {
      var data = {
        change: 'joystick',
          axis: event.axis,
          value: event.target[event.axis]
      };
      socket.emit('data', data);
    });

    nunchuk.accelerometer.on( "change", function( err, event ) {
      var distance = event.target[event.axis];
      if (event.axis != 'z' && (distance < 400 || distance > 600)) {
        var data = {
          change: 'axis',
          axis: event.axis,
          value: event.target[event.axis]
        };
        socket.emit('data', data);
      }
    });

    [ "down", "up", "hold" ].forEach(function( type ) {

      nunchuk.on( type, function( err, event ) {
        var data = {
          change: 'button',
          type: type,
          button: event.target.which,
          value: event.target.isUp
        };
        socket.emit('data', data);
        console.log(
          event.target.which + " is " + type,

          { isUp: event.target.isUp,
            isDown: event.target.isDown
          }
        );
      });

    });
    console.log('bam, connected');
  });
});
