var moment = require('moment');
const express = require('express')
var router = express.Router()
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '128.199.98.237',
        user: 'test',
        password: 'test',
        database: 'PatientQueue'
    }
})
router.get('/getPatient', async (req, res) => {
    var data = await knex.table('Patient')
        .select()
    res.send(data);
})

router.get('/getMax', async (req, res) => {
    var maxHN = await knex.table('Queue')
        .select()
        .where('roomId', 1)
        .max('queueId as maxQueueId')
    console.log(maxHN[0].maxQueueId)
    res.send('EIEI');
})

//Insert to Queue Table
router.post('/addPatientQ', async (req, res) => {

var maxHN = await knex.table('Queue')
            .select()
            .where('roomId', req.body.roomId)
            .max('queueId as maxQueueId')
        console.log(maxHN[0].maxQueueId)
        res.send('EIEI');
        await knex.table('Queue')
            .insert({
                queueId: maxHN[0].maxQueueId + 1,
                roomId: req.body.roomId, //เปลียน
                Date: req.body.date,
                statusId: req.body.statusId,
                HN: req.body.HN,
                doctorId: req.body.doctorId,//เปลียน
                forward: req.body.forward,
                nurseId: req.body.nurseId
            })
        res.send('Success')
            // var checkTime = await knex.table('Timetable')
    //     .join('Doctor', 'Timetable.doctorId', '=', 'Doctor.empId')

    //     //join doctor get deperment แล้วเอา department id มา where 
    //     .where({
    //         day: req.body.day,
    //         month: req.body.month,
    //         year: req.body.year,
    //         departmentId: req.body.departmentId
    //     })

    //     .select()
    // var checkRangeTime = checkTime.filter(check => {
    //     isAfter = moment().isAfter(moment(check.timeStart, 'HH:mm:ss'))
    //     isBefore = moment().isBefore(moment(check.timeEnd, 'HH:mm:ss'))

    //     // (check.timeStart >= req.body.timeFormat) && (check.timeEnd <= req.body.timeFormat)
    //     return isAfter && isBefore
    // })
    // console.log(checkRangeTime)
    
})
//Check HN IN Department
router.get('/checkHNatDepartment/:id', async (req, res) => {
    var data = await knex.table('Queue')
        .join('Room', 'Queue.roomId', '=', 'Room.roomId')
        .join('Department', 'Room.departmentId', '=', 'Department.departmentId')
        .select('HN')
        .where('Department.departmentId', req.params.id)
        .where('statusId','!=',  4)
    res.send(data);

})

router.get('/getDepartment', async (req, res) => {
    var data = await knex.table('Department')
        .select()
    res.send(data);
})

router.get('/getDepartment/:id', async (req, res) => {
    var data = await knex.table('Department')
        .select()
        .where('departmentId', req.params.id)
    res.send(data);
})

router.get('/getRoom/:id', async (req, res) => {
    var data = await knex.table('Room')
        .select()
        .where('departmentId', req.params.id)
    res.send(data);
})
//doctor
router.get('/getDoctor/:id', async (req, res) => {
    var data = await knex.table('Timetable')
        .select('doctorId')
        .where('roomId', req.params.id)
    res.send(data);
})
router.get('/doctorTime', async (req, res) => {
    var data = await knex.table('Doctor')
        .select()
        
    res.send(data);
})
router.get('/currentQwithDoctor/:id', async (req, res) => {
    var data = await knex.table('Queue')
        .join('Patient','Queue.HN','=','Patient.HN')
        .join('Doctor','Queue.doctorId','=','Doctor.empId')
        .where('statusId', 3)
        .where('doctorId', req.params.id)
    res.send(data)
})

router.post('/getListDoctor', async (req, res) => {
    
    var data = await knex.table('Timetable')
        .join('Doctor', 'Timetable.doctorId', '=', 'Doctor.empId')
        .select()
        .where(
            'day', req.body.day,
        )
        .whereIn('month', req.body.month,)
        .whereIn('year', req.body.year,)
        .whereIn('departmentId',req.body.departmentId)
    res.send(data);
    console.log(data)
})


router.delete('/deletePatientQ', async (req, res) => {
    var data = await knex.table('Queue')
        .where({
            HN: req.body.HN
        })
        .delete()
    res.end('success')
})

router.post('/checkHN', async (req, res) => {
    var data = await knex.table('Patient')
        .select()
        .where({
            HN: req.body.HN,
            phoneNumber: req.body.phoneNumber
        })
    res.send(data);
})

router.post('/checkUsername', async (req, res) => {
    var data = await knex.table('Nurse')
        .select()
        .where({
            Username: req.body.Username,
            Password: req.body.Password
        })
    res.send(data);
})

router.post('/getHN', async (req, res) => {
    var data = await knex.table('Patient')
        .select()
        .where('HN', req.body.HN)
    res.send(data);
})


router.get('/getNurse', async (req, res) => {
    var data = await knex.table('Nurse')
        .select()
    res.send(data);
})

router.get('/getQueue', async (req, res) => {
    var data = await knex.table('Queue')
        .join('Room', 'Queue.roomId', '=', 'Room.roomId')
        .join('Department', 'Room.departmentId', '=', 'Department.departmentId')
        .join('Patient', 'Queue.HN', '=', 'Patient.HN')
        .join('Doctor','Queue.doctorId','=','Doctor.empId')
        // .join('Timetable','Queue.doctorId','=','Timetable.doctorId' )
        // .join('Doctor','Queue.empId','=','Doctor.doctorId')
        .select()
        .where('statusId', 1)
    res.send(data);
})

router.post('/updateQueue', async (req, res) => {
    var data = await knex.table('Queue')
        .where('HN', req.body.HN)
        .update({
            statusId: 3,
        })
    res.send('data')

    if (req.body.previousHN !== '') {
        await knex.table('Queue')
            .where('HN', req.body.previousHN)
            .update({
                statusId: 4,
            })
    }

})

router.get('/getDate', async (req, res) => {
    var data = await knex.table('Timetable')
        .select('timeStart', 'timeEnd')

    res.send(data);
})


module.exports = router
