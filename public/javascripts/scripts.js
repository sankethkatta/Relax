(function() {
  var time;

  time = 2;

  $(document).ready(function() {
    var send, startTimer, startTracking, validate;
    $('#start').click(function() {
      $('#start').fadeOut(1000);
      $('#timer').delay(1000).fadeIn(1000);
      $('#progress').delay(1000).fadeIn(1000);
      $('#progressWrapper').delay(1000).fadeIn(1000);
      setTimeout(function() {
        return startTimer();
      }, 1000);
      return setTimeout(function() {
        return startTracking();
      }, 3000);
    });
    startTracking = function() {
      $(document).click(function() {
        $('#message').html("It's okay, let go of the mouse");
        $('#message').show();
        return $('#message').fadeOut(3000);
      });
      $(document).mouseover(function() {
        $('#message').html("It's okay, let go of the mouse");
        $('#message').show();
        return $('#message').fadeOut(3000);
      });
      return $(document).keydown(function() {
        $('#message').html("It's okay, move your hands off the keyboard");
        $('#message').show();
        return $('#message').fadeOut(3000);
      });
    };
    startTimer = function() {
      var curTime, run;
      curTime = time;
      return run = setInterval(function() {
        var minute, second;
        curTime -= 1;
        $('#progress').css({
          width: ((time - curTime) * 100) / time + "%"
        });
        if (curTime > 60) {
          minute = Math.floor(curTime / 60);
          second = curTime % 60;
          if (second < 10) {
            return $('#timer').html("" + minute + ":0" + second);
          } else {
            return $('#timer').html("" + minute + ":" + second);
          }
        } else if (curTime >= 0) {
          second = curTime;
          $('#timer').html(second);
          if (curTime === 5) return $('object').css('display', 'block');
        } else {
          $('#timer').html("DONE!");
          clearInterval(run);
          $(document).unbind();
          $('#timer').fadeOut(2000);
          $('#progressWrapper').fadeOut(2000).delay(2000);
          return $('#commentWrapper').delay(2000).fadeIn(2000);
        }
      }, 1000);
    };
    $('#comment').focus(function() {
      if ($(this).html() === 'How did you feel?') {
        $(this).removeClass('faded');
        return $(this).html('');
      }
    });
    $('#comment').blur(function() {
      if ($(this).html() === "") {
        $(this).addClass('faded');
        return $(this).html('How did you feel?');
      }
    });
    send = function(sendData, type) {
      return $.ajax({
        type: "POST",
        url: "http://localhost:1995/" + type,
        data: sendData,
        dataType: "text"
      });
    };
    return validate = function(obj) {
      if (obj.username === "" || obj.password === "") return "ERROR";
    };
  });

}).call(this);
