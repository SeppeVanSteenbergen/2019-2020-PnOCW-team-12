class ColorRange {
  static colors() {
    return {
      red1: 0,
      yellow: 60,
      green: 120,
      blueGreen: 180,
      blue: 240,
      pink: 300,
      red2: 360
    }
  };

  static closestColor(H) {
    let closest = Object.values(this.colors()).reduce(function(prev, curr) {
      return (Math.abs(curr - H) < Math.abs(prev - H) ? curr : prev);
    });
    return Object.keys(this.colors()).find(key => this.colors()[key] === closest);
  }

  static colorDetected(color, H, S, L) {
    if (L <= 10) {
      return color === "black";
    } else if (L >= 90) {
      return color === "white";
    }
    
    return this.closestColor(H).includes(color);
  }

  static colorDetectedOld(color, H, S, L) {
    if (color === "blue") {
      return this.inBlueRange(H, S, L);
    } else if (color === "blueGreen") {
      return this.inBlueGreenRange(H, S, L);
    } else if (color === "green") {
      return this.inGreenRange(H, S, L);
    } else if (color === "pink") {
      return this.inPinkRange(H, S, L);
    } else if (color === "red") {
      return this.inRedRange(H, S, L);
    } else if (color === "white") {
      return this.inWhiteRange(H, S, L);
    } else if (color === "yellow") {
      return this.inYellowRange(H, S, L);
    }
  }

  static inBlueRange(H, S, L) {
    return (
      (
        this.inBlueBoxA1(H, S) ||
        this.inBlueBoxA2(H, S) ||
        this.inBlueBoxA3(H, S)
      ) &&
      (
        this.inBlueBoxB1(H, L) ||
        this.inBlueBoxB2(H, L) ||
        this.inBlueBoxB3(H, L)
      )
    );
  }

  static inBlueBoxA1(H, S) {
    return (
      H >= 220 &&
      H <= 262 &&
      S >= 90 &&
      S <= 100
    );
  }

  static inBlueBoxA2(H, S) {
    return (
      H >= 234 &&
      H <= 242 &&
      S >= 73 &&
      S <= 90
    );
  }

  static inBlueBoxA3(H, S) {
    return (
      H >= 250 &&
      H <= 255 &&
      S >= 83 &&
      S <= 90
    );
  }

  static inBlueBoxB1(H, L) {
    return (
      H >= 220 &&
      H <= 232 &&
      L >= 45 &&
      L <= 60
    );
  }

  static inBlueBoxB2(H, L) {
    return (
      H >= 232 &&
      H <= 242 &&
      L >= 36 &&
      L <= 64
    );
  }

  static inBlueBoxB3(H, L) {
    return (
      H >= 242 &&
      H <= 262 &&
      L >= 38 &&
      L <= 52
    );
  }

  static inBlueGreenRange(H, S, L) {
    return (
      (
        this.inBlueGreenBoxA1(H, S) ||
        this.inBlueGreenBoxA2(H, S)
      ) &&
      (
        this.inBlueGreenBoxB1(H, L) ||
        this.inBlueGreenBoxB2(H, L)
      )
    );
  }

  static inBlueGreenBoxA1(H, S) {
    return (
      H >= 167 &&
      H <= 193 &&
      S >= 40 &&
      S <= 100
    );
  }

  static inBlueGreenBoxA2(H, S) {
    return (
      H >= 193 &&
      H <= 199 &&
      S >= 90 &&
      S <= 100
    );
  }

  static inBlueGreenBoxB1(H, L) {
    return (
      H >= 167 &&
      H <= 194 &&
      L >= 40 &&
      L <= 60
    );
  }

  static inBlueGreenBoxB2(H, L) {
    return (
      H >= 174 &&
      H <= 199 &&
      L >= 15 &&
      L <= 40
    );
  }

  static inGreenRange(H, S, L) {
    return (
      (
        this.inGreenBoxA1(H, S) ||
        this.inGreenBoxA2(H, S)
      ) &&
      (
        this.inGreenBoxB1(H, L) ||
        this.inGreenBoxB2(H, L) ||
        this.inGreenBoxB3(H, L) ||
        this.inGreenBoxB4(H, L)
      )
    );
  }

  static inGreenBoxA1(H, S) {
    return (
      H >= 96 &&
      H <= 123 &&
      S >= 66 &&
      S <= 100
    );
  }

  static inGreenBoxA2(H, S) {
    return (
      H >= 123 &&
      H <= 130 &&
      S >= 66 &&
      S <= 100 &&
      S - 4.8 * H <= -524
    );
  }

  static inGreenBoxB1(H, L) {
    return (
      H >= 96 &&
      H <= 120 &&
      L >= 20 &&
      L <= 40
    );
  }

  static inGreenBoxB2(H, L) {
    return (
      H >= 96 &&
      H <= 120 &&
      L >= 20 &&
      L <= 40 &&
      L + 0.8 * H >= 117
    );
  }

  static inGreenBoxB3(H, L) {
    return (
      H >= 120 &&
      H <= 127 &&
      L >= 40 &&
      L <= 60 &&
      L + 2.8 * H <= 396
    );
  }

  static inGreenBoxB4(H, L) {
    return (
      H >= 120 &&
      H <= 130 &&
      L >= 18 &&
      L <= 40
    );
  }

  static inPinkRange(H, S, L) {
    return (
      (
        this.inPinkBoxA1(H, S) ||
        this.inPinkBoxA2(H, S)
      ) &&
      (
        this.inPinkBoxB1(H, L) ||
        this.inPinkBoxB2(H, L) ||
        this.inPinkBoxB3(H, L)
      )
    );
  }

  static inPinkBoxA1(H, S) {
    return (
      H >= 291 &&
      H <= 299 &&
      S >= 94  &&
      S <= 100
    );
  }

  static inPinkBoxA2(H, S) {
    return (
      H >= 299 &&
      H <= 310 &&
      S >= 67 &&
      S <= 100
    );
  }

  static inPinkBoxB1(H, L) {
    return (
      H >= 291 &&
      H <= 300 &&
      L >= 37 &&
      L <= 51
    );
  }

  static inPinkBoxB2(H, L) {
    return (
      H >= 297 &&
      H <= 300 &&
      L >= 51 &&
      L <= 58
    );
  }

  static inPinkBoxB3(H, L) {
    return (
      H >= 300 &&
      H <= 310 &&
      L >= 31 &&
      L <= 63
    );
  }

  static inRedRange(H, S, L) {
    return (
      (
        this.inRedBoxA1(H, S) ||
        this.inRedBoxA2(H, S)
      ) &&
      (
        this.inRedBoxB1(H, L) ||
        this.inRedBoxB2(H, L)
      )
    );
  }

  static inRedBoxA1(H, S) {
    return (
      H >= 0 &&
      H <= 25 &&
      S >= 66 &&
      S <= 100
    );
  }

  static inRedBoxA2(H, S) {
    return (
      H >= 355 &&
      H <= 360 &&
      S >= 73 &&
      S <= 100
    );
  }

  static inRedBoxB1(H, L) {
    return (
      H >= 0 &&
      H <= 25 &&
      L >= 37 &&
      L <= 64
    );
  }

  static inRedBoxB2(H, L) {
    return (
      H >= 355 &&
      H <= 360 &&
      L >= 37 &&
      L <= 55
    );
  }

  static inYellowRange(H, S, L) {
    return (
      (
        this.inYellowBoxA1(H, S) ||
        this.inYellowBoxA2(H, S)
      ) &&
      (
        this.inYellowBoxB1(H, L) ||
        this.inYellowBoxB2(H, L) ||
        this.inYellowBoxB3(H, L) ||
        this.inYellowBoxB4(H, L)
      )
    );
  }

  static inYellowBoxA1(H, S) {
    return (
      H >= 46 &&
      H <= 54  &&
      S >= 70  &&
      S <= 100
    );
  }

  static inYellowBoxA2(H, S) {
    return (
      H >= 54 &&
      H <= 67 &&
      S >= 60 &&
      S <= 100
    );
  }

  static inYellowBoxB1(H, L) {
    return (
      H >= 47 &&
      H <= 51 &&
      L >= 40 &&
      L <= 56
    );
  }

  static inYellowBoxB2(H, L) {
    return (
      H >= 46 &&
      H <= 57 &&
      L >= 19 &&
      L <= 40
    );
  }

  static inYellowBoxB3(H, L) {
    return (
      H >= 51 &&
      H <= 67 &&
      L >= 40 &&
      L <= 52
    );
  }

  static inYellowBoxB4(H, L) {
    return (
      H >= 57 &&
      H <= 67 &&
      L >= 29 &&
      L <= 40
    );
  }

  static inWhiteRange(H, S, L) {
    return (
      (
        this.inWhiteBoxA1(H, S) &&
        this.inWhiteBoxB1(H, L)
      ) ||
      (
        this.inWhiteBoxB2(H, L)
      )
    );
  }

  static inWhiteBoxA1(H, S) {
    return (
      H >= 0 &&
      H <= 360 &&
      S >= 0 &&
      S <= 35
    );
  }

  static inWhiteBoxB1(H, L) {
    return (
      H >= 0 &&
      H <= 360 &&
      L >= 25 &&
      L <= 100
    );
  }

  static inWhiteBoxB2(H, L) {
    return (
      H >= 0 &&
      H <= 360 &&
      L >= 70 &&
      L <= 100
    );
  }

  //TODO: black range opstellen!
  static inBlackRange(H, S, L){
    return false
  }

  static inMidRange(H, S, L){
    return this.inBlueGreenRange(H,S,L)
  }

}