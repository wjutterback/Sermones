const router = require('express').Router();

module.exports = (io) => {
  router.get('/room/:id', (req, res) => {
    io.on('connection', (socket) => {
      const roomID = req.params.id;
      socket.join(`${roomID}`);
      socket.on('message', (message) => {
        //send message to the same room
        io.to(roomID).emit('createMessage', message);
      });
    });
    res.render('roomchat', { loggedIn: req.session.loggedIn });
  });

  //Declare more routes
  return router;
};
