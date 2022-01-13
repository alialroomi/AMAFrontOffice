
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next ) =>{
    const token = req.cookies.jwt;
    //check json web 
    if(token){
     
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) res.render('login',{layout: 'login.hbs'});
            next();
        })
    }else{
       
        res.render('login',{layout: 'login.hbs'})
    }
   
}

module.exports = { authenticateToken}