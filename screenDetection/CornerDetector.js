class CornerDetector {

    constructor(screenMatrix, midPoint, id) {
        this.matrix = screenMatrix
        this.midPoint = midPoint
        this.id = id
        this.corners = {
            LU: null,
            RU: null,
            RD: null,
            LD: null
        };
        this.height = this.matrix.length
        this.width = this.matrix[0].length
        this.radiusFactor = 0.25;
        this.radius = 0 //will be set later
    }

    cornerDetection() {
        let tmpCorners = this.findCorners()
        this.radius = this.calcRadius(this.radiusFactor,tmpCorners)
        //returns 4 corners in relative position
        let nonPositionCorners = this.validateCorners(tmpCorners)
        this.positionCorners(nonPositionCorners)
        if (nonPositionCorners.length < 4)
            this.reconstructCorners()
    }

    reconstructCorners(missingCornersCount) {
        let missingPoints = []
        for (let i = 0; i < missingCornersCount; i++) {
            let helpPoint
            let helpCorner
            let helpMid
            //missing LU
            if (this.corners.LU == null) {
                helpMid = this.LeftUpPoint(Reconstructor.reconstructCircleMidPoint(this.corners.RU, this.matrix, this.id, this.radius))
                if (this.corners.RU != null) {
                    helpPoint = this.LeftUpPoint(Reconstructor.reconstructCircle(this.corners.RU, this.matrix, this.id, this.radius))
                    helpCorner = this.corners.RU
                } else if (this.corners.LD != null) {
                    helpPoint = this.LeftUpPoint(Reconstructor.reconstructCircle(this.mid, this.matrix, this.id, this.radius))
                    helpCorner = this.corners.LD
                }
            }
            //missing RU
            else if (this.corners.RU == null) {
                helpMid = this.RightUpPoint(Reconstructor.reconstructCircleMidPoint(this.corners.RU, this.matrix, this.id, this.radius))
                if (this.corners.LU != null) {
                    helpPoint = this.RightUpPoint(Reconstructor.reconstructCircle(this.corners.LU, this.matrix, this.id, this.radius))
                    helpCorner = this.corners.LU
                } else if (this.corners.RD != null) {
                    helpPoint = this.RightUpPoint(Reconstructor.reconstructCircle(this.corners.RD, this.matrix, this.id, this.radius))
                    helpCorner = this.corners.RD
                }
            }
            //missing RD
            else if (this.corners.RD == null) {
                helpMid = this.RightDownPoint(Reconstructor.reconstructCircleMidPoint(this.corners.RU, this.matrix, this.id, this.radius))
                if (this.corners.RU != null) {
                    helpPoint = this.RightDownPoint(Reconstructor.reconstructCircle(this.corners.RU, this.matrix, this.id, this.radius))
                    helpCorner = this.corners.RU
                } else if (this.corners.LD != null) {
                    helpPoint = this.RightDownPoint(Reconstructor.reconstructCircle(this.corners.LD, this.matrix, this.id, this.radius))
                    helpCorner = this.corners.LD
                }
            }
            //missing LD
            else if (this.corners.LD == null) {
                helpMid = this.LeftDownPoint(Reconstructor.reconstructCircleMidPoint(this.corners.RU, this.matrix, this.id, this.radius))
                if (this.corners.RD != null) {
                    helpPoint = this.LeftDownPoint(Reconstructor.reconstructCircle(this.corners.RD), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.RD
                } else if (this.corners.LU != null) {
                    helpPoint = this.LeftDownPoint(Reconstructor.reconstructCircle(this.corners.LU), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.LU
                }
            }
            let helpLine1 = new Line(helpPoint, helpCorner) 
            let helpLine2 = new Line(this.midPoint, helpMid)
            missingPoints.push(helpLine1.calcIntersection(helpLine2, this.width, this.height))
        }
        this.positionCorners(missingPoints)
    }

    LeftUpPoint(pointList) {
        pointList.sort(function(a, b){if(a[0]-b[0] == 0){return a[1]-b[1]} return a[0] - b[0]})
        return pointList[0]
    }

    RightUpPoint(pointList) {
        pointList.sort(function(a, b){if(a[0]-b[0] == 0){return a[1]-b[1]} return b[0] - a[0]})
        return pointList[0]
    }
    LeftDownPoint(pointList) {
        pointList.sort(function(a, b){if(a[0]-b[0] == 0){return b[1]-a[1]} return a[0] - b[0]})
        return pointList[0]
    }
    RightDownPoint(pointList) {
        pointList.sort(function(a, b){if(a[0]-b[0] == 0){return b[1]-a[1]} return b[0] - a[0]})
        return pointList[0]
    }


    positionCorners(nPCorners) {
        for (let i = 0; i < nPCorners.length; i++) {
            if (npCorners[i][0] < this.midPoint[0] && npCorners[i][1] < this.midPoint[0])
                this.corners.LU = npCorners[i]
            else if (npCorners[i][0] < this.midPoint[0] && npCorners[i][1] > this.midPoint[0])
                this.corners.LD = npCorners[i]
            else if (npCorners[i][0] > this.midPoint[0] && npCorners[i][1] < this.midPoint[0])
                this.corners.RU = npCorners[i]
            else if (npCorners[i][0] > this.midPoint[0] && npCorners[i][1] > this.midPoint[0])
                this.corners.RD = npCorners[i]
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
        let corners = []
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
        let corners = []
        // left
        for (let x = 0; x < this.width; x++) {
            let found = false;
            let tempY = [];
            for (let y = 0; y < height; y++) {
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
                    this.matrix[height - y - 1][medianX]
                ]);
                break;
            }
        }
        return corners
    }

    validateCorners(tmpCorners) {
        let validCorners = []
        for (let c = 0; c < tmpCorners.length; c++) {
            let tmpCorner = tmpCorners[c]
            if(Reconstructor.reconstructCircle([tmpCorner[0], tmpCorner[1]],this.matrix, this.id, this.radius).length >= 3)
                validCorners.push(tmpCorner)
        }
        return validCorners
    }

    isFromIsland(x, y) {
        let pixel = this.getMatrix(x, y)
        return pixel >= this.id && pixel <= this.id + 2;
    }

    //calculates it based on the point with the longest distance from the temporary corners to the midpoint.
    calcRadius(factor, corners) {
        let distance = this.farestToMid(corners)
        return Math.floor(distance*factor)
    }

    farestToMid(corners) {
        let distances = [];
        let midPoint = this.midPoint
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