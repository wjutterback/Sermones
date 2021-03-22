const router = require('express').Router();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('connection fired: server');
    console.log(socket.id);

    socket.on('audio-joined', (user) => {
      console.log(user);
    });
    
    socket.on('room-joined', (roomID, userID) => {
      console.log('room joined fired');
      socket.join(`${roomID}`);
      socket.on('message', (message) => {
        //send message to the same room
        io.to(roomID).emit('createMessage', message);
      });
      socket.on('disconnect', () => {
        socket.broadcast.to(roomID).emit('user-disconnected', userID);
      });
    });
  });

  //Declare more routes
  return router;
};
