const express = require('express')
const path = require('path')


const app = express()

const basePath = path.join(__dirname, './public')
app.use(express.static(basePath))

app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'))

app.post('/', (req, res) => res.redirect('https://everfest.ru/'))

app.listen(5020)

