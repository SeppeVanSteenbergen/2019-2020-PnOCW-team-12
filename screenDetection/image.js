class image{
    image;
    canvas;
    constructor(img, colorSpace){
        this.image = img;
        this.canvas = document.createElement("CANVAS");
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.canvas.getContext("2d").drawImage(img, 0, 0);
        this.colorSpace = colorSpace;
        console.log("image is constructed " + colorSpace);
    }

    changeColorSpace(newColorSpace){
        this.colorSpace = newColorSpace;
    }

    getColorSpace(){
        return this.colorSpace;
    }
    
    getPixel(xPixel, yPixel){
        var i = (yPixel * this.canvas.width + xPixel) * 4;
        return new Array([this.canvas[i], this.canvas[++i], this.canvas[++i], this.canvas[++i]]);
    }

    getHeight(){
        return this.image.height;
    }

    getWidth(){
        return this.image.width;
    }
}