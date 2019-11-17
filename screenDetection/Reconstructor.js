class Reconstructor {
    /**
     *
     * @param {Array} cornerCoo Coordinate of the corner
     * @param {Array} matrix screenmatrix (B&W)
     * @param id
     * @param radius
     */
    //https://stackoverflow.com/questions/53432767/how-to-iterate-over-pixels-on-edge-of-a-square-in-1-iteration

    static reconstructCircle(cornerCoo, matrix, id, radius) {
        let lines = this.calcLinesCirc(cornerCoo, matrix, id, radius);
        let reco = [];
        let furthestPoints = this.calcTwoFurthestPoints(lines);
        let validatedFurthestPoints = this.validateTwoFurthestPoints(matrix, cornerCoo, furthestPoints, lines);
        validatedFurthestPoints.forEach(point => reco.push(point));
        let biggest;
        let biggestNb = -Infinity;
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].includes(furthestPoints[0]) && !lines[i].includes(furthestPoints[1])) {
                if (biggestNb < lines[i].length) {
                    biggest = lines[i];
                    biggestNb = lines[i].length
                }
            }
        }
        if (biggest != null)
            reco.push(biggest[Math.floor(biggest.length / 2)]);

        return reco
    }

    //returns list of 4 points
    static reconstructCircleMidPoint(midPointCoo, matrix, id, radius){
        let lines = this.calcLinesCirc(midPointCoo, matrix, id, radius);
        let reco = [];
        for(let i = 0; i < lines.length; i++){
            let midPoint = lines[i][Math.floor(lines[i].length / 2)];
            if (!this.crossesWhite(matrix, midPointCoo, midPoint)) {
                reco.push(midPoint);
            }
        }
        
        return reco;
    }

    static calcLinesCirc(cornerCoo, matrix, id, radius) {
        const dTheta = 0.01;
        const maxWrongPixel = 5;

        let white = false;
        let lines = [];
        let newLine = [];
        let blackCount = 0;

        // Calculate start theta
        let startTheta = 0;
        let x = cornerCoo[0] + Math.floor(radius * Math.cos(startTheta));
        let y = cornerCoo[1] + Math.floor(radius * Math.sin(startTheta));
        while(this.isFromIsland(x, y, matrix, id)) {
            startTheta += dTheta;
            x = cornerCoo[0] + Math.floor(radius * Math.cos(startTheta));
            y = cornerCoo[1] + Math.floor(radius * Math.sin(startTheta));
        }

        for (let theta = startTheta; theta < startTheta + 2 * Math.PI; theta += dTheta) {
            let x = cornerCoo[0] + Math.floor(radius * Math.cos(theta));
            let y = cornerCoo[1] + Math.floor(radius * Math.sin(theta));
            if (newLine[newLine.length - 1] !== [x, y]) {
                if (this.isFromIsland(x, y, matrix, id)) {
                    white = true;
                    blackCount = 0;
                    newLine.push([x, y])
                } else if (white && ++blackCount >= maxWrongPixel) {
                    blackCount = 0;
                    white = false;
                    lines.push(newLine.slice(0));
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
        let points = [];
        for(let i = 0; i < lines.length; i++) {
            points.push(lines[i][0]);
            points.push(lines[i][lines[i].length-1]);
        }
        let furthestDist = 0;
        let furthestPoints = [];
        for(let i = 0; i < points.length; i++) {
            for(let j = i+1; j < points.length; j++) {
                let point1 = points[i];
                let point2 = points[j];
                let dist = Algebra.calcDist(point1,point2);
                if(dist > furthestDist) {
                    furthestPoints = [point1, point2, dist];
                    furthestDist = dist;
                }
            }
        }
        return furthestPoints
    }

    static validateTwoFurthestPoints(matrix, cornerCoo, points, lines) {
        if (!isFinite(points[2])) {
            return [];
        }

        let point1 = points[0];
        let point2 = points[1];
        let line1;
        let line2;

        for (let i = 0; i < lines.length; i++) {
            if(lines[i].includes(point1)) {
                if (lines[i][0] === point1) {
                    line1 = lines[i];
                } else line1 = lines[i].reverse();
            }
        }
        for (let i = 0; i < lines.length; i++) {
            if(lines[i].includes(point2)) {
                if (lines[i][0] === point1) {
                    line2 = lines[i];
                } else line2 = lines[i].reverse();
            }
        }
        
        //TODO implement with generic offset

        let validatedPoints = [];
        let offset = 0;
        for (let i = 0; i < line1.length; i++) {
            point1 = line1[i];
            if (!this.crossesWhite(matrix, cornerCoo, point1)) {
                i += offset;
                validatedPoints.push(line1[i]);
                break;
            }
        }
        for (let i = 0; i < line2.length; i++) {
            point2 = line2[i];
            if (!this.crossesWhite(matrix, cornerCoo, point2)) {
                i += offset;
                validatedPoints.push(line2[i]);
                break;
            }
        }

        return validatedPoints;
    }

    static crossesWhite(matrix, cornerCoo, point) {
        let point1 = cornerCoo;
        let point2 = point;

        if (point2[0] <= point1[0]) {
            [point1, point2] = [point2, point1]
        }

        let a = (point2[1] - point1[1]) / (point2[0] - point1[0]);
        let b = point1[1] - a * point1[0];

        if (isFinite(a)) {
            for (let x = point1[0]; x <= point2[0]; x++) {
                let y = Math.round(a * x + b);
                let id = this.getMatrix(x, y, matrix);
                if (id === 0) {
                    return true
                }
            }
        } else {
            if (point2[1] < point1[1]) {
                [point1, point2] = [point2, point1]
            }
            let x = point1[0];
            for (let y = point1[1]; y <= point2[1]; y++) {
                let id = this.getMatrix(x, y, matrix);
                if (id === 0) {
                    return true
                }
            }
        }

        return false
    }

    static isFromIsland(x, y, matrix, id) {
        let pixel = this.getMatrix(x, y, matrix);
        return pixel >= id && pixel <= id + 2;

    }

    static getMatrix(x, y, matrix) {
        if (x < 0 || x >= matrix[0].length) return 0;
        if (y < 0 || y >= matrix.length) return 0;
        return matrix[y][x]
    }
}