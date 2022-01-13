require('dotenv').config()
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');


router.get('/', function(req, res, next){
    console.log('logout')
    res.clearCookie('jwt');
    res.render('login',{layout: 'login.hbs'})
})


module.exports = router;