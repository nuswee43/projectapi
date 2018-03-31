const express = require('express')
const app = express()

const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const router = require('./route')
app.use('/', router)

app.listen(3001, () => {
  console.log('Start server at port 3001.')
})
