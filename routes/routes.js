const router = require('express').Router();
const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');
const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

router.get('/', (req, res) => {
  res.render('homepage', {
    loggedIn: req.session.loggedIn,
    name: req.session.name,
  });
});

router.get('/homepage', (req, res) => {
  res.render('loggedIn', {
    loggedIn: req.session.loggedIn,
    name: req.session.name,
  });
});

router.get('/rooms', async (req, res) => {
  try {
    const roomData = await Room.findAll({
      where: {
        userId: {
          [Op.like]: req.session.userId,
        },
      },
    });
    const rooms = roomData.map((room) => room.get({ plain: true }));
    console.log(rooms);
    res.render('room', {
      rooms,
      loggedIn: req.session.loggedIn,
      name: req.session.name,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/roomscode', async (req, res) => {
  try {
    const findRoom = await Room.findOne({ where: { code: req.body.code } });
    await Room.create({
      title: findRoom.title,
      code: findRoom.code,
      userId: req.session.userId,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/rooms', async (req, res) => {
  try {
    const roomDATA = await Room.create({
      title: req.body.title,
      code: uuidv4(),
      userId: req.session.userId,
    });
    console.log(roomDATA);
    res.status(200).send(roomDATA);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/sign-in', (req, res) => {
  res.render('sign-in', { loggedIn: req.session.loggedIn });
});

router.get('/messages', (req, res) => {
  res.render('dm', { loggedIn: req.session.loggedIn, name: req.session.name });
});

router.post('/sign-in', async (req, res) => {
  try {
    const dbUserData = await User.findOne({
      where: {
        name: req.body.name,
      },
    });

    if (!dbUserData) {
      res
        .status(400)
        .json({ message: 'Incorrect username or password. Please try again!' });
      return;
    }

    const validPassword = await dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect username or password. Please try again!' });
      return;
    }

    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.userId = dbUserData.id;
      req.session.name = dbUserData.name;
      res.status(200).json({
        user: dbUserData,
        message: 'You are now logged in!',
        loggedIn: req.session.loggedIn,
        userId: req.session.userId,
      });
      let localDate=new Date();
      localStorage.setItem('userLastCheckedMessages',localDate);
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/sign-up', (req, res) => {
  res.render('sign-up', { loggedIn: req.session.loggedIn });
});

router.post('/sign-up', async (req, res) => {
  try {
    const dbUserData = await User.findOne({
      where: {
        name: req.body.name,
      },
    });
    if (!dbUserData) {
      const userCreate = await User.create({
        name: req.body.name,
        password: req.body.password,
      });
      req.session.save(() => {
        req.session.loggedIn = true;
        req.session.userId = userCreate.id;
        req.session.name = userCreate.name;
        res.status(200).json({ message: 'User created!' });
      });
    } else {
      res.status(409).json({ message: 'Username taken! Please use another.' });
      return;
    }
  } catch (err) {
    console.log(err);
  }
});

router.get('/room/:id', async (req, res) => {
  const roomID = req.params.id;
  const userName = req.session.name;
  try {
    const messageData = await Message.findAll({
      where: {
        room_id: roomID,
      },
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });
    const messages = messageData.map((message) => message.get({ plain: true }));
    res.render('roomchat', {
      messages,
      loggedIn: req.session.loggedIn,
      name: userName,
      user_id: [req.session.userId],
      roomID: roomID,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/room/:id', async (req, res) => {
  try {
    const MessageDATA = await Message.create({
      text: req.body.text,
      room_id: req.params.id,
      user_id: [req.session.userId],
    });
    console.log(MessageDATA);
    res.status(200).send(MessageDATA);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(200).json({ message: 'You are now logged out!' });
    });
  } else {
    res.redirect('/');
  }
});

router.delete('/room/:id', async (req, res)=> {
  try{
    const userData = await Room.destroy({
      where:{
        code: req.body.room_id,
        userId: req.body.user_id
      }
    });
    res.status(200).json(userData);
  }catch(err){
    res.status(500).json(err);
  }
});

module.exports = router;
