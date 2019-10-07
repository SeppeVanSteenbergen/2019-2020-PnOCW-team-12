class image{
    constructor(img, colorSpace){
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        this.colorSpace = colorSpace;
    }

    changeColorSpace(newColorSpace){
        this.colorSpace = newColorSpace;
    }

    getColorSpace(){
        return this.colorSpace;
    }
    
    getPixel(xPixel, yPixel){
        var i = (yPixel * canvas.width + xPixel) * 4;
        return new Array([i, ++i, ++i]);
    }

    getHeight(){
        return canvas.height;
    }

    getWidth(){
        return canvas.width;
    }
}