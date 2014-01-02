exports.runSensor = function(five, socket) {
  new five.Pin("A4").low(); //DATA
  new five.Pin("A5").low(); //CLK
  
  // Create a new `nunchuk` hardware instance.
  var nunchuk = new five.Wii.Nunchuk({
    freq: 25
  });
  nunchuk.joystick.on( "change", function( err, event ) {
    var data = {
      change: 'position',
      axis: event.axis,
      value: event.target[event.axis]
    };
    socket.emit('nunchuk', data);
  });

  nunchuk.accelerometer.on( "change", function( err, event ) {
    var distance = event.target[event.axis];
    if (event.axis === 'x') {
      var data = {
        change: 'rotate',
        axis: event.axis,
        value: event.target[event.axis]
      };
      socket.emit('nunchuk', data);
    }
  });

  [ "down", "up", "hold" ].forEach(function( type ) {
    nunchuk.on( type, function( err, event ) {
      var data = {
        change: 'button',
        type: type,
        button: event.target.which,
        value: event.target.isUp
      };
      socket.emit('data', data);
      console.log(
        event.target.which + " is " + type,

        { isUp: event.target.isUp,
          isDown: event.target.isDown
        }
      );
    });

  });
};
