class Triangle{
    point1
    point2
    point3
    //edges is list of the edgessets 
    edges
    constructor(point1, point2, point3){
        this.point1 = point1
        this.point2 = point2
        this.point3 = point3
        this.edges = [[point1, point2], [point2, point3], [point3, point1]]
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