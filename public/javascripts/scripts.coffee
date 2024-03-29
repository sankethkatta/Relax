time = 300 #seconds
$(document).ready ->

	$('#start').click ->
		$('#start').fadeOut(1000)
		$('#timer').delay(1000).fadeIn(1000)
		$('#progress').delay(1000).fadeIn(1000)
		$('#progressWrapper').delay(1000).fadeIn(1000)
		setTimeout ->
			startTimer()
		, 1000		
		setTimeout ->
			startTracking()
		, 3000
	startTracking = ->
		$(document).click ->
			$('#message').html "It's okay, let go of the mouse"
			$('#message').show()
			$('#message').fadeOut(3000)

		$(document).mouseover ->
			$('#message').html "It's okay, let go of the mouse"
			$('#message').show()
			$('#message').fadeOut(3000)

		$(document).keydown ->
			$('#message').html "It's okay, move your hands off the keyboard"
			$('#message').show()
			$('#message').fadeOut(3000)
	startTimer = ->
		curTime = time
		run = setInterval ->
			curTime-=1
			$('#progress').css({width: ((time-curTime)*100)/time+"%"}) 
			
			if curTime > 60
				minute = Math.floor(curTime/60)
				second = curTime % 60 
				if second < 10
					$('#timer').html "#{minute}:0#{second}"
				else
					$('#timer').html "#{minute}:#{second}"
			else if curTime >= 0
				second = curTime
				$('#timer').html second
				if curTime == 5
					$('object').css 'display', 'block'
				
			else 
				$('#timer').html "DONE!"
				clearInterval(run)
				$(document).unbind()				
				$('#timer').fadeOut(2000)
				$('#progressWrapper').fadeOut(2000).delay(2000)
				$('#commentWrapper').delay(2000).fadeIn(2000)
		, 1000

	$('#comment').focus ->
		if $(@).html() == 'How did you feel?'
			$(@).removeClass('faded')
			$(@).html('')

	$('#comment').blur ->
		if $(@).html() == "" 
			$(@).addClass('faded')
			$(@).html('How did you feel?')
	
	send = (sendData, type) ->
		$.ajax
			type: "POST",
			url: "http://localhost:1995/#{type}",
			data:  sendData,
			dataType:  "text"
	
	validate = (obj) ->
		if (obj.username == "" || obj.password == "")
			return "ERROR"
