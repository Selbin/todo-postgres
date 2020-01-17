const express = require('express')
const listRoutes = require('./server/routes/listRouter')
const todoRoutes = require('./server/routes/todoRouter')
const dotEnv = require('dotenv')

const app = express()

dotEnv.config()

app.use(express.static('app'))
app.use(express.json())
app.use('/list', listRoutes)
app.use('/todo', todoRoutes)

app.listen(process.env.APP_PORT, () => console.log(`listening to port ${process.env.APP_PORT}`))
