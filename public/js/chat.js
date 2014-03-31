$(function () {

	var Chat = function () {
	};
	Chat.prototype = {
		__socket: null,
		__domain: window.location.host,
		__port: 80,
		__room: 'homepage',
		__username: null,
		initialize: function () {
			this.__socket = io.connect('http://' + this.getDomain() + ':' + this.getPort() + '/');
			var path = window.location.pathname.split('/');

			if (path.length > 1)
				this.__room = md5(path[1]);

			this.__username = $.cookie('username');
			if (this.__username !== null && this.__username !== undefined)
				this.dialog();

			var self = this;
			var room = this.getRoom();

			$("#login-form-wrapper form").submit(function (e) {
				e.preventDefault();

				self.__username = $(this).find('input[name=username]').val().escapeHTML();
				self.print('Hi, ' + self.__username);
				$(this).parent().hide();

				$.cookie('username', self.__username, {path:'/'});

				self.dialog();
			});

			$('a[role="logout"]').click(function () {
				self.logout();
			});

			var form = $("#input-box-wrapper form").submit(function (e) {
				e.preventDefault();
				var textArea = $('#input-box-wrapper form textarea[name=message]');
				if (textArea.val().length > 0) {
					self.send(textArea.val());
					textArea.val('');
				}
			});

			$("#input-box-wrapper form textarea").keypress(function (e) {
				if (e.keyCode === 13) {
					e.preventDefault();
					$(this).blur();
					form.submit();
				}
			});

		},
		send: function (message) {
			this.getSocket().emit('userSay', {
				message: message,
				username: this.getUsername()
			});
			var date = new Date();
			this.print('You say, ' + date.getHours() + ':' + date.getMinutes() + ': ' + message);
		},
		typing: function (type, username) {
			var wrapper = $("#dialog-wrapper");
			if (type === 'start' && !wrapper.find('div.typing[data-username=' + username.escapeHTML() + ']').length)
				wrapper.append('<div class="typing" data-username="' + username.escapeHTML() + '">' + username + ' is typing a message </div>');
			else
				wrapper.find('div.typing[data-username=' + username.escapeHTML() + ']').remove();
		},
		on: function (action, callback) {
			this.getSocket().on(this.getRoom() + action, callback);
		},
		dialog: function () {
			var room = this.getRoom();
			var self = this;

			self.getSocket().emit('userJoinInToRoom', { room: room, username: self.getUsername() });

			$('div.logout-button').show();
			$("#login-form-wrapper").hide();

			this.on('UserJoin', function (data) {
				self.print('New user connected to our room, His name is ' + data.username);
			});

			this.on('UserSay', function (data) {
				self.print(data.message);
			});

			this.on('UserStartTyping', function (data) {
				self.typing('start', data.username);
			});

			this.on('UserStopTyping', function (data) {
				self.typing('stop', data.username);
			});

			$('#input-box-wrapper form textarea[name=message]').focus(function () {
				self.getSocket().emit('userStartTyping', { });
			}).blur(function () {
				self.getSocket().emit('userStopTyping', { });
			});

			$("#input-box-wrapper").show();
		},
		print: function (message) {
			$("#dialog-wrapper").append('<div>' + message.escapeHTML() + '</div>');
		},
		getUsername: function () {
			return this.__username;
		},
		getRoom: function () {
			return this.__room;
		},
		logout: function () {
			this.print('By by ' + this.getUsername());
			$("#input-box-wrapper, div.logout-button").hide();
			$('#login-form-wrapper').show();
			$.cookie('username', null);
			this.getSocket().off('all');
		},
		getDomain: function () {
			return this.__domain;
		},
		getPort: function () {
			return this.__port;
		},
		getSocket: function () {
			return this.__socket;
		},
		run: function () {
			this.initialize();
		}
	};
	var chat = new Chat();
	chat.run();
});