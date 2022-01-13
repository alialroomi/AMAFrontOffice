var express = require('express');
var router = express.Router();

const db = require('../database/database');

// get all occupied rooms 
router.get('/',  function(req, res, next) {
    var endOFLoop = 1;
    let occupiedrooms ;
    db.promise().query(`SELECT * FROM rooms WHERE occupied=1`)
    .then((rooms) => { 
        if(rooms[0].length > 0){
            rooms[0].forEach( room => {
                db.promise().query(`SELECT * from appartments WHERE id=${room.appartmentid }`)
                .then( async (appartmentname) => { 
                    room.appartmentid  = appartmentname[0][0]['appartmentnumber'];
                    var customerfullname  = await db.promise().query(`SELECT * FROM checkin WHERE roomid=${room.id}`);
                    room.customerfullname = customerfullname[0][0].customerfullname;
                    room.customerid       = customerfullname[0][0].id;
         
                    console.log(room);
                    if(rooms[0].length == endOFLoop){
                        occupiedrooms = rooms[0];
                        res.render('occupied', { occupiedrooms  })
                    }
                    endOFLoop = endOFLoop + 1;
                })
                .catch((err) => {console.log(err)})
            })
        }else{
            res.render('occupied', { occupiedrooms  })
        }
        
        
    })
    .catch((err) => {console.log(err)})
})


// checkout room
router.get('/:id', function(req, res, next) {
    var roomid = req.params.id;
    db.promise().query(`UPDATE rooms SET occupied='0' WHERE id=${roomid}`)
      .then( () => {
        res.redirect('/occupied')
      })
      .catch((err) => console.log(err))

});

module.exports = router;