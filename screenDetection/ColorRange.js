class ColorRange {
    static sensitivity(){return 30}

    static lowerBoundMid(){return {H: 180 - this.sensitivity(), S: 50, L: 25}}
    static upperBoundMid(){return {H: 180 + this.sensitivity(), S: 100, L: 75}}
    
    static lowerBoundG(){return {H: 230 - this.sensitivity(), S: 50, L: 25}}
    static upperBoundG(){return {H: 230 + this.sensitivity(), S: 100, L: 75}}

    static lowerBoundB(){return {H: 120 - this.sensitivity(), S: 50, L: 25}}
    static upperBoundB(){return {H: 120 + this.sensitivity(), S: 100, L: 75}}


    static inMidRange(H, S, L) {
        return (
          H >= this.lowerBoundMid().H &&
          S >= this.lowerBoundMid().S &&
          L >= this.lowerBoundMid().L &&
          H <= this.upperBoundMid().H &&
          S <= this.upperBoundMid().S &&
          L <= this.upperBoundMid().L
        );
      }

      static inGreenRange(H, S, L) {
        return (
          H >= this.lowerBoundG().H &&
          S >= this.lowerBoundG().S &&
          L >= this.lowerBoundG().L &&
          H <= this.upperBoundG().H &&
          S <= this.upperBoundG().S &&
          L <= this.upperBoundG().L
        );
      }

      static inBlueRange(H, S, L) {
        return (
          H >= this.lowerBoundB().H &&
          S >= this.lowerBoundB().S &&
          L >= this.lowerBoundB().L &&
          H <= this.upperBoundB().H &&
          S <= this.upperBoundB().S &&
          L <= this.upperBoundB().L
        );
      }
}