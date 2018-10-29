var Moment = require('moment');
var MomentRange = require('moment-range');
var moment = MomentRange.extendMoment(Moment);
const momentTz = require('moment-timezone')
require('twix');
const express = require("express");
var router = express.Router();
var knex = require("knex")({
  client: "mysql",
  connection: {
    host: "128.199.98.237",
    user: "test",
    password: "test",
    database: "PatientQueue",

  },

});

//nexmo
const Client = require('authy-client').Client;
const authy = new Client({ key: "QJ3XJ266b3AvqNKyKxFx1Xt8ZAlLYNgH" });
const enums = require('authy-client').enums;


const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: "ed268acf",
  apiSecret: "ekUo5BMKsfRKlxoQ"
});

//Check Patient Data in Adminhome.js 
router.get("/getPatient", async (req, res) => {
  var data = await knex.table("Patient").select();
  res.send(data);
});

//Never use
router.get("/getMax", async (req, res) => {
  var maxHN = await knex
    .table("Queue")
    .select()
    .where("roomId", 1)
    .max("queueId as maxQueueId");
  console.log(maxHN[0].maxQueueId);
  res.send("EIEI");
});

//Update Queue in Adminhome.js (Addqueue Function)
router.post("/addPatientQ", async (req, res) => {
  console.log(req.body)
  var maxHN = await knex
    .table("Queue")
    .select()
    .where("roomId", req.body.roomId)
    .max("queueId as maxQueueId");

  let groupId = 0
  console.log(maxHN[0].maxQueueId);
  if (req.body.queueDefault === 'queueDefault') {
    let tmp = await knex
      .table("Queue")
      .select()
      .max("group as maxGroupId");
    groupId = tmp[0].maxGroupId + 1
  } else {
    groupId = req.body.groupId
  }
  console.log('groupid ', groupId)
  await knex.table("Queue").insert({
    queueId: maxHN[0].maxQueueId + 1,
    roomId: req.body.roomId,
    Date: req.body.date,
    statusId: req.body.statusId,
    HN: req.body.HN,
    doctorId: req.body.doctorId,
    forward: req.body.forward,
    nurseId: req.body.nurseId,
    group: groupId,
    roomBack: req.body.roomBack
  });
  res.send("Success");

});

//Check HN IN Department ว่าอยู๋ในแผนกไหน Adminhome.js (Addqueue Function)
router.get("/checkHNatDepartment/:id", async (req, res) => {
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .select()
    .where("Department.departmentId", req.params.id)
    .where("statusId", "!=", 4);
  res.send(data);
});

//get all department in Adminhome.js (Forward function)
router.get("/getDepartment", async (req, res) => {
  var data = await knex
    .table("Department")
    .select()
    .where("type", 1);
  res.send(data);
});
//get all Lab in Adminhome.js (Forward function)
router.get("/getLab", async (req, res) => {
  var data = await knex
    .table("Department")
    .select()
    .where("type", 2);
  res.send(data);
});

//Not sure
router.get("/getDepartment/:id", async (req, res) => {
  var data = await knex
    .table("Department")
    .select()
    .where("departmentId", req.params.id);

  res.send(data);
});
//Never use
router.get("/getRoom/:id", async (req, res) => {
  var data = await knex
    .table("Room")
    .select()
    .where("departmentId", req.params.id);
  res.send(data);
});

//Never use
router.get("/getTheRoom", async (req, res) => {
  var data = await knex.table("Room").select();
  res.send(data);
});
//Never use
router.get("/getDoctor/:id", async (req, res) => {
  var data = await knex
    .table("Timetable")
    .select("doctorId")
    .where("roomId", req.params.id);
  res.send(data);
});
//Never use
router.get("/doctorTime", async (req, res) => {
  var data = await knex.table("Doctor").select();

  res.send(data);
});

