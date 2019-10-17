class Island {

    minx;
    maxx;
    miny;
    maxy;
    id;
    screenMatrix = [];
    corners = [];

    /**
     * Create and Island starting with this pixel
     * @param {int} x x co
     * @param {int} y y co
     */
    constructor(x, y, id) {
        this.minx = x;
        this.maxx = x;

        this.miny = y;
        this.maxy = y;

        this.id = id;
    }

    /**
     * Add a pixel to the Island
     * 
     * @param {int} x x co 
     * @param {int} y y co
     */
    add(x, y) {
        this.minx = Math.min(x, this.minx);
        this.miny = Math.min(y, this.miny);

        this.maxx = Math.max(x, this.maxx);
        this.maxy = Math.max(y, this.maxy);
    }

    print(){
        console.log("starting co: " + this.minx + ", " + this.miny);
        console.log("ending co: " + this.maxx + ", " + this.maxy);
    }

    size(){
        return (this.maxx - this.minx) * (this.maxy - this.miny);
    }

    /**
     * Get the square distance from the given pixel position relative to the center of the island
     */
    sqDist(x, y) {
        var cx = (this.maxx - this.minx) / 2;
        var cy = (this.maxy - this.miny) / 2;

        return (cx - x) * (cx - x) + (cy - y) * (cy - y);
    }
    
    setScreenMatrix(matrix){
        this.screenMatrix = matrix.slice(this.miny, this.maxy);
        for(var i = 0; i < this.maxy - this.miny; i++){
            this.screenMatrix[i] = this.screenMatrix[i].slice(this.minx, this.maxx);
        }
    }
    findScreenCorners(){
        let x = 0;
        let y = 0;
        while(this.screenMatrix[0][x] == 0) x++;//bovenhoek
        if(x >= this.screenMatrix[0].length / 2){
            while(this.screenMatrix[0][x + 1] >= 1) ++x;
        }
        this.corners.push([x, 0, this.screenMatrix[0][x]]);
        x = this.screenMatrix[0].length - 1;
        while(this.screenMatrix[y][x] == 0) y++; //rechterhoek
        if(y >= this.screenMatrix.length / 2){
            while(this.screenMatrix[y + 1][x] >= 1) ++y;
        }
        this.corners.push([x, y, this.screenMatrix[y][x]]);
        y = this.screenMatrix.length - 1;
        while(this.screenMatrix[y][x] == 0) x--; // onderhoek
        if(x <= this.screenMatrix.length / 2){
            while(this.screenMatrix[y][x - 1] >= 1) --x;
        }
        this.corners.push([x, y, this.screenMatrix[y][x]]);
        while(this.screenMatrix[y][0] == 0) y--; //linkerhoek
        if(y <= this.screenMatrix.length / 2){
            while(this.screenMatrix[y - 1][0] >= 1) --y;
        }
        this.corners.push([0, y, this.screenMatrix[y][x]]);
        console.log(this.corners);
        return this.corners;
    }

    findScreenOrientation(){
        let radion = Math.atan((this.corners[0][0] - this.corners[3][0])/(this.corners[3][1] - this.corners[0][1]));
        return radion * 180 / Math.PI;
    }
    
    findScreen(){

    }
}