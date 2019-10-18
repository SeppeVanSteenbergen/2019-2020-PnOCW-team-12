/*
['image name', nb screens, [screen size], [orientation screen]]
*/
var images = [
    ['orientation1.jpg', 1, [400000], [0]], //0
    ['orientation2.jpg', 1, [400000], [90]],
    ['orientation3.jpg', 1, [400000], [180]],
    ['orientation4.jpg', 1, [400000], [270]],
    ['orientation5.jpg', 1, [400000], [45]],
    ['orientation6.jpg', 1, [400000], [6.5]],
    ['orientation7.jpg', 1, [400000], [347]], // 6
    ['size1.jpg', 1, [26000], [0]], // 7
    ['size2.jpg', 1, [140000], [0]],
];

var orientation = [0, 6];
var size = [7, 8];



loadImagesInList();
//  var testImage = createImage(images[0]);


console.log(images);

function loadImagesInList(){
    let img;
    for(let i = 0; i < images.length; i++){
        img = document.createElement('img');
        //img.addEventListener('load', imgLoadHandler);
        img.src = "Images/" , images[i];
        images[i] = img;
    }
}

function createImage(image){
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, image.width, image.height);
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
    let imageData = context.getImageData(0, 0, image.width, image.height);
    return new Image(imageData, "", "RGBA");
}

function mergeImages() {
    var img1 = images[0], 
        img2 = images[1];
}

var loadedCount = 0;
function imgLoadHandler() {
    if (++loadedCount === images.length) {
        mergeImages();
    }
}