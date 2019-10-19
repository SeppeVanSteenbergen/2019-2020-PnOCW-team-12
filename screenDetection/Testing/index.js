const http = require('http');
const server = http.createServer();
const  fs = require('fs');

fs.readFile('public/index.html', function (err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    }).listen(8080);
    console.log("listening on port: 8080");
});

server.on('connection',socket => {
    console.log("new connection");
});