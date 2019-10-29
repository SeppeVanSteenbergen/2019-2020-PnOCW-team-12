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
    if(points.length < 3){
        return
    }
    let supTriangle = superTriangle(points)
    let triangulation = []
    triangulation.push(supTriangle)
    for(let i = 0; i < points.length; i++){
        let badTriangles = []
        for(let tri = 0; tri < triangulation.length; tri++){
            let radius = calcRadius(triangulation[tri].point1, triangulation[tri].point2, triangulation[tri].point3)
            let center = calcCenter(triangulation[tri].point1, triangulation[tri].point2, triangulation[tri].point3)
           if(inCircle(points[i], radius, center)){
               badTriangles.push(triangulation[tri])
           }
        }
        let polygon = []
        for(let tri = 0; tri < badTriangles.length; tri++){
            let badTriangle = badTriangles[tri]
            for(let edg = 0; edg < badTriangle.edges.length; edg++){
                let badTriangleEdge = badTriangle.edges[edg]
                for(let tri2 = 0; tri < badTriangles.length; tri++){
                    badTriangle2 = badTriangles[tri2]
                    if(badTriangle !== badTriangle2)
                        for(let edg2 = 0; edg2 < badTriangle2.edges.length; edg2++){
                            let compareEdge = badTriangle2.edges[edg2]
                            if(badTriangle.equalEdges(badTriangleEdge, compareEdge)){
                                polygon.push(compareEdge)
                            }
                        }
                }
            }
        }
        for(let tri = 0; tri < badTriangles.length; tri++){
            arrayRemove(triangulation, badTriangles[tri]);
        }
        for(let edg = 0; edg < polygon.length; edg++){
            triangulation.push(new Triangle(points[i], polygon[edg][0], polygon[edg][1]))
        }
    }
    //triangulation done, only remove triangles with super-triangle
    for(let i = 0; i < triangulation.length; i++){
        let triangle = triangulation[i]
        for(let j = 0; j < triangle.edges.length; j++){
            let edges = triangle.edges
            if(triangle.equalEdges(edges[j], supTriangle.edges[0])){
                arrayRemove(triangulation, triangle)
            } else if(triangle.equalEdges(edges[j], supTriangle.edges[1])){
                arrayRemove(triangulation, triangle)
            } else if(triangle.equalEdges(edges[j], supTriangle.edges[2])){
                arrayRemove(triangulation, triangle)
            }
        }
    }
    return triangulation
}
function arrayRemove(array, value){
    return array.filter(function(element){
        return element != value
    })
}
//correct
//math for finding center of 3 points from paulbourke.net/geometry/circlesphere
function calcCenter(point1, point2, point3){
    let ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
    let mb = (point3[1] - point2[1]) / (point3[0] - point2[0])
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
//correct
function calcRadius(point1, point2, point3){
    // console.log("3 punten", point1, point2, point3)
    let dist1 = calcDistance(point2, point3)
    let dist2 = calcDistance(point1, point3)
    let dist3 = calcDistance(point1, point2)
    let numerator = dist1 * dist2 * dist3
    let denumerator = Math.sqrt((dist1 + dist2 + dist3) * (dist2 + dist3 - dist1) * (dist3 + dist1 - dist2) * (dist1 + dist2 - dist3))
    return numerator / denumerator
}
//correct
/*
    calculates crossproduct between two points, point3 as basis
*/
function crossProduct(p1, p2, p3){
    let crossProduct = (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p2[1] - p3[1])
    return crossProduct
}
//correct
/*
    point as Array
    triangle as Triangle
    Returns true if point is in triangle, otherwise false
*/
function inTriangle(point, triangle){
    let edge1 = [triangle.point1, triangle.point2]
    let edge2 = [triangle.point2, triangle.point3]
    let edge3 = [triangle.point3, triangle.point1]
    //point is in triangle if it lies at same side of the 3 edges
    //Same side of edge1 and edge2
    //crossProdcut is positive if point lays at same side of edgex and edgey
    if(crossProduct(edge1[1], point, edge1[0]) * crossProduct(edge2[1], point, edge2[0]) >= 0)
        //Same side of edge2 and edge3
        if(crossProduct(edge2[1], point, edge2[0]) * crossProduct(edge3[1], point, edge3[0]) >= 0)
            return true
    return false
}
//correct
function inCircle(point, radius, center){
    if(Math.pow(point[0] - center[0],2) + Math.pow(point[1] - center[1], 2) <= Math.pow(radius, 2))
        return true
    return false
}
//correct
function superTriangle(points){
    let minMax = calcMinMaxPoint(points)
    let point1 = [minMax[3][0] + 5 , minMax[1][1] + 5]
    let point2 = [minMax[3][0] + 5, minMax[0][1] - 5]

    let p1 = point1.slice(0)
    let p2
    //searches leftmost point from the lowest point
    for(let i = 0; i < points.length; i++){
        p2 = points[i]
        if(crossProduct(p1, p2, point2) > 0){
            p1 = p2
        }
    }
    //p1 is leftMost point

    let slope = (point2[1] - p1[1]) / (point2[0] - p1[0])
    let y = minMax[1][1]
    let x = ((y - p1[1]) / slope) + p1[0]
    let point3 = [x, y]
    return new Triangle(point1, point2, point3)
}
//correct
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
        if(point[1] > maxY){
            maxY = point[1]
            upperPoint = point
        } 
        if(point[1] < minY){
            minY = point[1]
            lowerPoint = point
        }
        if(point[0] > maxX){
            maxX = point[0]
            rightPoint = point
        }
        if(point[0] < minX){
            minX = point[0]
            leftPoint = point
        }
    }
    return [lowerPoint, upperPoint, leftPoint, rightPoint]
}


