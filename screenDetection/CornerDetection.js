class CornerDetection {
    static cornerDetection(pixels, id) {
        let width = pixels[0].length
        let height = pixels.length
        let corners = this.findCorners(pixels, id)
        let validCorners = this.validateCorners(corners, pixels, id)
        //cleanCorners()

        //returns 4 corners in relative position
        return corners
    }

    static findCorners(pixels, id) {
        let height = pixels.length
        let width = pixels[0].length
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
                if (this.isFromIsland(x, y, pixels, id)) yValuesLeft.push(y / height);
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
            corners = this.diagonalSearch(pixels, id)

        } else {
            // Perpendicular search
            corners = this.perpendicularSearch(pixels, id)
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

    static diagonalSearch(pixels, id) {
        let height = pixels.length
        let width = pixels[0].length
        let corners = []
        // left upper corner
        for (let k = 0; k <= width + height - 2; k++) {
            let found = false;
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (
                    i < height &&
                    j < width &&
                    this.isFromIsland(j, i, pixels, id)
                ) {
                    corners.push([j, i, pixels[i][j]]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        // right upper corner
        for (let k = 0; k <= width + height - 2; k++) {
            let found = false;
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (
                    i < height &&
                    j < width &&
                    this.isFromIsland(width - j - 1, i, pixels, id)
                ) {
                    corners.push([
                        width - j - 1,
                        i,
                        pixels[i][width - j - 1]
                    ]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        // right lower corner
        for (let k = 0; k <= width + height - 2; k++) {
            let found = false;
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (
                    i < height &&
                    j < width &&
                    this.isFromIsland(width - j - 1, height - i - 1, pixels, id)
                ) {
                    corners.push([
                        width - j - 1,
                        height - i - 1,
                        pixels[height - i - 1][width - j - 1]
                    ]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        // left lower corner
        for (let k = 0; k <= width + height - 2; k++) {
            let found = false;
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (
                    i < height &&
                    j < width &&
                    this.isFromIsland(j, height - i - 1, pixels, id)
                ) {
                    corners.push([
                        j,
                        height - i - 1,
                        pixels[height - i - 1][j]
                    ]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        return corners
    }

    static perpendicularSearch(pixels, id) {
        let height = pixels.length
        let width = pixels[0].length
        let corners = []
        // left
        for (let x = 0; x < width; x++) {
            let found = false;
            let tempY = [];
            for (let y = 0; y < height; y++) {
                if (this.isFromIsland(x, y, pixels, id)) {
                    tempY.push(y);
                    found = true;
                }
            }
            if (found) {
                let medianY = tempY[Math.floor(tempY.length / 2)];
                corners.push([x, medianY, pixels[medianY][x]]);
                break;
            }
        }

        // top
        for (let y = 0; y < height; y++) {
            let found = false;
            let tempX = [];
            for (let x = 0; x < width; x++) {
                if (this.isFromIsland(x, y, pixels, id)) {
                    tempX.push(x);
                    found = true;
                }
            }
            if (found) {
                let medianX = tempX[Math.floor(tempX.length / 2)];
                corners.push([medianX, y, pixels[y][medianX]]);
                break;
            }
        }

        // right
        for (let x = 0; x < width; x++) {
            let found = false;
            let tempY = [];
            for (let y = 0; y < height; y++) {
                if (this.isFromIsland(width - x - 1, y, pixels, id)) {
                    tempY.push(y);
                    found = true;
                }
            }
            if (found) {
                let medianY = tempY[Math.floor(tempY.length / 2)];
                corners.push([
                    width - x - 1,
                    medianY,
                    pixels[medianY][width - x - 1]
                ]);
                break;
            }
        }
        // bottom
        for (let y = 0; y < height; y++) {
            let found = false;
            let tempX = [];
            for (let x = 0; x < width; x++) {
                if (this.isFromIsland(x, height - y - 1, pixels, id)) {
                    tempX.push(x);
                    found = true;
                }
            }
            if (found) {
                let medianX = tempX[Math.floor(tempX.length / 2)];
                corners.push([
                    medianX,
                    height - y - 1,
                    pixels[height - y - 1][medianX]
                ]);
                break;
            }
        }
        return corners
    }

    static cleanCorners(corners, radius) {
        let L = corners[0];
        let T = corners[1];
        let R = corners[2];
        let B = corners[3];

        if (Island.calcDist(L, T) <= radius) {
            if (Island.calcDist(R, B) <= radius) {
                console.error('Bad picture!');
            } else {
                // corners.splice(0, 2);
                // corners.splice(0, 0, [(L[0] + T[0]) / 2, (L[1] + T[1]) / 2, L[2]]);
                this.corners.LU = [(L[0] + T[0]) / 2, (L[1] + T[1]) / 2, L[2]];

                if (R[1] >= this.midPoint[1]) {
                    this.corners.RD = R;
                    this.corners.LD = B;
                } else {
                    this.corners.RU = R;

                    if (B[0] >= this.midPoint[0]) {
                        this.corners.RD = B;
                    } else this.corners.LD = B;
                }
            }
        } else if (Island.calcDist(T, R) <= radius) {
            if (Island.calcDist(L, B) <= radius) {
                console.error('Bad picture!');
            } else {
                // corners.splice(1, 2);
                // corners.splice(1, 0, [(T[0] + R[0]) / 2, (T[1] + R[1]) / 2, T[2]]);
                this.corners.RU = [(T[0] + R[0]) / 2, (T[1] + R[1]) / 2, T[2]];

                if (L[1] >= this.midPoint[1]) {
                    this.corners.LD = L;
                    this.corners.RD = B;
                } else {
                    this.corners.LU = L;

                    if (B[0] >= this.midPoint[0]) {
                        this.corners.RD = B;
                    } else this.corners.LD = B;
                }
            }
        } else if (Island.calcDist(R, B) <= radius) {
            // corners.splice(2, 2);
            // corners.splice(2, 0, [(R[0] + B[0]) / 2, (R[1] + B[1]) / 2, R[2]]);
            this.corners.RD = [(R[0] + B[0]) / 2, (R[1] + B[1]) / 2, R[2]];

            if (L[1] <= this.midPoint[1]) {
                this.corners.LU = L;
                this.corners.RU = T;
            } else {
                this.corners.LD = L;

                if (T[0] <= this.midPoint[0]) {
                    this.corners.LU = T;
                } else this.corners.RU = T;
            }
        } else if (Island.calcDist(L, B) <= radius) {
            // corners.shift();
            // corners.pop();
            // corners.push([(L[0] + B[0]) / 2, (L[1] + B[1]) / 2, L[2]]);
            this.corners.LD = [(L[0] + B[0]) / 2, (L[1] + B[1]) / 2, L[2]];

            if (R[1] <= this.midPoint[1]) {
                this.corners.RU = R;
                this.corners.LU = T;
            } else {
                this.corners.RD = R;

                if (T[0] <= this.midPoint[0]) {
                    this.corners.LU = T;
                } else this.corners.RU = T;
            }
        } else {
            if (T[0] >= this.midPoint[0]) {
                this.corners.LU = L;
                this.corners.RU = T;
                this.corners.RD = R;
                this.corners.LD = B;
            } else {
                this.corners.LU = T;
                this.corners.RU = R;
                this.corners.RD = B;
                this.corners.LD = L;
            }
        }
    }

    static validateCorners(corners, pixels, id){
        let validCorners = []
        for(let c = 0; c < corners.length; c++){
            let corner = corners[c]
            if(Reconstructor.reconstruct([corner[0], corner[1]], pixels, id).length >= 3)
                validCorners.push(corner)
        }
        return validCorners
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