const sensitivity = 20

export default class ColorRange {
  static inBlueRange(H, S, L) {
    return (
      (this.inBlueBoxA1(H, S) ||
        this.inBlueBoxA2(H, S) ||
        this.inBlueBoxA3(H, S)) &&
      (this.inBlueBoxB1(H, L) ||
        this.inBlueBoxB2(H, L) ||
        this.inBlueBoxB3(H, L))
    )
  }

  static inBlueBoxA1(H, S) {
    return H >= 220 && H <= 262 && S >= 90 && S <= 100
  }

  static inBlueBoxA2(H, S) {
    return H >= 234 && H <= 242 && S >= 73 && S <= 90
  }

  static inBlueBoxA3(H, S) {
    return H >= 250 && H <= 255 && S >= 83 && S <= 90
  }

  static inBlueBoxB1(H, L) {
    return H >= 220 && H <= 232 && L >= 45 && L <= 60
  }

  static inBlueBoxB2(H, L) {
    return H >= 232 && H <= 242 && L >= 36 && L <= 64
  }

  static inBlueBoxB3(H, L) {
    return H >= 242 && H <= 262 && L >= 38 && L <= 52
  }

  static inBlueGreenRange(H, S, L) {
    return (
      (this.inBlueGreenBoxA1(H, S) || this.inBlueGreenBoxA2(H, S)) &&
      (this.inBlueGreenBoxB1(H, L) || this.inBlueGreenBoxB2(H, L))
    )
  }

  static inBlueGreenBoxA1(H, S) {
    return (
      H >= 167 - sensitivity &&
      H <= 193 + sensitivity &&
      S >= 40 - sensitivity &&
      S <= 100
    )
  }

  static inBlueGreenBoxA2(H, S) {
    return (
      H >= 193 - sensitivity &&
      H <= 199 + sensitivity &&
      S >= 90 - sensitivity &&
      S <= 100
    )
  }

  static inBlueGreenBoxB1(H, L) {
    return (
      H >= 167 - sensitivity &&
      H <= 194 + sensitivity &&
      L >= 40 - sensitivity &&
      L <= 60 + sensitivity
    )
  }

  static inBlueGreenBoxB2(H, L) {
    return (
      H >= 174 - sensitivity &&
      H <= 199 + sensitivity &&
      L >= 15 + sensitivity &&
      L <= 40
    )
  }

  static inGreenRange(H, S, L) {
    return (
      (this.inGreenBoxA1(H, S) || this.inGreenBoxA2(H, S)) &&
      (this.inGreenBoxB1(H, L) ||
        this.inGreenBoxB2(H, L) ||
        this.inGreenBoxB3(H, L) ||
        this.inGreenBoxB4(H, L))
    )
  }

  static inGreenBoxA1(H, S) {
    return H >= 96 && H <= 123 && S >= 66 && S <= 100
  }

  static inGreenBoxA2(H, S) {
    return H >= 123 && H <= 130 && S >= 66 && S <= 100 && S - 4.8 * H <= -524
  }

  static inGreenBoxB1(H, L) {
    return H >= 96 && H <= 120 && L >= 20 && L <= 40
  }

  static inGreenBoxB2(H, L) {
    return H >= 96 && H <= 120 && L >= 20 && L <= 40 && L + 0.8 * H >= 117
  }

  static inGreenBoxB3(H, L) {
    return H >= 120 && H <= 127 && L >= 40 && L <= 60 && L + 2.8 * H <= 396
  }

  static inGreenBoxB4(H, L) {
    return H >= 120 && H <= 130 && L >= 18 && L <= 40
  }

  static inPinkRange(H, S, L) {
    return (
      (this.inPinkBoxA1(H, S) || this.inPinkBoxA2(H, S)) &&
      (this.inPinkBoxB1(H, L) ||
        this.inPinkBoxB2(H, L) ||
        this.inPinkBoxB3(H, L))
    )
  }

  static inPinkBoxA1(H, S) {
    return (
      H >= 291 - sensitivity &&
      H <= 299 + sensitivity &&
      S >= 94 - sensitivity &&
      S <= 100
    )
  }

