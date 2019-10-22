/*
['image name', barcode]
*/
let barcodeImages = [
    ["barocde12345_3S_4m", 12345],
    ["barocde12345_4S_4m", 12345],
    ["barocde12345_5S_4m", 12345],
    ["barocde12345_6S_4m", 12345],
    ["barocde12345_7S_4m", 12345],
    ["barocde12345_8S_4m", 12345],
    ["barocde12345_9S_4m", 12345],
    ["barocde12345_10S_4m", 12345],
    ["barocde12345_11S_4m", 12345],
    ["barocde12345_12S_4m", 12345],
    ["barocde12345_13S_4m", 12345],
    ["barocde12345_14S_4m", 12345],
    ["barocde12345_15S_4m", 12345],
];

function checkBarcode(i) {
    if (i==0) console.log("Start barcode check")
    if (i < barcodeImages.length) {
        var image = document.createElement('img')
        var canvas = document.createElement('canvas')
        var ctx

        image.setAttribute('src', sourceFolder + barcodeImages[i][0] + '.jpg')
        image.onload = function() {
            ctx = canvas.getContext('2d')
            canvas.width = image.width
            canvas.height = image.height
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(image, 0, 0, image.width, image.height)
            let imgData = ctx.getImageData(0, 0, image.width, image.height)
            var inputImage = new Image(imgData, '', 'RGBA', image.width, image.height)

            inputImage.rgbaToHsla();
            let barcode = scanner(inputImage.getImgData(), inputImage.getWidth(), inputImage.getHeight, 15);
            
            let errorMessage = "The barcode of " + barcodeImages[i][0] + " has to be " + barcodeImages[i][1] + " but returns " + barcode;
            console.assert(barcode == barcodeImages[i][1], errorMessage);
            
            checkBarcode(i + 1)
        }
    } else console.log("Stop barocde check")
}
