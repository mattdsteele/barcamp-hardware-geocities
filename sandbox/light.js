var five = require('johnny-five'),
    board,
    light;

board = new five.Board();
board.on('ready', function() {
  light = new five.Sensor({
    pin: 'A5',
    freq: 50
  });

  board.repl.inject({ pot: light });
  light.on('data', function() {
    console.log(this.value, this.raw);
  });
});
