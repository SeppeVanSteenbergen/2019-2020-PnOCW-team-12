class Iterator {
    constructor(LU, RU, width, height) {
        if (LU[0] < RU[0]) {
            this.leftPoint = LU
            this.rightPoint = RU
          } else {
            this.leftPoint = RU
            this.rightPoint = LU
          }
        
        this.width = width
        this.height = height

        this.a = (his.rightPoint[1] - this.leftPoint[1]) /
        (this.rightPoint[0] - this.leftPoint[0])

        if (this.a >= 0) {
            this.y = 0
        } else {
            this.y = this.height
        }
        this.x = -1

        this.hasNext = true
    }

    hasNext() {
        return this.hasNext
    }

    next() {
        this.x++

        if (this.x === 0) {
            if (this.a >= 0) {
                this.y++
            } else {
                this.y--
            }
            this.b = this.y - this.a * this.x
            

            if (this.y > this.height) {
                this.y = this.height
                if (this.a > 0) {

                }
                this.hasNext = false
            }

            

        } else {
            this.y = Math.round(this.a * this.x + this.b)

            if (this.y > this.height || this.y < 0 || this.x > this.width) {
                this.x = -1
                this.y = Math.round(this.a * this.x + this.b)
                this.next()
            }
        }
    }
}