/**
 * A quality of life helper class for screen reconstruction
 */
class Line{
    /**
     * Initiate the line trough 2  random points
     * 
     * @param {array} a point a
     * @param {array} b point b
     */
    constructor(a, b){
        let tmp = null;
        if(a[0] > b[0]){
            tmp = a;
            a = b;
            b = tmp;
        }

        this.a = a;
        this.b = b;

        this.dx = b[0] - a[0];
        this.dy = b[1] - a[1];

    }

    /**
     * Get the rico of this line
     */
    get slope(){
        if(this.dx === 0){
            return 0;
        }

        return this.dy / this.dx;
    }

    /**
     * Get the original reconstruction points
     */
    get points(){
        return [this.a, this.b];
    }

    /**
     * Get the start and end points to draw the line over the full canvas
     */
    get infinitePoints(width , height){

    }

    /**
     * Get the intersection point between this line and the given line, null if no intersection point
     * 
     * @param {Line} Line line to intersect with
     */
    calcIntersection(line){

    }
}