exports.runSensor = function(board, five, socket) {
  var light = new five.Sensor({
    pin: 'A1',
    freq: 50
  });

  board.repl.inject({ pot: light });
  light.on('data', function() {
    socket.emit('lightsensor', five.Board.map(this.raw, 0, 1024, 0, 255));
  });
};
