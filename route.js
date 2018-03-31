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
            HN: req.body.HN
        })
    res.end('success')
})

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

module.exports = router
