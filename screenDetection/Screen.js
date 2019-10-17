class Screen {
    corners;
    orientation;
    constructor(corners, orientation) {
        this.corners = position;
        this.orientation = orientation;
    }

    orientationMatrix(){
        return [[Math.cos(this.orientation), -Math.sin(this.orientation)],
        [Math.sin(this.orientation), Math.cos(this.orientation)]];
    }
}
