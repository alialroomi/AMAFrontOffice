
require('dotenv').config()
var express = require('express');
var router = express.Router();
var moment = require('moment');
var datetime = moment().format('YYYY-MM-DD');
var path = require('path');
var md5 = require('md5');
const jwt = require('jsonwebtoken');


const db = require('../database/database');


router.get('/', function(req, res, next) {
    console.log('login')
    res.render('login',{layout: 'login.hbs'})
})

router.post('/', async function(req, res, next) {
    console.log('login post')
    var { useremail , userpassword  } = req.body
            userpassword = md5(userpassword);
    
    const user = { name: useremail }
    var saveduseremail = await  db.promise().query(`SELECT * FROM users WHERE useremail='${useremail}' AND userpassword='${userpassword}'`);
    if(saveduseremail[0].length > 0){
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
        
        res.cookie( 'jwt', accessToken )
        res.redirect('/checkin')
    }else{
        var ErrorMsg = 'Wrong userEmail or userPassword'
        res.redirect('/login')
        
    }
})
module.exports = router;