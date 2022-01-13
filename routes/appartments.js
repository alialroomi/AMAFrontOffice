var express = require('express');
var router = express.Router();
var moment = require('moment');
var datetime = moment().format('YYYY-MM-DD');
var md5 = require('md5');


const db = require('../database/database');


//edit appartment 
router.get('/appartmentedit/:id', function(req, res, next) {
    var appartmentid = req.params.id;
    db.promise().query(`SELECT * FROM appartments WHERE id=${appartmentid}`)
    .then((appartments) => { 
        appartments = appartments[0];
        res.render('editappartments', { appartments  })
    })
    .catch((err) => {console.log(err)})
    

});
router.get('/', function(req, res, next) {
    db.promise().query(`SELECT * FROM appartments`)
    .then((appartments) => { 
        appartments = appartments[0];
        res.render('appartments', {appartments  })
    })
    .catch((err) => {console.log(err)})
    
})

//add appartment
router.post('/', function(req, res, next) {
    const { appartmentname } = req.body;
    console.log(appartmentname)
    db.promise().query(`INSERT INTO appartments (appartmentnumber) VALUES ('${appartmentname}')`)
    .then(() => {
        res.redirect('/appartments')
    }).catch((err) => {console.log(err) })
});

// edit appartment post 
router.post('/appartmentedit/:id', function(req, res, next){
    var appartmentid = req.params.id;
    const { appartmentnumber } = req.body;

    db.promise().query(`UPDATE appartments SET appartmentnumber='${appartmentnumber}' WHERE id=${appartmentid}`)
       .then(() => {res.redirect('/appartments?appartmentedit');})
       .catch((err) => console.log(err))      
});
// delete appartment 
router.get('/:id', function(req, res, next) {
    var appartmentid = req.params.id;
    var roomsids = [];
    var endofloop = 0;
      db.promise().query(`SELECT * FROM rooms WHERE appartmentid =${appartmentid}`)
        .then((room) =>{
            var roomids = room[0];
            console.log(roomids.length)
            if(roomids.length > 0){
                roomids.forEach(async roomid =>{
                    roomsids.push(roomid.id);
                    endofloop = endofloop +1;
                    await db.promise().query(`DELETE FROM checkin WHERE roomid=${roomid.id}`);
                    if(endofloop == roomids.length){
                        db.promise().query(`DELETE  FROM rooms WHERE appartmentid =${appartmentid}`)
                        .then( () => {
                          db.promise().query(`DELETE  FROM appartments WHERE id =${appartmentid}`)
                          .then(() => {
                              res.redirect('/appartments')
                          })
                        })
                        .catch((err) => console.log(err))
                    }
                })
            }else{
                db.promise().query(`DELETE  FROM appartments WHERE id =${appartmentid}`)
                    .then(() => {
                        res.redirect('/appartments')
                    })
            }
        })
   

});

module.exports = router;