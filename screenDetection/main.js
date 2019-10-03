let image = cv.imread("image");
screenDetection = new screenDetection(image);
let imageOutRed = screenDetection.makeRedMask();
let imageOutGreen = screenDetection.makeGreenMask();
let imageOutBlue = screenDetection.makeBlueMask();
cv.imshow("imageOutRed", imageOutRed);
cv.imshow("imageOutGreen", imageOutGreen);
cv.imshow("imageOutBlue", imageOutBlue);
