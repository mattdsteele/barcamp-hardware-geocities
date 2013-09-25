var five = require('johnny-five'),
    board, flex;

board = new five.Board();

board.on('ready', function() {
  flex = new five.Sensor({
    pin: 'A2',
    freq: 250
  });

  flex.scale(85, 300).on('data', function() {
    console.log(five.Board.map(this.raw, 85, 300, 0, 255));
    console.log(this.scaled, this.raw);
  });
});
