const fs = require('fs');
const sourceFolder = "./Images/";

var images = [];





function loadImages() {
    fs.readdir(sourceFolder, (err, files) => {
        if(err) {console.error("Could not load the images")}

        files.forEach(file => {
            if(file.includes("orientation"))
                images.push(file);
        });
        console.log(images);
    });
}

loadImages();