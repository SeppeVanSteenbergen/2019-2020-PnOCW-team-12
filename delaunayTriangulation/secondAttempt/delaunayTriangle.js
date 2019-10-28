class Triangle{
    points
    //edges is list of the edgessets 
    edges
    constructor(point1, point2, point3){
        this.points = [point1, point2, point3]
        this.edges = [new Set([point1, point2], new Set([point2, point3]), new Set([point3, point1]))
    }
    
}