  static inPinkBoxA2(H, S) {
    return (
      H >= 299 - sensitivity &&
      H <= 310 + sensitivity &&
      S >= 67 - sensitivity &&
      S <= 100
    )
  }

  static inPinkBoxB1(H, L) {
    return (
      H >= 291 - sensitivity &&
      H <= 300 + sensitivity &&
      L >= 37 - sensitivity &&
      L <= 51 + sensitivity
    )
  }

  static inPinkBoxB2(H, L) {
    return (
      H >= 297 - sensitivity &&
      H <= 300 + sensitivity &&
      L >= 51 - sensitivity &&
      L <= 58 + sensitivity
    )
  }

  static inPinkBoxB3(H, L) {
    return (
      H >= 300 - sensitivity &&
      H <= 310 + sensitivity &&
      L >= 31 - sensitivity &&
      L <= 63 + sensitivity
    )
  }

  static inRedRange(H, S, L) {
    return (
      (this.inRedBoxA1(H, S) || this.inRedBoxA2(H, S)) &&
      (this.inRedBoxB1(H, L) || this.inRedBoxB2(H, L))
    )
  }

  static inRedBoxA1(H, S) {
    return H >= 0 && H <= 25 && S >= 66 && S <= 100
  }

  static inRedBoxA2(H, S) {
    return H >= 355 && H <= 360 && S >= 73 && S <= 100
  }

  static inRedBoxB1(H, L) {
    return H >= 0 && H <= 25 && L >= 37 && L <= 64
  }

  static inRedBoxB2(H, L) {
    return H >= 355 && H <= 360 && L >= 37 && L <= 55
  }

  static inYellowRange(H, S, L) {
    return (
      (this.inYellowBoxA1(H, S) || this.inYellowBoxA2(H, S)) &&
      (this.inYellowBoxB1(H, L) ||
        this.inYellowBoxB2(H, L) ||
        this.inYellowBoxB3(H, L) ||
        this.inYellowBoxB4(H, L))
    )
  }

  static inYellowBoxA1(H, S) {
    return (
      H >= 46 - sensitivity &&
      H <= 54 + sensitivity &&
      S >= 70 - sensitivity &&
      S <= 100
    )
  }

  static inYellowBoxA2(H, S) {
    return (
      H >= 54 - sensitivity &&
      H <= 67 + sensitivity &&
      S >= 60 - sensitivity &&
      S <= 100
    )
  }

  static inYellowBoxB1(H, L) {
    return (
      H >= 47 - sensitivity &&
      H <= 51 + sensitivity &&
      L >= 40 - sensitivity &&
      L <= 56 + sensitivity
    )
  }

  static inYellowBoxB2(H, L) {
    return (
      H >= 46 - sensitivity &&
      H <= 57 + sensitivity &&
      L >= 19 - sensitivity &&
      L <= 40 + sensitivity
    )
  }

  static inYellowBoxB3(H, L) {
    return (
      H >= 51 - sensitivity &&
      H <= 67 + sensitivity &&
      L >= 40 - sensitivity &&
      L <= 52 + sensitivity
    )
  }

  static inYellowBoxB4(H, L) {
    return (
      H >= 57 - sensitivity &&
      H <= 67 + sensitivity &&
      L >= 29 - sensitivity &&
      L <= 40 + sensitivity
    )
  }

  static inWhiteRange(H, S, L) {
    return (
      (this.inWhiteBoxA1(H, S) && this.inWhiteBoxB1(H, L)) ||
      this.inWhiteBoxB2(H, L)
    )
  }

  static inWhiteBoxA1(H, S) {
    return H >= 0 && H <= 360 && S >= 0 && S <= 35
  }

  static inWhiteBoxB1(H, L) {
    return H >= 0 && H <= 360 && L >= 25 && L <= 100
  }

  static inWhiteBoxB2(H, L) {
    return H >= 0 && H <= 360 && L >= 70 && L <= 100
  }

  static inMidRange(H, S, L) {
    return this.inBlueGreenRange(H, S, L)
  }
}
