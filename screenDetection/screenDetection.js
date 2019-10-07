function changeColorSpace(image) {
    let imageOut = new cv.Mat();
    //TODO: Check colorspace of input image.
    cv.cvtColor(image, imageOut, cv.COLOR_RGBA2RGB);
    cv.cvtColor(imageOut, imageOut, cv.COLOR_RGB2HLS);
    return imageOut;
}

function makeMask(image, lowerBound, upperBound) {
    let imageOut = new cv.Mat();
    let low = new cv.Mat(image.rows, image.cols, image.type(), lowerBound);
    let high = new cv.Mat(image.rows, image.cols, image.type(), upperBound);
    cv.inRange(image, low, high, imageOut)
    return imageOut;
}

function makeGreenMask(image, sensitivity) {
    let lowerBound = new cv.Scalar(60 - sensitivity, 65, 125);
    let upperBound = new cv.Scalar(60 + sensitivity, 190, 255);
    return makeMask(image, lowerBound, upperBound);
}

function makeBlueMask(image, sensitivity) {
    let lowerBound = new cv.Scalar(120 - sensitivity, 65, 125);
    let upperBound = new cv.Scalar(120 + sensitivity, 190, 255);
    return makeMask(image, lowerBound, upperBound);
}

function screenDetection(image) {
    let hlsImage = changeColorSpace(image);
    var sensitivity = 15;
    let imageOutGreen = makeGreenMask(hlsImage, sensitivity);
    let imageOutBlue = makeBlueMask(hlsImage, sensitivity);
    let imageOutConcatenated = new cv.Mat();
    cv.add(imageOutGreen, imageOutBlue, imageOutConcatenated);
    let imageOutSmoothened = new cv.Mat();
    cv.medianBlur(imageOutConcatenated, imageOutSmoothened, 3);
    let imageOutCropped = new cv.Mat();
    let rect = cv.boundingRect(imageOutSmoothened);
    imageOutCropped = imageOutSmoothened.roi(rect);
    let imageOutDetectedScreens = image.clone();
    let point1 = new cv.Point(rect.x, rect.y);
    let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
    cv.rectangle(imageOutDetectedScreens, point1, point2, new cv.Scalar(255, 0, 0, 255), 2, cv.LINE_AA, 0);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(imageOutSmoothened, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let rotatedRect = cv.minAreaRect(cnt);
        // new Screen(rotatedRect.size, rotatedRect.center, rotatedRect.angle);
        let vertices = cv.RotatedRect.points(rotatedRect);
        for (let i = 0; i < 4; i++) {
            cv.line(imageOutDetectedScreens, vertices[i], vertices[(i + 1) % 4], new cv.Scalar(255, 255, 0, 255), 2, cv.LINE_AA, 0);
        }
        let tmp = new cv.Mat();
        cv.convexHull(cnt, tmp, false, true);
        let hull = new cv.MatVector();
        hull.push_back(tmp);
        cv.drawContours(imageOutDetectedScreens, hull, 0, new cv.Scalar(255, 0, 255, 255), 2, cv.LINE_AA, hierarchy, 100);
    }
    cv.imshow("imageOutGreen", imageOutGreen);
    cv.imshow("imageOutBlue", imageOutBlue);
    cv.imshow("imageOutConcatenated", imageOutConcatenated);
    cv.imshow("imageOutSmoothened", imageOutSmoothened);
    cv.imshow("imageOutCropped", imageOutCropped);
    cv.imshow("imageOutDetectedScreens", imageOutDetectedScreens)
}

function rescale(image){
    let imageOut = new cv.Mat();
    let newScale = new cv.Size(504, 378);
    cv.resize(image, imageOut, newScale, 0, 0,  cv.INTER_AREA);
    return imageOut;
}
