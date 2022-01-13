var express = require('express');
var router = express.Router();

const db = require('../database/database');

// get all vacants rooms 
router.get('/', function(req, res, next) {
    vacantrooms = [];
    var endOFLoop = 1;
    db.promise().query(`SELECT * FROM rooms WHERE occupied= 0`)
    .then((rooms) => { 
        
        if(rooms[0].length == 0){
            res.render('vacant', { vacantrooms  })
        }else{
            rooms[0].forEach(room => {
                db.promise().query(`SELECT * from appartments WHERE id=${room.appartmentid }`)
                .then((appartmentname) => { 
                    room.appartmentid  = appartmentname[0][0]['appartmentnumber'];
                    db.promise().query(`SELECT * from roomtype WHERE id=${room.roomtypeid  }`)
                      .then((roomtype) => {
                        room.roomtypeid   = roomtype[0][0]['roomtypename'];
                        vacantrooms.push(room);
                        if(rooms[0].length == endOFLoop){
                            res.render('vacant', { vacantrooms  })
                        }
                        endOFLoop = endOFLoop + 1;
                      })
                      .catch((err) => {console.log(err)})
                })
                .catch((err) => {console.log(err)})
            })
            
        }
        
    })
    .catch((err) => {console.log(err)})
})


module.exports = router;