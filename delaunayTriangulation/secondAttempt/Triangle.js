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
        if(edge1.contains(edge2[0]) && edge1.contains(edge2[1]))
            return true
        return false
    }
}