var socket;
socket = io.connect('http://localhost:3000');

Reveal.addEventListener('potentiometer', function() {
  var text = $('[data-state="potentiometer"].present p');
  socket.on('potentiometer', function(data) {
    text.css('font-size', data + 'px');
  });
}, false);

Reveal.addEventListener('lightsensor', function() {
  var background = $('.state-background');
  console.log(background);
  socket.on('lightsensor', function(data) {
    data = Math.round(data);
    var css ='rgba(' + data + ',' + (255 - data) + ',' + (255 - data) + ', 0.5)' ;
    if (document.querySelector('[data-state="lightsensor"].present')) {
      background.css('background-color', css);
    }
  });
}, false);

Reveal.addEventListener('afterlight', function() {
  var background = $('.state-background');
  background.css('background', 'transparent');
}, false);

Reveal.addEventListener('flexsensor', function() {
  socket.on('flex', function(data) {
    console.log('boom!');
    //Flex
    ig.input.presses = {gravityflip: true};
  });
}, false);

Reveal.addEventListener('monster', function() {
  var monster = $('.monster section.present img');
  socket.on('nunchuk', function(data) {
    if (data.change === 'rotate') {
      var diff = ((data.value - 300) / 400) * 360;
      monster.css('-webkit-transform', 'rotate(' + (diff + 180) + 'deg)');
    } else {
      if (data.axis === 'x') {
        var diff = (data.value - 100) / 800;
        var delta = (diff * 100) - 50;
        monster.css('left', delta + '%');
      } else {
        var diff = (data.value - 100) - 350;
        monster.css('top', '' + (diff * -1) + 'px');
      }
    }
  });
  background.css('background', 'transparent');
}, false);
