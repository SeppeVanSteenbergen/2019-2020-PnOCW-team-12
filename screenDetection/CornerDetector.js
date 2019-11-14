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
        if(nonPositionCorners.length < 4)
            this.reconstructCorners()
    }
    
    reconstructCorners(){
        
    }

    positionCorners(nPCorners){
        for(let i = 0; i < nPCorners.length; i++){
            if(npCorners[i][0] < this.midPoint[0] && npCorners[i][1] < this.midPoint[0]) 
                this.corners.LU = npCorners[i]
            else if(npCorners[i][0] < this.midPoint[0] && npCorners[i][1] > this.midPoint[0]) 
                this.corners.LD = npCorners[i]
            else if (npCorners[i][0] > this.midPoint[0] && npCorners[i][1] < this.midPoint[0]) 
                this.corners.RU = npCorners[i]
            else if(npCorners[i][0] > this.midPoint[0] && npCorners[i][1] > this.midPoint[0]) 
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

    validateCorners(tmpCorners){
        let validCorners = []
        for(let c = 0; c < tmpCorners.length; c++){
            let tmpCorner = tmpCorners[c]
            let radius = this.calcRadius(this.radiusFactor)
            if(Reconstructor.reconstructCircle([tmpCorner[0], tmpCorner[1]], this.id, radius).length >= 3)
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