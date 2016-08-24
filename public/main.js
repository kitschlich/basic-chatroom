$(document).ready(function() {
	var username = prompt('Enter a username');

	if (username === '') {
		username = 'Anonymous';
	}

	var socket = io();

	socket.emit('join', username);

	var input = $('input');
	var messages = $('#messages');
	var usersConnected = $('#usersConnected');
	var onlineUsers = $('#users');
	var userTyping = $('#userTyping');

	var addMessage = function(message) {
		messages.append('<div>' + message + '</div>');
	};

	var updateUsers = function(users) {
		usersConnected.text(Object.keys(users).length);

		var userList = '';
		for (user in users) {
			userList += '<li>' + users[user] + '</li>';
			console.log(users[user]);
		}
		onlineUsers.html('');
		onlineUsers.append(userList);
	};

	var showTyping = function(user) {
		userTyping.text(user + ' is typing...');
		setTimeout(function() {
			userTyping.text('');
		}, 1000);
	}

	input.on('keydown', function(event) {
		if (event.keyCode != 13) {
			socket.emit('typing');
			return;
		}

		var message = input.val();
		addMessage(username + ': ' + message);
		socket.emit('message', message);
		input.val('');
	});

	socket.on('message', addMessage);
	socket.on('connectionInfo', updateUsers);
	socket.on('userTyping', showTyping);

	socket.on('reconnect', function() {
		socket.emit('join', username);
	});
});
