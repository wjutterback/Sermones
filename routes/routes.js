const router = require('express').Router();
const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../models/User');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.get('/', (req, res) => {
  res.render('homepage', { loggedIn: req.session.loggedIn });
});

router.get('/rooms', async (req, res) => {
  try{
    const roomData = await Room.findAll(
      //TODO: add back when updating attribute is working
      // where: {
      //   members_id:{
      //     [Op.like]: req.session.userId
      //   }
      // }
    );
    const rooms = roomData.map((room) => room.get({ plain: true }));
    console.log(rooms);
    res.render('room',
      { rooms,
        loggedIn: req.session.loggedIn });
  }catch(err){
    res.status(500).json(err);
  }
});
//TODO: Get the user id added to json attribute in the Room object
// router.put('/rooms', async (req,res) => {
//   try{
//     await Room.findOne({
//       where: {code: req.body.code}
//     }).then(async()=>{
//       try{
//         const codeData = await Room.update({
//           members_id:req.session.userId
//         },{
//           where: {code: req.body.code}
//         });
//         res.status(200).json(codeData);
//       }catch(err){
//         res.status(500).json(err);
//       }
//     });
//   }catch(err){
//     res.status(404).json(err);
//   }
// });

router.post('/rooms', async (req,res) => {
  try{
    const roomDATA = await Room.create({
      title: req.body.title,
      code: uuidv4(),
      members_id:req.session.userId,
    });
    console.log(roomDATA);
    res.status(200).send(roomDATA);
  }catch(err){
    res.status(400).send(err);
  }
});

router.get('/sign-in', (req, res) => {
  res.render('sign-in', { loggedIn: req.session.loggedIn });
});

router.get('/messages', (req, res) => {
  res.render('dm', { loggedIn: req.session.loggedIn });
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
  try{
    const messageData = await Message.findAll({
      where:{
        room_id:roomID
      },
      include:[{
        model: User,
        attributes: ['name'],
      }]
    });
    const messages = messageData.map((message) => message.get({ plain: true }));
    res.render('roomchat', {
      messages,
      loggedIn: req.session.loggedIn,
      name: userName,
      roomID: roomID,
    });
  }catch(err){
    res.status(500).json(err);
  }
});

router.post('/room/:id', async (req, res) => {
  try{
    const MessageDATA = await Message.create({
      text: req.body.text,
      room_id:req.params.id,
      user_id:[req.session.userId],
    });
    console.log(MessageDATA);
    res.status(200).send(MessageDATA);
  }catch(err){
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

module.exports = router;
