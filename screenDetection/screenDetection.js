class screenDetection {
    constructor(image) {
        this.image = image;
    }

    sensitivity = 15;

    changeColorSpace() {
        let imageOut = new cv.Mat();
        //TODO: Check colorspace of input image.
        cv.cvtColor(this.image, imageOut, cv.COLOR_RGB2HSV, 0);
        return imageOut;
    }

    makeMask(lowerBound, upperBound) {
        let imageOut = new cv.Mat();
        let low = new cv.Mat(this.image.rows, this.image.cols, this.image.type(), lowerBound);
        let high = new cv.Mat(this.image.rows, this.image.cols, this.image.type(), upperBound);
        cv.inRange(this.image, low, high, imageOut)
        return imageOut;
    }

    makeRedMask() {
        lowerBound = [360 - this.sensitivity, 80, 80];
        upperBound = [this.sensitivity, 100, 100];
        return this.makeMask(lowerBound, upperBound);
    }

    makeGreenMask() {
        lowerBound = [120 - this.sensitivity, 80, 80];
        upperBound = [120 + this.sensitivity, 100, 100];
        return this.makeMask(lowerBound, upperBound);
    }

    makeBlueMask() {
        lowerBound = [240 - this.sensitivity, 80, 80];
        upperBound = [240 + this.sensitivity, 100, 100];
        return this.makeMask(lowerBound, upperBound);
    }

}