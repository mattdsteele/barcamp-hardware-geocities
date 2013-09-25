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
          client.back(0.5);
        } else if (value > 520) {
          client.front(0.5);
        } else {
          client.front(0);
        }
      } else if (axis === 'x') {
        if (value < 480) {
          client.left(0.5);
        } else if (value > 520) {
          client.right(0.5);
        } else {
          client.left(0);
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
    var distance = event.target[event.axis];
    if ('up' === copter.status) {
      if (event.axis != 'z' && (distance < 400 || distance > 600)) {
        console.log('bam');
      }
    }
    if (event.axis != 'z' && (distance < 400 || distance > 600)) {
      var data = {
        change: 'axis',
    axis: event.axis,
    value: event.target[event.axis]
      };
    }
  });

  [ "down", "up", "hold" ].forEach(function( type ) {

    nunchuk.on( type, function( err, event ) {
      //takeoff
      if (type === 'hold' && 'c' === event.target.which && 'down' === copter.status) {
        console.log('Taking off!');
        copter.status = 'up';
        client.disableEmergency();
        client.ftrim();
        client.takeoff();
      } else if (type === 'hold' && 'c' === event.target.which && 'up' === copter.status) {
        console.log('Landing!');
        copter.status = 'down';
        client.land();
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
