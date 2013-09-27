var five = require('johnny-five'),
    board, flex;

board = new five.Board();

board.on('ready', function() {
  flex = new five.Sensor({
    pin: 'A2',
    freq: 250
  });

  flex.on('data', function() {
    console.log(five.Board.map(this.raw, 100, 300, 0, 100));
    // console.log(this.raw);
  });
});
