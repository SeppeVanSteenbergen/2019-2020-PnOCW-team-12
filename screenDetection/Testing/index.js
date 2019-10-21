/*
    code used from: https://www.codexpedia.com/node-js/node-js-http-server-displaying-images-from-a-directory/
 */

//include http, fs and url module
const http = require('http'),
    fs = require('fs'),
    path = require('path'),
    url = require('url');
imageDir = 'public/Images/';

//create http server listening on port 3333
http.createServer(function (req, res) {
    //use the url to parse the requested url and get the image name
    let query = url.parse(req.url,true).query;
    let pic = query.image;

    if (typeof pic === 'undefined') {
        getImages(imageDir, function (err, files) {
            let script = '<script src="screenTesting.js" type="text/javascript"> console.log("helloworld")</script>';
            let imageLists = '<ul>';
            for (let i=0; i<files.length; i++) {
                imageLists += '<li><a href="/?image=' + files[i] + '">' + files[i] + '</li>';
            }
            imageLists += '</ul>';
            res.writeHead(200, {'Content-type':'text/html'});
            res.end(imageLists + script);
        });
    } else {
        //read the image using fs and send the image content back in the response
        fs.readFile(imageDir + pic, function (err, content) {
            if (err) {
                res.writeHead(400, {'Content-type':'text/html'})
                console.log(err);
                res.end("No such image", imageDir + pic);
            } else {
                //specify the content type in the response will be an image
                res.writeHead(200,{'Content-type':'image/jpg'});
                res.end(content);
            }
        });
    }

}).listen(8080);

console.log("Server running at http://localhost:8080/");

//get the list of jpg files in the image dir
function getImages(imageDir, callback) {
    let fileType = '.jpg',
        files = [], i;
    fs.readdir(imageDir, function (err, list) {
        for(i=0; i<list.length; i++) {
            if(path.extname(list[i]) === fileType) {
                files.push(list[i]); //store the file name into the array files
            }
        }
        callback(err, files);
    });
}

//const formBegin = '<!doctype html> \ <html lang="en"> \ <head> \ <meta charset="UTF-8"> \ <title>ScreenDetectionTest</title> \ </head>  \ <body> ';
//const formEnd = '</body> \ </html>';