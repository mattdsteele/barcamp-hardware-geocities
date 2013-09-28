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
        if (value < 450) {
          console.log('Going backwards!');
          client.back(0.2);
        } else if (value > 550) {
          console.log('Going forwards!');
          client.front(0.2);
        } else {
          client.front(0);
          client.back(0);
        }
      } else if (axis === 'x') {
        if (value < 400) {
          console.log('Turning left!');
          client.left(0.2);
        } else if (value > 600) {
          console.log('Turning right!');
          client.right(0.2);
        } else {
          client.left(0);
          client.right(0);
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
      if (axis === 'y') {
        if (value < 400) {
          console.log('Elevating!');
          client.up(0.5);
        } else if (value > 600) {
          console.log('Going down!');
          client.down(0.5);
        } else {
          client.down(0);
          client.up(0);
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
      if ('z' === event.target.which &&  'down' === type && 'up' === copter.status && !flipped) {
        console.log('Flip!');
        client.animate('flipLeft', 1000);
        flipped = true;
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
  console.log('We\'re in!');
});
