$(function() {

  //on header
  var currentUsername = $('#current-username').val();

  /*** SOCKETS ***/
  var socket = io();
  socket.on('connect', function() {
    console.log('Client connected!');
  });
  // New user joined battlefield
  socket.on('newUser', function(user) {
    var currentLevel = $('.current-level').val();
    var currentPower = $('.your-power').val();
    //on header
    var currentUsername = $('#current-username').val();

    function userNotOnField() {
      var usersOnField = [];
      $('.conn-username').each(function() {
        usersOnField.push(($(this).val()));
      });
      console.log(usersOnField);
      console.log(user.username);

      if (usersOnField.length !== 0) {
       for (var i = 0; i < usersOnField.length; i++) {
          if (usersOnField[i] == user.username) {
            return false;
          }
        }
        //after for loop
        return true;
      } else {
        return true;
      }
    };

    //only append if the user is not already on the field, new user's level matches yours, and it is not you
    if (userNotOnField() && user.level == currentLevel && user.username != currentUsername) {
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

  // User removed from battlefield because they lost on level 1
  socket.on('removeFromField', function(username) {
    //on header
    var currentUsername = $('#current-username').val();

    console.log('first currentUsername', currentUsername);

    if (currentUsername == username) {
      window.location.replace(`/users/${username}`);
    }
    // }
  });

  // User left battlefield manually OR user lost & is moved down a level
  socket.on('leftField', function(user) {
    var currentLevel = $('.current-level').val();
    console.log('currentLevel',currentLevel);
    console.log('user.level', user.level);
    if (currentLevel == user.level) {
      $(`input[value='${user.username}']`).parent().parent().remove();
    }
  });
  /*** /SOCKETS ***/








  // function win() {
  //   console.log('got to win()');
  //   //you go up a level
  //   User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': upLevel }, function(err, user) {
  //     if (err) console.log(err);
  //     io.sockets.emit('leftField', user.local);
  //     console.log('emitted leftfield event');
  //     // if opponent is on level 1, remove them from battlefield, emit event
  //     if (currentLevel == 1) {
  //       console.log('inside if statement');
  //       User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.battlefield': false }, function(err, user) {
  //         if (err) console.log(err);
  //         io.sockets.emit('removeFromField', connUsername);
  //         console.log('connUsername', connUsername);
  //         res.send('isthisworking');
  //       });
  //     } else {
  //       console.log('downLevel',downLevel);
  //       //find opposing user & make them go down a level
  //       User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.level': downLevel }, function(err, user) {
  //         if (err) console.log(err);
  //         io.sockets.emit('newUser', user.local);
  //         //io.sockets.emit('getLevel', user.local.username);
  //         res.send('win');
  //       });
  //     }
  //   });
  // };



  $('.duel-user').on('click', function(e) {
    e.preventDefault();
    var connUsername = $(this).siblings('.conn-username').val();
    var yourPower = $(this).siblings('.your-power').val();
    var connPower = $(this).siblings('.conn-power').val();
    //for 2nd ajax
    var currentLevel = $(this).siblings('.current-level').val();

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

      console.log(status);
      if (status == 'win' || (status == 'lose' && currentLevel > 1) || (status == 'tie' && currentLevel > 1)) {
        console.log('inside loop');
        $.ajax({
          url: '/duel/update',
          method: 'GET',
          data: {},
          dataType: 'json'
        })
        .done(function(data) {
          // if (!data) {
          //   return;
          // }
          console.log('data', data);
          console.log('data.users',data.users);
          console.log('data.power',data.power);
          console.log('data.users[0]', data.users[0]);
          console.log('data.users[0].local', data.users[0].local);
          console.log('data.users[0].local.username', data.users[0].local.username);
          $('#connected').empty();
          data.users.forEach(function(user){
            console.log(user);
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
          console.log('ajax failed',jqXHR, textStatus, errorThrown);
        })
      }
    })
    //for first AJAX
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log('2ajax failed',jqXHR, textStatus, errorThrown);
    })
  });

});