//check Doctor in room at Adminhome.js 
router.get("/currentQwithDoctor/:id", async (req, res) => {
  var data = await knex
    .table("Queue")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .where("statusId", 3)
    .where("doctorId", req.params.id);
  res.send(data);
});
//get list doctor 
router.post("/getListDoctor", async (req, res) => {
  var data = await knex
    .table("Timetable")
    .join("Doctor", "Timetable.doctorId", "=", "Doctor.empId")
    .select()
    .where("day", req.body.day)
    .whereIn("month", req.body.month)
    .whereIn("year", req.body.year)
    .whereIn("departmentId", req.body.departmentId);
  res.send(data);
  // console.log(data);
});
// เช็ค forwardDepertment ID
router.post("/getRoomAndDoctor", async (req, res) => {
  var data = await knex
    .table("Timetable")
    .join("Doctor", "Timetable.doctorId", "=", "Doctor.empId")
    .select()
    .where("day", req.body.day)
    .whereIn("month", req.body.month)
    .whereIn("year", req.body.year)
    .whereIn("departmentId", req.body.forwardDepartmentId);

  res.send(data);
  console.log(data);
});
//never use
router.delete("/deletePatientQ", async (req, res) => {
  var data = await knex
    .table("Queue")
    .where({
      HN: req.body.HN
    })
    .delete();
  res.end("success");
});
//never use
router.post("/checkHN", async (req, res) => {
  var data = await knex
    .table("Patient")
    .select()
    .where({
      HN: req.body.HN,
      phoneNumber: req.body.phoneNumber
    });
  res.send(data);
});
//use for check username with nurse at Admin.js
router.post("/checkUsername", async (req, res) => {
  var data = await knex
    .table("Nurse")
    .join("Department", "Department.departmentId", "=", "Nurse.departmentId")
    .select()
    .where({
      Username: req.body.Username,
      Password: req.body.Password
    });
  res.send(data);
});
//never use
router.post("/getHN", async (req, res) => {
  var data = await knex
    .table("Patient")
    .select()
    .where("HN", req.body.HN);
  res.send(data);
});
//never use
router.get("/getNurse", async (req, res) => {
  var data = await knex.table("Nurse").select();
  res.send(data);
});

//queues show queue in Adminhome.js
router.get("/getQueue/:roomId", async (req, res) => {
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .join("Status", "Queue.statusId", "=", "Status.statusId")
    .select()
    .where("Queue.statusId", 1)
    .where("Queue.roomId", req.params.roomId);
  console.log(data)
  res.send(data);
});

//lab queue ----------------
router.get("/getLabQueue/:roomId", async (req, res) => {
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .select()
    .where("Queue.roomBack", req.params.roomId)
    //test
    // .where("Department.type", 2)
    // .where("Room.roomId", req.params.roomId);
  res.send(data);
});
//----------------------
router.get("/getListLabQueue", async (req, res) => {
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .select()
    .where("statusId", 2);

  res.send(data);
});
//----------------------
//Neveruse
router.get("/getqueuqueue", async (req, res) => {
  var data = await knex.table("Queue").select();

  res.send(data);
});
//Call function Adminhome.js
// router.post("/updateQueue", async (req, res) => {
//   console.log(req.body.Date)
//   if (req.body.previousHN !== "") {
//     await knex
//       .table("Queue")
//       .where("HN", req.body.previousHN)
//       .update({
//         statusId: 4,
//         date: new Date(momentTz().tz(req.body.Date, "Asia/Bangkok").format()),
//       });

//   }
//   var data = await knex
//     .table("Queue")
//     .where("HN", req.body.HN)
//     .update({
//       statusId: 3,
//       date: new Date(momentTz().tz(req.body.Date, "Asia/Bangkok").format())
//     });
//   res.send("data");
// });


router.post("/updateCurrentLabQueue", async (req, res) => {
  console.log(req.body.HN);
  var data = await knex
    .table("Queue")
    .where("HN", req.body.HN)
    .update({
      statusId: 1
    });
  res.send(data);
});
//
//รอเคลีย-------------------------------------
router.post("/updateForwardQueue", async (req, res) => {
  // var maxHN = await knex
  //   .table("Queue")
  //   .select()
  //   .where("roomId", req.body.roomId)
  //   .max("queueId as maxQueueId")

  // // var maxGroup = await knex
  // // .table("Queue")
  // // .select("group")
  // // .max("group as maxGroups")


  // let tmp = {};

  // tmp = {
  //   statusId: 1,
  //   roomId: req.body.roomId,
  //   forward: req.body.forward,
  //   doctorId: req.body.doctorId,
  //   queueId: maxHN[0].maxQueueId + 1,
  //   roomBack: req.body.roomBack,
  //   // group : maxGroup[0].maxGroups + 1
  // };

  var data = await knex
    .table("Queue")
    .where("HN", req.body.HN)
    //.increment('queueId', 1)
    .update(tmp);
  res.send("data");
});
//รอเคีล-------------------------------------------
//never use
router.get("/getDate", async (req, res) => {
  var data = await knex.table("Timetable").select("timeStart", "timeEnd");

  res.send(data);
});

