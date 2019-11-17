class CornerDetector {

    constructor(screenMatrix, midPoint, id) {
        this.matrix = screenMatrix;
        this.midPoint = midPoint;
        this.id = id;
        this.corners = {
            LU: null,
            RU: null,
            RD: null,
            LD: null
        };
        this.height = this.matrix.length;
        this.width = this.matrix[0].length;
        this.radiusFactor = 0.25;
        this.radius = 0; //will be set later
        this.yellow = id;
        this.pink = id + 1
    }

    cornerDetection() {
        let tmpCorners = this.findCorners();
        // tmpCorners = this.minOffset(tmpCorners);
        this.radius = this.calcRadius(this.radiusFactor,tmpCorners);
        //returns 4 corners in relative position
        let nonPositionCorners = this.validateCorners(tmpCorners);
        this.corners = this.orderCorners(nonPositionCorners);
        nonPositionCorners = nonPositionCorners.filter(function(point) {
            return point != null;
        });
        if (nonPositionCorners.length < 4)
            this.reconstructCorners(4 - nonPositionCorners.length);
        return this.corners
    }

    reconstructCorners(missingCornersCount) {
        let helpMids = Reconstructor.reconstructCircleMidPoint(this.midPoint, this.matrix, this.id, this.radius);
        helpMids = this.orderCorners(helpMids);
        console.log(helpMids);
        for (let i = 0; i < missingCornersCount; i++) {
            let helpMid = null;
            let helpPoint = null;
            let helpCorner = null;
            let otherCorner = null;
            let helpPoints = null;

            //missing LU
            if (this.corners.LU === null) {
                helpMid = helpMids.LU;
                if (this.corners.RU !== null) {
                    helpPoints = Reconstructor.reconstructCircle(this.corners.RU, this.matrix, this.id, this.radius);
                    if (helpPoints.length >= 3) {
                        helpPoints = helpPoints.slice(0, 2);
                        helpCorner = this.corners.RU;
                        otherCorner = this.corners.RD;
                        helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner);
                    }
                } 
                if (this.corners.LD !== null && helpPoint === null) {
                    helpPoints = Reconstructor.reconstructCircle(this.corners.LD, this.matrix, this.id, this.radius);
                    if (helpPoints.length >= 3) {
                        helpPoints = helpPoints.slice(0, 2);
                        helpCorner = this.corners.LD;
                        otherCorner = this.corners.RD;
                        helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner);
                    }
                }

                let corner = this.reconstructCorner(helpPoint, helpCorner, helpMid);
                this.addColorId(corner, this.corners.RD);
                this.corners.LU = corner;
            }
            //missing RU
            else if (this.corners.RU === null) {
                helpMid = helpMids.RU;
                helpPoints = Reconstructor.reconstructCircle(this.corners.LU, this.matrix, this.id, this.radius);
                if (helpPoints.length >= 3) {
                    helpPoints = helpPoints.slice(0, 2);
                    helpCorner = this.corners.LU;
                    otherCorner = this.corners.LD;
                    helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner);
                }
                if (this.corners.RD !== null && helpPoint === null) {
                    helpPoints = Reconstructor.reconstructCircle(this.corners.RD, this.matrix, this.id, this.radius);
                    if (helpPoints.length >= 3) {
                        helpCorner = this.corners.RD;
                        otherCorner = this.corners.LD;
                        helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner);
                    }
                }

                let corner = this.reconstructCorner(helpPoint, helpCorner, helpMid);
                this.addColorId(corner, this.corners.LD);
                this.corners.RU = corner;
            }
            //missing RD
            else if (this.corners.RD === null) {
                helpMid = helpMids.RD;
                if (this.corners.RU != null) {
                    helpPoints = Reconstructor.reconstructCircle(this.corners.RU, this.matrix, this.id, this.radius);
                    if (helpPoints.length >= 3) {
                        helpPoints = helpPoints.slice(0, 2);
                        helpCorner = this.corners.RU;
                        otherCorner = this.corners.LU;
                        helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner);
                    }
                } 
                if (this.corners.LD !== null && helpPoint === null) {
                    helpPoints = Reconstructor.reconstructCircle(this.corners.LD, this.matrix, this.id, this.radius);
                    if (helpPoints.length >= 3) {
                        helpPoints = helpPoints.slice(0, 2);
                        helpCorner = this.corners.LD;
                        otherCorner = this.corners.LU;
                        helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner);
                    }
                }

                let corner = this.reconstructCorner(helpPoint, helpCorner, helpMid);
                this.addColorId(corner, this.corners.LU);
                this.corners.RD = corner;
            }
            //missing LD
            else if (this.corners.LD === null) {
                helpMid = helpMids.LD;
                helpPoints = Reconstructor.reconstructCircle(this.corners.RD, this.matrix, this.id, this.radius);
                if (helpPoints.length >= 3) {
                    helpPoints = helpPoints.slice(0, 2);
                    helpCorner = this.corners.RD;
                    otherCorner = this.corners.RU;
                    helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner);
                }
                if (this.corners.LU !== null && helpPoint === null) {
                    helpPoints = Reconstructor.reconstructCircle(this.corners.LU, this.matrix, this.id, this.radius);
                    if (helpPoints.length >= 3) {
                        helpPoints = helpPoints.slice(0, 2);
                        helpCorner = this.corners.LU;
                        otherCorner = this.corners.RU;
                        helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner);
                    }
                }
                
                let corner = this.reconstructCorner(helpPoint, helpCorner, helpMid);
                this.addColorId(corner, this.corners.RU);
                this.corners.LD = corner;
            }
        } 
    }

    reconstructCorner(helpPoint, helpCorner, helpMid) {
        console.log("reconstructCorner")
        let helpLine1 = new Line(helpPoint, helpCorner);
        let helpLine2 = new Line(this.midPoint, helpMid);
        let missingCorner = helpLine1.calcIntersection(helpLine2, this.width, this.height);

        console.log(helpLine1, helpLine2, missingCorner)
        
        return missingCorner;
    }

    addColorId(point, oppositePoint) {
        point.push(oppositePoint[2] === this.yellow ? this.pink : this.yellow);
    }

    // minOffset(corners) {
    //     let orderedCorners = this.orderCorners(corners);
    //     if (orderedCorners.LU !== null) {
    //         orderedCorners.LU = [orderedCorners.LU[0] + 5, orderedCorners.LU[1] + 5, orderedCorners.LU[2]];
    //     }
    //     if (orderedCorners.RU !== null) {
    //         orderedCorners.RU = [orderedCorners.RU[0] - 5, orderedCorners.RU[1] + 5, orderedCorners.RU[2]];
    //     }
    //     if (orderedCorners.RD !== null) {
    //         orderedCorners.RD = [orderedCorners.RD[0] - 5, orderedCorners.RD[1] - 5, orderedCorners.RD[2]];
    //     }
    //     if (orderedCorners.LD !== null) {
    //         orderedCorners.LD = [orderedCorners.LD[0] + 5, orderedCorners.LD[1] - 5, orderedCorners.LD[2]];
    //     }

    //     return Object.values(orderedCorners).filter(function (corner) {
    //         return corner != null;
    //     });
    // }

    isValidOrder(pointList) {
        let LU = pointList[0];
        let RU = pointList[1];

        return (
            (LU === null || (LU[0] <= this.midPoint[0] && LU[1] <= this.midPoint[1])) &&
            (RU === null || (RU[0] >= this.midPoint[0] && RU[1] <= this.midPoint[1]))
        );
    }

    orderCorners(pointList) {
        for (let i = 0; i < pointList.length; i++) {
            if (this.isValidOrder(pointList)) {
                break;
            }
            pointList.push(pointList.shift());
        }

        return ({
            LU: pointList[0],
            RU: pointList[1],
            RD: pointList[2],
            LD: pointList[3]
        });
    }

    findHelpPoint(helpPoints, helpCorner, otherCorner) {
        let line1 = new Line(helpCorner, otherCorner);
        let line2 = new Line(helpCorner, helpPoints[0]);

        if (line1.dx === 0 || line1.dy === 0) {
            if (line1.dx === 0) {
                return Math.sign(line1.dy) === Math.sign(line2.dy) && Math.abs(line2.dy) > 3 ? helpPoints[1] : helpPoints[0];
            } else {
            return Math.sign(line1.dx) === Math.sign(line2.dx) && Math.abs(line2.dx) > 3 ? helpPoints[1] : helpPoints[0];
            }
        } else {
            return Math.sign(line1.dx) === Math.sign(line2.dx) && Math.sign(line1.dy) === Math.sign(line2.dy) ? helpPoints[1] : helpPoints[0];
        }
    }

    findCorners() {
        // choosing diagonal or straight corner detection
        let diagonalSearch = false;

        // Find which corner search to use: perpendicular or diagonal.

        const ratio = 0.07;
        const minPixels = 10;
        const sd_threshold = 0.15;

        const testOffsetX = Math.max(Math.floor(ratio * this.width), minPixels);
        const testOffsetY = Math.max(Math.floor(ratio * this.height), minPixels);

        // Left variance
        let yValuesLeft = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < testOffsetX; x++) {
                if (this.isFromIsland(x, y)) yValuesLeft.push(y / this.height);
            }
        }
        let yValuesLeftAvg =
            yValuesLeft.reduce((t, n) => t + n) / yValuesLeft.length;

        let yValuesLeftVariance = Math.sqrt(
            yValuesLeft.reduce((t, n) => t + Math.pow(yValuesLeftAvg - n, 2)) /
            yValuesLeft.length
        );

        if (yValuesLeftVariance > sd_threshold) diagonalSearch = true;

        let corners = [];
        if (diagonalSearch) {
            // Diagonal search
            corners = this.diagonalSearch()

        } else {
            // Perpendicular search
            corners = this.perpendicularSearch()
        }

        return corners
    }

    diagonalSearch() {
        let corners = [];
        // left upper corner
        for (let k = 0; k <= this.width + this.height - 2; k++) {
            let found = false;
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (
                    i < this.height &&
                    j < this.width &&
                    this.isFromIsland(j, i)
                ) {
                    corners.push([j, i, this.matrix[i][j]]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        // right upper corner
        for (let k = 0; k <= this.width + this.height - 2; k++) {
            let found = false;
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (
                    i < this.height &&
                    j < this.width &&
                    this.isFromIsland(this.width - j - 1, i)
                ) {
                    corners.push([
                        this.width - j - 1,
                        i,
                        this.matrix[i][this.width - j - 1]
                    ]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        // right lower corner
        for (let k = 0; k <= this.width + this.height - 2; k++) {
            let found = false;
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (
                    i < this.height &&
                    j < this.width &&
                    this.isFromIsland(this.width - j - 1, this.height - i - 1)
                ) {
                    corners.push([
                        this.width - j - 1,
                        this.height - i - 1,
                        this.matrix[this.height - i - 1][this.width - j - 1]
                    ]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        // left lower corner
        for (let k = 0; k <= this.width + this.height - 2; k++) {
            let found = false;
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (
                    i < this.height &&
                    j < this.width &&
                    this.isFromIsland(j, this.height - i - 1)
                ) {
                    corners.push([
                        j,
                        this.height - i - 1,
                        this.matrix[this.height - i - 1][j]
                    ]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        return corners
    }

    perpendicularSearch() {
        let corners = [];
        // left
        for (let x = 0; x < this.width; x++) {
            let found = false;
            let tempY = [];
            for (let y = 0; y < this.height; y++) {
                if (this.isFromIsland(x, y)) {
                    tempY.push(y);
                    found = true;
                }
            }
            if (found) {
                let medianY = tempY[Math.floor(tempY.length / 2)];
                corners.push([x, medianY, this.matrix[medianY][x]]);
                break;
            }
        }

        // top
        for (let y = 0; y < this.height; y++) {
            let found = false;
            let tempX = [];
            for (let x = 0; x < this.width; x++) {
                if (this.isFromIsland(x, y)) {
                    tempX.push(x);
                    found = true;
                }
            }
            if (found) {
                let medianX = tempX[Math.floor(tempX.length / 2)];
                corners.push([medianX, y, this.matrix[y][medianX]]);
                break;
            }
        }

        // right
        for (let x = 0; x < this.width; x++) {
            let found = false;
            let tempY = [];
            for (let y = 0; y < this.height; y++) {
                if (this.isFromIsland(this.width - x - 1, y)) {
                    tempY.push(y);
                    found = true;
                }
            }
            if (found) {
                let medianY = tempY[Math.floor(tempY.length / 2)];
                corners.push([
                    this.width - x - 1,
                    medianY,
                    this.matrix[medianY][this.width - x - 1]
                ]);
                break;
            }
        }
        // bottom
        for (let y = 0; y < this.height; y++) {
            let found = false;
            let tempX = [];
            for (let x = 0; x < this.width; x++) {
                if (this.isFromIsland(x, this.height - y - 1)) {
                    tempX.push(x);
                    found = true;
                }
            }
            if (found) {
                let medianX = tempX[Math.floor(tempX.length / 2)];
                corners.push([
                    medianX,
                    this.height - y - 1,
                    this.matrix[this.height - y - 1][medianX]
                ]);
                break;
            }
        }
        return corners
    }

    validateCorners(tmpCorners) {
        let validCorners = [];
        for (let c = 0; c < tmpCorners.length; c++) {
            let tmpCorner = tmpCorners[c];
            if(Reconstructor.reconstructCircle([tmpCorner[0], tmpCorner[1]],this.matrix, this.id, this.radius).length >= 3)
                validCorners.push(tmpCorner)
            else validCorners.push(null);
        }
        return validCorners
    }

    isFromIsland(x, y) {
        let pixel = this.getMatrix(x, y);
        return pixel >= this.id && pixel <= this.id + 2;
    }

    //calculates it based on the point with the longest distance from the temporary corners to the midpoint.
    calcRadius(factor, corners) {
        let distance = this.farestToMid(corners);
        return Math.floor(distance*factor)
    }

    farestToMid(corners) {
        let distances = [];
        let midPoint = this.midPoint;
        corners.forEach(function (corner) {
            if (corner !== null) {
                distances.push(Algebra.calcDist(corner, midPoint));
            } else distances.push(null);
        });
        return Math.max(...distances);
    }

    getMatrix(x, y) {
        if (x < 0 || x >= this.matrix[0].length) return 0;
        if (y < 0 || y >= this.matrix.length) return 0;
        return this.matrix[y][x];
    }

}