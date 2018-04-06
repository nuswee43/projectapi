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
    var data = await knex.table('Patient').select()
    res.send(data);
})

router.post('/addPatientQ', async (req, res) => {
    var data = await knex.table('Queue')
        // .insert({id:'101',textmessage:'yayayya'})
        .insert({
            queueId: req.body.HN,
            roomId: req.body.roomId,
            Date: req.body.Date,
            statusId: req.body.statusId,
            HN: req.body.HN,
            doctorId: req.body.doctorId,
            forward: req.body.forward,
            nurseId: req.body.nurseId
        })

}),



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
        .where({ HN: req.body.HN })
    res.send(data);
})

router.get('/getQueue', async (req, res) => {
    var data = await knex.table('Queue')
    .join('Room', 'Queue.roomId', '=', 'Room.roomId')
    .join('Department','Room.departmentId','=','Department.departmentId')
    .join('Patient','Queue.HN','=','Patient.HN')
    .select()
    
    res.send(data);
})

module.exports = router
