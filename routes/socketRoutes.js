const { Sequelize } = require('sequelize');
const Audio = require('../models/Audio');
const User = require('../models/User');
const Op = Sequelize.Op;
const router = require('express').Router();

module.exports = (io) => {
  io.on('connection', async (socket) => {
    socket.on('update-socket', async (username) => {
      await User.update({ socketId: socket.id }, { where: { name: username } });
    });

    socket.on('audio-joined', async (channel, name) => {
      const audioChannelCheck = await Audio.findOne({
        where: { channel: channel },
      });
      const userData = await User.findOne({ where: { name: name } });
      if (!audioChannelCheck) {
        const createdAudio = await Audio.create({ channel: channel });
        await User.update(
          { audioId: createdAudio.id },
          { where: { name: name } }
        );
      } else {
        await User.update(
          { audioId: audioChannelCheck.id },
          { where: { name: name } }
        );
      }

      socket.emit('create', userData, name);

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

    socket.on('userJoin', (user, room) => {
      io.to(room).emit('addUser', user);
    });

    socket.on('room-joined', async (roomID) => {
      console.log('room joined fired');
      const getAudioUsers = await User.findAll({
        where: { audioId: { [Op.not]: null } },
        include: [
          {
            model: Audio,
          },
        ],
      });
      io.to(socket.id).emit('audioUsers', getAudioUsers, roomID);
      socket.join(`${roomID}`);
      socket.on('message', (message, username) => {
        //send message to the same room
        io.to(roomID).emit('createMessage', message, username);
      });

      socket.on('disconnect', async () => {
        const dcUser = await User.findOne({ where: { socketId: socket.id } });
        await User.update(
          { audioId: null },
          { where: { socketId: socket.id } }
        );
        io.to(roomID).emit('user-disconnected', dcUser);
      });
    });
  });

  //Declare more routes
  return router;
};
