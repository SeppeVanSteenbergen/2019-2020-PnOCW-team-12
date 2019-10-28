class Island {

    minx;
    maxx;
    miny;
    maxy;
    id;
    screenMatrix = [];
    corners = [];
    blue;
    green;
    margin = 5;

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
        this.blue = id + 1;
        this.green = id;
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

    print() {
        console.log("starting co: " + this.minx + ", " + this.miny);
        console.log("ending co: " + this.maxx + ", " + this.maxy);
    }

    size() {
        return (this.maxx - this.minx) * (this.maxy - this.miny);
    }

    getMinx() {
        return this.minx;
    }

    getMiny() {
        return this.miny;
    }

    getMaxx() {
        return this.maxx;
    }

    getMaxy() {
        return this.maxy;
    }


    /**
     * Get the square distance from the given pixel position relative to the center of the island
     */
    sqDist(x, y) {
        var cx = (this.maxx - this.minx) / 2;
        var cy = (this.maxy - this.miny) / 2;

        return (cx - x) * (cx - x) + (cy - y) * (cy - y);
    }

    setScreenMatrix(matrix) {
        this.screenMatrix = matrix.slice(this.miny, this.maxy);
        for (var i = 0; i < this.maxy - this.miny; i++) {
            this.screenMatrix[i] = this.screenMatrix[i].slice(this.minx, this.maxx);
        }  
    }

    findScreenCorners() {
        let x = 0;
        let y = 0;
        while (this.screenMatrix[0][x] != this.blue && this.screenMatrix[0][x] != this.green) x++;//bovenhoek
        if (x >= this.screenMatrix[0].length / 2) {
            while (this.screenMatrix[0][x + 1] >= 1)++x;
        }
        this.corners.push([x, 0, this.screenMatrix[0][x]]);

        x = this.screenMatrix[0].length - 1;

        while (this.screenMatrix[y][x] != this.blue && this.screenMatrix[y][x] != this.green) y++; //rechterhoek
        if (y >= this.screenMatrix.length / 2) {
            while (this.screenMatrix[y + 1][x] >= 1)++y;
        }
        this.corners.push([x, y, this.screenMatrix[y][x]]);

        y = this.screenMatrix.length - 1;

        while (this.screenMatrix[y][x] != this.blue && this.screenMatrix[y][x] != this.green) x--; // onderhoek
        if (x <= this.screenMatrix.length / 2) {
            while (this.screenMatrix[y][x - 1] >= 1)--x;
        }

        this.corners.push([x, y, this.screenMatrix[y][x]]);
        while (this.screenMatrix[y][0] != this.blue && this.screenMatrix[y][0] != this.green) y--; //linkerhoek

        if (y <= this.screenMatrix.length / 2) {
            while (this.screenMatrix[y - 1][0] >= 1)--y;
        }
        this.corners.push([0, y, this.screenMatrix[y][x]]);
        return this.corners;
    }

    Corners() {
        let temp = [];
        let x = 0 + this.margin;
        let y = 0 + this.margin;
        let halfHor = Math.floor((this.screenMatrix[0].length - 1)/2);
        let halfVer = Math.floor((this.screenMatrix.length - 1)/2);


        for(x; x < this.screenMatrix[0].length; x++) {
            if(this.screenMatrix[0][x] !== 0) {
                temp.push(x);
            }
        }
        let horAvg = Math.floor(this.calcAverage(temp));
        if(horAvg <= halfHor) {
            this.corners.push([temp[0], 0, this.screenMatrix[0][temp[0]]]);
        } else this.corners.push([temp[temp.length - 1], 0, this.screenMatrix[0][temp[temp.length - 1]]]);

        x = this.screenMatrix[0].length - 1;
        temp.length = 0;

        for (y; y < this.screenMatrix.length; y++) {
            console.log(this.screenMatrix[y][x]);
            if(this.screenMatrix[y][x] !== 0) {
                temp.push(y);
            }
        }
        let verAvg = Math.floor(this.calcAverage(temp));
        if(verAvg <= halfVer) {
            this.corners.push([x, temp[0], this.screenMatrix[temp[0]][x]]);
        } else this.corners.push([x, temp[temp.length - 1], this.screenMatrix[temp[temp.length - 1]][x]]);

        y = this.screenMatrix.length - 1;
        temp.length = 0;


        for (x; x >= 0; x--) {
            if(this.screenMatrix[y][x] !== 0) {
                temp.push(x);
            }
        }
        horAvg = Math.floor(this.calcAverage(temp));
        if(horAvg >= halfVer) {
            this.corners.push([temp[0], y, this.screenMatrix[y][temp[0]]]);
        } else this.corners.push([temp[temp.length-1], y, this.screenMatrix[y][temp[temp.length-1]]]);

        temp.length = 0;
        x = 0;

        for (y; y >= 0; y--) {
            if(this.screenMatrix[y][x] !== 0) {
                temp.push(y);
            }
        }
        verAvg = Math.floor(this.calcAverage(temp));
        if(verAvg >= halfVer) {
            this.corners.push([x, temp[0], this.screenMatrix[temp[0]][x]]);
        } else this.corners.push([x, temp[temp.length-1], this.screenMatrix[temp[temp.length-1]][x]]);

        return this.corners;
    }

    calcAverage(list) {
        let sum = 0;
        for(let i = 0; i < list.length; i++) {
            sum += list[i];
        }
        return sum/list.length;
    }

    findScreenOrientation() {
        let radian = Math.atan((this.corners[0][0] - this.corners[3][0])/(this.corners[3][1] - this.corners[0][1]));
        let colorUp = this.findUpColor();
        let colorLeft = this.findLeftColor();
        if(colorUp == this.blue && colorLeft == this.green)  radian += Math.PI / 2.0;
        else if(colorUp == this.green && colorLeft == this.green) radian += Math.PI;
        else if(colorUp == this.green && colorLeft == this.blue) radian += 3 * Math.PI / 2.0;
        return radian * 180 / Math.PI;
    }

    findUpColor() {
        let x = Math.floor((this.corners[1][0] + this.corners[0][0]) / 2); 
        let y = Math.floor((this.corners[1][1] + this.corners[0][1]) / 2);
        return this.screenMatrix[y][x];
    }

    findLeftColor(){
        let x = Math.floor((this.corners[3][0] + this.corners[0][0]) / 2);
        let y = Math.floor((this.corners[3][1] + this.corners[0][1])/2);
        return this.screenMatrix[y][x];
    }

    getMidpoint(){
        let x = Math.floor((this.maxx-this.minx)/2);
        let y = Math.floor((this.maxy-this.miny)/2);
        return [x,y];
    }

    createScreen() {
        this.corners.length = 0;
        let corners = this.findScreenCorners();
        let orientation = this.findScreenOrientation();
        for(let i =  0; i < corners.length; i++){
            corners[i][0] += this.minx;
            corners[i][1] += this.miny;
        }
        
        return new Screen(corners, orientation);
    }
}