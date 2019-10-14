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
        minx, maxx = x;

        miny, maxy = y;

    }

    /**
     * Add a pixel to the Island
     * 
     * @param {int} x x co 
     * @param {int} y y co
     */
    add(x, y) {
        minx = Math.min(x, minx);
        miny = Math.min(y, miny);

        maxx = Math.max(x, maxx);
        maxy = Math.max(y, maxy);
    }

    print(){
        console.log("starting co: " + minx + ", " + miny);
        console.log("ending co: " + maxx + ", " + maxy);
    }

    get size(){
        return (maxx - minx) * (maxy - miny) / 2;
    }

    /**
     * Get the square distance from the given pixel position relative to the center of the island
     */
    get sqDist(x, y) {
        var cx = (this.maxx - this.minx) / 2;
        var cy = (this.maxy - this.miny) / 2;

        return (cx - x) * (cx - x) + (cy - y) * (cy - y);
    }
}