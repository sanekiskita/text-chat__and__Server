const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { isArray } = require('util');
const io = new Server(server);
const PORT = process.env.PORT || 5001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rooms = new Map();
const users = new Map();


app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
    optionsSuccessStatus: 200
  })
);
/**
* добавить комнату для юзера
*/
app.post('/addroom', (req, res) => {
  const roomId = req.body.roomid;
  const user = req.body.user;
  if (users.has(user)) {
    users.get(user).get('rooms').push(+roomId);
  }

});
/**
* получение всех комнат для юзера
*/
app.post('/allroom/:user', (req, res) => {
  const user = req.params.user;
  const allRooms = users.has(user) ? [...users.get(user).get('rooms')] : [];
  const array = [];
  allRooms.map((element) => {
    array.push(rooms.get(element).get('setting'));
  });
  res.json(array);
});
/**
* получение всех значений комнаты
*/
app.post('/getusers/:id', (req, res) => {
  const roomId = req.params.id;
  const obj = rooms.has(+roomId) ? {
    users: [...rooms.get(+roomId).get('users').values()],
    message: [...rooms.get(+roomId).get('message').values()],
    setting: rooms.get(+roomId).get('setting'),
  } : {
    users: [],
    message: [],
    setting: {},
  };

  res.json(obj);
});
/**
* получение данных при входе в комнату
*/
app.post('/joinroom', (req, res) => {
  const { roomId, userName } = req.body;
  if ('-1' == users.get(userName).get('rooms').indexOf(+roomId)) {
    users.get(userName).get('rooms').push(+roomId);
  }

  if (rooms.get(+roomId).get('users').has(userName)) {
    rooms.get(+roomId).get('users').set(userName, userName);
  }

  res.json(roomId);
})
/**
* авторизация и добавление новой комнаты
*/
app.post('/user', (req, res) => {
  let roomId = 2;
  do {
    roomId = getRandomArbitrary(0, 10000);

  } while (rooms.has(+roomId))
  if (!users.has(req.body.userName)) {
    users.set(req.body.userName, new Map([
      ['rooms', [+roomId]]
    ]));
  } else {
    users.get(req.body.userName).get('rooms').push(+roomId);
  }
  if (!rooms.has(+roomId)) {
    rooms.set(+roomId, new Map([
      ['users', new Map()],
      ['message', []],
      ['setting', { 'id': roomId, 'name': 'комната-' + roomId }],
    ]));
  }
  res.json(roomId);
});



io.on('connection', (socket) => {
  console.log('a user connected');
/**
* прослушка входа в комнату
*/
  socket.on('ROOM:JOIN', ({ roomId, userName }) => {
    socket.join(+roomId);
    //rooms.get(roomId).get('users').set(socket.id,userName);
    rooms.get(+roomId).get('users').set(userName, userName);

    const obj = rooms.has(+roomId) ? {
      users: [...rooms.get(+roomId).get('users').values()],
      message: [...rooms.get(+roomId).get('message').values()],
      setting: rooms.get(+roomId).get('setting'),
    } : {
      users: [],
      message: [],
      setting: {},
    };
    socket.to(+roomId).emit('ROOM:USERS', obj);
  });

  /**
* прослушка при выходе из комнаты
*/
  socket.on('ROOM:USERDISCONNECT', ({ roomId, userName }) => {
    rooms.forEach((value) => {
      if (value.get('users').delete(userName)) {
        const obj = rooms.has(+roomId) ? {
          users: [...rooms.get(+roomId).get('users').values()],
          message: [...rooms.get(+roomId).get('message').values()],
          setting: rooms.get(+roomId).get('setting'),
        } : {
          users: [],
          message: [],
          setting: {},
        };
        socket.broadcast.to(+roomId).emit('ROOM:USERS', obj);
      }
    });
  });
  /**
* прослушка при отправке
*/
  socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
    rooms.get(+roomId).get('message').unshift({ userName, text });
    socket.broadcast.to(+roomId).emit('ROOM:ADD_MESSAGE', { userName, text });

  });

  socket.on('disconnect', () => {
    //добавить обработку при закрытии сокета
    console.log('a user disconnect');

  })
});

server.listen(PORT, (err) => {
  if (err) {
    throw Error(err);
  }
  console.log('listening on *:' + PORT);
});

function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


