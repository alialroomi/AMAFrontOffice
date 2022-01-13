var express = require('express');
var router = express.Router();
var moment = require('moment');
var datetime = moment().format('YYYY-MM-DD');
var md5 = require('md5');


const db = require('../database/database');

//list all rooms types
router.get('/', function(req, res, next) {
    db.promise().query(`SELECT * FROM roomtype`)
    .then((roomtype) => { 
        roomtype = roomtype[0];
        res.render('roomstype', {roomtype  })
    })
    .catch((err) => {console.log(err)})
    
})

//add appartment
router.post('/', function(req, res, next) {
    const { roomtypename } = req.body;
    db.promise().query(`INSERT INTO roomtype (roomtypename) VALUES ('${roomtypename}')`)
    .then(() => {
        res.redirect('/roomstype')
    }).catch((err) => {console.log(err) })
});
//edit appartment 
router.get('/roomstypeedit/:id', function(req, res, next) {
    var roomtypeid = req.params.id;
    db.promise().query(`SELECT * FROM roomtype WHERE id=${roomtypeid}`)
    .then((roomtype) => { 
        roomtype = roomtype[0];
        res.render('roomstypeedit', { roomtype  })
    })
    .catch((err) => {console.log(err)})
    

});

// edit room type post 
router.post('/roomstypeedit/:id', function(req, res, next){
    var roomtypeid = req.params.id;
    const { roomtypename } = req.body;

    db.promise().query(`UPDATE roomtype SET roomtypename='${roomtypename}' WHERE id=${roomtypeid}`)
       .then(() => {res.redirect('/roomstype?roomtypeedit');})
       .catch((err) => console.log(err))      
});

// delete room type 
router.get('/:id', async function(req, res, next) {
    var roomtypeid = req.params.id;
    var roomsids = [];
    var endofloop = 0;
      db.promise().query(`SELECT * FROM rooms WHERE roomtypeid =${roomtypeid}`)
        .then(  (room) =>{
            var roomids = room[0];
            console.log(roomids.length)
            if(roomids.length > 0){
                roomids.forEach(async roomid =>{
                    roomsids.push(roomid.id);
                    endofloop = endofloop +1;
                    await db.promise().query(`DELETE FROM checkin WHERE roomid=${roomid.id}`);
                    if(endofloop == roomids.length){
                        console.log('clients removed');
                        db.promise().query(`DELETE  FROM rooms WHERE roomtypeid  =${roomtypeid}`)
                        .then( () => {
                            db.promise().query(`DELETE  FROM roomtype WHERE id =${roomtypeid}`)
                            .then(() => {
                                res.redirect('/roomstype')
                            })
                        })
                        .catch((err) => console.log(err))
                    }
                     
                })
            }else{
                console.log('no rooms connected ')
                db.promise().query(`DELETE  FROM roomtype WHERE id =${roomtypeid}`)
                    .then(() => {
                        res.redirect('/roomstype')
                    })
            }
             
            
        })
        
    

});

module.exports = router;