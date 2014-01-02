exports.runSensor = function(five, socket) {
  var flex = new five.Sensor({
    pin: 'A2',
    freq: 250
  });

  var flexed = false;
  flex.on('data', function() {
    var flexValue = this.raw,
    threshold = 130,
    minValue = 5;
    if (!flexed && flexValue < threshold && flexValue > minValue) {
      flexed = true;
      socket.emit('flex', {});
    } else if (flexed && flexValue > threshold) {
      flexed = false;
    }
  });
};
