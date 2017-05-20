function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}
/*处理原始的用户输入*/
function processUserInput(chatApp, socket) {
	var message = $('#send-message').val();
	var systemMessage;

	if(message.charAt(0) == '/') { //如果用户输入内容以斜杠开头，将其视为命令
		systemMessage = chatApp.processCommand(message);
		if(message.match(/private/)){
			var msg=message.split(/\s/)[2];
			div=$('<div style="color:red"></div>').text(msg);
			$('#messages').append(div);
		}
		if(systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage));
		}
	} else {
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}

	$('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function() {
	var chatApp = new Chat(socket);

	socket.on('nameResult', function(result) {
		var message;

		if(result.success) {
			message = '你现在的名字是 ' + result.name + '.';
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});

	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('房间已改变.'));
	});

	socket.on('message', function(message) {
		var newElement = $('<div></div>').text(message.text);
		$('#messages').append(newElement);
	});

	socket.on('rooms', function(rooms) {
		$('#room-list').empty();

		for(var room in rooms) {
			room = room.substring(1, room.length);
			if(room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}

		socket.on('private message', function(from, msg) {
			var newElement = $('<div style="color:green"></div>').text(from + "对您说:" + msg);
			$('#messages').append(newElement);
		})

		$('#room-list div').click(function() {
			chatApp.processCommand('/join ' + $(this).text());
			$('#send-message').focus();
		});
	});

	setInterval(function() {
		socket.emit('rooms');
	}, 1000);

	$('#send-message').focus();

	$('#send-form').submit(function() {
		processUserInput(chatApp, socket);
		return false;
	});
});