//forward to another department (Forard Function)
router.post("/updateForward", async (req, res) => {
  var data = await knex
    .table("Queue")
    .where("HN", req.body.HN)
    .update({
      statusId: 3
    });
  res.send("data");
});

//getQueueData
router.post("/getQueueData", async (req, res) => {
  console.log(req.body.HN);
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .join("Status", "Queue.statusId", "=", "Status.statusId")
    // .join("Appointment","Queue.HN","=","Appointment.HN")
    .select()
    .where("Queue.HN", req.body.HN)
    .where("Queue.statusId", "!=", 4);
  res.send(data);
});

router.get("/getCurrentQueue/:roomId", async (req, res) => {
  var data = await knex
    .table("Queue")
    .select("queueId")
    .where("roomId", req.params.roomId)
    .where("statusId", 3);

  res.send(data);
});

router.post("/addAppointment", async (req, res) => {
  var data = await knex
    .table("Appointment")
    .insert({
      date: req.body.date,
      day: req.body.day,
      month: req.body.month,
      year: req.body.year,
      timeStart: req.body.startTime,
      timeEnd: req.body.endTime,
      doctorId: req.body.doctorId,
      HN: req.body.HN,
      // roomId : req.body.roomId
    })
    .select();
  res.send(data);
});
//use with calendar 
router.get("/getAppointment/:id", async (req, res) => {
  var data = await knex
    .table("Appointment")
    .join("Patient", "Appointment.HN", "=", "Patient.HN")
    .join("Doctor", "Appointment.doctorId", "=", "Doctor.empId")
    .join("Department", "Doctor.departmentId", "=", "Department.departmentId")
    // .join("Room","Doctor.departmentId","=","Room.departmentId")
    .where('Department.departmentId',req.params.id)
    .select();

  res.send(data);
});

router.get("/updateAllPerDay", async (req, res) => {

  var getDate = new Date(momentTz.tz(new Date(), "Asia/Bangkok").format())


  var month = new Array(
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec"
  );
  var day = new Array(7);
  day[0] = "sun";
  day[1] = "mon";
  day[2] = "tue";
  day[3] = "wed";
  day[4] = "thu";
  day[5] = "fri";
  day[6] = "sat";

  var curr_date = getDate.getDay();
  var curr_month = getDate.getMonth();
  var curr_year = getDate.getFullYear();
  listEmpId = await knex
    .table("Timetable")
    .join("Doctor", "Timetable.doctorId", "=", "Doctor.empId")
    .select("Timetable.doctorId")
    .where("day", day[curr_date])
    .whereIn("month", month[curr_month])
    .whereIn("year", curr_year)

  diff_minutes = (tmp2, tmp1) => {
    var diff = (tmp2.getTime() - tmp1.getTime()) / 1000
    diff /= 60;
    return Math.abs(Math.round(diff))
  }
  for (let i = 0; i < listEmpId.length; i++) {
    // console.log("listEmpId " + listEmpId.length)

    let range = 0
    let sumRange = 0
    dateQueue = await knex
      .table("Queue")
      .select("date")
      .where("doctorId", listEmpId[i].doctorId)
      .where("statusId", 4)
    // console.log("for แรก")

    if (dateQueue.length != 0) {
      // console.log("เข้า if")
      // console.log("dateQueue " + dateQueue.length)
      for (let j = 0; j < dateQueue.length; j++) {
        let tmp1 = new Date(dateQueue[j].date)
        // console.log("tmp1: " + tmp1)
        if (dateQueue.length - 1 == j) {
          range = range + 0
        } else {
          let tmp2 = new Date(dateQueue[j + 1].date)
          console.log("tmp2: " + tmp2)
          range = diff_minutes(tmp2, tmp1)
          // console.log("for สอง")
          // console.log('range ',range)
          sumRange += range
          // console.log("sumRange" + sumRange)
        }
      }
      var avgMinutes = sumRange / dateQueue.length
      // console.log("dateQueue" + dateQueue.length)
      // console.log("avgMinutes" + avgMinutes)
      updateAvgTime = await knex
        .table("Doctor")
        .where("empId", listEmpId[i].doctorId)
        .update({
          avgtime: avgMinutes
        });

      // console.log("เข้า db update")
      break;
    }
  }
});

