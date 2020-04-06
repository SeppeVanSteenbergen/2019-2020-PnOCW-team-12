const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/tracking.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/tracking-min.js'))
})

app.get('/FASTDetector.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'FastDetector.js'))
})

app.get('/Brief.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'Brief.js'))
})

app.get('/pageScript.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'pageScript.js'))
})

app.get('/jsfeat.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/jsfeat-min.js'))
})

app.get('/homer.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/homer.jpg'))
})

app.listen(3050, () => {
  console.log('listening on port 3050')
})
