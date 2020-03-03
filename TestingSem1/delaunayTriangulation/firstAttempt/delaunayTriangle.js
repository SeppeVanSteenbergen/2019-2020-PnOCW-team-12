class Triangle{
    trianglePoints
    adjacentTriangles

    constructor(points, adjacentTriangles){
        if(points.length != 3){
            console.error("a triangle has only 3 points")
        }
        this.trianglePoints = points
        this.adjacentTriangles = adjacentTriangles
    }

    addTriangle(triangle){
        if(this.adjacentTriangles.length + 1 > 3)
            console.error("a triangle can max have 3 adjacent triangles")
        this.adjacentTriangles.push(triangle)
    }

    

}