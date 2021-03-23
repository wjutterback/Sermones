const router = require('express').Router();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('connection fired: server');
    console.log(socket.id);

    socket.on('audio-joined', () => {
      socket.emit('create');
      socket.on('created', (id) => {
        console.log('peerID: server', id);
        socket.emit('user-connected', id);
      });
    });

    socket.on('room-joined', (roomID) => {
      console.log('room joined fired');
      socket.join(`${roomID}`);
      socket.on('message', (message) => {
        //send message to the same room
        io.to(roomID).emit('createMessage', message);
      });

      socket.on('disconnect', () => {
        socket.broadcast.to(roomID).emit('user-disconnected');
      });
    });
  });

  //Declare more routes
  return router;
};
