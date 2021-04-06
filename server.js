const compression = require('compression');
const path = require('path');
const express = require('express');
const { ExpressPeerServer } = require('peer');
const session = require('express-session');
const exphbs = require('express-handlebars');
const sequelize = require('./config/connection');
const routes = require('./routes/routes');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const helpers = require('./utils/helpers.js');
const app = express();
const PORT = process.env.PORT || 3030;

//Handlebars Set-Up
const hbs = exphbs.create({
  layoutsDir: path.join(__dirname, '/views/layouts'),
  partialsDir: path.join(__dirname, '/views'),
  extname: '.hbs',
  helpers,
});

//Session Set-Up
const sess = {
  secret: 'sdg3tsbvs',
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

//Server Creation
const httpServer = require('http').createServer(app);
const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
});

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

//route to peerjs connection
app.use('/peerjs', peerServer);
app.use(compression({ filter: shouldCompress }));
app.use(session(sess));
app.set('views', path.join(__dirname, '/views'));
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(routes);

//socket IO config
const io = require('socket.io')(httpServer, {
  // ... options go here if we need for server
});
const socketRoutes = require('./routes/socketRoutes')(io);

app.use(socketRoutes);

sequelize.sync().then(() => {
  httpServer.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
});
