var express = require('express');
var router = express.Router();
var moment = require('moment');
var datetime = moment().format('YYYY-MM-DD');




const db = require('../database/database');



/* GET all customers . */
router.get('/', async function(req, res, next) {
        var endloop = 0;
        var allcustomersarray = [];
        await db.promise().query(`SELECT * FROM checkin`)
           .then((customers) => {
               customers = customers[0];
               if(customers.length > 0){
                customers.forEach( async  customer => {
                    var roomid = customer.roomid;
                    const originalroomid = customer.roomid;
                   
                    //get room details for each customer 
                     await db.promise().query(`SELECT * FROM rooms WHERE id=${roomid}`)
                       .then(async (roomdetails) => {
                         var appartmentid = roomdetails[0][0].appartmentid;
                         var appartmentnumber = await db.promise().query(`SELECT appartmentnumber FROM appartments WHERE id=${appartmentid}`)
                         roomdetails[0][0].appartmentid = appartmentnumber[0][0].appartmentnumber;
 
                         var roomtypeid = roomdetails[0][0].roomtypeid;
                         var roomtypename = await db.promise().query(`SELECT roomtypename FROM roomtype WHERE id=${roomtypeid}`)
                         roomdetails[0][0].roomtypeid = roomtypename[0][0].roomtypename;
                         
                         customer.roomid = roomdetails[0];
                         customer.checkindate  = moment(customer.checkindate).format('MM/DD/YYYY');
                         customer.checkoutdate = moment(customer.checkoutdate).format('MM/DD/YYYY');
                         if(customer.customerpaidrent == '1'){
                             customer.customerpaidrent = 'Yes';
                         }else{
                             customer.customerpaidrent = 'No';
                         }
 
                         if(customer.customerpaiddeposit == '1'){
                             customer.customerpaiddeposit = 'Yes';
                         }else{
                             customer.customerpaiddeposit = 'No';
                         }
                         customer.originalroomid = originalroomid;
                         
                         allcustomersarray.push(customer);
                         endloop = endloop + 1;
                         
                         if(endloop == customers.length ){
                             res.render('allcustomers', { allcustomersarray})
                         }
                         
                       })                      
                }) 
                
               }else{
                res.render('allcustomers', { })
               }
               
           })
})



router.get('/:id', async function(req, res, next) {
    var reqparam            = req.params.id.split('__');
    var customerid          = reqparam[0];
    var returenddeposit     = reqparam[1];
    var deductdepositreason = reqparam[2];

    var roomid     = await db.promise().query(`SELECT * from checkin WHERE id=${customerid}`);
        roomid     = roomid[0][0].roomid;
        console.log(customerid,roomid);
    //get all details to archive it 
    var roomdetails    = await db.promise().query(`SELECT * from rooms WHERE id=${roomid}`);
    var appartmentid   = roomdetails[0][0].appartmentid;
    var roomtypeid     = roomdetails[0][0].roomtypeid;
    var roomnumber     = roomdetails[0][0].roomnumber;
    var price          = roomdetails[0][0].price;
    
    var appartmentName = await db.promise().query(`SELECT * from appartments WHERE id=${appartmentid}`); 
    var roomtypename   = await db.promise().query(`SELECT * from roomtype WHERE id=${roomtypeid}`); 
    
    appartmentName     = appartmentName[0][0].appartmentnumber;
    roomtypename       = roomtypename[0][0].roomtypename;

    var customerinfo   = await db.promise().query(`SELECT * from checkin WHERE id=${customerid}`); 
        customerinfo   = customerinfo[0][0];
    var customerfullname = customerinfo.customerfullname;
    var customeremail    = customerinfo.customeremail;
    var customermobile   = customerinfo.customermobile;
    var customerwhatsapp = customerinfo.customerwhatsapp;
    var customerpassport = customerinfo.customerpassport;
    var customerVisa     = customerinfo.customerVisa;
    var customerResident = customerinfo.customerResident;
    var checkindate      = customerinfo.checkindate;
        checkindate      = moment().format('YYYY-MM-DD');
    var checkoutdate     = customerinfo.checkoutdate;
        checkoutdate      = moment().format('YYYY-MM-DD');
        
     db.promise().query(`INSERT INTO archive (appartmentnumber,roomnumber,roomtype,price,customerfullname,customeremail,customermobile,customerwhatsapp,customerpassport,customerVisa,customerResident,checkindate,checkoutdate,returenddeposit,deductdepositreason) VALUES ('${appartmentName}','${roomnumber}','${roomtypename}','${price}','${customerfullname}','${customeremail}','${customermobile}','${customerwhatsapp}','${customerpassport}','${customerVisa}','${customerResident}','${checkindate}','${checkoutdate}','${returenddeposit}','${deductdepositreason}')`)
       .then(async () => {
            //delete customer 
            var deletecustomer = await db.promise().query(`DELETE  FROM checkin WHERE id=${customerid}`)

            //update room vacant status 
            var checkoutroom   = await db.promise().query(`UPDATE ROOMS SET occupied='0' WHERE id=${roomid}`)
           res.redirect('/allcustomers')
       }) 
    
})


//block customer 
router.post('/:id', async function(req, res, next) {
    var paramid = req.params.id.split('__');
    var blacklistreason = paramid[0];
    var customername    = paramid[1];

     db.promise().query(`INSERT INTO blacklistcustomers (blacklistcustomer,blacklistreason) VALUES('${customername}','${blacklistreason}')`)
        .then((data) => {
            res.send('blocked user')
        })
    
})



module.exports = router;