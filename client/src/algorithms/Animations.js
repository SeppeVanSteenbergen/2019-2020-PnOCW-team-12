import Triangle from './Triangle'
import Delaunay from './Delaunay'
import Line from './Line'

export default class Animations{
    constructor(canvas){
        this.width = canvas.width
        this.height = canvas.height
        this.ctx = canvas.getContext("2d")
        this.position = {x: 0, y: 0}
        this.radius = 5
        this.fillStyle = "red"
        this.range = 5
        this.firstPoint
        this.endPoint
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

    setDelaunay(delaunay){
        this.delaunay = delaunay
    }

    drawImage(triangulation){
        this.updateFrameTriangulation(triangulation)
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
        this.dx = Math.random() * step * signDx
        this.dy = Math.random() * step * signDy
        this.go(dx, dy)
    }

    updateFrameTriangulation(triangulation){
        if(!this.inRange(this.endPoint)){
            this.go(this.dx, this.dy)
        }
        else {
            let newNeighbours = this.findNeighbours(this.endPoint, triangulation)
            let random = Math.floor(Math.random()*newNeighbours.length)
            let newNeighbour = newNeighbours[random]
            this.setPosition(endPoint[0], endPoint[1])
            this.setDirection(endpoint, newNeighbour)
            this.firstPoint = this.endPoint.slice()
            this.endPoint = newNeighbour
        }
    }

    inRange(endPoint){
        
        return (Math.pow(endPoint[0] - this.position.x,2) + Math.pow(endPoint[1] - this.position.y,2) < Math.pow(this.range,2))
    }

    setDirection(beginPoint, endPoint){
        let line = new Line(beginPoint, endPoint)
        this.dx = line.dx / Math.abs(line.dx)
        this.dy = line.slope
    }


    findNeighbours(point, triangulation){
        let neighbours = []
        for(let tri = 0; tri < triangulation.length; tri++){
            if(triangulation[tri].getPoints().includes(point)){
                for(let i = 0; i < 3; i++){
                    if(point !== triangulation[tri].getPoints()[i]){
                        neighbours.push(triangulation[tri].getPoints()[i])
                    }
                }
            }
        }
        return neighbours
    }
}