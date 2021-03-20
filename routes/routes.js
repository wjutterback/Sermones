const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('homepage');
});

router.get('/rooms', (req, res) => {
  res.render('room');
});

module.exports = router;
