const express = require('express');
const router = express.Router();


const User = require('../models/User')


router.get('/login', (req, res) => res.render('login'));


router.get('/register', (req, res) => res.render('register'));


router.post('/register', (req, res) => {
    const { name, email, password, cpassword } = req.body;

    
    let errors = [];

    if (!name || !email || !password || !cpassword) {
        errors.push({ msg: 'Please enter all fields' });
    }
    if(password!=cpassword){
        errors.push({msg : 'Password do not match'});
        console.error('Passwords do not match');    
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password
        });
    } else {
        
        User.findOne({ email: email}).then(user => {
            if (user) {
                
                errors.push({ msg: 'Email ID already exists' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                
                newUser
                    .save()
                    .then(user => {
                        req.flash(
                            'success_msg',
                            'You are now registered and can log in'
                        );
                        res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
            }
        });
    }
});


router.post('/login', (req, res) => {
    const { name, email,password } = req.body;
    
    User.findOne({
        email: email,
        password: password
    }).then(user => {
        if (!user) {
            let errors = [];
            errors.push({ msg: 'Wrong credentials entered.' });
            res.render('login', {
                errors,
                name,
                email,
                password
            });
        }
        
        else {
            res.redirect(`/dashboard?user=${user.email}`);
        }
    });

});


router.get('/logout', (req, res) => {
    // req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;