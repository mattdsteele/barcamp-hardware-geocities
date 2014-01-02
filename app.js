
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
    board = new five.Board();

board.on("ready", function() {
  io.sockets.on('connection', function(socket) {
    runSensors(board, five, socket);
  });
});

var runSensors = function(board, five, socket) {
  var pot = require('./pot');
  pot.runSensor(board, five, socket);

  var light = require('./light');
  light.runSensor(board, five, socket);

  var flex = require('./flex');
  flex.runSensor(five, socket);

  var nunchuk = require('./nunchuk');
  nunchuk.runSensor(five, socket);
};
