testcalcSmallestCircleCenter()

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
    console.log(seedPoint, x1, C)
}

function testcalcSmallestCircleCenter(){
    let pointList = randomPointsGenerator(10, 20)
    let point1 = pointList.pop()
    let point2 = pointList.pop()
    let center = calcSmallestCircleCenter(point1, point2, pointList)
    console.log(point1, point2, center)
}

/*
math for finding center of 3 points from paulbourke.net/geometry/circlesphere
*/
function calcSmallestCircleCenter(point1, point2, points){
    let distance12 = calcDistance(point1, point2)
    let point3
    let minPoint
    let minRadius = Infinity
    let radius
    for(let i = 0; i < points.length; i++){
        point3= points[i]
        distance23 = calcDistance(point2, point3)
        distance13 = calcDistance(point1, point3)
        radius = calcRadius(distance12, distance13, distance23)
        if(radius < minRadius){
            minPoint = point3
            minRadius = radius
        }
    }
    //math for finding center of 3 points from paulbourke.net/geometry/circlesphere
    let ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
    let mb = (minPoint[1] - point2[1]) / (minPoint[0] - point2[0])

    centerX = (ma * mb * (point1[1] - minPoint[1]) + mb * (point1[0] + point2[0]) - ma * (point2[0] - minPoint[0])) / (2* (mb - ma))
    centerY = -(centerX - (point1[0] + point2[0]) / 2) / ma + (point1[1] + point2[1]) / 2
    return [centerX, centerY]

}

/*
math from mathopenref.com/trianglecircumcircle.html
*/
function calcRadius(dist1, dist2, dist3){
    let numerator = dist1 * dist2 * dist3
    let denumerator = Math.sqrt((dist1 + dist2 + dist3) * (dist2 + dist3 - dist1) * (dist3 + dist1 - dist2) * (dist1 + dist2 - dist3))
    return numerator / denumerator
}

function calcDistance(point1, point2){
    return Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
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