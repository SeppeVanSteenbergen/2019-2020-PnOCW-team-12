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
            let radius = calcRadius(triangulation[tri].points[0], triangulation[tri].points[1], triangulation[tri].points[2])
            let center = calcCenter(triangulation[tri].points[0], triangulation[tri].points[1], triangulation[tri].points[2])
           if((points[i].x - center.x)^2 + (points[i].y - center.y)^2 < radius^2){
               badTriangles.push(triangulation[tri])
           }
        }
        let polygon = new Set()
        for(let tri = 0; tri < badTriangles.length; tri++){
            for(let edg = 0; edg < badTriangles[tri].edges.length; edg++){
                //zie pseudocode op wikipedia
            }
        }
    }

}
//math for finding center of 3 points from paulbourke.net/geometry/circlesphere
function calcCenter(point1, point2, point3){
    let ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
    let mb = (minPoint[1] - point2[1]) / (minPoint[0] - point2[0])
    let counter = 3
    while(counter > 0 && (!isFinite(ma) || ! isFinite(mb) || ma == mb)){
        let helpPoint = point1.slice(0)
        point1 = point2.slice(0)
        point2 = point3.slice(0)
        point3 = helpPoint
        ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
        mb = (point3[1] - point2[1]) / (point3[0] - point2[0])
        counter--
    }
    let centerX = (ma * mb * (point1[1] - point3[1]) + mb * (point1[0] + point2[0]) - ma * (point2[0] + point3[0])) / (2* (mb - ma))
    let centerY = -(centerX - (point1[0] + point2[0]) / 2) / ma + (point1[1] + point2[1]) / 2
    return [centerX, centerY]
}

function calcRadius(point1, point2, point3){
    // console.log("3 punten", point1, point2, point3)
    let dist1 = calcDistance(point2, point3)
    let dist2 = calcDistance(point1, point3)
    let dist3 = calcDistance(point1, point2)
    let numerator = dist1 * dist2 * dist3
    let denumerator = Math.sqrt((dist1 + dist2 + dist3) * (dist2 + dist3 - dist1) * (dist3 + dist1 - dist2) * (dist1 + dist2 - dist3))
    return numerator / denumerator
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
