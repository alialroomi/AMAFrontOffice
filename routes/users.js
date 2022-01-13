var express = require('express');
var router = express.Router();
var moment = require('moment');
var datetime = moment().format('YYYY-MM-DD');
var path = require('path');
var md5 = require('md5');

const db = require('../database/database');



/* GET users listing. */
router.get('/',  function(req, res, next) {
  // get all users 
  db.promise().query(`SELECT * FROM users`)
    .then((data) => { 
      var data= data[0];
      db.promise().query(`SELECT * FROM usertype`)
        .then((userstypes) => {
          var userstypes = userstypes[0]
          
          if(data.length > 0){
            data.forEach(element => {
              var usertypeid = element.usertype;
              element.createddate = element.createddate;
              db.promise().query(`SELECT usertype FROM usertype WHERE id=${usertypeid}`)
                .then( (usertypedata) => {
                  var usertypedata = usertypedata[0][0].usertype;
                  element.usertype = usertypedata;
                  res.render('users', { data,userstypes })
                })
                .catch((err) => {
                  res.render('users', { data,userstypes })
                })
            });
          }else{
            res.render('users', { userstypes })
          }
       
        }).catch((err) => {console.log(err)})
      
     
    })
    .catch((err) => console.log(err))


});

/* create users */

router.post('/', function(req, res, next) {
  const {userfullname, useremail,userpassword,usertype } = req.body;
  let userimage;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }


  userimage = req.files.userimage;
  uploadPath = path.join('public')+ '/uploads/' + userimage.name;

  userimage.mv(uploadPath, function(err) {
    
    if (err)
      return res.status(500).send(err);

      if(userfullname){
        try {
          db.promise().query(`INSERT INTO USERS (userfullname,useremail,userpassword,usertype,userimage,createddate)
           VALUES('${userfullname}','${useremail}','${md5(userpassword)}','${usertype}','${userimage.name}','${datetime}')`);
           res.redirect('/users')
           
        } catch (error) {
          console.log(error);
        }
      }
  });

});

// edit post user 
router.post('/useredit/:id', function(req, res, next){
  var id = req.params.id;
 
  const {userfullname,useremail,userpassword,usertype} = req.body;
  let userimage;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    if(userpassword == ''){
      db.promise().query(`UPDATE USERS SET userfullname='${userfullname}',useremail='${useremail}',usertype='${usertype}',createddate='${datetime}' WHERE id=${id}`);
            res.redirect('/users?useredit');
    }else{
      console.log('else')
      db.promise().query(`UPDATE USERS SET userfullname='${userfullname}',useremail='${useremail}',userpassword='${md5(userpassword)}',usertype='${usertype}',createddate='${datetime}' WHERE id=${id}`);
            res.redirect('/users?useredit');
    }
  }else{
    userimage = req.files.userimage;
    uploadPath = path.join('public')+ '/uploads/' + userimage.name;
    userimage.mv(uploadPath, function(err) {
      if (err)
        return res.status(500).send(err);
  
      if(userpassword == ''){
        db.promise().query(`UPDATE USERS SET userfullname='${userfullname}',useremail='${useremail}',usertype='${usertype}',userimage='${userimage.name}',createddate='${datetime}' WHERE id=${id}`);
              res.redirect('/users?useredit');
      }else{
        console.log('else')
        db.promise().query(`UPDATE USERS SET userfullname='${userfullname}',useremail='${useremail}',userpassword='${md5(userpassword)}',usertype='${usertype}', userimage='${userimage.name}',createddate='${datetime}' WHERE id=${id}`);
              res.redirect('/users?useredit');
      }
  
    })
  }
})

// show value to edit user 
router.get('/useredit/:id', function(req, res, next) {
  var userid = req.params.id;
  db.promise().query(`SELECT * FROM users WHERE id=${userid}`)
    .then((data) => { 
      var data= data[0];
      db.promise().query(`SELECT * FROM usertype`)
        .then((userstypes) => {
          var userstypes = userstypes[0];
          res.render('useredit', {userstypes, data ,userid})
        }).catch((err) => {console.log(err)})
    })
    .catch((err) => console.log(err))
});

// delete user 
router.get('/:id', function(req, res, next) {
      console.log(req.params.id)
      db.promise().query(`DELETE  FROM users WHERE id=${req.params.id}`)
        .then( () => {
          res.redirect('/users')
          
        })
        .catch((err) => console.log(err))

});


module.exports = router;
