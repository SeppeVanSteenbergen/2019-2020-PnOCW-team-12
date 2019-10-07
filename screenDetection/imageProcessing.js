/*
imageIn as Document
image as Image easy for pixel manipulation (intern Image = canvas)
*/
function readImage(imageIn){
    var image = new Image(imageIn, "RGB");
}
/*
    image as Image
    math from: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
*/
function rgbToHsl(image){
    //convert rgb spectrum to 0-1
    if(image.getColorSpace() != "RGB"){
        console.error("Image has to be in RGB to convert from RGB to HSL");
    }
    for(x = 0; x < image.getWidth(); x++){
        for(y = 0; y < image.getHeight(); y++){
            var  pixel = image.getPixel(x, y);

            var red = pixel[0]/255;
            var green = pixel[1]/255;
            var blue = pixel[2]/255;

            var min = Math.min(red, green, blue);
            var max = Math.max(red, green, blue);
            
            var L = (min + max)/2;
            var S = findSaturation(min, max, L);
            var H = findHue(red, green, blue, max, min);
            
            pixel[0] = H;
            pixel[1] = S;
            pixel[2] = L;
        }
    }
    image.changeColorSpace("HSL");
}

/*
    image as Image
    math from: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    !!! works only after creating mask --> in last value of pixel 0 == black, 1 == white
*/
function hslToRgb(image){
    for(x = 0; x < image.getWidth; x++){
        for(y =0; y < image.getHeight; y++){
            var pixel = image.getPixel(x, y);
            if(pixel[3] = 0){
                pixel[0] = 0;
                pixel[1] = 0;
                pixel[2] = 0;
                pixel[3] = 1;
            } else{
                pixel[0] = 255;
                pixel[1] = 255;
                pixel[2] = 255;
                pixel[3] = 1;
            }
        }
    }

}

function findSaturation(min, max, L){
    if(L < 0.5){
        return (max - min) / (max + min);
    }else{
        return (max - min) / (2.0 - max - min);
    };
}

function findHue(red, green, blue, max, min){
    var hue = 0;
    if(max = min){
        return 0;
    }
    else if(red = max){
        hue = (green - blue)/(max - min);
    }
    else if(green = max){
        hue = 2.0 + (blue - red)/(max - min);
    } 
    else if (blue = max){
        hue = 4.0 + (red - green)/(max - min);
    };

    hue *= 60;
    if(hue < 0){hue += 360};
    return hue;
}

/* 
image as Image
mask color = white
not in mask = black
low = array[low Hue, low Saturation, low Luminance]
high = array[""]
*/
function createMask(image, low, high){
    imageOut = image;
    for(x = 0; x < image.getWidth(); x++){
        for(y = 0; y < image.getHeight(); y++){
            var pixel = image.getPixel(x, y);
            var h = pixel[0];
            var s = pixel[1];
            var l = pixel[2];

            if(h >= low[0] && s >= low[1] && l >= low[2] &&
                h <= high[0] && s <= high[1] && l <= high[2]){
                    pixel[2] = 0;
                    pixel[3] = 1;
                } else{
                    pixel[1] = 100;
                    pixel[2] = 100;
                    pixel[3] = 0;
                };
        }
    }
    return imageOut;
}

function createGreenMask(image, sensitivity){
    var lowerBound = [120 - sensitivity, 25, 50];
    var upperBound = [120 + sensitivity, 75, 100];
    return makeMask(image, lowerBound, upperBound);
}
