$(function() {
  // $('#enter').click(function(){
    // $('#battlefront').toggleClass('hide');
    // $('#battlefield').toggleClass('hide');
    var socket = io();
    socket.on('connect', function() {
      console.log('Client connected!');
    });
    socket.on('newUser', function(user) {

      var newConnect = '<h1>'+user.username+'</h1>';

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
        $.ajax({
          url: '/duel/get',
          method: 'GET',
          data: {},
          dataType: 'json'
        })
        .done(function(data) {
          if (!data) {
            return;
          } else {
            console.log('data',data);
            console.log('data.users',data.users);
            console.log('data.power', data.power);
            //loop through dragons & display
            $('#connected').empty();
            data.users.forEach(function(user){
              $('#connected').prepend(`<div class="conn-user">
                    <form action="/duel" method="post">
                      <input type="hidden" class="conn-username" name="username" value="${user.local.username}" />
                      <input type="hidden" class="your-power" name="yourPower" value="${data.power}" />
                      <input type="hidden" class="conn-power" name="connPower" value="${user.local.power}" />
                      <input type="submit" class="duel-user ${user.local.color}" value="" />
                    <a href="/users/${user.local.username}">@${user.local.username}</a>
                    </form>
                  </div>`);
            })

          }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown);
        })
      }
    })
    //for first AJAX
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown);
    })
  });

});
