
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const nodemailer = require('nodemailer');

const app = express();

// const db = require('./config/keys').MongoURI;
const db = 'mongodb+srv://saurabh2:12345@cluster0.m1mhbxh.mongodb.net/habittrack?retryWrites=true&w=majority'


mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB successfully!"))
    .catch(err => console.log(err));


app.use(expressLayouts);
app.use("/assets", express.static('./assets'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: false }));


app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);


app.use(flash());


app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port  ${PORT}`));

