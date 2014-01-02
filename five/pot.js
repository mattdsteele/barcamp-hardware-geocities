exports.runSensor = function(board, five, socket) {

  var potentiometer = new five.Sensor({
    pin: 'A0',
    freq: 16
  });

  board.repl.inject({ pot: potentiometer });
  potentiometer.on('data', function() {
    socket.emit('potentiometer', five.Board.map(this.raw, 0, 1024, 1, 300));
  });

};
