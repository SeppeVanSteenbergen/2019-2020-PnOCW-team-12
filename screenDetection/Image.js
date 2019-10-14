class Image {

    pixels;
    canvas;
    colorSpace;
    sensitivity = 30;
    colorSpaces = ["RGBA", "HSLA", "BW"];

    corners = new Array();

    islands;
    matrix;

    MIN_ISLAND_SIZE = 1000000;

    lowerBoundG = [120 - this.sensitivity, 50, 25];
    upperBoundG = [120 + this.sensitivity, 100, 75];
    lowerBoundB = [240 - this.sensitivity, 50, 25];
    upperBoundB = [240 + this.sensitivity, 100, 75];

    constructor(imgData, canvasName, colorSpace) {
        this.pixels = imgData.data;
        this.canvas = document.getElementById(canvasName);
        this.canvas.width = imgData.width;
        this.canvas.height = imgData.height;
        this.colorSpace = colorSpace;
        let context = this.canvas.getContext("2d");
        context.putImageData(imgData, 0, 0);

        this.islands = new Array();
        this.matrix = new Array(this.getHeight());
        for (let i = 0; i < this.getHeight(); i++) {
            this.matrix[i] = new Array(this.getWidth());
        }
    }

    getImgData() {
        let context = this.canvas.getContext("2d");
        let imgData = context.createImageData(this.canvas.width, this.canvas.height);
        imgData.data.set(this.pixels);
        return imgData;
    }

    changeColorSpace(newColorSpace) {
        if (!this.colorSpaces.includes(newColorSpace)) {
            console.error("colorspace '" + newColorSpace + "' doesn't exist!");
        }
        this.colorSpace = newColorSpace;
    }

    getColorSpace() {
        return this.colorSpace;
    }

    getHeight() {
        return this.canvas.height;
    }

    getWidth() {
        return this.canvas.width;
    }

    show() {
        let context = this.canvas.getContext("2d");
        context.putImageData(this.getImgData(), 0, 0);
        context.fillStyle = "#ff2626";
        var pointSize = 30;
        //console.log(this.corners.size);
        for(var i = 0; i < this.corners.size; i++){
            var x = Math.round(this.corners[i][0]);
            var y = Math.round(this.corners[i][1]);
            context.beginPath(); -
                context.arc(x, y, pointSize, 0, Math.PI * 2, true);
            context.fill();
        }
    }

    /**
     * Make a simple threshold cut
     * @param {float} value : value 0..1
     * 
     */
    threshold(value) {
        if (this.colorSpace != "RGBA") {
            console.error("wrong colorspace")
        }

        for (var i = 0; i < this.pixels.length; i += 4) {
            if (this.pixels[i] / 255 < value) {
                this.pixels[i] = 0;
                this.pixels[i + 1] = 0;
                this.pixels[i + 2] = 0;
            }
        }
    }

    calcIslands() {

        var tmpIslands = [];

        for (var j = 0; j < this.getHeight(); j++) {
            for (var i = 0; i < this.getWidth(); i++) {
                if (this.matrix[j][i] == 1 && this.isSeperated(i, j)) {
                    //console.log(i, j);
                    var island = new Island(i, j);
                    tmpIslands.push(island);
                } else {
                    var d = Infinity;
                    for (var s = 0; s < tmpIslands.length; s++) {
                        if (tmpIslands[s].sqDist(i, j) < d) {
                            d = tmpIslands[s].sqDist(i, j);
                            var joiningIsland = tmpIslands[s];
                        }
                    }
                    
                    if (joiningIsland != null) {
                        joiningIsland.add(i, j);
                    }

                }
            }
        }

        for (var i = 0; i < tmpIslands.length; i++) {
            //tmpIslands[i].print();
            if (tmpIslands[i].size() > this.MIN_ISLAND_SIZE) {
                this.islands.push(tmpIslands[i]);
            }
        }

        console.log("aantal detected islands: " + this.islands.length);
    }

    isSeperated(x, y) {
        if (y - 1 < 0 || this.matrix[y - 1][x] == 1)
            return false;
        if (x - 1 < 0 || this.matrix[y][x - 1] == 1)
            return false;
        //eventueel nog schuin checken

        return true;
    }
    /*
    toBinary() {
        if (this.colorSpace == "RGBA") {
            this.rgbaToHsla();
        }
        if (this.colorSpace == "BW") {
            return;
        }

        for (let j = 0; j < this.canvas.height; j++) {
            for (let i = 0; i < this.canvas.width; i++) {
                this.matrix[j][i] = this.pixels[this.pixelToPosition(i, j) + 2];
            }
        }

        console.log("nu in matrix vorm");

        this.changeColorSpace("BW");
    }*/

    /**
     * 
     * @param {HTMLCanvasElement} canvas canvas om imgdata op te pushen
     */
    matrixToImg(canvas) {

        let data = context.createImageData(this.getWidth(), this.getHeight());

        for (let j = 0; j < this.canvas.height; j++) {
            for (let i = 0; i < this.canvas.width; i++) {
                let pos = this.positionToPixel(i, j);
                newData[pos], newData[pos + 1] = 0;
                newData[pos + 2] = this.matrix[j][i];
            }
        }

        let img = new Image(newData, canvas, "HSL");

        img.hslaToRgba();

        return img;
    }

    /*
    image as Image
    math from: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    */
    rgbaToHsla() {
        if (this.colorSpace != "RGBA") {
            console.error("Image has to be in RGBA to convert from RGBA to HSLA!");
        }
        for (var i = 0; i < this.pixels.length; i += 4) {
            //convert rgb spectrum to 0-1
            var red = this.pixels[i] / 255;
            var green = this.pixels[i + 1] / 255;
            var blue = this.pixels[i + 2] / 255;

            var min = Math.min(red, green, blue);
            var max = Math.max(red, green, blue);

            var L = (min + max) / 2;
            var S = this.findSaturation(min, max, L);
            var H = this.findHue(red, green, blue, max, min);

            this.pixels[i] = H;
            this.pixels[i + 1] = Math.round(S * 100);
            this.pixels[i + 2] = Math.round(L * 100);
        }
        this.changeColorSpace("HSLA");
    }

    findSaturation(min, max, L) {
        if (L < 0.5) {
            return (max - min) / (max + min);
        } else {
            return (max - min) / (2.0 - max - min);
        };
    }

    findHue(red, green, blue, max, min) {
        var hue = 0;
        if (max == min) {
            return 0;
        }
        else if (red == max) {
            hue = (green - blue) / (max - min);
        }
        else if (green == max) {
            hue = 2.0 + (blue - red) / (max - min);
        }
        else if (blue == max) {
            hue = 4.0 + (red - green) / (max - min);
        };

        hue *= 60;
        if (hue < 0) {
            hue += 360
        };

        return hue;
    }

    /*
        image as Image
        math from: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    */
    hslaToRgba() {
        if (this.colorSpace != "HSLA") {
            console.error("Image has to be in HSLA to convert from HSLA to RGBA!");
        }
        for (var i = 0; i < this.pixels.length; i += 4) {
            var H = this.pixels[i] / 360.0;
            var S = this.pixels[i + 1] / 100.0;
            var L = this.pixels[i + 2] / 100.0;

            if (S == 0) {
                var R = L;
                var G = L;
                var B = L;
            } else {
                if (L < 0.5) {
                    var tmp1 = L * (1.0 + S);
                }
                else {
                    var tmp1 = L + S - L * S;
                }
                var tmp2 = 2 * L - tmp1

                var tmpR = H + 1 / 3;
                tmpR = this.setTemporaryInRange(tmpR);

                var tmpG = H;
                tmpG = this.setTemporaryInRange(tmpG);

                var tmpB = H - 1 / 3;
                tmpB = this.setTemporaryInRange(tmpB);

                var R = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpR);
                var G = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpG);
                var B = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpB);
            }

            this.pixels[i] = Math.round(R * 255);
            this.pixels[i + 1] = Math.round(G * 255);
            this.pixels[i + 2] = Math.round(B * 255);
        }
        this.changeColorSpace("RGBA");
    }

    setTemporaryInRange(temp) {
        if (temp > 1) {
            return temp - 1;
        } else if (temp < 0) {
            return temp + 1;
        };
        return temp;
    }

    hslaToRgbaCalculateColor(tmp1, tmp2, tmpColor) {
        if (6 * tmpColor < 1) {
            return tmp2 + (tmp1 - tmp2) * 6 * tmpColor;
        } else if (2 * tmpColor < 1) {
            return tmp1;
        } else if (3 * tmpColor < 2) {
            return tmp2 + (tmp1 - tmp2) * (0.666 - tmpColor) * 6;
        };
        return tmp2;
    }

    /* 
    image as Image
    mask color = white
    not in mask = black
    low = array[low Hue, low Saturation, low Luminance]
    high = array[""]
    */
    createMask(low, high) {
        for (var i = 0; i < this.pixels.length; i += 4) {
            var H = this.pixels[i];
            var S = this.pixels[i + 1];
            var L = this.pixels[i + 2];

            if (H >= low[0] && S >= low[1] && L >= low[2] &&
                H <= high[0] && S <= high[1] && L <= high[2]) {
                this.pixels[i + 1] = 0;
                this.pixels[i + 2] = 100;
            }
            else {
                this.pixels[i + 1] = 0;
                this.pixels[i + 2] = 0;
            }
        }
    }

    createGreenMask() {
        var lowerBound = [120 - this.sensitivity, 50, 25];
        var upperBound = [120 + this.sensitivity, 100, 75];
        this.createMask(lowerBound, upperBound);
    }

    createBlueMask() {
        var lowerBound = [240 - this.sensitivity, 50, 25];
        var upperBound = [240 + this.sensitivity, 100, 75];
        this.createMask(lowerBound, upperBound);
    }

    addImgData(imgData) {
        var pixelsToAdd = imgData.data;
        for (var i = 0; i < this.pixels.length; i += 4) {
            this.pixels[i] += pixelsToAdd[i];
            this.pixels[i + 1] += pixelsToAdd[i + 1];
            this.pixels[i + 2] += pixelsToAdd[i + 2];
        }
    }

    medianBlur(ksize) {
        for (var y = 0; y < this.getHeight(); y++) {
            for (var x = 0; x < this.getWidth(); x++) {
                var LArray = new Array();

                var halfKsize = Math.floor(ksize / 2);
                for (var yBox = -halfKsize; yBox <= halfKsize; yBox++) {
                    for (var xBox = -halfKsize; xBox <= halfKsize; xBox++) {
                        var pixel = this.getPixel(x + xBox, y + yBox);
                        LArray.push(pixel[2]);
                    }
                }
                LArray.sort(function (a, b) { return a - b });

                var i = this.pixelToPosition([x, y]);
                var half = Math.floor(LArray.length / 2);
                this.pixels[i + 2] = LArray[half];
            }
        }
    }

    medianBlurMatrix(ksize){
        for (var y = 0; y < this.getHeight(); y++) {
            for (var x = 0; x < this.getWidth(); x++) {
                var LArray = new Array();

                var halfKsize = Math.floor(ksize / 2);
                for (var yBox = -halfKsize; yBox <= halfKsize; yBox++) {
                    for (var xBox = -halfKsize; xBox <= halfKsize; xBox++) {
                        if(y + yBox >= 0 && y + yBox < this.getHeight() && x + xBox >= 0 && x + xBox < this.getWidth()){
                            var pixel = this.matrix[y + yBox][x + xBox];
                            LArray.push(pixel);
                        }
                    }
                }
                LArray.sort(function(a, b){return a-b});
                var half = Math.floor(LArray.length / 2);
                this.matrix[y][x] = LArray[half];
            }
        }
    }

    cornerDetection(){
        var nbNeigbours = 2;
        var corners = new Array();
        for (var y = 0; y < this.getHeight(); y++) {
            for (var x = 0; x < this.getWidth(); x++) {
                var white = 0;
                var black = 0;
                if (this.getPixel(x, y)[2] == 100) {
                    for (var yBox = -nbNeigbours; yBox <= nbNeigbours; yBox++) {
                        for (var xBox = -nbNeigbours; xBox <= nbNeigbours; xBox++) {
                            var pixel = this.getPixel(x + xBox, y + yBox);
                            if (pixel[2] == 100) {
                                white += 1;
                            } else if (pixel[2] == 0) {
                                black += 1;
                            }
                        }
                    }
                    if (white >= 7 && white <= 12 && black >= 13 && black <= 18) {
                        var i = this.pixelToPosition([x, y]);
                        corners.push([x, y]);
                        //this.makeRed(i);
                    }
                }
            }
        }
        this.corners = this.cornerFilter(corners);
    }

    cornerFilter(corners) {
        var newCorners = new Array();
        corners.sort(function (a, b) {
            if (a[0] == b[0]) return a[1] - b[1];
            return a[0] - b[0];
        });
        for (var i = 0; i < corners.length - 1; i++) {
            if (corners[i + 1][0] - corners[i][0] <= 10) {
                if (corners[i + 1][1] - corners[i][1] <= 10) {
                    var newX = (corners[i][0] + corners[i + 1][0]) / 2;
                    var newY = (corners[i][1] + corners[i + 1][1]) / 2;
                    newCorners.push([newX, newY])
                    corners[i + 1] = [newX, newY];
                }
            }
        }
        return newCorners;
    }

    getPixel(xPixel, yPixel) {
        if (xPixel < 0) {
            xPixel = 0;
        }
        else if (xPixel >= this.getWidth()) {
            xPixel = this.getWidth() - 1;
        }

        if (yPixel < 0) {
            yPixel = 0;
        }
        else if (yPixel >= this.getHeight()) {
            yPixel = this.getHeight() - 1;
        }
        var i = (yPixel * this.getWidth() + xPixel) * 4;
        return [this.pixels[i], this.pixels[i + 1], this.pixels[i + 2]];
    }

    createGreenBlueMask() {
        if (this.getColorSpace() != "HSLA") {
            console.error("createGreenBlueMask only with HSLA as colorspace!");
        }
        for (var i = 0; i < this.pixels.length; i += 4) {
            var H = this.pixels[i];
            var S = this.pixels[i + 1];
            var L = this.pixels[i + 2];
            var pixel = this.positionToPixel(i);
            var x = pixel[0];
            var y = pixel[1];
            if (this.inGreenRange(H, S, L)) {
                this.pixels[i + 1] = 0;
                this.pixels[i + 2] = 100;
                this.matrix[y][x] = 1;
            } else if (this.inBlueRange(H, S, L)) {
                this.pixels[i + 1] = 0;
                this.pixels[i + 2] = 100;
                this.matrix[y][x] = 1;
            } else {
                this.pixels[i + 1] = 0;
                this.pixels[i + 2] = 0;
                this.matrix[y][x] = 0;
            }
        }
    }

    inGreenRange(H, S, L) {
        if (H >= this.lowerBoundG[0] && S >= this.lowerBoundG[1] && L >= this.lowerBoundG[2] &&
            H <= this.upperBoundG[0] && S <= this.upperBoundG[1] && L <= this.upperBoundG[2]) {
            return true;
        }
        return false;
    }

    inBlueRange(H, S, L) {
        if (H >= this.lowerBoundB[0] && S >= this.lowerBoundB[1] && L >= this.lowerBoundB[2] &&
            H <= this.upperBoundB[0] && S <= this.upperBoundB[1] && L <= this.upperBoundB[2]) {
            return true;
        }
        return false;
    }

    positionToPixel(position) {
        position /= 4;
        var x = position % this.getWidth();
        var y = (position - x) / this.getWidth();
        return [x, y];
    }

    pixelToPosition(pixel) {
        return (pixel[1] * this.getWidth() + pixel[0]) * 4;
    }

    makeRed(position) {
        if (this.getColorSpace() == "RGBA") {
            this.pixels[position] = 255;
            this.pixels[++position] = 0;
            this.pixels[++position] = 0;
        } else if (this.getColorSpace() == "HSLA") {
            this.pixels[position] = 0;
            this.pixels[++position] = 100;
            this.pixels[++position] = 50;
        }
    }

    /**
     * DEBUG METHODS
     */

     /**
      * Draw a cross at the given pixel location of the given pixel size
      * @param {int} x x co
      * @param {int} y y co
      * @param {int} size size
      */
    drawPoint(x, y, size) {
        size = Math.round(size);

        //verticale lijn
        for (let j = y - (size / 2); j < y + (size / 2); j++) {
            let pos = this.pixelToPosition([x, j]);

            this.pixels[pos] = 255;
            this.pixels[pos + 1] = 0;
            this.pixels[pos + 2] = 0;
        }

        //horizontale lijn
        for (let i = x - (size / 2); i < x + (size / 2); i++) {
            let pos = this.pixelToPosition([i, y]);

            this.pixels[pos] = 255;
            this.pixels[pos + 1] = 0;
            this.pixels[pos + 2] = 0;
        }
    }

    /**
     * Draw a filled rectangle on top of the image
     * 
     * @param {Array} startCorner linkerbovenhoek vector co array
     * @param {Array} endCorner rechteronderhoek vector co array
     * @param {float} alpha getal 0..1
     */
    drawFillRect(startCorner, endCorner, alpha) {

        alpha = alpha * 255;

        for (let j = startCorner[1]; j < endCorner[1]; j++) {
            for (let i = startCorner[0]; i < endCorner[0]; i++) {
                let pos = this.pixelToPosition([i, j]);

                this.pixels[pos] = Math.min(this.pixels[pos] + alpha, 255);
                this.pixels[pos + 1] = 0;
                this.pixels[pos + 2] = 0;
            }
        }
    }

}

/*
Review by martijn:
    -Method changeColorspace: maybe make an array with possible colorspaces and check if the given colorspace is one of them.
        or if we only work with rgba and hsla change it to a boolean maybe.
    -What's the difference between the method getImgData() and show()?
    -rgba to hsla method: in first if also check if it isnt already in hsla?
        same for inverse method
*/