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

// router.delete("/deleteAppointment", async (req, res) => {
//   console.log(req.body.appointmentId)
//   var data = await knex
//     .table("Appointment")
//     .where("appointmentId", req.body.appointmentId)
//     .del()

//   res.send(data);
// });







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

module.exports = router;
