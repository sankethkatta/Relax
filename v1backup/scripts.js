(function() {
  var time;

  time = 300;

  $(document).ready(function() {
    var startTimer, startTracking;
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
          $('#timer').fadeOut(3000);
          $('#progressWrapper').fadeOut(3000).delay(3000);
          return $('#commentWrapper').delay(3000).fadeIn(3000);
        }
      }, 1000);
    };
    $('#comment').focus(function() {
      $(this).removeClass('faded');
      return $(this).html('');
    });
    $('#commentWrapper').blur(function() {
      $(this).removeClass('faded');
      return $(this).html('How did you feel?');
    });
    return $("form").submit(function(evnt) {
      console.log($(this).serialize());
      return evnt.preventDefault();
    });
  });

}).call(this);
