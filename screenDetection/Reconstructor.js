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

    static reconstructCircle(cornerCoo, matrix, id, radius) {
        let lines = this.calcLinesCirc(cornerCoo, matrix, id, radius)
        let reco = []
        let furthestPoints = this.calcTwoFurthestPoints(lines)
        reco.push(furthestPoints[0], furthestPoints[1])
        let biggest
        let biggestNb = -Infinity
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].includes(furthestPoints[0]) && !lines[i].includes(furthestPoints[1])) {
                if (biggestNb < lines[i].length) {
                    biggest = lines[i]
                    biggestNb = lines[i].length
                }
            }
        }
        if (biggest != null)
            reco.push(biggest[Math.floor(biggest.length / 2)])

        return reco
    }

    static reconstructCircleMidPoint(midPointCoo, matrix, id, radius){
        let lines = this.calcLinesCirc(midPointCoo, matrix, id, radius)
        let reco = []
        for(let i = 0; i < lines.length; i++){
            reco.push(lines[i][Math.floor(lines[i].length / 2)])
        }
        return reco
    }


    static calcLinesCirc(cornerCoo, matrix, id, radius) {
        const dtheta = 0.01
        const maxWrongPixel = 5

        let white = false;
        let lines = []
        let newLine = []
        let blackCount = 0
        for (let theta = 0; theta < 2 * Math.PI; theta += dtheta) {
            let x = cornerCoo[0] + Math.floor(radius * Math.cos(theta))
            let y = cornerCoo[1] + Math.floor(radius * Math.sin(theta))
            if (newLine[newLine.length - 1] != [x, y]) {
                if (this.isFromIsland(x, y, matrix, id)) {
                    white = true
                    blackCount = 0
                    newLine.push([x, y])
                } else if (white && ++blackCount >= maxWrongPixel) {
                    blackCount = 0
                    white = false
                    lines.push(newLine.slice(0))
                    newLine.length = 0
                }
            }
        }
        if (newLine.length > 0) {
            lines.push(newLine.slice(0))
        }
        return lines
    }

    static calcTwoFurthestPoints(lines) {
        let furthestPoints = [null, null, -Infinity]
        for (let i = 0; i < lines.length - 1; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                let possibleFurthestPoints = this.calcFurthestPoints2Lines(lines[i], lines[j])
                if (furthestPoints[2] < possibleFurthestPoints[2])
                    furthestPoints = possibleFurthestPoints.slice(0)
            }
        }
        return furthestPoints
    }

    static calcFurthestPoints2Lines(line1, line2) {
        let startPoint1 = line1[0]
        let furthestPoint2 = null
        let furthestDistance = -Infinity
        for (let i = 0; i < line2.length; i++) {
            let distance = this.calcDistance(startPoint1, line2[i])
            if (distance > furthestDistance) {
                furthestDistance = distance
                furthestPoint2 = line2[i]
            }
        }
        let furthestPoint1 = null
        furthestDistance = -Infinity
        for (let i = 0; i < line1.length; i++) {
            let distance = this.calcDistance(furthestPoint2, line1[i])
            if (distance > furthestDistance) {
                furthestDistance = distance
                furthestPoint1 = line1[i]
            }
        }
        return [furthestPoint1, furthestPoint2, furthestDistance]
    }

    static calcDistance(point1, point2) {
        return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
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
        return pixel >= id && pixel <= id + 2;

    }
    static getMatrix(x, y, matrix) {
        if (x < 0 || x >= matrix[0].length) return 0;
        if (y < 0 || y >= matrix.length) return 0;
        if(!isNaN(x) && !isNaN(y)) return matrix[y][x]
    }
}