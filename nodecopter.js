var five = require("johnny-five"),
    board, nunchuk;

board = new five.Board();

var arDrone = require('ar-drone'),
    client = arDrone.createClient(),
    copter = {
      status: 'down'
    };


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
    var axis = event.axis,
      value = event.target[axis];
    //x: 108 -> 896
    //y: 144 -> 888
    if (copter.status === 'up') {
      if (axis === 'y') {
        if (value < 480) {
          client.down(0.5);
        } else if (value > 520) {
          client.up(0.5);
        } else {
          console.log('y is zero!');
          client.stop();
        }
      } else if (axis === 'x') {
        if (value < 480) {
          client.counterClockwise(0.5);
        } else if (value > 520) {
          client.clockwise(0.5);
        } else {
          console.log('x is zero!');
          client.stop();
        }
      }
    }
    var data = {
      change: 'joystick',
      axis: event.axis,
      value: event.target[event.axis]
    };
    console.log(data);
  });

  nunchuk.accelerometer.on( "change", function( err, event ) {
    var value = event.target[event.axis],
    axis = event.axis;
    if ('up' === copter.status) {
      if (axis === 'y') {
        if (value < 400) {
          console.log('going back');
          client.back(0.2);
        } else if (value > 600) {
          console.log('not going back');
          client.front(0.2);
        } else {
          console.log('y is zero!');
          client.stop();
        }
      } else if (axis === 'x') {
        if (value < 400) {
          client.left(0.2);
        } else if (value > 600) {
          client.right(0.2);
        } else {
          console.log('x is zero!');
          client.stop();
        }
      }
    }
  });

  [ "down", "up", "hold" ].forEach(function( type ) {

    var flipped = false;
    nunchuk.on( type, function( err, event ) {
      //takeoff
      if (type === 'hold' && 'c' === event.target.which && 'down' === copter.status) {
        console.log('Taking off!');
        client.disableEmergency();
        client.ftrim();
        client.after(2000, function() {
          this.takeoff();
          this.stop();
          copter.status = 'up';
        });
      } else if (type === 'hold' && 'c' === event.target.which && 'up' === copter.status) {
        console.log('Landing!');
        copter.status = 'down';
        client.land();
      }
      if ('z' === event.target.which &&  'down' === type && 'up' === copter.status) {
        // console.log('Hover!');
        // client.stop();
      } else if ('z' === event.target.which && 'hold' === type && !flipped) {
        console.log('flipped!');
        flipped = true;
        client.animate('flipLeft', 1000);
      }
      var data = {
        change: 'button',
      type: type,
      button: event.target.which,
      value: event.target.isUp
      };
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
