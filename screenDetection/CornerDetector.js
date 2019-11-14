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
    }

    cornerDetection() {
        let tmpCorners = this.findCorners()
        //returns 4 corners in relative position
        let nonPositionCorners = this.validateCorners(tmpCorners)
        this.positionCorners(nonPositionCorners)
        if (nonPositionCorners.length < 4)
            this.reconstructCorners()
    }

    reconstructCorners(missingCornersCount) {
        for (let i = 0; i < missingCornersCount; i++) {
            let helpPoint
            let helpCorner
            //missing LU
            if (this.corners.LU == null) {
                if (this.corners.RU != null) {
                    helpPoint = this.mostLeftPoint(Reconstructor.reconstructCircle(this.corners.RU), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.RU
                } else if (this.corners.LD != null) {
                    helpPoint = this.mostUpPoint(Reconstructor.reconstructCircle(this.corners.LD), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.LD
                }
            }
            //missing RU
            else if (this.corners.RU == null) {
                if (this.corners.LU != null) {
                    helpPoint = this.mostRightPoint(Reconstructor.reconstructCircle(this.corners.LU), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.LU
                } else if (this.corners.RD != null) {
                    helpPoint = this.mostUpPoint(Reconstructor.reconstructCircle(this.corners.RD), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.RD
                }
            }
            //missing RD
            else if (this.corners.RD == null) {
                if (this.corners.RU != null) {
                    helpPoint = this.mostDownPoint(Reconstructor.reconstructCircle(this.corners.RU), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.RU
                } else if (this.corners.LD != null) {
                    helpPoint = this.mostRightPoint(Reconstructor.reconstructCircle(this.corners.LD), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.LD
                }
            }
            //missing LD
            else if (this.corners.LD == null) {
                if (this.corners.RD != null) {
                    helpPoint = this.mostLeftPoint(Reconstructor.reconstructCircle(this.corners.RD), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.RD
                } else if (this.corners.LU != null) {
                    helpPoint = this.mostDownPoint(Reconstructor.reconstructCircle(this.corners.LU), this.matrix, this.id, this.radius)
                    helpCorner = this.corners.LU
                }
            }
        }
    }

    mostRightPoint(pointList) {
        pointList.sort(function (a, b) { return b[0] - a[0] })
        return pointList[0]
    }

    mostLeftPoint(pointList) {
        pointList.sort(function (a, b) { return a[0] - b[0] })
        return pointList[0]
    }
    mostUpPoint(pointList) {
        pointList.sort(function (a, b) { return a[1] - b[1] })
        return pointList[0]
    }
    mostDownPoint(pointList) {
        pointList.sort(function (a, b) { return b[1] - a[1] })
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
            let radius = this.calcRadius(this.radiusFactor)
            if (Reconstructor.reconstructCircle([tmpCorner[0], tmpCorner[1]], this.id, radius).length >= 3)
                validCorners.push(tmpCorner)
        }
        return validCorners
    }

    isFromIsland(x, y) {
        let pixel = this.getMatrix(x, y)
        return pixel >= this.id && pixel <= this.id + 2;
    }

    calcRadius(factor) {
        this.corners.forEach(function (corner) {
            if (corner !== null) {
                let distance = Algebra.calcDist(corner, this.midPoint)
                return distance * factor
            }
        })
    }

    getMatrix(x, y) {
        if (x < 0 || x >= this.matrix[0].length) return 0;
        if (y < 0 || y >= this.matrix.length) return 0;
        return this.matrix[y][x];
    }

}