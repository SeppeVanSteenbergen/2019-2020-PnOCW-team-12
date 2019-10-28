delaunayTriangulation.js
function randomPointsGenerator(nbPoints, size){
    let pointList = []
    for(let i = 0; i < nbPoints; i++){
        let x = Math.floor(Math.random() * size)
        let y = Math.floor(Math.random() * size)
        pointList.push([x, y])
    }
    return pointList
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

function delaunay(points){
    let triangulation = []
    triangulation.push(superTriangle(points))
    for(let i = 0; i < points.length; i++){
        let badTriangles = []
        for(let tri = 0; tri < triangulation.length; tri++){
           // if()
        }
    }

}
/*
    calculates crossproduct between two points, point3 as basis
*/
function crossProduct(p1, p2, p3 = [0,0]){
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p2.y - p3.y)
}
//TODO: is this correct?
function superTriangle(points){
    let minMax = calcMinMaxPoint(points)
    let point1 = [minMax[3].x, minMax[1].y]
    let point2 = [minMax[3].x, minMax[0].y]

    let point3
    let p1 = point1.slice(0)
    let p2
    //searches leftmost point from the lowest point
    for(let i = 0; i < points.length; i++){
        point = points[i]
        if(crossProduct(p1, p2, point2) < 0){
            point3 = point
        }
    }
    //this can't be correct
    let slope = (point3.y-point2.y) / (point3.x - point2.x)
    let point4 = [(minMax[1].y - point3.y)/slope , minMax[1].y]
    return new Triangle(point1, point2, point4)
}



function calcMinMaxPoint(points){
    let maxY = -Infinity
    let upperPoint
    let minY = Infinity
    let lowerPoint
    let maxX = -Infinity
    let rightPoint
    let minX = Infinity
    let leftPoint
    for(let i = 0; i < points.length; i++){
        let point = points[i]
        if(point.y > maxY){
            maxY = point.y
            upperPoint = point
        } else if(point.y < minY){
            minY = point.y
            lowerPoint = point
        }
        if(point.x > maxX){
            maxX = point.x
            leftPoint = point
        } else if(pointx < minX){
            minX = point.x
            rightPoint = point
        }
    }
    return [lowerPoint, upperPoint, leftPoint, rightPoint]
}
