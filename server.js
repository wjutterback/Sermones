const path = require('path');
const express = require('express');
const { ExpressPeerServer } = require('peer');
const session = require('express-session');
const exphbs = require('express-handlebars');
const sequelize = require('./config/connection');
const routes = require('./routes/routes');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const PORT = process.env.PORT || 3030;

//Handlebars Set-Up
const hbs = exphbs.create({
  layoutsDir: path.join(__dirname, '/views/layouts'),
  partialsDir: path.join(__dirname, '/views'),
  extname: '.hbs',
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

//route to peerjs connection
app.use('/peerjs', peerServer);

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

//default port for HTTPS is 443, in dev we need to use a different one
sequelize.sync({ force: true }).then(() => {
  httpServer.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
});
