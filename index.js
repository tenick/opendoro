const path = require('path');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const md5 = require('md5');
const flash = require('connect-flash');

// models
const User = require('./models/user');

// load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// session store in MongoDB
const store = new MongoStore({
    mongoUrl: process.env.DB_URL,
    dbName: 'sessions'
});

// set view engine
app.set('view engine', 'ejs');

// load assets
app.use("/css", express.static(path.join(__dirname, "assets", "css")));
app.use("/js", express.static(path.join(__dirname, "assets", "js")));
app.use('/img', express.static(path.join(__dirname, 'assets', 'img')));

// middlewares
app.use(morgan('tiny'));

app.use(express.json());
app.use(express.urlencoded( {extended: true} ));

app.use(session({
    secret: 'bonk',
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use(flash());

// routes
app.get('/', async (req, res) => {
    let authenticated = false;
    if (req.session.isAuth)
        authenticated = true;
    
    const data = {authenticated: authenticated, username: req.session.username};

    const err = req.flash('error-msg');
    const succ = req.flash('success-msg');

    res.render('index', { ...data, ...{errMsg: err, succMsg: succ}});
    console.log(req.session);
    console.log(req.session.id);
})

app.get('/login', (req, res) => {
    // check if logged in, redirect to dashboard if so
    if (req.session.isAuth)
        res.redirect('/dashboard');
    else {
        res.render('login', {errMsg: req.flash('error-msg'), succMsg: req.flash('success-msg')} );
    }
});

app.get('/register', (req, res) => {
    // check if logged in, redirect to dashboard if so
    if (req.session.isAuth)
        res.redirect('/dashboard');
    else
        res.render('register', {errMsg: req.flash('error-msg'), succMsg: req.flash('success-msg')} );
});

// routes USER
// when submitting login form
app.post('/login', async (req, res) => {
    // check if login-submit is set
    if (req.body['login-submit']) {
        const account = await User.findOne({username: req.body.username, password: md5(req.body.password)});
        
        if (!account) {
            req.flash('error-msg', "Invalid credentials or account doesn't exist.");
            res.redirect('/login');
        }
        else {
            // add necessary session variables
            req.session.username = req.body.username;
            req.session.isAuth = true;

            req.flash('success-msg', `Welcome back, ${req.body.username}`);
            res.redirect('/');
        }
    }
    else
        res.redirect('/login');
})

app.post('/register', async (req, res) => {
    // check if register-submit is set
    if (req.body['register-submit']) {
        const emailUniqueCheck = await User.findOne({email: req.body.email});
        const usernameUniqueCheck = await User.findOne({username: req.body.username});
        
        if (!emailUniqueCheck && !usernameUniqueCheck) {
            User.create({
                email: req.body.email, 
                username: req.body.username, 
                password: md5(req.body.password)
            })
            .then(val => console.log(`Successfully added ${val} to database!`))
            .catch(err => console.log(err));

            // add necessary session variables
            req.session.username = req.body.username;
            req.session.isAuth = true;
            
            req.flash('success-msg', `Successfully registered! Welcome, ${req.body.username}`);
            res.redirect('/');
        }
        else {
            req.flash('error-msg', "Email or Username is already in use.");
            res.redirect('/register');
        }
    }
    else
        res.redirect('/register');
})

app.get('/dashboard', (req, res) => {
    // check if not logged in, redirect to index if so
    if (!req.session.isAuth)
        res.redirect('/');
    else
        res.render('user/dashboard');
})

// logout
app.post('/dashboard', (req, res) => {
    if (req.body['log-out']) {
        req.session.destroy();
        res.redirect('/');
    }
    else
        res.redirect('/dashboard');
})

// routes CHAT
app.get('/chat', (req, res) => {
    // check if not logged in, redirect to index if so
    if (!req.session.isAuth)
        res.redirect('/');
    else
        res.render('chat', {username: req.session.username});
});


// MongoDB connect then start server and setup socket
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Database connected");

    // start server
    const server = app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    })

    // setup socket
    var users = {}
    var io = socketio(server);
    io.on('connection', (socket) => {
        console.log(`Connection made by ${socket.handshake.query.username} on socket: ${socket.id}`);

        if (socket.handshake.query.username in users) 
            users[socket.handshake.query.username] += 1;
        else {
            users[socket.handshake.query.username] = 1
            io.sockets.emit('new-user-connection', {newUser: socket.handshake.query.username});
            io.sockets.emit('update-user-list', users);
        }

        // socket events
        socket.on('disconnect', () => {
            if (users[socket.handshake.query.username] == 1) {
                io.sockets.emit('user-disconnection', {user: socket.handshake.query.username});
                delete users[socket.handshake.query.username];
                io.sockets.emit('update-user-list', users);
            }
            else 
                users[socket.handshake.query.username] -= 1;

            console.log(`${socket.handshake.query.username} disconnected on socket: ${socket.id}`);
        });

        socket.on('chat', (data) => {
            console.log(data.handle + ': ' + data.message);
            io.sockets.emit('chat', data);
        });
    });
})
.catch(err => console.log(err));
