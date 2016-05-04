$(function() {
  // $('#enter').click(function(){
    // $('#battlefront').toggleClass('hide');
    // $('#battlefield').toggleClass('hide');
    var socket = io();
    socket.on('connect', function() {
      console.log('Client connected!');
    });
    socket.on('newUser', function(user) {
      console.log('socket user',user);

      var newConnect = '<h1>'+user.username+'</h1>';
      console.log('new connection user',newConnect);

      $('#new-connect').prepend(newConnect);
      $('#new-connect').prepend('WHY YOU NO WORK');
    });
  // })

  $('.duel-user').on('click', function(e) {
    e.preventDefault();
    var self = $(this);
    var connUsername = $(this).siblings('.conn-username').val();
    var yourPower = $(this).siblings('.your-power').val();
    var connPower = $(this).siblings('.conn-power').val();

    $.ajax({
      url: '/duel',
      method: 'POST',
      data: {
        connUsername: connUsername,
        yourPower: yourPower,
        connPower: connPower
      }
    })
    .done(function(status) {
      if (status == 'win') {
        self.parent().parent().remove();
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown);
    })
  });

});
