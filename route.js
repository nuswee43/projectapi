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
    // timezone: "GMT+0700"
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
  var maxHN = await knex
    .table("Queue")
    // .join('Room','Queue.roomId','=','Room.roomid')
    .select()
    .where("roomId", req.body.roomId)
    // .andwhere('departmentId', req.body.departId)
    .max("queueId as maxQueueId");
  console.log(maxHN[0].maxQueueId);
  res.send("EIEI");
  await knex.table("Queue").insert({
    queueId: maxHN[0].maxQueueId + 1,
    roomId: req.body.roomId,
    Date: req.body.date,
    statusId: req.body.statusId,
    HN: req.body.HN,
    doctorId: req.body.doctorId,
    forward: req.body.forward,
    nurseId: req.body.nurseId
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
  console.log(data);
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
router.get("/getQueue", async (req, res) => {
  var data = await knex
    .table("Queue")
    .join("Room", "Queue.roomId", "=", "Room.roomId")
    .join("Department", "Room.departmentId", "=", "Department.departmentId")
    .join("Patient", "Queue.HN", "=", "Patient.HN")
    .join("Doctor", "Queue.doctorId", "=", "Doctor.empId")
    .join("Status", "Queue.statusId", "=", "Status.statusId")
    .select()
    .where("Queue.statusId", 1);
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
    .where("statusId", 2)
    .where("Room.roomId", req.params.roomId);
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
router.post("/updateQueue", async (req, res) => {
  console.log(req.body.Date)
  if (req.body.previousHN !== "") {
    await knex
      .table("Queue")
      .where("HN", req.body.previousHN)
      .update({
        statusId: 4,
        date: new Date(momentTz().tz(req.body.Date, "Asia/Bangkok").format()),
      });

  }
  var data = await knex
    .table("Queue")
    .where("HN", req.body.HN)
    .update({
      statusId: 3,
      date: new Date(momentTz().tz(req.body.Date, "Asia/Bangkok").format())
    });
  res.send("data");
});


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

router.post("/updateForwardQueue", async (req, res) => {
  var maxHN = await knex
    .table("Queue")
    .select()
    .where("roomId", req.body.roomId)
    .max("queueId as maxQueueId");

  let tmp = {};
  if (req.body.typeForward === "Department") {
    tmp = {
      statusId: 1,
      roomId: req.body.roomId,
      forward: req.body.forward,
      doctorId: req.body.doctorId,
      queueId: maxHN[0].maxQueueId + 1
    };
  } else if (req.body.typeForward === "Lab") {
    tmp = {
      statusId: 2,
      roomId: req.body.roomId,
      forward: req.body.forward,
      doctorId: req.body.doctorId
    };
  }
  var data = await knex
    .table("Queue")
    .where("HN", req.body.HN)
    //.increment('queueId', 1)
    .update(tmp);
  res.send("data");
});

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
      HN: req.body.HN
    })
    .select();
  res.send(data);
});

router.get("/getAppointment", async (req, res) => {
  var data = await knex
    .table("Appointment")
    .join("Patient", "Appointment.HN", "=", "Patient.HN")
    .join("Doctor", "Appointment.doctorId", "=", "Doctor.empId")
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
    console.log("listEmpId " + listEmpId.length)

    let range = 0
    let sumRange = 0
    dateQueue = await knex
      .table("Queue")
      .select("date")
      .where("doctorId", listEmpId[i].doctorId)
      .where("statusId", 4)
    console.log("for แรก")

    if (dateQueue.length != 0) {
      console.log("เข้า if")
      console.log("dateQueue " + dateQueue.length)
      for (let j = 0; j < dateQueue.length; j++) {
        let tmp1 = new Date(dateQueue[j].date)
        console.log("tmp1: " + tmp1)
        if (dateQueue.length - 1 == j) {
          range = range + 0
        } else {
          let tmp2 = new Date(dateQueue[j + 1].date)
          console.log("tmp2: " + tmp2)
          range = diff_minutes(tmp2, tmp1)
          console.log("for สอง")
          console.log(range)
          sumRange += range
          console.log("sumRange" + sumRange)
        }
      }
      var avgMinutes = sumRange / dateQueue.length
      console.log("dateQueue" + dateQueue.length)
      console.log("avgMinutes" + avgMinutes)
      updateAvgTime = await knex
        .table("Doctor")
        .where("empId", listEmpId[i].doctorId)
        .update({
          avgtime: avgMinutes
        });

      console.log("เข้า db update")
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


// GET updateAllPerDay (ทำแบบสรุปเป็นวันจะทำให้ไม่เสีย performance ในการคิวรี่ DB )
//method time ของหมอ - คิด avg time ของหมด แล้วก็ del q ทั้งหมด
//
//คิวรี่ empId มาทั้งหมดจาก timetable ที่เข้าวันนี้  = [] where ว่าหมอคนนั้นมีกี่คิว ,
// (ใช้ for loop)
//ใน for loop - สร้างตัวแปรนึงขึ้นมาเพื่อเก็บคิวของหมอคนนั้น เอาไป where empId = data[i] , status = 4
//จะได้เวลาที่เป็น array มา มาใช้ใน for loop อีกรอบ
//let tmp1 = new Date(listQueue[j]).getMinute()
//let tmp2 = new Date(listQueue[j+1]).getMinute()
//let sumMinuts = 0
//sumMinuts += tmp2 - tmp1
//สร้างตัวแปร let sumMinuts นอก loop j
// ออกนอก loop j
//var let avgMinute  = sumMinute / listQueue.length
//แล้วอัพเดท . update() where empId = ? update avgTime ให้้กับหมอคนที่ where
//เปลี่ยนจาก update date ตอน add มาเป็น add date ตอน call (date เป็น null ได้)  xxxxxx

//method clear q

//สร้าง part get หมอ รับ empId แล้วใน showPatient ก็ ดึง path นี้ไป
//ฝั่ง user ใช้ คิวที่รอ * กับ avgTime ได้เลย

module.exports = router;
