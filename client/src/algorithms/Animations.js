import Triangle from './Triangle'
import Delaunay from './Delaunay'
import Line from './Line'

export default class Animations {
  constructor(canvas) {
    this.catImage = new Image()
    this.catImage.src = "cat3_trans.png"
    this.nbFrames = 8
    this.width = canvas.width
    this.height = canvas.height
    this.ctx = canvas.getContext('2d')
    this.position = { x: 0, y: 0 }
    this.radius = 5
    this.fillStyle = 'red '
    this.range = 5
    this.speed = 10
    this.frame = 0
    this.angle = 0
    this.firstPoint
    this.endPoint
  }

  setPosition(x, y) {
    if (x > 0 && x < this.width) this.position.x = x
    if (y > 0 && y < this.height) this.position.y = y
  }

  getPosition() {
    return [this.position.x, this.position.y]
  }

  goHorizontal(dx) {
    this.setPosition(this.position.x + dx, this.position.y)
    return this.getPosition()
  }

  goVertical(dy) {
    this.setPosition(this.position.x, this.position.y + dy)
    return this.getPosition()
  }

  go(dx, dy) {
    this.goVertical(dy)
    this.goHorizontal(dx)
    return this.getPosition()
  }

  setDelaunay(delaunay) {
    this.delaunay = delaunay
  }

  drawImage(triangulation) {
    this.animateSprite(this.position.x,this.position.y,this.catImage, this.catImage.width,
        this.catImage.height, this.nbFrames)
    this.updateFrameTriangulation(triangulation)
    this.angle = Math.atan2(this.endPoint[1]-this.firstPoint[1], this.endPoint[0]-this.firstPoint[0])*180/Math.PI
    // if (this.angle < 0 )
    //   this.angle +=180
    // this.ctx.beginPath()
      // this.ctx.fillStyle = this.fillStyle
      // this.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI)
      // this.ctx.fill()
    return [this.position.x, this.position.y]
  }

    updateFrameTriangulation(triangulation){
      let canReturn = false
      if (triangulation[0].point1 === triangulation[0].point2){
        canReturn = true
      }
        if(!this.inRange(this.endPoint)){
            this.go(this.dx, this.dy)
        }
        else {
            let newNeighbours = this.findNeighbours(this.endPoint, triangulation)
            let random = Math.floor(Math.random()*newNeighbours.length)
            let newNeighbour = newNeighbours[random]
            while(canReturn === false && newNeighbour[0] === this.firstPoint[0] && newNeighbour[1] === this.firstPoint[1]){
              random = Math.floor(Math.random()*newNeighbours.length)
              newNeighbour = newNeighbours[random]
            }
            this.setPosition(this.endPoint[0], this.endPoint[1])
            this.setDirection(this.endPoint, newNeighbour)
            this.firstPoint = this.endPoint.slice()
            this.endPoint = newNeighbour
            console.log(this.firstPoint + " ---> " + this.endPoint + " angle: "+
                this.angle)
          console.log(this.dy)
        }
    }

    inRange(endPoint){
        return (Math.pow(endPoint[0] - this.position.x,2) + Math.pow(endPoint[1] - this.position.y,2) < Math.pow(this.range,2))
    }

  setDirection(beginPoint, endPoint) {
    let line = new Line(beginPoint, endPoint)
    this.dx = line.dx / Math.abs(line.dx)
    this.dy = line.slope * this.dx
    let scale = Math.sqrt(Math.pow(this.dx,2) + Math.pow(this.dy,2))
    this.dx /= scale/this.speed
    this.dy /= scale/this.speed
  }

  findNeighbours(point, triangulation) {
    let neighbours = []
    for (let tri = 0; tri < triangulation.length; tri++) {
      if (triangulation[tri].getPoints().includes(point)) {
        for (let i = 0; i < 3; i++) {
          if (point !== triangulation[tri].getPoints()[i]) {
            neighbours.push(triangulation[tri].getPoints()[i])
          }
        }
      }
    }
    return neighbours
  }

  animateSprite(x, y, image, spriteWidth, spriteHeight, nbFrames){

    if (this.endPoint[0] < this.firstPoint[0]){
      this.angle += 180
    }

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(this.angle*Math.PI/180);
    this.ctx.translate(-x, -y);
    // this.ctx.drawImage(image, this.frame * spriteWidth/nbFrames , 0,
    //     spriteWidth /nbFrames, spriteHeight, xCoo,yCoo,spriteWidth/nbFrames, spriteHeight)
    // this.ctx.restore();


    if (this.endPoint[0] >= this.firstPoint[0]){
      this.ctx.drawImage(image, this.frame * spriteWidth/nbFrames , 0,
          spriteWidth /nbFrames, spriteHeight, (x-spriteWidth/(2*nbFrames)),y-spriteHeight/2,spriteWidth/nbFrames, spriteHeight)
    }
    else{
      this.ctx.save()
      this.ctx.translate(this.width, 0)
      this.ctx.scale(-1,1)
      this.ctx.drawImage(image, this.frame * spriteWidth/nbFrames , 0,
          spriteWidth /nbFrames, spriteHeight, -(x+spriteWidth/(2*nbFrames))+this.width,y-spriteHeight/2,spriteWidth/nbFrames, spriteHeight)
      this.ctx.restore()

    }
    this.ctx.restore()
    this.frame += 1
    if (this.frame>=nbFrames){
      this.frame=0

    }


  }

}
