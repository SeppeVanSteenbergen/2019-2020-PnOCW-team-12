import Triangle from './Triangle'
import Point from "./Point"

export default class Delaunay {
  static randomPointsGenerator(nbPoints, canvas) {
    let pointList = []
    for (let i = 0; i < nbPoints; i++) {
      let x = Math.floor(Math.random() * canvas.width)
      let y = Math.floor(Math.random() * canvas.height)
      pointList.push([x, y])
    }
    return pointList
  }

  static calcDistance(point1, point2) {
    return Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
    )
  }

  /*
  input points = array of all points
  sorts all points in points in function of distance to seedPoint in descending order to seedPoint
  */
  radialSort(points, point) {
    points.sort(function (a, b) {
      let distanceA = this.calcDistance(a, point)
      let distanceB = this.calcDistance(b, point)
      return distanceB - distanceA
    })

    return points
  }

  static triangulationEdges(triangulation) {
    let edges = new Set();
    for (let i = 0; i < triangulation.length; i++) {
      let triangle = triangulation[i]
      edges.add([triangle.point1, triangle.point2])
      edges.add([triangle.point2, triangle.point3])
      edges.add([triangle.point3, triangle.point1])
      edges.add([triangle.point2, triangle.point1])
      edges.add([triangle.point3, triangle.point2])
      edges.add([triangle.point1, triangle.point3])
    }
    let edges2 = {}
    for(let item of edges){
      if(!(item[0] in edges2)){
        edges2[item[0]] = []
      }
      if(!edges2[item[0]].includes(item[1]))
        edges2[item[0]].push(item[1])
    }
    return edges2
  }

  static triangulation(points, width, height) {
    if (points.length < 3) {
      if (points.length === 2) {
        return [new Triangle(points[0], points[0], points[1])]
      }
      return []
    }
    let supTriangle = this.superTriangle(width, height)
    let triangulation = []
    triangulation.push(supTriangle)
    for (let i = 0; i < points.length; i++) {
      let badTriangles = []
      for (let tri = 0; tri < triangulation.length; tri++) {
        let radius = this.calcRadius(
          triangulation[tri].point1,
          triangulation[tri].point2,
          triangulation[tri].point3
        )
        let center = this.calcCenter(
          triangulation[tri].point1,
          triangulation[tri].point2,
          triangulation[tri].point3
        )
        if (this.inCircle(points[i], radius, center)) {
          badTriangles.push(triangulation[tri])
        }
      }
      let polygon = []
      for (let t = 0; t < badTriangles.length; t++) {
        for (let e = 0; e < badTriangles[t].edges.length; e++) {
          // check if any other triangle in badTriangles also has this edge
          // t = triangle, ot = other triangle, ote = other triangle edge
          let edgeShared = false
          for (let ot = 0; ot < badTriangles.length; ot++) {
            if (ot !== t) {
              if (badTriangles[ot].hasEdge(badTriangles[t].edges[e])) {
                edgeShared = true
                break
              }
            }
          }
          if (!edgeShared) {
            polygon.push(badTriangles[t].edges[e])
          }
        }
      }

      for (let i = 0; i < badTriangles.length; i++) {
        triangulation = this.arrayRemove(triangulation, badTriangles[i])
      }
      for (let edg = 0; edg < polygon.length; edg++) {
        triangulation.push(
          new Triangle(points[i], polygon[edg][0], polygon[edg][1])
        )
      }
    }
    //triangulation done, only remove triangles with super-triangle
    for (let i = 0; i < triangulation.length; i++) {
      let triangle = triangulation[i].getPoints()
      if (
        triangle.includes(supTriangle.point1) ||
        triangle.includes(supTriangle.point2) ||
        triangle.includes(supTriangle.point3)
      ) {
        triangulation = this.arrayRemove(triangulation, triangulation[i])
        i--
      }
    }
    return triangulation
  }

  static arrayRemove(array, value) {
    let newArray = []
    for (let i = 0; i < array.length; i++) {
      if (array[i] !== value) newArray.push(array[i])
    }
    return newArray
  }

  //correct
  //math for finding center of 3 points from paulbourke.net/geometry/circlesphere
  static calcCenter(point1, point2, point3) {
    let ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
    let mb = (point3[1] - point2[1]) / (point3[0] - point2[0])
    let counter = 3
    while (
      counter > 0 &&
      (!isFinite(ma) || !isFinite(mb) || ma === mb || ma === 0 || mb === 0)
    ) {
      let helpPoint = point1.slice(0)
      point1 = point2.slice(0)
      point2 = point3.slice(0)
      point3 = helpPoint
      ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
      mb = (point3[1] - point2[1]) / (point3[0] - point2[0])
      counter--
    }
    let centerX =
      (ma * mb * (point1[1] - point3[1]) +
        mb * (point1[0] + point2[0]) -
        ma * (point2[0] + point3[0])) /
      (2 * (mb - ma))

    let centerY =
      -(centerX - (point1[0] + point2[0]) / 2) / ma +
      (point1[1] + point2[1]) / 2
    return [centerX, centerY]
  }

  //correct
  static calcRadius(point1, point2, point3) {
    // console.log("3 punten", point1, point2, point3)
    let dist1 = this.calcDistance(point2, point3)
    let dist2 = this.calcDistance(point1, point3)
    let dist3 = this.calcDistance(point1, point2)
    let numerator = dist1 * dist2 * dist3
    let denumerator = Math.sqrt(
      (dist1 + dist2 + dist3) *
      (dist2 + dist3 - dist1) *
      (dist3 + dist1 - dist2) *
      (dist1 + dist2 - dist3)
    )
    return numerator / denumerator
  }

  //correct
  /*
      calculates crossproduct between two points, point3 as basis
  */
  static crossProduct(p1, p2, p3) {
    let crossProduct =
      (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p2[1] - p3[1])
    return crossProduct
  }

  //correct
  /*
      point as Array
      triangle as Triangle
      Returns true if point is in triangle, otherwise false
  */
  static inTriangle(point, triangle) {
    let edge1 = [triangle.point1, triangle.point2]
    let edge2 = [triangle.point2, triangle.point3]
    let edge3 = [triangle.point3, triangle.point1]
    //point is in triangle if it lies at same side of the 3 edges
    //Same side of edge1 and edge2
    //crossProdcut is positive if point lays at same side of edgex and edgey
    if (
      this.crossProduct(edge1[1], point, edge1[0]) *
      this.crossProduct(edge2[1], point, edge2[0]) >=
      0
    )
      if (
        this.crossProduct(edge2[1], point, edge2[0]) *
        this.crossProduct(edge3[1], point, edge3[0]) >=
        0
      )
        //Same side of edge2 and edge3
        return true
    return false
  }

  //correct
  static inCircle(point, radius, center) {
    return (
      Math.pow(point[0] - center[0], 2) + Math.pow(point[1] - center[1], 2) <=
      Math.pow(radius, 2)
    )
  }

  //correct
  static superTriangle(width, height) {
    let g = width > height ? width : height
    g *= g
    let p1 = [-500, -500]
    let p2 = [0, Math.sqrt(g) * 2]
    let p3 = [Math.sqrt(g) * 2, 0]

    return new Triangle(p1, p2, p3)
  }

  //Testfunctions
  static testInTriangle() {
    let point1 = [0, 0]
    let point2 = [0, 2]
    let point3 = [2, 0]
    let triangle = new Triangle(point1, point2, point3)
    let pointInTriangle1 = [0.5, 0.5]
    let pointInTriangle2 = [1, 1]

    console.assert(
      this.inTriangle(pointInTriangle1, triangle),
      'Point ' + pointInTriangle1 + ' should be in triangle'
    )
    console.assert(
      this.inTriangle(pointInTriangle2, triangle),
      'Point ' + pointInTriangle2 + ' should be in triangle'
    )
    console.assert(
      this.inTriangle(point1, triangle),
      'Point ' + point1 + ' should be in triangle'
    )
    console.assert(
      this.inTriangle(point2, triangle),
      'Point ' + point2 + ' should be in triangle'
    )
    console.assert(
      this.inTriangle(point3, triangle),
      'Point ' + point3 + ' should be in triangle'
    )
  }

  static testInCircle() {
    let center = [0, 0]
    let radius = 5
    let inCircle1 = [0, 0]
    let inCircle2 = [1, 1]
    let inCircle3 = [-2, 2]
    let inCircle4 = [-2, -4]
    let inCircle5 = [2, 4]
    let inCircle6 = [5, 0]
    let notInCircle1 = [5, 5]

    console.assert(
      this.inCircle(inCircle1, radius, center),
      'Point ' + inCircle1 + ' should be in circle'
    )
    console.assert(
      this.inCircle(inCircle2, radius, center),
      'Point ' + inCircle2 + ' should be in circle'
    )
    console.assert(
      this.inCircle(inCircle3, radius, center),
      'Point ' + inCircle3 + ' should be in circle'
    )
    console.assert(
      this.inCircle(inCircle4, radius, center),
      'Point ' + inCircle4 + ' should be in circle'
    )
    console.assert(
      this.inCircle(inCircle5, radius, center),
      'Point ' + inCircle5 + ' should be in circle'
    )
    console.assert(
      this.inCircle(inCircle6, radius, center),
      'Point ' + inCircle6 + ' should be in circle'
    )
    console.assert(
      !this.inCircle(notInCircle1, radius, center),
      'Point ' + notInCircle1 + ' should not be in circle'
    )
  }

  static testSuperTriangle() {
    let points = this.randomPointsGenerator(30000, 30000)
    let superTriangle = this.superTriangle(points)
    console.log('check')
    for (let i = 0; i < points.length; i++) {
      console.assert(
        this.inTriangle(points[i], superTriangle),
        'Point ' + points[i] + ' should be in triangle'
      )
    }
    console.log('end check')
  }
}
