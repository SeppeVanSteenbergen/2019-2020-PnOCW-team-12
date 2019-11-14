class Reconstructor {
    /**
     * 
     * @param {Array[2]} cornerCoo Coordinate of the corner
     * @param {Array[Array[]]} matrix screenmatrix (B&W)
     */
    //https://stackoverflow.com/questions/53432767/how-to-iterate-over-pixels-on-edge-of-a-square-in-1-iteration
    
    static reconstruct(cornerCoo, matrix) {
        let sideLength = 14
        let x = cornerCoo[0] - sideLength/2
        let y = cornerCoo[1] - sideLength/2

        let dx = 1;
        let dy = 0;
        let white = false;
        let blackCount = 0
        let lines = []
        let newLine = []
        for (let side = 0; side < 4; side++) {
            for (let i = 0; i < sideLenght; i++) {
                if(matrix[y][x] > 0){
                    white = true
                    newLine.push([x,y])
                } else if(white){
                    blackCount++
                    if(blackCount >= 2){
                        blackCount = 0
                        white = false
                        lines.push(newLine.slice(0))
                        newLine.length = 0
                    }
                }
                x += dx;
                y += dy;
            }
            //turn right
            let t = dx;
            dx = -dy;
            dy = t;
        }
        return lines
    }
}