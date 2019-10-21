class Screen {
    corners;
    orientation;
    size;
    constructor(corners, orientation) {
        this.corners = corners;
        this.orientation = orientation;
        var area = 0;
        console.log(corners);
        for(let i = 0; i < corners.length - 1; i++){
            area += (corners[i][0] * corners[i + 1][1] *0.5)
            area -=  (corners[i+ 1][0] * corners[i][1]*0.5)
        }
        area += (corners[3][0] * corners[0][1] *0.5)
        area -=  (corners[0][0] * corners[3][1]*0.5)
        this.size = Math.abs(area);
    }

    orientationMatrix(){
        return [[Math.cos(this.orientation), -Math.sin(this.orientation)],
        [Math.sin(this.orientation), Math.cos(this.orientation)]];
    }
}
