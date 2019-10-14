class Island {

    minx;
    maxx;
    miny;
    maxy;

    /**
     * Create and Island starting with this pixel
     * @param {int} x x co
     * @param {int} y y co
     */
    constructor(x, y) {
        this.minx = x;
        this.maxx = x;

        this.miny = y;
        this.maxy = y;
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
}