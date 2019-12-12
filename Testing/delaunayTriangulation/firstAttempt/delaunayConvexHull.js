class ConvexHull{
    convex
    leftMost
    constructor(point){
        this.convex = [point]
        this.leftMost = this.convex[0]
    }

/* 
algorithm from https://www.nayuki.io/res/convex-hull-algorithm/convex-hull.js
*/
addPoint(point){
    if(this.convex.length == 1){
        this.convex.push(point)
        if(point.x < this.leftMost.x)
            this.leftMost = point
        return
    }
    if(this.convex.length == 2){
        this.convex.push(point)
        this.hullSort()
        return
    }

    
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        // let p = point
        while (upperHull.length >= 2) {
            let q = upperHull[upperHull.length - 1];
            let r = upperHull[upperHull.length - 2];
            if ((q[0] - r[0]) * (p[1] - r[1]) >= (q[1] - r[1]) * (p[0] - r[0]))
                upperHull.pop();
            else
                break;
        }
        upperHull.push(p);
    }
    upperHull.pop();

    let lowerHull = [];
    for (let i = points.length - 1; i >= 0; i--) {
        let p = points[i];
        // let p = point
        while (lowerHull.length >= 2) {
            let q = lowerHull[lowerHull.length - 1];
            let r = lowerHull[lowerHull.length - 2];
            if ((q[0] - r[0]) * (p[1] - r[1]) >= (q[1] - r[1]) * (p[0] - r[0]))
                lowerHull.pop();
            else
                break;
        }
        lowerHull.push(p);
    }
    lowerHull.pop();
    // console.log(upperHull, lowerHull)

    if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0][0] === lowerHull[0][0] && upperHull[0][1] === lowerHull[0][1])
        return upperHull;
    else
        return upperHull.concat(lowerHull);
}

hullSort(){
    this.convex.sort(function(a, b) {
        if (a[1] < b[1])
            return -1;
        else if (a[1] > b[1])
            return +1;
        else if (a[2] < b[2])
            return -1;
        else if (a[2] > b[2])
            return +1;
        else
            return 0;
    })
}
}