const { Sequelize } = require('sequelize');
const User = require('../models/User');
const Op = Sequelize.Op;
const router = require('express').Router();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('connection fired: server');
    console.log(socket.id);
    //not using channel yet, but probably will need
    socket.on('audio-joined', async (channel, name) => {
      const userData = await User.findOne({ where: { name: name } });
      socket.emit('create', userData);

      socket.on('created', async (id, userData) => {
        const peers = [];
        await User.update({ callerId: id }, { where: { name: userData.name } });
        const allUsers = await User.findAll({
          where: { callerId: { [Op.not]: null } },
        });
        allUsers.forEach((user) => {
          peers.push(user.dataValues.callerId);
        });
        socket.emit('user-connected', id, peers);
      });
    });

    socket.on('room-joined', (roomID) => {
      console.log('room joined fired');
      socket.join(`${roomID}`);
      socket.on('message', (message, username) => {
        //send message to the same room
        io.to(roomID).emit('createMessage', message, username);
      });

      socket.on('disconnect', () => {
        socket.broadcast.to(roomID).emit('user-disconnected');
      });
    });
  });

  //Declare more routes
  return router;
};
