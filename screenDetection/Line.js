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
    calcInfinitePoints(width , height){

    }

    /**
     * Get the intersection point between this line and the given line, null if no intersection point
     * 
     * intersection math from: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
     * 
     * @param {Line} Line line to intersect with
     * @param {int} width canvas width (optional)
     * @param {int} height canvas height (optional)
     */
    calcIntersection(line, width = 0, height = 0){
        let intersection = null;

        //calc intersection

        if (this.slope !== line.slope) {

            let x1 = this.a[0];
            let x2 = this.b[0];
            let x3 = line.a[0];
            let x4 = line.b[0];
            let y1 = this.a[1];
            let y2 = this.b[1];
            let y3 = line.a[1];
            let y4 = line.b[1];

            let x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - xy));
            let y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2)(x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2)(x3 - x4));

            intersection = [x, y];
        }

        if(intersection != null){
            if(intersection[0] < 0 || intersection[0] >= width || intersection[1] < 0 || intersection[1] >= height){
                intersection = null;
            }
        }

        return intersection;
    }

    /**
     * Math floor this result to get the y pixel index
     * 
     * @param {float} x get the y value of this line equation
     */
    evaluate(x){
        let cte = this.a[1] / (this.slope * this.a[0]);

        return (this.slope * x) + cte;
    }
}