const fs = require('fs');
const sourceFolder = "./Images/";

/*
['image name', nb screens, [screen size], [orientation screen]]
*/
var images = [
    ['orientation1', 1, [400000], [0]], //0
    ['orientation2', 1, [400000], [90]],
    ['orientation3', 1, [400000], [180]],
    ['orientation4', 1, [400000], [270]],
    ['orientation5', 1, [400000], [45]],
    ['orientation6', 1, [400000], [6.5]],
    ['orientation7', 1, [400000], [347]], // 6
    ['size1', 1, [26000], [0]], // 7
    ['size2', 1, [140000], [0]],
];



function loadImage(imageName) {
    fs.readdir(sourceFolder, (err, files) => {
        if(err) {console.error("Could not load the images")}

        files.forEach(file => {
            if(file.includes(imageName))
                return file;
        });
        console.log(images);
    });
}

function load(){
    for(let i = 0; i < images.length; i++){
        this.images[i] = loadImage(this.images[i][0]);
    }
}