var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path');
var datetime = moment().format('YYYY-MM-DD');


const db = require('../database/database');

router.get('/', async function(req, res, next) {
    //get all appartments name that have vacant rooms 
    var vacantrooms = await db.promise().query(`SELECT * from rooms WHERE  occupied=0`);
        vacantrooms = vacantrooms[0];
        var vacantroomsarray = [];
        vacantrooms.forEach(async room => {
            if (vacantroomsarray.includes(room.appartmentid ) === false){
                vacantroomsarray.push(room.appartmentid)
            }
        }) 
    var vacantappartments = await db.promise().query(`SELECT * from appartments`);
        vacantappartments  = vacantappartments[0];
    var allappartmentsarray = [];
        vacantappartments.forEach(allappartments =>{
            if (vacantroomsarray.includes(allappartments.id)){
                allappartmentsarray.push(allappartments)
            }
        })
    res.render('checkin',{allappartmentsarray})
})


router.get('/vacantroomstype/:id', async function(req, res, next ){
    var appartmentid    = req.params.id;
    var vacantroomstype = await db.promise().query(`SELECT * from rooms WHERE appartmentid =${appartmentid} AND occupied=0`);
    var vacantalltypes  = await db.promise().query(`SELECT * from roomtype`);
        vacantalltypes  = vacantalltypes[0];
    var types = [];
    var alltypesvacant = [];

    vacantroomstype[0].forEach(async type => {
        if (types.includes(type.roomtypeid) === false){
            types.push(type.roomtypeid)
        }  
    })
    //get all types for vacant rooms 
    vacantalltypes.forEach(async alltypes => {
        if (types.includes(alltypes.id)){
            alltypesvacant.push(alltypes)
        }
    })
 
    res.send(alltypesvacant);
})
router.get('/vacantrooms/:id', async function(req, res, next ){
    var appartmentid  = req.params.id.split('-')[0];
    var roomtypeid  = req.params.id.split('-')[1];
    var vacantrooms = await db.promise().query(`SELECT * from rooms WHERE appartmentid =${appartmentid} AND roomtypeid=${roomtypeid} AND occupied=0`);
        vacantrooms = vacantrooms[0];
    res.send(vacantrooms);
})

//get room details 
router.get('/roomdetails/:id', async function(req, res, next ){
    var roomid  = req.params.id;
    var roomdetails = await db.promise().query(`SELECT * from rooms WHERE id=${roomid}`);
        roomdetails = roomdetails[0];
    res.send(roomdetails);
})


//add checkin post 

router.post('/', function(req,res, next){
    const {roomid, customerfullname,customeremail,customermobile ,customerwhatsapp,checkindate,checkoutdate,customerpaidrent,customerpaiddeposit,comments } = req.body;

    let customerpassport;
    let passportuploadPath;
    let customerVisa;
    let visauploadPath;
    let customerResident;
    let residentuploadPath;
    console.log(req.files)
    if(req.files == null){
        customerpassport = 'nopassport.png';
    }else{
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
        
        

    }
    if(req.files == null){
        customerVisa = 'novisa.png';
    }else{
        console.log(req.files.customerVisa)
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
        
       

    }
    if(req.files == null){
        customerResident = 'noresident.png';
    }else{
        if(req.files.customerResident == undefined){
            customerResident = 'noresident.png';
        }else{
            let uploadcustomerResident = req.files.customerResident;
            customerResident = req.files.customerResident.name;
            residentuploadPath = path.join('public')+ '/uploads/residents/' + datetime +'_' + customerfullname + '_' + customerResident;
            uploadcustomerResident.mv(residentuploadPath, function(err) {
                if (err)
                    return res.status(500).send(err);
            });
        }
        
       

    }

    db.promise().query(`INSERT INTO checkin (roomid ,customerfullname,customeremail,customermobile,customerwhatsapp,customerpassport,customerVisa,customerResident,checkindate,checkoutdate,customerpaidrent,customerpaiddeposit,comments)
    VALUES('${roomid}','${customerfullname}','${customeremail}','${customermobile}','${customerwhatsapp}','${customerpassport}','${customerVisa}','${customerResident}','${checkindate}','${checkoutdate}','${customerpaidrent}','${customerpaiddeposit}','${comments}')`)
        .then(() =>{
            //update room status
            db.promise().query(`UPDATE ROOMS SET occupied='1' WHERE id=${roomid}`)
            res.redirect('/allcustomers')
        })
    

})


module.exports = router;