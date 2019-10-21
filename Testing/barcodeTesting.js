const fs = require('fs');
const sourceFolder = "./Images/";

/*
['image name', barcode]
*/
var images = [
    ['barcode1', 12345],
    ['barcode2', 23451],
    ['barcode3', 34512],
    ['barcode4', 45123],
    ['barcode5', 51234],
    ['barcode6', 54321],
    ['barcode7', 43215],
];

load();

//get the list of jpg files in the image dir
function getImages(imageDir, callback) {
    var fileType = '.jpg',
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


function load(){
    getImages(sourceFolder, function (err, files) {
        var imageList = '<ul>';
        for (var i=0; i<files.length; i++) {
            imageLists += '<li><a href="/?image=' + files[i] + '">' + files[i] + '</li>';
        }
        imageLists += '</ul>';
    });

    console.log(imageLists);


    for(let i = 0; i < images.length; i++){
        images[i] = loadImage(this.images[i][0]);
    }
}