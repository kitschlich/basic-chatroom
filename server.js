var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var users = {};

io.on('connection', function(socket) {

	serverSockets = io.sockets.sockets;

	socket.on('join', function(username) {
		users[socket.id] = username;
		console.log(username + ' has connected');
		socket.broadcast.emit('message', username + ' has connected');

		var connections = Object.keys(serverSockets).length;
		io.emit('connectionInfo', users);
		console.log('Current connections: ' + Object.keys(users).length);
	});

	socket.on('typing', function() {
		socket.broadcast.emit('userTyping', users[socket.id]);
	});

	socket.on('message', function(message) {
		console.log('Received message:', message);
		if ((message.slice(0,1) === '/') && (message.indexOf('') !== -1)) {
			var spaceAt = message.indexOf(' ');
			var userToPm = message.slice(1,spaceAt);
			var newMessage = message.slice(spaceAt+1);
			for (user in users) {
				if (users[user] === userToPm) {
					socket.broadcast.to(user).emit('message', 'PM from ' + users[socket.id] + ': ' + newMessage);
				}
			}
		}
		else {
			socket.broadcast.emit('message', users[socket.id] + ': ' + message);
		}
	});

	socket.on('disconnect', function() {
		console.log(users[socket.id] + ' has disconnected');
		socket.broadcast.emit('message', users[socket.id] + ' has disconnected');

		delete users[socket.id];
		io.emit('connectionInfo', users);
	});
});

server.listen(8080);
