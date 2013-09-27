var five = require('johnny-five'),
    board,
    potentiometer;

board = new five.Board();
board.on('ready', function() {
  potentiometer = new five.Sensor({
    pin: 'A0',
    freq: 16
  });

  board.repl.inject({ pot: potentiometer });
  potentiometer.on('data', function() {
    console.log(this.value, this.raw);
  });
});
