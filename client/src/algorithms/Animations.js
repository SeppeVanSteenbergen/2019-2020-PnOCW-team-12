export default class Animations{
    constructor(canvas){
        this.width = canvas.width
        this.height = canvas.height
        this.ctx = canvas.getContext("2d")
        this.position = {x: 0, y: 0}

        this.radius = 5
        this.fillStyle = "red"
    }

    setPosition(x, y){
        if(x > 0 && x < this.width)
            this.position.x = x
        if(y > 0 && y < this.height)
            this.position.y = y
    }

    getPosition(){
        return [this.position.x, this.position.y]
    }

    goHorizontal(dx){
        this.setPosition(this.position.x + dx, this.position.y)
        return this.getPosition()
    }
    
    goVertical(dy){
        this.setPosition(this.position.x, this.position.y + dy)
        return this.getPosition()
    }

    go(dx, dy){
        this.goVertical(dy)
        this.goHorizontal(dx)
        return this.getPosition()
    }

    drawImage(){
        this.updateFrame()
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.beginPath()
        this.ctx.fillStyle = this.fillStyle
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    updateFrame() {
        let step = 1
        let signDx = Math.pow(-1, Math.floor(Math.random()*2) + 1)
        let signDy = Math.pow(-1, Math.floor(Math.random()*2) + 1)
        let dx = Math.random() * step * signDx
        let dy = Math.random() * step * signDy
        this.go(dx, dy)
    }

}