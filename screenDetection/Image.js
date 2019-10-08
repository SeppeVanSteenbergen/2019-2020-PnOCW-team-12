class Image {
    
    imgData;
    canvas;
    colorSpace;

    constructor(imgData, canvasName, colorSpace) {
        this.imgData = imgData;
        this.canvas = document.getElementById(canvasName);
        this.canvas.width = imgData.width;
        this.canvas.height = imgData.height;
        this.colorSpace = colorSpace;
        let context = this.canvas.getContext("2d");
        context.putImageData(imgData, 0, 0);
        console.log("image is constructed " + colorSpace);
    }

    getImgData() {
        let context = this.canvas.getContext("2d");
        let imgData = context.createImageData(this.imgData.width, this.imgData.height);
        imgData.data.set(this.imgData.data);
        return imgData;
    }

    changeColorSpace(newColorSpace) {
        this.colorSpace = newColorSpace;
    }

    getColorSpace() {
        return this.colorSpace;
    }

    getPixel(xPixel, yPixel) {
        var i = (yPixel * this.canvas.width + xPixel) * 4;
        return new Array([this.canvas[i], this.canvas[++i], this.canvas[++i], this.canvas[++i]]);
    }

    getHeight() {
        return this.image.height;
    }

    getWidth() {
        return this.image.width;
    }

    show() {
        let context = this.canvas.getContext("2d");
        context.putImageData(this.imgData, 0, 0);
    }

    /*
    image as Image
    math from: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    */
    rgbaToHsla() {
        if (this.colorSpace != "RGBA") {
            console.error("Image has to be in RGBA to convert from RGBA to HSLA!");
        }
        var pixels = this.imgData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            //convert rgb spectrum to 0-1
            var red = pixels[i] / 255;
            var green = pixels[i + 1] / 255;
            var blue = pixels[i + 2] / 255;

            var min = Math.min(red, green, blue);
            var max = Math.max(red, green, blue);

            var L = (min + max) / 2;
            var S = this.findSaturation(min, max, L);
            var H = this.findHue(red, green, blue, max, min);

            pixels[i] = H;
            pixels[i + 1] = Math.round(S * 100);
            pixels[i + 2] = Math.round(L * 100);
        }
        this.changeColorSpace("HSLA");
        console.log("converted to hsla");
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
        !!! works only after creating mask --> in last value of pixel 0 == black, 1 == white
    */
    hslaToRgba(image) {
        if (this.colorSpace != "HSLA") {
            console.error("Image has to be in HSLA to convert from HSLA to RGBA!");
        }
        var pixels = this.imgData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            var H = pixels[i] / 360.0;
            var S = pixels[i + 1] / 100.0;
            var L = pixels[i + 2] / 100.0;

            if (S == 0) {
                var R = L;
                var G = L;
                var B = L;
            }

            else {
                if (L < 0.5) {
                    var tmp1 = L * (1.0 + S);
                }
                else {
                    var tmp1 = L + S - L * S;
                }
                var tmp2 = 2 * L - tmp1
    
                var tmpR = H + 1/3;
                if (tmpR > 1) {
                    tmpR -= 1;
                }
                else if (tmpR < 0) {
                    tmpR += 1;
                }
                var tmpG = H;
                if (tmpG > 1) {
                    tmpG -= 1;
                }
                else if (tmpG < 0) {
                    tmpG += 1;
                }
                var tmpB = H - 1/3;
                if (tmpB > 1) {
                    tmpB -= 1;
                }
                else if (tmpB < 0) {
                    tmpB += 1;
                }
    
                if (6 * tmpR < 1) {
                    var R = tmp2 + (tmp1 - tmp2) * 6 * tmpR;
                }
                else if (2 * tmpR < 1) {
                    var R = tmp1;
                }
                else if (3 * tmpR < 2) {
                    var R = tmp2 + (tmp1 - tmp2) * (2/3 - tmpR) * 6;
                }
                else {
                    var R = tmp2;
                }
                if (6 * tmpG < 1) {
                    var G = tmp2 + (tmp1 - tmp2) * 6 * tmpG;
                }
                else if (2 * tmpG < 1) {
                    var G = tmp1;
                }
                else if (3 * tmpG < 2) {
                    var G = tmp2 + (tmp1 - tmp2) * (2/3 - tmpG) * 6;
                }
                else {
                    var G = tmp2;
                }
                if (6 * tmpB < 1) {
                    var B = tmp2 + (tmp1 - tmp2) * 6 * tmpB;
                }
                else if (2 * tmpB < 1) {
                    var B = tmp1;
                }
                else if (3 * tmpB < 2) {
                    var B = tmp2 + (tmp1 - tmp2) * (2/3 - tmpB) * 6;
                }
                else {
                    var B = tmp2;
                }
            }

            pixels[i] = Math.round(R * 255);
            pixels[i + 1] = Math.round(G * 255);
            pixels[i + 2] = Math.round(B * 255);
        }
        this.changeColorSpace("RGBA");
        console.log("converted to rgba");
    }

    /* 
    image as Image
    mask color = white
    not in mask = black
    low = array[low Hue, low Saturation, low Luminance]
    high = array[""]
    */
    createMask(low, high) {
        var pixels = this.imgData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            var H = pixels[i];
            var S = pixels[i + 1];
            var L = pixels[i + 2];
            
            if (H >= low[0] && S >= low[1] && L >= low[2] &&
                H <= high[0] && S <= high[1] && L <= high[2]) {
                    pixels[i + 1] = 0;
                    pixels[i + 2] = 100;
                }
            else {
                pixels[i + 1] = 0;
                pixels[i + 2] = 0;
            }
        }
        console.log("created mask");
    }

    createGreenMask() {
        var sensitivity = 30;
        var lowerBound = [120 - sensitivity, 50, 25];
        var upperBound = [120 + sensitivity, 100, 75];
        this.createMask(lowerBound, upperBound);
    }

    createBlueMask() {
        var sensitivity = 30;
        var lowerBound = [240 - sensitivity, 50, 25];
        var upperBound = [240 + sensitivity, 100, 75];
        this.createMask(lowerBound, upperBound);
    }

    addImgData(imgData) {
        var pixels = this.imgData.data;
        var pixelsToAdd = imgData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i] += pixelsToAdd[i];
            pixels[i + 1] += pixelsToAdd[i + 1];
            pixels[i + 2] += pixelsToAdd[i + 2];
        }
    }

}