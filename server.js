var io = require('socket.io').listen(8030);

io.sockets.on('connection', function (socket) {

	socket.on('userSay', function (data) {

		var date = new Date();
		socket.broadcast.emit(socket.room + 'UserSay', {
			username: data.username,
			message: date.getHours() + ':' + date.getMinutes() + ', ' + data.username + ' say: ' + data.message
		});
	});

	socket.on('userStartTyping', function () {
		socket.broadcast.emit(socket.room + 'UserStartTyping', { username: socket.username });
	});

	socket.on('userStopTyping', function () {
		socket.broadcast.emit(socket.room + 'UserStopTyping', { username: socket.username });
	});

	socket.on('userJoinInToRoom', function (data) {
		socket.username = data.username;
		socket.room = data.room;

		socket.broadcast.emit(socket.room + 'UserJoin', {
			username: socket.username
		});
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit(socket.room + 'UserStopTyping', { username: socket.username });
		socket.broadcast.emit(socket.room + 'UserSay', {
			username: socket.username,
			message: 'By by'
		});
	});
});