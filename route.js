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
            roomId: req.body.roomId,
            Date: req.body.Date,
            statusId: req.body.statusId,
            HN: req.body.HN,
            doctorId: req.body.doctorId,
            forward: req.body.forward,
            nurseId: req.body.nurseId
        })
    res.send('Success')
})
//Check HN IN Department
router.get('/checkHNatDepartment/:id', async (req, res) => {
    var data = await knex.table('Queue')
        .join('Room', 'Queue.roomId', '=', 'Room.roomId')
        .join('Department', 'Room.departmentId', '=', 'Department.departmentId')
        .select('HN')
        .where('Department.departmentId', req.params.id)
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
    var data = await knex.table('Doctor')
        .select('empId')
        .where('roomId', req.params.id)
    res.send(data);
})





// router.get('/loginNurse/:id', async (req, res) => {
//     var data = await knex.table('Nurse')
//         .select()
//         .where('empId', req.params.id)
//     res.send(data);
// })




// router.put('/updatePatientQ', async (req, res) => {
//     var data = await knex.table('Queue')
//         .update({
//             textmessage: 'hahaaaa'
//         })
//         .where({
//             id: '101'
//         })
//     res.end('success')

// })

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

// router.post('/getRoom', async (req, res) => {
//     var data = await knex.table('Room')
//         .select()
//         .where({ HN: req.body.HN })
//     res.send(data);
// })

// router.get('/getRoom', async (req, res) => {
//     var data = await knex.table('Room')
//         .join('Department','Room.departmentId','=','Department.departmentId')
//         .join('Doctor','Department.empId','=','Doctor.empId')
//         .select()
//     res.send(data);
// })



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


module.exports = router
