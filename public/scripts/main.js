$(function() {

  /* LOGIN/JOIN MODAL (core in avgrund.js)  */
  var loginHTML = $('#login').html();
  var joinHTML = $('#join').html();

  $('#login-btn').avgrund({
    holderClass: 'login-modal',
    template: loginHTML
  });

  $('#join-btn').avgrund({
    holderClass: 'join-modal',
    template: joinHTML
  });

  //always keep the modals centered
  function modalCSS(name) {
    var height = $(`.${name}-modal`).height();
    var width = $(`.${name}-modal`).width();
    $('.avgrund-popin').css({
      'margin-top': -(height)/2+'px',
      'margin-left': -(width)/2+'px'
    });
  }

  $('#login-btn').click(function() {
    modalCSS('login');
  })
  $('#join-btn').click(function() {
    modalCSS('join');
  })

  $(window).resize(function() {
    if ($('.avgrund-popin').hasClass('login-modal')) {
      modalCSS('login');
    } else if ($('.avgrund-popin').hasClass('join-modal')) {
      modalCSS('join');
    }
  });
  /* END LOGIN/JOIN MODAL */


  /* SIGN UP VALIDATIONS */
  // password confirmation
  var password = $('#password').val(),
  confirm_password = $('#confirm_password').val();

  function validatePassword(){
    if (password != confirm_password) {
      confirm_password.setCustomValidity("Passwords don't match!");
    } else {
      confirm_password.setCustomValidity('');
    }
  }
  password.onchange = validatePassword;
  confirm_password.onkeyup = validatePassword;

  // check if e-mail is taken & validate
  checkAvailability('email');

  //check if username is taken
  checkAvailability('username');

  function checkAvailability(field) {
    // must use parent element & this/self because of modals
    $(document).on('blur', '#'+field, function() {
      var typedInput = $(this).val();
      var self = this;

      // if it's the e-mail field, validate it
      if (field == 'email') {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;

        // if it's valid
        if (re.test(typedInput)) {
          $('.invalid').addClass('hide');
          // empty available/unavailable
          $(self).next().empty();
        } else {
          $('.invalid').removeClass('hide');
          $(self).next().empty();
          // no need to run AJAX request if e-mail is invalid
          return;
        }
      }
      $.ajax({
        url: '/registered',
        method: 'GET',
        data: {},
        dataType: 'json'
      })
      .done(function(users) {
        var check = '<span>available 😁</span>';

        for (var i = 0; i < users.length; i++) {
          if (users[i].local[field] == typedInput) {
            console.log('got to unavailable');
            check = '<span class="taken">unavailable 😢</span>';
            break;
          }
        }
        $(self).next().html(check);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log('ajax failed',jqXHR, textStatus, errorThrown);
      })
    });
  };
  /* END SIGN UP VALIDATIONS */


  /* SOCKET IO */
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

    console.log('currentUsername', currentUsername);

    function userNotOnField() {
      var usersOnField = [];
      $('.conn-username').each(function() {
        usersOnField.push(($(this).val()));
      });

      console.log('usersOnField',usersOnField);

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

    console.log('user.level',user.level);
    console.log('user.username', user.username);

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

  // socket.on('getLevel', function(username) {
  //   //on header
  //   var currentUsername = $('#current-username').val();
  //   if (currentUsername == username) {
  //     ajaxGetLevel();
  //   }
  // });
  /* END OF SOCKET.IO */


  if (!$('.current-level').val()) {
    $('#duel').removeClass('hide');
  } else {
    $('#duel').addClass('hide');
  }

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
          console.log('Battlefield POST ajax failed',jqXHR, textStatus, errorThrown);
        })
      }
    })
    //for first AJAX
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log('Battlefield GET ajax failed',jqXHR, textStatus, errorThrown);
    })
  });

});
