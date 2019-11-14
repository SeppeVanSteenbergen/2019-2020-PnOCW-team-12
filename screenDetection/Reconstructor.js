class Reconstructor {
    /**
     * 
     * @param {Array[2]} cornerCoo Coordinate of the corner
     * @param {Array[Array[]]} matrix screenmatrix (B&W)
     */
    //https://stackoverflow.com/questions/53432767/how-to-iterate-over-pixels-on-edge-of-a-square-in-1-iteration

    static reconstruct(cornerCoo, matrix, id) {
        let sideLength = 200
        let x = cornerCoo[0] - sideLength / 2
        let y = cornerCoo[1] - sideLength / 2

        let dx = 1;
        let dy = 0;
        let white = false;
        let lines = []
        let newLine = []
        for (let side = 0; side < 4; side++) {
            for (let i = 0; i < sideLength; i++) {
                if (this.isFromIsland(x, y, matrix, id)) {
                    white = true
                    newLine.push([x, y])
                } else if (white) {
                    white = false
                    lines.push(newLine.slice(0))
                    newLine.length = 0
                }
                x += dx;
                y += dy;
            }
            //turn right
            let t = dx;
            dx = -dy;
            dy = t;
        }
        if (newLine.length > 0) {
            lines.push(newLine.slice(0))
        }
        return lines
    }
    static reconstructCircle(cornerCoo, matrix, id) {
        let lines = this.calcLinesCirc(cornerCoo, matrix, id)
        let range = this.calcRange(lines)
        let reco = []
        if (lines.length <= 3) {
            let diagonal = null
            if (range.rangeX > range.rangeY) {
                reco.push(range.minXCoo)
                reco.push(range.maxXCoo)
            } else {
                reco.push(range.minYCoo)
                reco.push(range.maxYCoo)
            }
            for (let i = 0; i < lines.length; i++) {
                for (let line = 0; line < lines[i].length; line++)
                    if (!lines[i].includes(reco[0]) && !lines[i].includes(reco[1]))
                        diagonal = lines[i]
            }
            if (diagonal != null) {
                reco.push(diagonal[Math.floor((diagonal.length) / 2)])
            }
        } else if(lines.length >= 4){
            for(let i = 0; i < lines.length; i++){
                reco.push(lines[i][Math.floor((lines[i].length) / 2)])
            }
        }

        return reco
    }


    static calcLinesCirc(cornerCoo, matrix, id) {
        let radius = 100
        let dtheta = 0.01

        let white = false;
        let lines = []
        let newLine = []
        let blackCount = 0
        for (let theta = 0; theta < 2 * Math.PI; theta += dtheta) {
            let x = cornerCoo[0] + Math.floor(radius * Math.cos(theta))
            let y = cornerCoo[1] + Math.floor(radius * Math.sin(theta))
            if (this.isFromIsland(x, y, matrix, id)) {
                white = true
                newLine.push([x, y])
            } else if (white && blackCount++ >= 3) {
                blackCount = 0
                white = false
                lines.push(newLine.slice(0))
                newLine.length = 0
            }
        }
        if (newLine.length > 0) {
            lines.push(newLine.slice(0))
        }
        return lines
    }

    static calcRange(lines) {
        let minX = Infinity
        let minXCoo
        let minY = Infinity
        let minYCoo
        let maxX = -Infinity
        let maxXCoo
        let maxY = -Infinity
        let maxYCoo
        for (let line = 0; line < lines.length; line++) {
            let currLine = lines[line]
            for (let pix = 0; pix < currLine.length; pix++) {
                let currPix = currLine[pix]
                if (currPix[0] < minX) { minX = currPix[0]; minXCoo = currPix }
                else if (currPix[0] > maxX) { maxX = currPix[0]; maxXCoo = currPix }
                if (currPix[1] < minY) { minY = currPix[1]; minYCoo = currPix }
                else if (currPix[1] > maxY) { maxY = currPix[1]; maxYCoo = currPix }
            }
        }

        return {
            minXCoo: minXCoo, maxXCoo: maxXCoo, rangeX: maxX - minX,
            minYCoo: minYCoo, maxYCoo: maxYCoo, rangeY: maxY - minY
        }
    }

    static isFromIsland(x, y, matrix, id) {
        let pixel = this.getMatrix(x, y, matrix)
        if (pixel >= id && pixel <= id + 2)
            return true
        return false
    }
    static getMatrix(x, y, matrix) {
        if (x < 0) return 0;
        else if (x >= matrix[0].length) return 0;
        if (y < 0) return 0;
        else if (y >= matrix.length) return 0;
        return matrix[y][x];
    }
}