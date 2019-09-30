const fs = require('fs');
const serveStatic = require('serve-static')
const path = require('path')

module.exports = (app) => {

    app.get('/test', (req, res) => {
        res.send('the test worked')
    })

    app.use("/", serveStatic(path.join(__dirname, '/dist')))


    app.use((req, res) => {
        fs.readFile('dist/index.html', 'utf-8', (err, content) => {
            if (err) {
            	console.log(err)
                console.log('cannot open file')
            }
            console.log('got the file')
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            })

            res.end(content)
        })
    })
}