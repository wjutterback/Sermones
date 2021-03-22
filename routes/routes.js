const router = require('express').Router();
const User = require('../models/User');

router.get('/', (req, res) => {
  res.render('homepage', { loggedIn: req.session.loggedIn });
});

router.get('/rooms', (req, res) => {
  res.render('room', { loggedIn: req.session.loggedIn });
});

router.get('/sign-in', (req, res) => {
  res.render('sign-in', { loggedIn: req.session.loggedIn });
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
