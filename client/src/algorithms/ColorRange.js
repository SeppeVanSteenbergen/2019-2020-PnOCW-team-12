export default class ColorRange {
  static sensitivity() {
    return 10
  }

  static settings() {
    return {
      red: {
        min: 0,
        max: 40,
        min2: 340,
        max2: 360
      },
      green: {
        min: 80,
        max: 160
      },
      blue: {
        min: 200, //of 200
        max: 270
      },
      blueGreen: {
        min: 160, //value max green
        max: 200 //value min blue
      }
    }
  }

  static checkColorRange(color, H) {
    if (H >= color.min && H <= color.max) {
      return true
    }
    if (color.max2 && H >= color.min2 && H <= color.max2) {
      return true
    }
    return false
  }

  static inBlueRange(H, S, L) {
    return (
      this.checkColorRange(this.settings().blue, H) &&
      S >= 40 &&
      L >= 25 &&
      L <= 75
    )
  }

  static inGreenRange(H, S, L) {
    return (
      this.checkColorRange(this.settings().green, H) &&
      S >= 50 &&
      L >= 25 &&
      L <= 75
    )
  }

  static inRedRange(H, S, L) {
    return (
      this.checkColorRange(this.settings().red, H) &&
      S >= 50 &&
      L >= 25 &&
      L <= 75
    )
  }

  static inBlueGreenRange(H, S, L) {
    return (
      this.checkColorRange(this.settings().blueGreen, H) &&
      S >= 40 &&
      L >= 35 &&
      L <= 60
    )
  }

  static inMaskRange(H, S, L) {
    return (
      this.inGreenRange(H, S, L) ||
      this.inRedRange(H, S, L) ||
      this.inBlueRange(H, S, L)
    )
  }

  static inMidRange(H, S, L) {
    return this.inRedRange(H, S, L)
  }

  static inZeroRange(H, S, L) {
    return L <= 50
  }

  static inOneRange(H, S, L) {
    return S <= 50 && L > 40 && L <= 70
  }

  static inCommaRange(H, S, L) {
    return L > 70
  }

  static inSepRange(H, S, L) {
    return S > 50 && L > 40 && L <= 70
  }
}
