class CornerDetection{
    static findCorners() {
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
            if (this.screenMatrix[y][x] !== 0) yValuesLeft.push(y / this.height);
          }
        }
        let yValuesLeftAvg =
          yValuesLeft.reduce((t, n) => t + n) / yValuesLeft.length;
    
        let yValuesLeftVariance = Math.sqrt(
          yValuesLeft.reduce((t, n) => t + Math.pow(yValuesLeftAvg - n, 2)) /
          yValuesLeft.length
        );
    
        //console.log('Left Variance: ' + yValuesLeftVariance);
        //console.log(yValuesLeftVariance > 0.15 ? 'Straight' : 'Inclined');
    
        if (yValuesLeftVariance > sd_threshold) diagonalSearch = true;
    
        let corners = [];
        if (diagonalSearch) {
          // Diagonal search
          corners = this.diagonalSearch()
    
        } else {
          // Perpendicular search
          corners = this.perpendicularSearch()
        }
    
        // corners to absolute position
        for (let i = 0; i < corners.length; i++) {
          corners[i][0] += this.minx;
          corners[i][1] += this.miny;
        }
    
        this.cleanCorners(corners, 30); // TODO shouldn't be hardcoded
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
      
      static cornerDetection{
          
      }
}