class CornerDetector {
    Constructor(pixels, matrix, id) {
        this.matrix = matrix
        this.pixels = pixels
        this.corners = {}
        this.id = id
        this.height = this.pixels.length
        this.width = this.pixels[0].length
    }

    cornerDetection(id) {
        let tmpCorners = this.findCorners()
        //returns 4 corners in relative position
        this.corners = this.validateCorners(tmpCorners)
        //cleanCorners()
    }

    findCorners() {
        // choosing diagonal or straight corner detection
        let diagonalSearch = false;

        // Find which corner search to use: perpendicular or diagonal.

        const ratio = 0.07;
        const minPixels = 10;
        const sd_threshold = 0.15;

        const testOffsetX = Math.max(Math.floor(ratio * width), minPixels);
        const testOffsetY = Math.max(Math.floor(ratio * height), minPixels);

        // Left variance
        let yValuesLeft = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < testOffsetX; x++) {
                if (this.isFromIsland(x, y)) yValuesLeft.push(y / height);
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
    /*
        let drawer = new Drawer(this.imgOriginal.data, this.imgOriginal.width, this.imgOriginal.height)
        let distances = this.distToMid();
        /////////////////////////////////////////////////////////////////
        let lines = []
        let linesCenter = []
        for (let i = 0; i < corners.length; i++) {
          let reco = Reconstructor.reconstructCircle([corners[i][0] - this.minx, corners[i][1] - this.miny], this.screenMatrix, this.id)
          let recoVal = Object.values(reco)
          for (let j = 0; j < recoVal.length; j++) {
            if (recoVal[j] != null){
              lines.push(new Line([recoVal[j][0] + this.minx, recoVal[j][1] + this.miny], corners[i]))
              //drawer.drawLine(new Line([recoVal[j][0] + this.minx, recoVal[j][1] + this.miny], corners[i]), false)
              drawer.drawPoint(recoVal[j][0] + this.minx, recoVal[j][1] + this.miny, 10)
            }
          }
        }
        let reco = Reconstructor.reconstructCircle([this.midPoint[0] - this.minx, this.midPoint[1] - this.miny], this.screenMatrix, this.id)
        let recoVal = Object.values(reco)
        for (let j = 0; j < recoVal.length; j++) {
          if (recoVal[j] != null){
            linesCenter.push(new Line([recoVal[j][0] + this.minx, recoVal[j][1] + this.miny], this.midPoint))
            drawer.drawPoint(recoVal[j][0] + this.minx, recoVal[j][1] + this.miny, 10)
          }
        }
        for(let i = 0; i < lines.length - 1; i++){
          for(let j = i+1; j < lines.length; j++){
            let intersect = lines[i].calcIntersection(lines[j], this.imgOriginal.width, this.imgOriginal.height)
            if(intersect != null){
              //drawer.drawPoint(intersect[0],intersect[1], 10)
            }
          }
        }
        /////////////////////////////////////////////////////////////////////
        this.recoScreen(distances);
      }
      */
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
                    corners.push([j, i, this.pixels[i][j]]);
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
                        this.pixels[i][this.width - j - 1]
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
                        this.pixels[this.height - i - 1][this.width - j - 1]
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
                        this.pixels[this.height - i - 1][j]
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
                corners.push([x, medianY, this.pixels[medianY][x]]);
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
                corners.push([medianX, y, this.pixels[y][medianX]]);
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
                    this.pixels[medianY][this.width - x - 1]
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
                    this.pixels[height - y - 1][medianX]
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
            if(Reconstructor.reconstructCircle([tmpCorner[0], tmpCorner[1]]).length >= 3)
                validCorners.push(tmpCorner)
        }
        return validCorners
    }

    isFromIsland(x, y, id) {
        let pixel = this.getMatrix(x, y)
        return pixel >= id && pixel <= id + 2;
    }

    getMatrix(x, y) {
        if (x < 0 || x >= this.matrix[0].length) return 0;
        if (y < 0 || y >= this.matrix.length) return 0;
        return this.matrix[y][x];
    }

}