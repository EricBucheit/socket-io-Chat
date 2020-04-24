const express = require("express");

const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;

const app = express();

const server = http.createServer(app);

const io = socketIo(server);

let interval;

let chatRooms = {}
let users = {}

function chatRoom(name, creator) {
	return ({
		name: name,
		creator: creator,
		messages: [],
		private: false,
		password: false,
	})
}

chatRooms.global = chatRoom("global", "Admin");


io.on("connection", (socket) => {
  console.log("New client connected");
  
  users[socket.id] = {room: "global"}

  socket.on("disconnect", () => {
  	delete users[socket.id];
    console.log("Client disconnected");
  });

  socket.on("message", (data) => {
  		chatRooms[users[socket.id].room].messages.push(data);
  })

  socket.on("changeRoom", (data) => {
  		users[socket.id].room = data.room;
  })

  socket.on('getMessages', (data) => {
  	socket.emit("getMessages", chatRooms[users[socket.id].room].messages)
  })

  socket.on('createRoom', (data) => {
  		for(room in chatRooms) {
  			if (chatRooms[room].name === data.roomName) {
  				socket.emit("createRoom", {message: "Room Already Exists"})
  				return
  			}
  		}
  		chatRooms[data.roomName] = chatRoom(data.roomName, socket.id)
  		socket.emit("createRoom", {message: "New Room Added"})
  		let rooms = []
  		for (let room in chatRooms) {
  			rooms.push(chatRooms[room].name);
  		}
  		socket.emit("getChatRooms", rooms)

  })

  socket.on('selectRoom', (data) => {
  	users[socket.id].room = data.room;
  })


  socket.on("getChatRooms", (data) => {
  		let rooms = []
  		for (let room in chatRooms) {
  			rooms.push(chatRooms[room].name);
  		}
  		socket.emit("getChatRooms", rooms)
  })

});

server.listen(port, () => console.log(`Listening on port ${port}`));
