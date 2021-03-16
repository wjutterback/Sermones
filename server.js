//https://ourcodeworld.com/articles/read/343/how-to-create-required-pem-certificates-for-https-connection-in-node-web-server
//we won't be needing these just yet, but as HTTPS is required for https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia we will eventually
//key/cert have been created

const fs = require('fs');
const privateKey = fs.readFileSync('certificates/key.pem', 'utf8');
const certificate = fs.readFileSync('certificates/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const path = require('path');
const express = require('express');
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
const httpSecureServer = require('https').createServer(credentials, app);

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
  // ...
});

io.on('connection', (socket) => {
  // ...
});

//default port for HTTPS is 443, in dev we need to use a different one
sequelize.sync().then(() => {
  httpServer.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  httpSecureServer.listen(8443, () => console.log(`HTTPS Server Listening`));
});
