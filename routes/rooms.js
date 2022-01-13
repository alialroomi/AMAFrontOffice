var express = require('express');
var router = express.Router();
var moment = require('moment');
var datetime = moment().format('YYYY-MM-DD');




const db = require('../database/database');


/* GET all rooms . */
router.get('/', function(req, res, next) {

db.promise().query(`SELECT * FROM rooms`)
   .then((rooms) => {
       
       db.promise().query(`SELECT * FROM appartments`)
         .then((appartments) => {
             db.promise().query(`SELECT * FROM roomtype`)
                .then((roomstype) => {
                    rooms       = rooms[0];
                    appartments = appartments[0];
                    roomstype   = roomstype[0];

                    res.render('rooms', {rooms ,appartments ,roomstype})
                }).catch((err) => {console.log(err)})
         })
         .catch((err) => {console.log(err)})
        
   })
   .catch((err) => {console.log(err)})


});

// add room 
router.post('/',function(req, res, next) {
  const { appartmentnumber, roomnumber, roomtypeid, price ,deposit} = req.body;

  //insert into table 
  db.promise().query(`INSERT INTO ROOMS (appartmentid,roomtypeid,roomnumber,price,deposit,occupied) VALUES
   ('${appartmentnumber}','${roomtypeid}','${roomnumber}','${price}','${deposit}','0')`)
   .then(() => {res.redirect('/rooms')})
   .catch((err) => {console.log(err)})

});



// edit room 
router.get('/roomedit/:id', function(req, res, next) {
  var roomid = req.params.id;
  db.promise().query(`SELECT * FROM rooms WHERE id=${roomid}`)
    .then((data) => { 
      var data= data[0];
      db.promise().query(`SELECT * FROM appartments`)
        .then((appartments) => {
          var appartments = appartments[0];
          db.promise().query(`SELECT * FROM roomtype`)
            .then((roomstype) => {
              roomstype = roomstype[0];
              res.render('roomedit', { data,appartments,roomstype,roomid})
            }).catch((err) => {console.log(err)})
          
        }).catch((err) => {console.log(err)})
    })
    .catch((err) => console.log(err))
});

// edit room post 
// edit post user 
router.post('/roomedit/:id', function(req, res, next){
  var id = req.params.id;
  const {appartmentnumber,roomnumber,roomtypeid,price,deposit,occupied} = req.body;
  console.log(id)
  console.log(appartmentnumber,roomnumber,roomtypeid,price,occupied)
  db.promise().query(`UPDATE ROOMS SET appartmentid='${appartmentnumber}',roomtypeid ='${roomtypeid}',roomnumber='${roomnumber}',price='${price}',deposit='${deposit}',occupied=${occupied} WHERE id=${id}`)
    .then(() => {
      res.redirect('/rooms?roomedit');
    })
    .catch((err) => {console.log(err)})

});


// delete room 
router.get('/:id', async function(req, res, next) {
   await db.promise().query(`DELETE FROM checkin WHERE roomid=${req.params.id}`);
   console.log('clients removed');
    db.promise().query(`DELETE  FROM rooms WHERE id=${req.params.id}`)
      .then( () => {
        res.redirect('/rooms')
        
      })
      .catch((err) => console.log(err))

});


module.exports = router;
