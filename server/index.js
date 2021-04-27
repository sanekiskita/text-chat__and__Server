const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const PORT = process.env.PORT || 5001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rooms = new Map();
const users = new Map();

app.use(
	cors({
		credentials: true,
		origin: ['http://localhost:3000'],
		optionsSuccessStatus: 200,
	})
);

/**
 * добавить комнату для юзера
 */
app.post('/addroom', (req) => {
	try {
		const roomId = req.body.roomid;
		const user = req.body.user;
		if (users.has(user)) {
			users
				.get(user)
				.get('rooms')
				.push(+roomId);
		}
	} catch (e) {
		console.log('Ошибка при добавлении комнаты к пользователю ' + e.name + ': ' + e.message);
	}
});

/**
 * получение всех комнат для юзера
 */
app.post('/allroom/:user', (req, res) => {
	try {
		const user = req.params.user;
		const allRooms = users.has(user) ? [...users.get(user).get('rooms')] : [];
		const array = [];
		allRooms.map((element) => {
			array.push(rooms.get(element).get('setting'));
		});
		res.json(array);
	} catch (e) {
		console.log('ошибка отправки списка комнат пользователя ' + e.name + ': ' + e.message);
	}
});

/**
 * получение всех значений комнаты
 */
app.post('/getusers/:id', (req, res) => {
	try {
		const roomId = req.params.id;
		const obj = rooms.has(+roomId)
			? {
					users: [
						...rooms
							.get(+roomId)
							.get('users')
							.values(),
					],
					message: [
						...rooms
							.get(+roomId)
							.get('message')
							.values(),
					],
					setting: rooms.get(+roomId).get('setting'),
			  }
			: {
					users: [],
					message: [],
					setting: {},
			  };

		res.json(obj);
	} catch (e) {
		console.log('Ошибка при получении инф о комнате ' + e.name + ': ' + e.message);
	}
});

/**
 * получение данных при входе в комнату
 */
app.post('/joinroom', (req, res) => {
	try {
		const { roomId, userName } = req.body;
		if (
			'-1' ==
			users
				.get(userName)
				.get('rooms')
				.indexOf(+roomId)
		) {
			users
				.get(userName)
				.get('rooms')
				.push(+roomId);
		}

		if (
			rooms
				.get(+roomId)
				.get('users')
				.has(userName)
		) {
			rooms
				.get(+roomId)
				.get('users')
				.set(userName, userName);
		}

		res.json(roomId);
	} catch (e) {
		console.log('Ошибка при обновлении информации о комнатах ' + e.name + ': ' + e.message);
	}
});

/**
 * авторизация и добавление новой комнаты
 */
app.post('/user', (req, res) => {
	try {
		let roomId = 2;
		do {
			roomId = getRandomArbitrary(0, 10000);
		} while (rooms.has(+roomId));
		if (!users.has(req.body.userName)) {
			users.set(req.body.userName, new Map([['rooms', [+roomId]]]));
		} else {
			users
				.get(req.body.userName)
				.get('rooms')
				.push(+roomId);
		}
		if (!rooms.has(+roomId)) {
			rooms.set(
				+roomId,
				new Map([
					['users', new Map()],
					['message', []],
					['setting', { id: roomId, name: 'комната-' + roomId }],
				])
			);
		}
		res.json(roomId);
	} catch (e) {
		console.log('Ошибка при добавлении комнаты ' + e.name + ': ' + e.message);
	}
});

io.on('connection', (socket) => {
	console.log('a user connected');

	/**
	 * прослушка входа в комнату
	 */
	socket.on('ROOM:JOIN', ({ roomId, userName }) => {
		try {
			socket.join(+roomId);
			rooms
				.get(+roomId)
				.get('users')
				.set(userName, userName);

			const obj = rooms.has(+roomId)
				? {
						users: [
							...rooms
								.get(+roomId)
								.get('users')
								.values(),
						],
						message: [
							...rooms
								.get(+roomId)
								.get('message')
								.values(),
						],
						setting: rooms.get(+roomId).get('setting'),
				  }
				: {
						users: [],
						message: [],
						setting: {},
				  };
			socket.to(+roomId).emit('ROOM:USERS', obj);
		} catch (e) {
			console.log('ошибка при добавлении пользователя в комнату ' + e.name + ': ' + e.message);
		}
	});

	/**
	 * прослушка при выходе из комнаты
	 */
	socket.on('ROOM:USERDISCONNECT', ({ roomId, userName }) => {
		try {
			rooms.forEach((value) => {
				if (value.get('users').delete(userName)) {
					const obj = rooms.has(+roomId)
						? {
								users: [
									...rooms
										.get(+roomId)
										.get('users')
										.values(),
								],
								message: [
									...rooms
										.get(+roomId)
										.get('message')
										.values(),
								],
								setting: rooms.get(+roomId).get('setting'),
						  }
						: {
								users: [],
								message: [],
								setting: {},
						  };
					socket.broadcast.to(+roomId).emit('ROOM:USERS', obj);
				}
			});
		} catch (e) {
			console.log('ошибка при отключении пользователя от комнаты ' + e.name + ': ' + e.message);
		}
	});

	/**
	 * прослушка при отправке
	 */
	socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text, date }) => {
		try {
			rooms
				.get(+roomId)
				.get('message')
				.unshift({ userName, text, date });
			socket.broadcast.to(+roomId).emit('ROOM:ADD_MESSAGE', { userName, text, date });
		} catch (e) {
			console.log('Ошибка при получении сообщения ' + e.name + ': ' + e.message);
		}
	});

	socket.on('disconnect', () => {
		console.log('a user disconnect');
	});
});

server.listen(PORT, (err) => {
	try {
		if (err) {
			throw Error(err);
		}
		console.log('listening on *:' + PORT);
	} catch (e) {
		console.log('Ошибка при запуске ' + e.name + ': ' + e.message);
	}
});

const getRandomArbitrary = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
};
