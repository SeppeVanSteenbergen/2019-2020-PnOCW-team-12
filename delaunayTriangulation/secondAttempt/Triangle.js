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
        this.edges = [new Set([point1, point2], new Set([point2, point3]), new Set([point3, point1]))]
    }

    getPoints(){
        return [this.point1, this.point2, this.point3]
    }
}