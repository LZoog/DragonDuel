$(function() {
  $('#enter').click(function(){
    $('#battlefront').toggleClass('hide');
    $('#battlefield').toggleClass('hide');
    var socket = io();
    socket.on('connect', function() {
      console.log('Client connected!');
    });
    socket.on('newUser', function(user) {
      console.log(user);
      var newUser = user.username;
      $('#new-connect').prepend(newUser);
    });
  })
});
