class ColorRange {
  static colors() {
    return {
      red1: 0,
      yellow: 60,
      green: 120,
      blueGreen: 180,
      blue: 240,
      purple: 300,
      red2: 360
    }
  }

  static closestColor(H, S, L) {
    if (S <= 30) return 'grey'
    if (L <= 20) return 'black'
    if (L >= 90) return 'white'
    let closest = Object.values(this.colors()).reduce(function(prev, curr) {
      return Math.abs(curr - H) < Math.abs(prev - H) ? curr : prev
    })
    return Object.keys(this.colors()).find(
      key => this.colors()[key] === closest
    )
  }

  static checkColor(H, S, L, color) {
    return this.closestColor(H, S, L).includes(color)
  }
}
