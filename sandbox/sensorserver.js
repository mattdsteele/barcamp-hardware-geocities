var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs');

var five = require('johnny-five'),
    board;

board = new five.Board();

app.listen(8080);

function handler(req, res) {
  fs.readFile(__dirname + '/index.html', function(err, data) {
    res.writeHead(200);
    res.end(data);
  });
}

board.on('ready', function() {
  var light = new five.Sensor({
    pin: 'A5',
      freq: 50
  });
  var pot = new five.Sensor({
    pin: 'A2',
      freq: 16
  });
  board.repl.inject({ pot: light });
  board.repl.inject({ pot: pot });
  io.sockets.on('connection', function(socket) {
    light.on('data', function() {
      socket.emit('light', this.value);
    });
    pot.on('data', function() {
      socket.emit('font', this.value);
    });
  });
});
