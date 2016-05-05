$(function() {
  // $('#enter').click(function(){
    // $('#battlefront').toggleClass('hide');
    // $('#battlefield').toggleClass('hide');
    var socket = io();
    socket.on('connect', function() {
      console.log('Client connected!');
    });
    socket.on('newUser', function(user) {
      var currentLevel = $('.current-level').val();
      var currentPower = $('.your-power').val();
      //on header
      var currentUsername = $('#current-username').val();

      if (user.level == currentLevel && user.username != currentUsername) {
        var newUser = (
        `<div class="conn-user">
          <form action="/duel" method="post">
            <input type="hidden" class="current-level" name="level" value="${user.level}" />
            <input type="hidden" class="your-power" name="yourPower" value="${currentPower}" />
            <input type="hidden" class="conn-power" name="connPower" value="${user.power}" />
            <input type="hidden" class="conn-username" name="username" value="${user.username}" />
            <input type="submit" class="duel-user ${user.color}" value="" />
          <a href="/users/${user.username}">@${user.username}</a>
          </form>
        </div>`
        );
        $('#new-user').prepend(newUser);
      }
    });
  // })

  $('.duel-user').on('click', function(e) {
    e.preventDefault();
    var self = $(this);
    var connUsername = $(this).siblings('.conn-username').val();
    var yourPower = $(this).siblings('.your-power').val();
    var connPower = $(this).siblings('.conn-power').val();
    var currentLevel = $(this).siblings('.current-level').val();

    $.ajax({
      url: '/duel',
      method: 'POST',
      data: {
        connUsername: connUsername,
        yourPower: yourPower,
        connPower: connPower,
        currentLevel: currentLevel
      }
    })
    .done(function(status) {
      if (!status) {
        return;
      }
      if (status == 'win') {
        $.ajax({
          url: '/duel/get',
          method: 'GET',
          data: {},
          dataType: 'json'
        })
        .done(function(data) {
          if (!data) {
            return;
          }
          $('#connected').empty();
          data.users.forEach(function(user){
            $('#connected').prepend(`<div class="conn-user">
                  <form action="/duel" method="post">
                    <input type="hidden" class="current-level" name="level" value="${user.local.level}" />
                    <input type="hidden" class="your-power" name="yourPower" value="${data.power}" />
                    <input type="hidden" class="conn-power" name="connPower" value="${user.local.power}" />
                    <input type="hidden" class="conn-username" name="username" value="${user.local.username}" />
                    <input type="submit" class="duel-user ${user.local.color}" value="" />
                  <a href="/users/${user.local.username}">@${user.local.username}</a>
                  </form>
                </div>`);
          })
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
