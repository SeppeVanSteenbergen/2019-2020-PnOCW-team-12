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
    let maxPoint = calcMaxPoint(points)

}

function superTriangle(points){
    let minMax = calcMinMaxPoint(points)
    let point1 = [minMax[3].x, minMax[1].y]
    let point2 = [minMax[3].x, minMax[0].y]

    let point3 = point1.slice(0)
    for(let i = 0; i < points.length; i++){
        
    }

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
