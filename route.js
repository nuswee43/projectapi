var Moment = require("moment");
var MomentRange = require("moment-range");
var moment = MomentRange.extendMoment(Moment);
const momentTz = require("moment-timezone");
require("twix");
const express = require("express");
var router = express.Router();
var knex = require("knex")({
  client: "mysql",
  connection: {
    host: "128.199.98.237",
    user: "test",
    password: "test",
    database: "PatientQueue"
  }
});

//nexmo
const Client = require("authy-client").Client;
const authy = new Client({ key: "QJ3XJ266b3AvqNKyKxFx1Xt8ZAlLYNgH" });
const enums = require("authy-client").enums;

const Nexmo = require("nexmo");
const nexmo = new Nexmo({
  apiKey: "929e744c",
  apiSecret: "qIsPlZ3NK0nJp3XY"
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
  // console.log(maxHN[0].maxQueueId);
  res.send("EIEI");
});

//Update Queue in Adminhome.js (Addqueue Function)
router.post("/addPatientQ", async (req, res) => {
  // console.log(req.body)
  var maxHN = await knex
    .table("Queue")
    .select()
    .where("roomId", req.body.roomId)
    .max("queueId as maxQueueId");

  let groupId = 0;
  // console.log(maxHN[0].maxQueueId);
  if (req.body.queueDefault === "queueDefault") {
    let tmp = await knex
      .table("Queue")
      .select()
      .max("group as maxGroupId");
    groupId = tmp[0].maxGroupId + 1;
  } else {
    groupId = req.body.groupId;
  }
  // console.log('groupid ', groupId)
  // console.log('roomId', req.body.roomId)
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
    roomBack: req.body.roomBack,
    step: req.body.step
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
    .where("Date", req.body.Date)
    .where("day", req.body.day)
    .where("month", req.body.month)
    .where("Year", req.body.year)
    .where("departmentId", req.body.departmentId);
  res.send(data);
});

// get only doctor
router.post("/getDoctors", async (req, res) => {
  var data = await knex
    .table("Doctor")
    .select()
    .whereIn("departmentId", req.body.departmentId);
  res.send(data);
});

//getList Romm
router.post("/getListRoom", async (req, res) => {
  var data = await knex
    .table("Room")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .select()
    .whereIn("Room.departmentId", req.body.departmentId);
  res.send(data);
  // console.log(data);
});

//check Status Queue
router.post("/checkStatusDoctor", async (req, res) => {
  var data = await knex
    .table("Queue")
    .select()
    .where("doctorId", req.body.doctorId)
    .where("date", "<", req.body.date + " 23:59:59");
  res.send(data);
  // console.log(data);
});

//get Timetable
router.post("/getTimetable", async (req, res) => {
  var data = await knex
    .table("Timetable")
    // .join("Queue", "Timetable.roomId", "=", "Timetable.roomId")
    .join("Doctor", "Timetable.doctorId", "=", "Doctor.empId")
    .select()
    .where("month", req.body.month)
    .where("departmentId", req.body.departmentId);
  // .groupBy('Timetable.roomId')
  res.send(data);
});
//add insert to timetable
router.post("/addTimetable", async (req, res) => {
  var data = await knex
    .table("Timetable")
    .insert({
      Date: req.body.Date,
      day: req.body.day,
      month: req.body.month,
      Year: req.body.Year,
      timeStart: req.body.timeStart,
      timeEnd: req.body.timeEnd,
      doctorId: req.body.doctorId,
      roomId: req.body.roomId
    })
    .select();
  res.send(data);
  // console.log(data);
});

router.post("/getCountQueue", async (req, res) => {
  var data = await knex
    .table("Queue")
    .count("queueId as countQueueId")
    .where("doctorId", req.body.doctorId)
    .where("date", req.body.date);
  res.send(data);
});

router.post("/getCountAppointment", async (req, res) => {
  var data = await knex
    .table("Appointment")
    .count("appointmentId as countAppointmentId")
    .where("doctorId", req.body.doctorId)
    .where("date", req.body.date);
  res.send(data);
});

