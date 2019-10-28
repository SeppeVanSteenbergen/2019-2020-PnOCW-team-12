

function randomPointsGenerator(nbPoints, size){
    let pointList = []
    for(let i = 0; i < nbPoints; i++){
        let x = Math.floor(Math.random() * size)
        let y = Math.floor(Math.random() * size)
        pointList.push([x, y])
    }
    return pointList
}
/*
points = array of all points
http://s-hull.org/
*/
function triangulation(points){
    let random = Math.floor(Math.random() * points.length)
    let seedPoint = points[random]
    radialSort(points, seedPoint)
    points.pop()
    let x1 = points.pop()
    let C = calcSmallestCircleCenter(seedPoint, x1, points)
    // console.log(seedPoint, x1, C)
    return [C, seedPoint]
}

function triangulation2(points, seedPoint){
    radialSort(points, seedPoint)
    // points.pop()
    let x1 = points[points.length-2]
    let C = calcSmallestCircleCenter(seedPoint, x1, points)
    let convexHull = C[2]
    // let vertices = [C[2]]
    let seedList = [...points]
    seedList.splice(seedList.length-2,2)
    seedList.splice(seedList.indexOf(C[1][2]),1)
    radialSort(seedList, C[0])
    C.push([seedList])
    return C
}

/* algorithm from https://www.nayuki.io/res/convex-hull-algorithm/convex-hull.js
*/
function addToConvexHull(points){
    let upperHull = [];
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

function hullSort(points){
    points.sort(function(a, b) {
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
    return points
}

/*
math for finding center of 3 points from paulbourke.net/geometry/circlesphere
*/
function calcSmallestCircleCenter(point1, point2, points){
    points = points.slice(0,points.length-2)
    let point3
    let minPoint
    let minRadius = Infinity
    let radius
    for(let i = 0; i < points.length; i++){
        point3= points[i]
        radius = calcRadius(point1, point2, point3)
        if(radius < minRadius){
            minPoint = point3
            minRadius = radius
        }
    }
    delete point3 //point3 only for help in the for loop
    // console.log("derde punt", minPoint)
    //math for finding center of 3 points from paulbourke.net/geometry/circlesphere
    let ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
    let mb = (minPoint[1] - point2[1]) / (minPoint[0] - point2[0])
    let counter = 3
    while(counter > 0 && (!isFinite(ma) || ! isFinite(mb) || ma == mb)){
        let helpPoint = point1.slice(0)
        point1 = point2.slice(0)
        point2 = minPoint.slice(0)
        minPoint = helpPoint
        ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
        mb = (minPoint[1] - point2[1]) / (minPoint[0] - point2[0])
        counter--
    }
    let centerX = (ma * mb * (point1[1] - minPoint[1]) + mb * (point1[0] + point2[0]) - ma * (point2[0] + minPoint[0])) / (2* (mb - ma))
    let centerY = -(centerX - (point1[0] + point2[0]) / 2) / ma + (point1[1] + point2[1]) / 2

    //let testingpoint = (centerX, centerY)
    //radius = calcDistance(testingpoint, point1)

    return [[centerX, centerY], [minRadius], [point1, point2, minPoint]]

}

/*
math from mathopenref.com/trianglecircumcircle.html
*/
function calcRadius(point1, point2, point3){
    // console.log("3 punten", point1, point2, point3)
    let dist1 = calcDistance(point2, point3)
    let dist2 = calcDistance(point1, point3)
    let dist3 = calcDistance(point1, point2)
    let numerator = dist1 * dist2 * dist3
    let denumerator = Math.sqrt((dist1 + dist2 + dist3) * (dist2 + dist3 - dist1) * (dist3 + dist1 - dist2) * (dist1 + dist2 - dist3))
    return numerator / denumerator
}

function calcDistance(point1, point2){
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
}


/*
input points = array of all points
sorts all points in points in function of distance to seedPoint in descending order to seedPoint
*/
function radialSort(points, point){
    points.sort(function(a, b){
        let distanceA = calcDistance(a, point)
        let distanceB = calcDistance(b, point)
        return distanceB - distanceA
    })

    return points
}

function testRadialSort(){
    let pointList = randomPointsGenerator(10, 20)
    let random = Math.floor(Math.random() * pointList.length)
    let seedPoint = pointList[random]
    radialSort(pointList, seedPoint)
    for(let i = 0; i < pointList.length; i++){
        pointList[i].push(calcDistance(pointList[i], pointList[pointList.length - 1]))
    }
    for(let i = 0; i < pointList.length - 1; i++){
        console.assert(pointList[i][2] >= pointList[i+1][2], "Point " + i + "is smaller than point " + (i + 1))
    }
}

function testCalcRadius(){
    let point1 = [5.6, 4.644]
    let point2 = [6.92, 10.312]
    let point3 = [0.94, 13.211]
    let radius = calcRadius(point1, point2, point3)
    let expectedRadius = 5
    console.assert(Math.abs(radius - expectedRadius) < 0.1)
}

function testcalcSmallestCircleCenter(){
    let pointList = randomPointsGenerator(10, 20)
    let point1 = pointList.pop()
    let point2 = pointList.pop()
    let center = calcSmallestCircleCenter(point1, point2, pointList)
    console.log(point1, point2, center)
}

function testHull(points, point){
    return addToConvexHull(hullSort(points))
}

testHull([[407,244],[228,273],[534,442],[50,50]])