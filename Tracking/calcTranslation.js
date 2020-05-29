function calcTranslation(imgData, width, hold){
    let grayPixels = grayScaleImgData(imgData,false)
    let corners = FASTDetector(imgData.data, canvas.width, hold)
}