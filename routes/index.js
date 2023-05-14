const express = require('express');
const router = express.Router();
const nodemailer=require('nodemailer');


const User = require('../models/User');
const Habit = require('../models/Habit');


router.get('/', (req, res) => res.render('welcome'));

let trying =[];
// trying.length=30;
for (let index = 0; index < trying.length; index++) {
    trying.push(0);   
}


var email = "";
var act="";
router.get('/dashboard', (req, res) => {
    email = req.query.user;
    User.findOne({
        email: req.query.user
    }).then(user => {
        Habit.find({
            email: req.query.user
        }, (err, habits) => {
            if (err) console.log(err);
            else {
                var days = [];
                days.push(getD(0));
                days.push(getD(1));
                days.push(getD(2));
                days.push(getD(3));
                days.push(getD(4));
                days.push(getD(5));
                days.push(getD(6));
                res.render('dashboard', { habits, user, days });
            }
        });
    })
}
);


function getD(n) {
    let d = new Date();
    d.setDate(d.getDate() -6 + n);
    var newDate = d.toLocaleDateString('pt-br').split( '/' ).reverse( ).join( '-' );
    var day;
    switch (d.getDay()) {
        case 0: day = 'Sun';
            break;
        case 1: day = 'Mon';
            break;
        case 2: day = 'Tue';
            break;
        case 3: day = 'Wed';
            break;
        case 4: day = 'Thu';
            break;
        case 5: day = 'Fri';
            break;
        case 6: day = 'Sat';
            break;
    }
    return { date: newDate, day };
}


router.post('/user-view', (req, res) => {
    User.findOne({
        email
    })
        .then(user => {
            user.view = user.view === 'daily' ? 'weekly' : 'daily';
            user.save()
                .then(user => {
                    return res.redirect('back');
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            console.log("Error changing view!");
            return;
        })
})


router.post('/dashboard', (req, res) => {
    const { content } = req.body;

    Habit.findOne({ content: content, email: email }).then(habit => {
        if (habit) {
            // act = JSON.stringify(content);
            act = content;
            let dates = habit.dates, tzoffset = (new Date()).getTimezoneOffset() * 60000;
            var today = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
            dates.find(function (item, index) {
                if (item.date === today) {
                    console.log("Habit exists!")
                    req.flash(
                        'error_msg',
                        'Habit already exists!'
                    );
                    res.redirect('back');
                }
                else {
                    dates.push({ date: today, complete: 'none' });
                    habit.dates = dates;
                    habit.save()
                        .then(habit => {
                            console.log(habit);
                            res.redirect('back');
                        })
                        .catch(err => console.log(err));
                }
            });
        }
        else {
            let dates = [], tzoffset = (new Date()).getTimezoneOffset() * 60000;
            var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
            dates.push({ date: localISOTime, complete: 'none' });
            const newHabit = new Habit({
                content,
                email,
                dates
            });

           
            newHabit
                .save()
                .then(habit => {
                    console.log(habit);
                    res.redirect('back');
                })
                .catch(err => console.log(err));
        }
    })
});




router.get("/status-update", (req, res) => {

    let todaydate=new Date().getDate();
    var d = req.query.date;
    var id = req.query.id;

    Habit.findById(id, (err,habit) => {
        if (err) {
            console.log("Error updating status!")
        }
        
        if(habit.trying[todaydate-1]!=1 && todaydate>1){
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'suchaksb@rknec.edu',
                  pass: 'suchaksaurabh@123'
                }
              });
              
              var mailOptions = {
                from: 'suchaksb@rknec.edu',
                to: email,
                subject: 'Incomplete activity',
                // html: "<h1>Attention</h1><p>You activity"${JSON.stringify(act)}+"is yet to be completed.! <br>Complete is ASAP"
 
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });}
    })
    
    Habit.findById(id, (err, habit) => {
        if (err) {
            console.log("Error updating status!")
        }
        else {
            let dates = habit.dates;
            let found = false;
            dates.find(function (item, index) {
                if (item.date === d) {
                    if (item.complete === 'yes') {
                        item.complete = 'no';
                        // item.flagtoday=false
                        trying[todaydate]=false;
                    }
                    else if (item.complete === 'no') {
                        item.complete = 'none'
                        // item.flagtoday=false
                        trying[todaydate]=false;
                    }
                    else if (item.complete === 'none') {
                        item.complete = 'yes'
                        item.flagtoday=true
                        trying[todaydate]=true;
                    }
                    found = true;
                }
            })
            if (!found) {
                dates.push({ date: d, complete: 'yes' })
            }
            habit.dates = dates;
            habit.save()
                .then(habit => {
                    console.log(habit);
                    res.redirect('back');
                })
                .catch(err => console.log(err));
        }
    })

})


router.get("/remove", (req, res) => {
    let id = req.query.id;
    Habit.deleteMany({
        _id: {
            $in: [
                id
            ]
        },
        email
    }, (err) => {
        if (err) {
            console.log("Error in deleting record(s)!");
        }
        else {
            req.flash(
                'success_msg',
                'Record(s) deleted successfully!'
            );
            return res.redirect('back');
        }
    })
});

module.exports = router;