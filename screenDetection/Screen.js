class Screen {
    constructor(size, position, orientation) {
        this.size = size;
        this.position = position;
        this.orientation = orientation;
    }

    get size() {
        return this.size;
    }

    get position() {
        return this.position;
    }

    get orientation() {
        return this.orientation;
    }

    set size(size) {
        this.size = size;
    }

    set position(position) {
        this.position = position;
    }

    set orientation(orientation) {
        this.orientation = orientation;
    }
}
