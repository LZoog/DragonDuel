$(function() {

  /* LOGIN/JOIN MODAL (core in avgrund.js)  */
  var loginHTML = $('#login').html();
  var joinHTML = $('#join').html();

  // only .avgrund it if it exists
  if ($('#login-btn').length) {
    $('#login-btn').avgrund({
      holderClass: 'login-modal',
      template: loginHTML
    });
  }

  if ($('#join-btn').length) {
    $('#join-btn').avgrund({
      holderClass: 'join-modal',
      template: joinHTML
    });
  }

  // always keep the modals centered
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
  // must use on blur/this.next like this because it is in a modal
  $(document).on('blur', '#password', function() {
    var pw_confirm = $(this).siblings('#password-confirm').val();
    var password = $(this).val();
    // this for clickableNextButton()
    pwCheck(password, pw_confirm, this);
  });

  $(document).on('blur', '#password-confirm', function() {
    var password = $(this).siblings('#password').val();
    var pw_confirm = $(this).val();
    pwCheck(password, pw_confirm, this);
  });

  function pwCheck(password, pw_confirm, self) {
    // *confirm pw* if something has been entered in both fields
    if (password && pw_confirm) {

      // if passwords match and matching error message is hidden, show err
      if (password == pw_confirm && !($('.invalid-password').hasClass('hide'))) {
        $('.invalid-password').addClass('hide');
        clickableNextButton(self);
        // if passwords don't match and matching error message is hidden, show
      } else if (password != pw_confirm && $('.invalid-password').hasClass('hide')) {
        $('.invalid-password').removeClass('hide');
        clickableNextButton(self);
      }
      // *pw 8+ characters* if password is is <8 characters and length error message is hidden, show err
      if ((password.length < 8 || pw_confirm.length < 8) && $('.invalid-length').hasClass('hide')) {
        $('.invalid-length').removeClass('hide');
        clickableNextButton(self);
        // if password is 8+ characters and length error message is shown, hide err
      } else if ((password.length >= 8 && pw_confirm.length >= 8) && (!$('.invalid-password').hasClass('hide'))) {
        $('.invalid-length').addClass('hide');
        clickableNextButton(self);
      }
    }
  };

  // check if entered e-mail is valid and available
  $(document).on('blur', '#email', function() {
    validAndAvailable('email', this, /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm);
  });

  // check if entered username is valid and available
  $(document).on('blur', '#username', function() {
    validAndAvailable('username', this, /^[a-z0-9]+$/i);
  });

  function validAndAvailable(field, self, regex) {
    var userInput = $(self).val();

    // if it's valid
    if (regex.test(userInput)) {
      $(`.invalid-${field}`).addClass('hide');
    } else {
      $(`.invalid-${field}`).removeClass('hide');
      // hide .invalid-taken msg if .invalid-email msg is shown
      if (!($(self).siblings(`.invalid-${field}-taken`).hasClass('hide'))) {
        $(self).siblings(`.invalid-${field}-taken`).addClass('hide');
      }
      clickableNextButton(self);
      // no need to run AJAX if invalid, so return
      return;
    }

    // hide .invalid-taken if it's shown, show loading... text
    // if (!($(self).siblings(`invalid-${field}-taken`).hasClass('hide'))) {
      $(self).siblings(`.invalid-${field}-taken`).addClass('hide');
    // }
    $(self).siblings(`.checking-${field}`).removeClass('hide');

    $.ajax({
      url: '/registered',
      method: 'GET',
      data: {},
      dataType: 'json'
    })
    .done(function(users) {
      for (var i = 0; i < users.length; i++) {
        if (users[i].local[field] == userInput) {
          //if entered text matches email or UN in DB, display error
          $(self).siblings(`.invalid-${field}-taken`).removeClass('hide');
          break;
        }
      }
      // remove loading... text
      $(self).siblings(`.checking-${field}`).addClass('hide');
      clickableNextButton(self);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log('GET registered users ajax failed',jqXHR, textStatus, errorThrown);
    })
  };

  // if everything is filled out without an error, show .next is clickable
  function clickableNextButton(self) {
    var validCount = 0;
    var inputs = $(self).siblings('input');
    for (var i = 0; i < inputs.length; i++) {
      if ($(inputs[i]).val()) {
        validCount++;
      }
    }
    if (validCount == 3 && $(self).siblings('span[class^="invalid"].hide').not('.invalid-form').length == 6 && !($('.next').hasClass('clickable'))) {
      console.log('add class clickable');
      $(self).siblings('.next').addClass('clickable');
    } else if ($('.next').hasClass('clickable')) {
      console.log('remove class clickable');
      $(self).siblings('.next').removeClass('clickable');
    }
  };
  /* END SIGN UP VALIDATIONS */


  /* SIGN UP SHOW/HIDE SECTIONS */
  $(document).on('click', '.next', function() {
    // all fields have input + no err msgs (there are 6 possible err msgs)
    // if ($(this).siblings('#email').val() && $(this).siblings('#password').val() && $(this).siblings('#password-confirm').val() && $(this).siblings('#username').val() && $(this).siblings('span[class^="invalid"].hide').not('.invalid-form').length == 6) {
      // hide this div and show the next one
      $(this).parent().fadeOut(300);
      var self = this;
      setTimeout(function(){
        $(self).parent().next().fadeIn(300).removeClass('hide');
        modalCSS('join');
      }, 300);
    // }
  });

  $(document).on('click', 'input[type="radio"]:not(.last)', function() {
    var self = this;
    $(this).parent().parent().fadeOut(300);
    setTimeout(function(){
      $(self).parent().parent().next().fadeIn(300).removeClass('hide');
      modalCSS('join');
    }, 300);
  })

  $(document).on('click', '.back', function() {
    var self = this;
    $(this).parent().fadeOut(300);
    setTimeout(function(){
      $(self).parent().prev().fadeIn(300).removeClass('hide');
      modalCSS('join');
    }, 300);
  });

  /* END SIGN UP SHOW/HIDE SECTIONS */

  /* SOCKET IO */
  var socket = io();
  socket.on('connect', function() {
    console.log('Client connected!');
  });

  // a new user entered the battlefield or went up/down a level
  socket.on('newUser', function(user) {
    var currentLevel = $('.current-level').val();
    var currentPower = $('.your-power').val();

    if (user.level == currentLevel) {
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

  // user removed from battlefield because they lost on level 1
  socket.on('sendToUL', function(username) {
    var currentUsername = $('#current-username').val();

    if (currentUsername == username) {
     window.location.replace(`/users/${username}`);
    }
  });

  // user left the battlefield or moved up/down a level
  socket.on('removeFromField', function(user) {
    var currentLevel = $('.current-level').val();

    if (currentLevel == user.level) {
      $(`input[value='${user.username}']`).parent().parent().remove();
    }
  });

  // level changed; load new level
  socket.on('getLevel', function(username) {
    var currentUsername = $('#current-username').val();
    if (currentUsername == username) {
      ajaxGetLevel();
    }
  });
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
    //for ajaxGetLevel()
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
      if (status == 'win' || (status == 'lose' && currentLevel > 1) || (status == 'tie' && currentLevel > 1)) {
        console.log('inside loop');
        ajaxGetLevel();
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log('Battlefield GET ajax failed',jqXHR, textStatus, errorThrown);
    })
  });

  function ajaxGetLevel() {
    $.ajax({
      url: '/duel/update',
      method: 'GET',
      data: {},
      dataType: 'json'
    })
    .done(function(data) {
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
  };

});