// เช็ค forwardDepertment ID
router.post("/getRoomAndDoctor", async (req, res) => {
  var data = await knex
    .table("Timetable")
    .join("Doctor", "Timetable.doctorId", "=", "Doctor.empId")
    .select()
    .where("Date", req.body.Date)
    .where("day", req.body.day)
    .whereIn("month", req.body.month)
    .whereIn("year", req.body.year)
    .whereIn("departmentId", req.body.forwardDepartmentId);

  res.send(data);
  // console.log(data);
});
//use in cancel queue in absent
router.delete("/deletePatientQ/:id", async (req, res) => {
  var data = await knex
    .table("Queue")
    .where({
      runningNumber: req.params.id
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

router.get("/getAllQueue", async (req, res) => {
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .join("Status", "Queue.statusId", "=", "Status.statusId")
    .select()
  // console.log(data)
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
  // console.log(data)
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
    // .havingIn('Queue.roomId',req.params.roomId)
    .where("Queue.roomId", req.params.roomId)
    .where("Queue.roomBack", "=", 1);
  //test
  // .where("Queue.step", "!=", 1)
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
//----------------------------
router.get("/getListAbsent", async (req, res) => {
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .select()
    .where("statusId", 6);

  res.send(data);
});
//-----------------------------
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
  // console.log(req.body.HN);
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
  // console.log(req.body.HN);
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
      HN: req.body.HN
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
    .where("Department.departmentId", req.params.id)
    .select();

  res.send(data);
});

router.get("/updateAllPerDay", async (req, res) => {
  console.log("เข้า update perday");
  var getDate = new Date(momentTz.tz(new Date(), "Asia/Bangkok").format());
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
    .whereIn("year", curr_year);

  diff_minutes = (tmp2, tmp1) => {
    var diff = (tmp2.getTime() - tmp1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  };
  for (let i = 0; i < listEmpId.length; i++) {
    let range = 0;
    let sumRange = 0;
    dateQueue = await knex
      .table("Queue")
      .select("date")
      .where("doctorId", listEmpId[i].doctorId)
      .where("statusId", 4);
    if (dateQueue.length != 0) {
      for (let j = 0; j < dateQueue.length; j++) {
        let tmp1 = new Date(dateQueue[j].date);
        console.log("tmp1 " + tmp1);
        if (dateQueue.length - 1 == j) {
          range = range + 0;
        } else {
          let tmp2 = new Date(dateQueue[j + 1].date);
          console.log("tmp2: " + tmp2);
          range = diff_minutes(tmp2, tmp1);
          console.log("range " + range);
          sumRange += range;
          console.log("sum " + sumRange);
        }
      }
      var avgMinutes = sumRange / dateQueue.length;
      console.log(avgMinutes);
      updateAvgTime = await knex
        .table("Doctor")
        .where("empId", listEmpId[i].doctorId)
        .update({
          avgtime: avgMinutes
        });
      break;
    }
  }
  res.send("Success");
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
      doctorId: req.body.doctorId,
      HN: req.body.HN
    })
    .where("appointmentId", req.body.appointmentId)
    .select();
  res.send(data);
});

router.post("/updateDoctorTimetable", async (req, res) => {
  var data = await knex
    .table("Timetable")
    .update({
      date: req.body.date,
      day: req.body.day,
      month: req.body.month,
      year: req.body.year,
      timeStart: req.body.timeStart,
      timeEnd: req.body.timeEnd,
      roomId: req.body.roomId,
      doctorId: req.body.doctorId
    })
    .where("timetableId", req.body.timetableId)
    .select();
  res.send(data);
});

router.delete("/deleteAppointment/:id", async (req, res) => {
  await knex
    .table("Appointment")
    .where("appointmentId", "=", req.params.id)
    .del();
  res.send("success");
});

router.delete("/deleteTimetable/:id", async (req, res) => {
  await knex
    .table("Timetable")
    .where("timetableId", "=", req.params.id)
    .del();
  res.send("success");
});

//deleteQueue 
router.delete("/deleteQueue/:id", async (req, res) => {
  await knex
    .table("Queue")
    .where("runningNumber", "=", req.params.id)
    .del();
  res.send("success");
});

//delete all queue  (deleteAllQueue)
router.delete("/deleteAllQueue", async (req, res) => {
  await knex
    .table("Queue")
    .del();
  res.send("success");
});


router.delete("/deleteListQueue/:id", async (req, res) => {
  await knex
    .table("Queue")
    .where("runningNumber", "=", req.params.id)
    .del();
  res.send("success");
});

//check Group
router.post("/checkGroupId", async (req, res) => {
  // console.log('group ', req.body.group)
  var data = await knex
    .table("Queue")
    .where("group", req.body.group)
    .where("statusId", 5)
    .select()
    .orderBy("step", "asc");
  // res.send("check Success")
  res.send(data);
});

//checkGroup for Roomback
router.post("/checkGroupRoomback", async (req, res) => {
  // console.log('group ', req.body.group)
  var data = await knex
    .table("Queue")
    .where("group", req.body.group)
    .where("statusId", 4)
    // .where("roomId",req.body.roomId)
    .select()
    .orderBy("step", "asc");
  // res.send("check Success")
  res.send(data);
});

//Call function Adminhome.js and forwward
router.post("/updateQueue", async (req, res) => {
  await knex
    .table("Queue")
    .where("HN", req.body.HN)
    .where("queueId", req.body.queueId)
    .where("runningNumber", req.body.runningNumber)
    // .where("statusId",1)
    .update({
      statusId: req.body.statusId,
      date: new Date(
        momentTz()
          .tz(req.body.date, "Asia/Bangkok")
          .format()
      ),
      roomBack: req.body.roomBack
    });
  res.send("UPDATE SUCCESS");
});

///user step at user page
router.post("/getAllStepQueue", async (req, res) => {
  console.log("เข้าเข้าเข้าเข้าเข้า step");
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
    .orderBy("step", "asc");

  console.log("dataatatatat   ", data);
  res.send(data);
});

///All Q

///
router.post("/getAllAppointment", async (req, res) => {
  var data = await knex
    .table("Appointment")
    .join("Patient", "Appointment.HN", "=", "Patient.HN")
    .join("Doctor", "Appointment.doctorId", "=", "Doctor.empId")
    .join("Department", "Doctor.departmentId", "=", "Department.departmentId")
    // .join("Room","Department.departmentId","=","Room.departmentId")
    .select()
    .where("Appointment.HN", req.body.HN);
  res.send(data);
});

//AC5cf1bd553585fc72b5ac8eb0ec2c43e7
//ACd6b78055eb3dbbebbb32eafe7f6d275e
const accountSid = "AC2f2d5c6616815df56e0de7e5e1a33361";
//bd1dd85fb32c4ff7598380f447cecc57
//45179b9b7d88c4989d13a81c82f16d91
const authToken = "ccd85328fe61d5cd443a5a9ebfdd032c";
const client = require("twilio")(accountSid, authToken);

router.post("/sendText", (req, res) => {
  console.log("เข้าๆๆๆๆๆๆๆๆ ", req.body.textmessage);
  const recipient = req.body.recipient;
  const textmessage = req.body.textmessage;
  client.messages
    .create(
      {
        body: textmessage,
        from: "+12054633481",
        //+12054633481 //new
        //+18647540772
        //+17257264897
        to: recipient
      },
      (err, message) => {
        console.log("message ", message.sid);
      }
    )
    .then(message => console.log(message.sid))
    .done();
});

router.post("/updateStep", async (req, res) => {
  console.log("!!!!!UPDATE");
  // console.log('body   ', req.body)
  var stepInGroup = await knex
    .table("Queue")
    .select()
    .where("group", req.body.group)
    .orderBy("step", "asc");
  // console.log('stepstepstep :: length' + stepInGroup.length, stepInGroup)
  if (stepInGroup.length > 0) {
    stepInGroup.map(async (data, i) => {
      // console.log('i and index', i, req.body.index)
      // console.log('i + 1', i + 1)
      // console.log('data + 1', data.step + 1)
      if (i >= req.body.index) {
        // console.log('stepingroup ', data)
        // index = 2 // คนที่จะอัพเดตคือ 3 4 >> 4 5
        // ตัวที่ผ่านเข้ามาคือ 3
        await knex
          .table("Queue")
          .where("step", data.step)
          .where("group", req.body.group)
          .update({
            step: data.step + 1
          });
      }
    });
  }
  res.send("success");
});

router.post("/updateStepQ", async (req, res) => {
  var data = await knex
    .table("Queue")
    .where("runningNumber", req.body.runningNumber)
    .update({
      step: req.body.step
    });
  res.send("success");
});

//Get phone Number to use for otp
router.post("/getPhoneNumber", async (req, res) => {
  var data = await knex
    .table("Patient")
    .select("phonenumber")
    .where("HN", req.body.HN);
  res.send(data);
});

router.post("/updateStatus", async (req, res) => {
  var data = await knex
    .table("Queue")
    // .where("HN", req.body.HN)
    // .where("queueId", req.body.queueId)
    .where("runningNumber", req.body.runningNumber)
    // .where("statusId",1)
    .update({
      statusId: req.body.statusId
    });
  res.send("success");
});

//check remaining of patientLimit
router.post("/getRemainingDoctor", async (req, res) => {
  var doctorInDate = await knex
    .table("Timetable")
    .join("Doctor", "Timetable.doctorId", "=", "Doctor.empId")
    .where("date", req.body.Date)
    .where("day", req.body.day)
    .where("month", req.body.month)
    .where("Year", req.body.year)
    .where("doctorId", req.body.doctorId)
    .where("departmentId", req.body.departmentId)
    .select();

  var patientLimit = await knex
    .table("Timetable")
    .where("date", req.body.Date)
    .where("day", req.body.day)
    .where("month", req.body.month)
    .where("Year", req.body.year)
    .where("doctorId", req.body.doctorId)
    .select("patientLimit");
  var countQueue = await knex
    .table("Queue")
    .count("queueId as countQueueId")
    .where("doctorId", req.body.doctorId);

  var countAppointment = await knex
    .table("Appointment")
    .count("appointmentId as countAppointmentId")
    .where("doctorId", req.body.doctorId)
    .where("date", req.body.Date);

  var sum = countQueue[0].countQueueId + countAppointment[0].countAppointmentId;
  let remaining = patientLimit[0].patientLimit - sum;

  const data = Object.assign({ remaining }, doctorInDate);
  res.send(data);
});

//Add or Delete Department Management
//add Patients
router.post("/addPatient", async (req, res) => {
  await knex.table("Patient").insert({
    HN: req.body.HN,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    dob: req.body.dob,
    gender: req.body.gender,
    phonenumber: req.body.phonenumber
  });
  res.send("success");
});

//addDoctors
router.post("/addDoctors", async (req, res) => {
  await knex.table("Doctor").insert({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    avgtime: req.body.avgtime,
    empId: req.body.empId,
    departmentId: req.body.departmentId
  });
  res.send("success");
});

//add department
router.post("/addDepartment", async (req, res) => {
  await knex.table("Department").insert({
    Department: req.body.Department,
    type: req.body.type
  });
  res.send("success");
});
//add room
router.post("/addRoom", async (req, res) => {
  await knex.table("Room").insert({
    roomId: req.body.roomId,
    floor: req.body.floor,
    departmentId: req.body.departmentId,
    building: req.body.building
  });
  res.send("success");
});
//request otp
router.post("/requestOTP", async (req, res) => {
  console.log(req.body.recipient);
  try {
    const result = await requestOTP(req.body.recipient);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});
//validate otp
router.post("/validateOTP", async (req, res) => {
  console.log(req.body.recipient);
  try {
    const result = await validateOTP(req.body.requestId, req.body.code);
    console.log("result", result);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

const requestOTP = recipient =>
  new Promise((resolve, reject) => {
    nexmo.verify.request(
      { number: recipient, brand: "patientQueue OTP" },
      (err, result) => {
        if (err) reject({ message: "Server Error" });
        console.log("asdasdasdasdasd ", result);
        if (result && result.status == "0") {
          resolve({ requestId: result.request_id });
          return;
        }
        reject({ message: result, requestId: result.request_id });
      }
    );
  });

const validateOTP = (requestId, code) =>
  new Promise((resolve, reject) => {
    nexmo.verify.check({ request_id: requestId, code }, (err, result) => {
      if (err) reject({ message: "Server Error" });
      console.log("validateOTP", result);
      if (result && result.status == "0") {
        resolve({ message: result });
        return;
      }
      reject({ message: result, requestId: requestId });
      reject({ message: result, requestId: requestId });
    });
  });

router.post("/cancelOTP", async (req, res) => {
  let data = await cancelOTP(req.body.requestId);
  res.send(data)
});

const cancelOTP = requestId =>
  new Promise((resolve, reject) => {
    // { status: '6', error_text: 'The requestId \'01a218e770de499cb7b27b6dee3d144e\' does not exist or its no longer active.'}
    // { status: '10', error_text: 'Concurrent verifications to the same number are not allowed'}
    // { status: '19', error_text: 'Verification request [\'53c28372047c483f8e6e428d44093148\'] can\'t be cancelled within the first 30 seconds.'}
    // { status : "19",error_text: "Verification request  ['7e7563aa38704911b36a67f2cd5d3759'] can't be cancelled now. Too many attempts to re-deliver have already been made."}
    nexmo.verify.control(
      { request_id: requestId, cmd: "cancel" },
      (err, result) => {
        if (err) reject({ message: err });
        console.log("CANCEL!!!!", result);
        if (result && result.status == "0") {
          resolve({ message: "cancel success!" });
          return;
        } else {
          reject({ message: result });
        }
      }
    );
  });

//getDepartment
router.get("/getAllDepartment", async (req, res) => {
  var data = await knex.table("Department").select();
  res.send(data);
});

//getRoom
router.get("/getAllRoom", async (req, res) => {
  var data = await knex
    .table("Room")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .select();
  res.send(data);
});

//get Doctor
router.get("/getDoctors", async (req, res) => {
  var data = await knex
    .table("Doctor")
    .join("Department", "Doctor.departmentId", "=", "Department.departmentId")
    .select();
  res.send(data);
});

//delete Department
router.delete("/deleteDepartment/:departmentId", async (req, res) => {
  await knex
    .table("Department")
    .where("departmentId", "=", req.params.departmentId)
    .del();
  res.send("success");
});

//deletePatient
router.delete("/deletePatient/:firstname", async (req, res) => {
  console.log(req.params);
  await knex
    .table("Patient")
    .where("firstName", "like", req.params.firstname)
    .del();
  res.send("success");
});

//deleteDoctors
router.delete("/deleteDoctors/:empId", async (req, res) => {
  await knex
    .table("Doctor")
    .where("empId", "=", req.params.empId)
    .del();
  res.send("success");
});
//DELETE ROom
router.delete("/deleteRoom/:roomId", async (req, res) => {
  await knex
    .table("Room")
    .where("roomId", "=", req.params.roomId)
    .del();
  res.send("success");
});

//get doctor except departmentId
router.post("/getAllDoctors", async (req, res) => {
  var data = await knex
    .table("Timetable")
    .join("Doctor", "Timetable.doctorId", "=", "Doctor.empId")
    .select()
    .where("Date", req.body.Date)
    .where("day", req.body.day)
    .where("month", req.body.month)
    .where("Year", req.body.year);
  res.send(data);
});

//updateLimit
router.post("/updateLimit", async (req, res) => {
  await knex
    .table("Timetable")
    .where("timetableId", req.body.timetableId)
    .update({
      patientLimit: req.body.patientLimit
    });
  res.send("success");
});

router.post("/updateAbsent", async (req, res) => {
  await knex
    .table("Queue")
    .where("runningNumber", req.body.runningNumber)
    .update({
      statusId: 6
    });
  res.send("success");
});
//updateQueueAbsent
router.post("/updateQueueAbsent", async (req, res) => {
  await knex
    .table("Queue")
    .where("runningNumber", req.body.runningNumber)
    .update({
      statusId: 1
    });
  res.send("success");
});

//getDataAppointment
router.post("/getDataAppointment", async (req, res) => {
  var data = await knex
    .table("Appointment")
    // .join("Timetable", "Appointment.doctorId", "=", "Timetable.doctorId")
    .where("appointmentId", req.body.appointmentId)
    .select();
  // const data = Object.assign({ remaining }, doctorInDate);
  res.send(data);
});

router.post("/getDataTimetable", async (req, res) => {
  var data = await knex
    .table("Timetable")
    .select()
    .where("doctorId", req.body.doctorId)
    .where("day", req.body.day)
    .where("Date", req.body.date)
    .where("month", req.body.month)
    .where("year", req.body.year);
  res.send(data);
});
module.exports = router;
