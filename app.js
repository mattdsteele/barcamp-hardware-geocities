
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
var five = require("johnny-five"),
    board, nunchuk;

board = new five.Board();

board.on("ready", function() {
  io.sockets.on('connection', function(socket) {


    new five.Pin("A4").low(); //DATA
    new five.Pin("A5").low(); //CLK

    var potentiometer = new five.Sensor({
      pin: 'A0',
      freq: 16
    });

    var light = new five.Sensor({
      pin: 'A1',
      freq: 50
    });

    board.repl.inject({ pot: light });
    light.on('data', function() {
      socket.emit('lightsensor', five.Board.map(this.raw, 0, 1024, 0, 255));
    });

    board.repl.inject({ pot: potentiometer });
    potentiometer.on('data', function() {
      socket.emit('potentiometer', five.Board.map(this.raw, 0, 1024, 1, 300));
    });

    flex = new five.Sensor({
      pin: 'A2',
      freq: 250
    });

    var flexed = false;
    flex.on('data', function() {
      var flexValue = this.raw,
        threshold = 130,
        minValue = 5;
      if (!flexed && flexValue < threshold && flexValue > minValue) {
        flexed = true;
        socket.emit('flex', {});
      } else if (flexed && flexValue > threshold) {
        flexed = false;
      }
  });
    // Create a new `nunchuk` hardware instance.
    nunchuk = new five.Wii.Nunchuk({
      freq: 25
    });
    nunchuk.joystick.on( "change", function( err, event ) {
      var data = {
        change: 'position',
          axis: event.axis,
          value: event.target[event.axis]
      };
      socket.emit('nunchuk', data);
    });

    nunchuk.accelerometer.on( "change", function( err, event ) {
      var distance = event.target[event.axis];
      if (event.axis === 'x') {
        var data = {
          change: 'rotate',
          axis: event.axis,
          value: event.target[event.axis]
        };
        socket.emit('nunchuk', data);
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
