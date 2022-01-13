var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path');
var datetime = moment().format('YYYY-MM-DD');


const db = require('../database/database');


router.get('/:id', async function(req, res, next) {
    //get appartments and room details by id 
    var roomid = req.params.id;

    db.promise().query(`SELECT * FROM rooms WHERE id=${roomid}`)
      .then((room) => {
          room = room[0];
          var appartmentsid = room[0].appartmentid;
          var roomtypeid    = room[0].roomtypeid;
          //get appartment name by id 
           db.promise().query(`SELECT * FROM appartments WHERE id=${appartmentsid}`)
            .then((appartmentnumber) => {
                room[0].appartmentid = appartmentnumber[0][0];
                //get room type by id 
                db.promise().query(`SELECT * FROM roomtype WHERE id=${roomtypeid}`)
                .then((roomtype) => {
                    room[0].roomtypeid = roomtype[0][0];
                    res.render('directcheckin',{room , roomid})
                    
                });
            });

      })

})

//add checkin post 

router.post('/:id', function(req,res, next){
    const {roomid, customerfullname,customeremail,customermobile ,customerwhatsapp,checkindate,checkoutdate,customerpaidrent,customerpaiddeposit,comments } = req.body;

    let customerpassport;
    let passportuploadPath;
    let customerVisa;
    let visauploadPath;
    let customerResident;
    let residentuploadPath;
    
    if(req.files == null){
        //no photos 
        console.log(roomid,'null photos')
        customerpassport = 'nopassport.png';
        customerVisa     = 'novisa.png';
        customerResident = 'noresident.png';

        db.promise().query(`INSERT INTO checkin (roomid ,customerfullname,customeremail,customermobile,customerwhatsapp,customerpassport,customerVisa,customerResident,checkindate,checkoutdate,customerpaidrent,customerpaiddeposit,comments)
        VALUES('${roomid}','${customerfullname}','${customeremail}','${customermobile}','${customerwhatsapp}','${customerpassport}','${customerVisa}','${customerResident}','${checkindate}','${checkoutdate}','${customerpaidrent}','${customerpaiddeposit}','${comments}')`)
            .then(() =>{
                //update room status
                db.promise().query(`UPDATE ROOMS SET occupied='1' WHERE id=${roomid}`)
                res.redirect(`/allcustomers`)
            })

    }else{
        //there is photos 
        console.log('no photos')
        if(req.files.customerpassport == undefined){
            customerpassport = 'nopassport.png';
        }else{
            let uploadcustomerpassport = req.files.customerpassport;
            customerpassport = req.files.customerpassport.name;
            passportuploadPath = path.join('public')+ '/uploads/passports/' + datetime +'_' + customerfullname + '_' + customerpassport;
            uploadcustomerpassport.mv(passportuploadPath, function(err) {
                if (err)
                    return res.status(500).send(err);
            });
    
        }
        if(req.files.customerVisa == undefined){
            customerVisa = 'novisa.png';
        }else{
            let uploadcustomerVisa = req.files.customerVisa;
            customerVisa = req.files.customerVisa.name;
            visauploadPath     = path.join('public')+ '/uploads/visa/' + datetime +'_' + customerfullname + '_' + customerVisa;
            uploadcustomerVisa.mv(visauploadPath, function(err) {
                if (err)
                    return res.status(500).send(err);
            });
    
        }
        if(req.files.customerResident == undefined){
            customerResident = 'noresident.png';
        }else{
            let uploadcustomerResident= req.files.customerResident;
            customerResident = req.files.customerResident.name;
            residentuploadPath = path.join('public')+ '/uploads/residents/' + datetime +'_' + customerfullname + '_' + customerResident;
            uploadcustomerResident.mv(residentuploadPath, function(err) {
                if (err)
                    return res.status(500).send(err);
            });
    
        }
    
        db.promise().query(`INSERT INTO checkin (roomid ,customerfullname,customeremail,customermobile,customerwhatsapp,customerpassport,customerVisa,customerResident,checkindate,checkoutdate,customerpaidrent,customerpaiddeposit,comments)
        VALUES('${roomid}','${customerfullname}','${customeremail}','${customermobile}','${customerwhatsapp}','${customerpassport}','${customerVisa}','${customerResident}','${checkindate}','${checkoutdate}','${customerpaidrent}','${customerpaiddeposit}','${comments}')`)
            .then(() =>{
                //update room status
                db.promise().query(`UPDATE ROOMS SET occupied='1' WHERE id=${roomid}`)
                res.redirect(`/allcustomers`)
            })
    }
    

})


module.exports = router;