import { Socket } from "socket.io";
import { MessageType, SocketAnswerMessage, SocketBootMessage, SocketCandidateMessage, SocketDataMessage, SocketDisconnectMessage, SocketOfferMessage } from "./interfaces/messages";

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket: Socket) => {
  socket.on(MessageType.BOOT, (event: SocketBootMessage) => {
    socket.to(event.room).emit(MessageType.BOOT, event);
    socket.join(event.room);
  });

  socket.on(MessageType.DATA, (event: SocketDataMessage) => {
    socket.to(event.room).emit(MessageType.DATA, event);
  });

  socket.on(MessageType.OFFER, (event: SocketOfferMessage) => {
    socket.to(event.room).emit(MessageType.OFFER, event);
  });

  socket.on(MessageType.ANSWER, (event: SocketAnswerMessage) => {
    socket.to(event.room).emit(MessageType.ANSWER, event);
  });

  socket.on(MessageType.CANDIDATE, (event: SocketCandidateMessage) => {
    socket.to(event.room).emit(MessageType.CANDIDATE, event);
  });

  socket.on(MessageType.DISCONNECT, (event: SocketDisconnectMessage) => {
    socket.to(event.room).emit(MessageType.DISCONNECT, event);
  });
});

server.listen(process.env.PORT || 3035);