//Testfunctions
function testInTriangle(){
    let point1 = [0, 0]
    let point2 = [0, 2]
    let point3 = [2, 0]
    let triangle = new Triangle(point1, point2, point3)
    let pointInTriangle1 = [0.5, 0.5]
    let pointInTriangle2 = [1, 1]

    console.assert(inTriangle(pointInTriangle1, triangle), "Point " + pointInTriangle1 + " should be in triangle")
    console.assert(inTriangle(pointInTriangle2, triangle), "Point " + pointInTriangle2 + " should be in triangle")
    console.assert(inTriangle(point1, triangle), "Point " + point1 + " should be in triangle")
    console.assert(inTriangle(point2, triangle), "Point " + point2 + " should be in triangle")
    console.assert(inTriangle(point3, triangle), "Point " + point3 + " should be in triangle")
}
function testInCircle(){
    let center = [0, 0]
    let radius = 5
    let inCircle1 = [0, 0]
    let inCircle2 = [1, 1]
    let inCircle3 = [-2, 2]
    let inCircle4 = [-2, -4]
    let inCircle5 = [2, 4]
    let inCircle6 = [5, 0]
    let notInCircle1 = [5, 5]

    console.assert(inCircle(inCircle1, radius, center), "Point " + inCircle1 + " should be in circle")
    console.assert(inCircle(inCircle2, radius, center), "Point " + inCircle2 + " should be in circle")
    console.assert(inCircle(inCircle3, radius, center), "Point " + inCircle3 + " should be in circle")
    console.assert(inCircle(inCircle4, radius, center), "Point " + inCircle4 + " should be in circle")
    console.assert(inCircle(inCircle5, radius, center), "Point " + inCircle5 + " should be in circle")
    console.assert(inCircle(inCircle6, radius, center), "Point " + inCircle6 + " should be in circle")
    console.assert(!inCircle(notInCircle1, radius, center), "Point " + notInCircle1 + " should not be in circle")
    

}
function testSuperTriangle(){
    points = randomPointsGenerator(30000, 30000)
    superTriangle = superTriangle(points)
    console.log("check")
    for(let i = 0; i < points.length; i++){
        console.assert(inTriangle(points[i], superTriangle), "Point " + points[i] + " should be in triangle")
    }  
    console.log("end check")
}