router.post("/updateAppointment", async (req, res) => {
  var data = await knex
    .table("Appointment")
    .update({
      date: req.body.date,
      day: req.body.day,
      month: req.body.month,
      year: req.body.year,
      timeStart: req.body.timeStart,
      timeEnd: req.body.timeEnd,

    })
    .where("appointmentId", req.body.appointmentId)
    .select();
  res.send(data);
});

router.delete("/deleteAppointment/:id", async (req, res) => {
  await knex
    .table("Appointment")
    .where("appointmentId",'=', req.params.id)
    .del()

  res.send('success');
});







//check Group
router.post("/checkGroupId", async (req, res) => {
  console.log('group ', req.body.group)
  var data = await knex
    .table("Queue")
    .where("group", req.body.group)
    .where("statusId", 5)
    .select()
    .orderBy('runningNumber', 'asc')
  // res.send("check Success")
  res.send(data)
});

//checkGroup for Roomback 
router.post("/checkGroupRoomback", async (req, res) => {
  console.log('group ', req.body.group)
  var data = await knex
    .table("Queue")
    .where("group", req.body.group)
    .where("statusId", 4)
    // .where("roomId",req.body.roomId)
    .select()
    .orderBy('runningNumber', 'asc')
  // res.send("check Success")
  res.send(data)
});



//Call function Adminhome.js and forwward
///// NEW //////////////////////////////
router.post("/updateQueue", async (req, res) => {
  await knex
    .table("Queue")
    .where("HN", req.body.HN)
    .where("queueId", req.body.queueId)
    .where("runningNumber", req.body.runningNumber)
    // .where("statusId",1)
    .update({
      statusId: req.body.statusId,
      date: new Date(momentTz().tz(req.body.date, "Asia/Bangkok").format()),
    });
  res.send("UPDATE SUCCESS");
});

///user step at user page 

router.post("/getAllStepQueue", async (req, res) => {
  console.log(req.body.HN);
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .join("Status", "Queue.statusId", "=", "Status.statusId")
    // .join("Appointment","Queue.HN","=","Appointment.HN")
    .select()
    .where("Queue.HN", req.body.HN)
    .where("Queue.group", req.body.group)
    .orderBy('runningNumber', 'asc')
    
  res.send(data);
});
///
router.post("/getAllAppointment", async (req, res) => {
  var data = await knex
    .table("Appointment")
    .join("Patient", "Appointment.HN", "=", "Patient.HN")
    .join("Doctor", "Appointment.doctorId", "=", "Doctor.empId")
    .join("Department", "Doctor.departmentId", "=", "Department.departmentId")
    // .join("Room","Department.departmentId","=","Room.departmentId")
    .select()
    .where("Appointment.HN",req.body.HN)
  res.send(data);
});


const accountSid = 'ACd6b78055eb3dbbebbb32eafe7f6d275e'
const authToken = '45179b9b7d88c4989d13a81c82f16d91'
const client = require('twilio')(accountSid, authToken);

router.post('/sendText', (req, res) => {

  const recipient = req.body.recipient
  const textmessage = req.body.textmessage

  client.messages.create({
    body: textmessage,
    from: '+18647540772',
    to: recipient
  }).then(message => console.log(message.sid))
    .done();

})

