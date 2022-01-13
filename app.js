var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { engine } = require('express-handlebars');
const fileUpload = require('express-fileupload');

const { authenticateToken } = require('./routes/auth');

var indexRouter    = require('./routes/index');
var usersRouter    = require('./routes/users');
var appartments    = require('./routes/appartments');
var roomstype      = require('./routes/roomstype');
var rooms          = require('./routes/rooms');
var vacantrooms    = require('./routes/vacant');
var occupiedrooms  = require('./routes/occupied');
var checkin        = require('./routes/checkin');
var directcheckin  = require('./routes/directcheckin');
var allcustomers   = require('./routes/allcustomers');
var loginusers     = require('./routes/loginusers');
var logout         = require('./routes/logout');


var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
  defaultLayout:'layout',
  extname:'.hbs',

  helpers:{
    EditUser: function(userdata,usertype){
      var list = '';
      usertype.forEach(type => {
        if(type != 'undefined'){
          if(userdata[0].usertype == type.id){
            list = list + "<option selected value="+type.id+">"+type.usertype+"</option>"
          }else{
             list = list + "<option value="+type.id+">"+type.usertype+"</option>"
          }
        }
      })
      return (`<div class='card-body'><div class='form-group'><label for='userfullname'>User Full Name</label><input type='input' class='form-control' name='userfullname' value='${userdata[0].userfullname}' placeholder='User Full Name'></div><div class='form-group'><label for='useremail'>Email address</label><input type='email' class='form-control' name='useremail' value='${userdata[0].useremail}' placeholder='Enter email'></div><div class='form-group'><label for='userpassword'>Password</label><input type='password' class='form-control'name='userpassword'  value='' placeholder='Password'></div><div class='form-group'><label for='usertype'>User Type</label><select class='custom-select' name='usertype'>${list}</select></div><div class='form-group'><label for='userimage'>File input</label><div class='input-group'><div class='custom-file'><input type='file' name='userimage'  class='custom-file-input'><label class='custom-file-label' for='userimage'>${userdata[0].userimage}</label></div><div class='input-group-append'><span class='input-group-text'>Upload</span></div></div></div><button type='submit' class='btn btn-primary'>Submit</button></div>`)    
    },
    allRooms: function(rooms, appartments, roomtypes){
        var roomRows = '';
        var appartmentName = {};
        var roomType = {};
        appartments.forEach( appartment => {
          appartmentName[appartment.id] = appartment.appartmentnumber
        });
        roomtypes.forEach( roomtype => {
          roomType[roomtype.id] = roomtype.roomtypename
        });
        //return rooms row 
        rooms.forEach(room => {
          if(room.vacent == 1){
            room.vacent = 'Yes';
          }else{
            room.vacent = 'No';
          }
          if(room.occupied == 1){
            room.occupied = 'Yes';
          }else{ 
            room.occupied = 'No';
          }    
          roomRows = roomRows + `<tr><td>#</td><td>${appartmentName[room.appartmentid]}</td><td>${room.roomnumber}</td><td> ${roomType[room.roomtypeid]}</td><td>${room.price}</td><td>${room.deposit}</td> <td>${room.occupied}</td> <td class='project-actions text-right'> <a class='btn btn-info btn-sm' href='/rooms/roomedit/${room.id}'> <i class='fas fa-pencil-alt'> </i> Edit </a> <a class='btn btn-danger btn-sm' data-toggle='modal' data-target='#modal-deleteroom' onclick='deleteroom(${room.id})' href='#'> <i class='fas fa-trash'> </i> Delete </a> </td> </tr>`;

        });

        return (roomRows)
    },
    EditRoom: function(room, appartments, roomstype){
        var appartmentsNumberList = '';
        var roomsTypeList         = '';
        var occupiedList          = '';
        if(room[0].occupied == 1){
          occupiedList = occupiedList + "<option selected value="+room[0].occupied+">Yes</option>"
          occupiedList = occupiedList + "<option  value='0'>No</option>"
        }else{
          occupiedList = occupiedList + "<option selected value="+room[0].occupied+">No</option>"
          occupiedList = occupiedList + "<option  value='1'>Yes</option>"
        }
        appartments.forEach(appartment => {
          if(appartment != 'undefined'){
            if(room[0].appartmentid == appartment.id){
              appartmentsNumberList = appartmentsNumberList + "<option selected value="+appartment.id+">"+appartment.appartmentnumber+"</option>"
            }else{
              appartmentsNumberList = appartmentsNumberList + "<option value="+appartment.id+">"+appartment.appartmentnumber+"</option>"
            }
          }
        });
        roomstype.forEach(roomtype => {
          if(roomtype != 'undefined'){
            if(room[0].roomtypeid == roomtype.id){
              roomsTypeList = roomsTypeList + "<option selected value="+roomtype.id+">"+roomtype.roomtypename+"</option>"
            }else{
              roomsTypeList = roomsTypeList + "<option value="+roomtype.id+">"+roomtype.roomtypename+"</option>"
            }
          }
        });
       return (`<div class='card-body'> <div class='form-group'> <label for='appartmentnumber'>Appartment Number</label> <select class='custom-select' required name='appartmentnumber'> ${appartmentsNumberList} </select> </div> <div class='form-group'> <label for='roomnumber'>Bed Number</label> <input type='text' value='${room[0].roomnumber}' required class='form-control' name='roomnumber' placeholder='Enter Room Number'> </div> <div class='form-group'> <label for='roomtypeid '>Room Type</label> <select class='custom-select' required name='roomtypeid'> ${roomsTypeList} </select> </div> <div class='form-group'> <label for='price'>Price</label> <input type='text' value='${room[0].price}' required class='form-control' name='price' placeholder='Room Price'> </div> <div class='form-group'> <label for='deposit'>Deposit</label> <input type='text' value='${room[0].deposit}' required class='form-control' name='deposit' placeholder='Room Deposit'> </div> <div class='form-group'> <label for='roomtypeid'>Occupied</label> <select class='custom-select' required name='occupied'> ${occupiedList} </select> </div> <button type='submit' class='btn btn-primary'>Submit</button> </div>`)
    }

    
  }
}));

app.set('view engine', '.hbs');
app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/login',loginusers);
app.use('/',authenticateToken,indexRouter);
app.use('/users', authenticateToken,usersRouter);
app.use('/roomstype',authenticateToken,roomstype);
app.use('/appartments',authenticateToken,appartments);
app.use('/rooms',authenticateToken,rooms);
app.use('/vacant',authenticateToken,vacantrooms);
app.use('/occupied',authenticateToken,occupiedrooms);
app.use('/checkin',authenticateToken,checkin);
app.use('/directcheckin',authenticateToken,directcheckin);
app.use('/allcustomers',authenticateToken,allcustomers);
app.use('/logout',logout);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
