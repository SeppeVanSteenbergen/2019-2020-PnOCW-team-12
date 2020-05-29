class Triangle{
    constructor(point1, point2, point3){
        this.point1 = point1
        this.point2 = point2
        this.point3 = point3
        this.edges = [[point1, point2], [point2, point3], [point3, point1]]
        this.circle = {radius: this.calcRadius(), center: this.calcCenter()}
    }

    inCircle(point) {
        return Math.pow(point[0] - this.circle.center[0], 2) + Math.pow(point[1] - this.circle.center[1], 2) <= Math.pow(this.circle.radius, 2);
    }

    //math for finding center of 3 points from paulbourke.net/geometry/circlesphere
    calcCenter() {
        let point1 = this.point1
        let point2 = this.point2
        let point3 = this.point3
        let ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
        let mb = (point3[1] - point2[1]) / (point3[0] - point2[0])
        let counter = 3
        while (counter > 0 && (!isFinite(ma) || !isFinite(mb) || ma === mb || ma === 0 || mb === 0)) {
          let helpPoint = point1.slice(0)
          point1 = point2.slice(0)
          point2 = point3.slice(0)
          point3 = helpPoint
          ma = (point2[1] - point1[1]) / (point2[0] - point1[0])
          mb = (point3[1] - point2[1]) / (point3[0] - point2[0])
          counter--
        }
        let centerX = (ma * mb * (point1[1] - point3[1]) + mb * (point1[0] + point2[0]) - ma * (point2[0] + point3[0])) / (2 * (mb - ma))
        let centerY = -(centerX - (point1[0] + point2[0]) / 2) / ma + (point1[1] + point2[1]) / 2
        return [centerX, centerY]
      }

    calcRadius() {
        let dist1 = this.calcDistance(this.point2, this.point3)
        let dist2 = this.calcDistance(this.point1, this.point3)
        let dist3 = this.calcDistance(this.point1, this.point2)
        let numerator = dist1 * dist2 * dist3
        let denumerator = Math.sqrt((dist1 + dist2 + dist3) * (dist2 + dist3 - dist1) * (dist3 + dist1 - dist2) * (dist1 + dist2 - dist3))
        return numerator / denumerator
      }

    calcDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
    }

    getPoints(){
        return [this.point1, this.point2, this.point3]
    }
    
    equalEdges(edge1, edge2){
        if(edge1.includes(edge2[0]) && edge1.includes(edge2[1]))
            return true
        return false
    }

    hasEdge(edge) {
        for(let i = 0; i < this.edges.length; i++) {
            if(this.equalEdges(edge, this.edges[i])) {
                return true
            }
        }
        return false
    }

}