router.post("/getPhoneNumber", async(req, res)=>{
  var data = await knex
  .table("Patient")
  .select("phonenumber")
  .where("HN",req.body.HN);
  res.send(data);
})

router.post("/requestOTP", async (req, res) => {
  console.log(req.body.recipient)
  try {
    const result = await requestOTP(req.body.recipient)
    res.send(result)
  } catch (error) {
    res.send(error)
  }
})

// router.post("/verifyOTP", async (req, res) => {
//   console.log(req.body.phoneNumber)
//   try {
//     const result = await verifyOTP(req.body.phoneNumber, req.body.token)
//     res.send(result)
//   } catch (error) {
//     res.send(error)
//   }
// })

router.post("/validateOTP", async (req, res) => {
  console.log(req.body.recipient)
  try {
    const result = await validateOTP(req.body.requestId, req.body.code)
    console.log('result', result)
    res.send(result)
  } catch (error) {
    res.send(error)
  }
})

//TWILIO
// const requestOTP = (phoneNumber) => new Promise((resolve,reject) => {
//   console.log("เข้า requestOTP")
//   authy.startPhoneVerification({ countryCode: 'TH', locale: 'th', phone: phoneNumber, via: enums.verificationVia.SMS }, function (err, res) {
//     if (err) reject(err);
//     console.log('Phone information', res);
//     resolve(res)
//   });
// })


// const verifyOTP = (phoneNumber,token) => new Promise((resolve, reject) => {
//   console.log("เข้า verifyOTP")
//   client.verifyPhone({ countryCode: 'TH', phone: phoneNumber, token: token }, function (err, res) {
//     console.log('Verification', res);
//     if (err) throw reject(err);
//     console.log('Verification code is correct');
//     resolve(res)
//   });
// })


const requestOTP = (recipient) => new Promise((resolve, reject) => {
  nexmo.verify.request({ number: recipient, brand: 'patientQueue OTP' }, (err, result) => {
    if (err) reject({ message: 'Server Error' })
    if (result && result.status == '0') {
      resolve({ requestId: result.request_id })
      return
    }
    reject({ message: result, requestId: result.request_id })
  })
})

const validateOTP = (requestId, code) => new Promise((resolve, reject) => {
  nexmo.verify.check({ request_id: requestId, code }, (err, result) => {
    if (err) reject({ message: 'Server Error' })
    console.log("validateOTP", result);
    if (result && result.status == '0') {
      resolve({ message: result })
      return
    }
    reject({ message: result, requestId: requestId })
  })
})

const cancelOTP = (requestId) => new Promise((resolve, reject) => {
  // { status: '6', error_text: 'The requestId \'01a218e770de499cb7b27b6dee3d144e\' does not exist or its no longer active.'}
  // { status: '10', error_text: 'Concurrent verifications to the same number are not allowed'}
  // { status: '19', error_text: 'Verification request [\'53c28372047c483f8e6e428d44093148\'] can\'t be cancelled within the first 30 seconds.'}
  // { status : "19",error_text: "Verification request  ['7e7563aa38704911b36a67f2cd5d3759'] can't be cancelled now. Too many attempts to re-deliver have already been made."}
  nexmo.verify.control({ request_id: requestId, cmd: 'cancel' }, (err, result) => {
    if (err) reject({ message: err })
    console.log("CANCEL!!!!", result)
    if (result && result.status == '0') {
      resolve({ message: 'cancel success!' })
      return
    } else {
      reject({ message: result })
    }
  });
})


// PhoneVerification.prototype.requestPhoneVerification = function (phone_number, country_code, via, callback) {
//   this._request("post", "/protected/json/phones/verification/start", {
//     "api_key": this.apiKey,
//     "phone_number": phone_number,
//     "via": via,
//     "country_code": country_code,
//     "code_length": 4
//   },
//     callback
//   );
// };

// PhoneVerification.prototype.verifyPhoneToken = function (phone_number, country_code, token, callback) {

//   console.log('in verify phone');
//   this._request("get", "/protected/json/phones/verification/check", {
//     "api_key": this.apiKey,
//     "verification_code": token,
//     "phone_number": phone_number,
//     "country_code": country_code
//   },
//     callback
//   );
// };

module.exports = router;
