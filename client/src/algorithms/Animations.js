import Line from './Line'
import config from '../config/config'
import Delaunay from './Delaunay'

export default class Animations {
  constructor(triangulation, canvas, xmasMode) {
    this.xmasMode = xmasMode
    this.catImage = new window.Image()
    this.mouseImage = new window.Image()
    if (typeof config !== 'undefined') {
      this.catImage.src = config.backend.url + '/img/cat4_trans.png'
      this.mouseImage.src = config.backend.url + '/img/mouse2_trans.png'
    } else {
      if (xmasMode){
        this.catImage.src = 'cat4_trans_xmas.png'
        this.mouseImage.src = 'mouse2_trans_xmas.png'
      }
      else{
        this.catImage.src = 'cat4_trans.png'
        this.mouseImage.src = 'mouse2_trans.png'
      }


    }

    this.nbFrames = 7
    this.width = canvas.width
    this.height = canvas.height
    //this.ctx = canvas.getContext('2d')
    this.position = { x: 0, y: 0 }
    this.radius = 5
    this.fillStyle = 'red '
    this.range = 7
    this.speed = 12
    this.frame = 0
    this.angle = 0
    this.snowAngle = 0
    this.posStack = []
    this.firstPoint
    this.endPoint
    this.triangulation = triangulation
    this.stack = []

    this.mp = 250; //max particles
    this.particles = [];
    for(let i = 0; i < this.mp; i++) {
      this.particles.push({
        x: Math.random()*this.height, //x-coordinate
        y: Math.random()*this.width, //y-coordinate
        r: Math.random()*4+1, //radius
        d: Math.random()*this.mp //density
      })
    }

    if(triangulation !== null) {
      this.edges = Delaunay.triangulationEdges(triangulation)
    }

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

  // setDelaunay(delaunay) {
  //   this.delaunay = delaunay
  // }

  // drawImage() {
  //   this.updateFrame()
  //   this.animateSprite(
  //     this.position.x,
  //     this.position.y,
  //     this.catImage,
  //     this.catImage.width,
  //     this.catImage.height,
  //     this.nbFrames
  //   )
  //
  //   return {
  //     x: this.position.x,
  //     y: this.position.y,
  //     direction: this.angle,
  //     frame: this.frame,
  //     right: this.endPoint[0] >= this.firstPoint[0]
  //   }
  // }

  drawAnimals(nbCats, distCats, canvas, x, y, angle, frame, right){
    this.stack.push([x,y, angle, frame, right])
    if (this.stack.length>distCats){
      for(let i = 0; i<= nbCats-1; i++){
        if (i === 0){
          this.drawAnimal(canvas, this.stack[i*Math.round(distCats/nbCats)][0],
              this.stack[i*Math.round(distCats/nbCats)][1], this.stack[i*Math.round(distCats/nbCats)][2],
              this.stack[i*Math.round(distCats/nbCats)][3], this.stack[i*Math.round(distCats/nbCats)][4], true)
        }
        else {
          this.drawAnimal(canvas, this.stack[i * Math.round(distCats / nbCats)][0],
              this.stack[i * Math.round(distCats / nbCats)][1], this.stack[i * Math.round(distCats / nbCats)][2],
              this.stack[i * Math.round(distCats / nbCats)][3], this.stack[i * Math.round(distCats / nbCats)][4], false)
        }
      }
      this.stack.shift()
    }

  }

  drawAnimal(canvas, x, y, angle, frame, right, cat) {
    if (cat){
      var image = this.catImage
    }
    else {
      var image = this.mouseImage
    }
    let ctx = canvas.getContext('2d')
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((angle * Math.PI) / 180)
    ctx.translate(-x, -y)

    if (right) {
      ctx.drawImage(
          image,
        (frame * image.width) / this.nbFrames,
        0,
          image.width / this.nbFrames,
          image.height,
        x - image.width / (2 * this.nbFrames),
        y - image.height ,
          image.width / this.nbFrames,
          image.height
      )
    } else {
      ctx.save()
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(
          image,
        (frame * image.width) / this.nbFrames,
        0,
          image.width / this.nbFrames,
          image.height,
        -(x + image.width / (2 * this.nbFrames)) + this.width,
        y - image.height ,
          image.width / this.nbFrames,
          image.height
      )
      ctx.restore()
    }
    ctx.restore()
  }

  getNextFrame() {
    this.updateFrame()
    return {
      x: this.position.x,
      y: this.position.y,
      angle: this.angle,
      frame: this.frame,
      right: this.endPoint[0] >= this.firstPoint[0]
    }
  }

  /**
   * sets the new Position, direction, firstpoint, endpoint and angle of this class
   * @param triangulation
   */
  updateFrame() {
    let canReturn = false
    if (this.triangulation[0].point1 === this.triangulation[0].point2) {
      canReturn = true
    }
    if (!this.inRange(this.endPoint)) {
      this.go(this.dx, this.dy)
    } else {
      let newNeighbours = this.findNeighbours(this.endPoint, this.triangulation)
      let random = Math.floor(Math.random() * newNeighbours.length)
      let newNeighbour = newNeighbours[random]
      while (
        canReturn === false &&
        newNeighbour[0] === this.firstPoint[0] &&
        newNeighbour[1] === this.firstPoint[1]
      ) {
        random = Math.floor(Math.random() * newNeighbours.length)
        newNeighbour = newNeighbours[random]
      }
      this.setPosition(this.endPoint[0], this.endPoint[1])
      this.setDirection(this.endPoint, newNeighbour)
      this.firstPoint = this.endPoint.slice()
      this.endPoint = newNeighbour
      console.log(
        this.firstPoint + ' ---> ' + this.endPoint + ' angle: ' + this.angle
      )
      console.log(this.dy)
    }

    this.angle =
      (Math.atan2(
        this.endPoint[1] - this.firstPoint[1],
        this.endPoint[0] - this.firstPoint[0]
      ) *
        180) /
      Math.PI

    if (this.endPoint[0] < this.firstPoint[0]) {
      this.angle += 180
    }

    this.frame += 1
    if (this.frame >= this.nbFrames) {
      this.frame = 0
    }
  }

  inRange(endPoint) {
    return (
      Math.pow(endPoint[0] - this.position.x, 2) +
        Math.pow(endPoint[1] - this.position.y, 2) <
      Math.pow(this.range, 2)
    )
  }

  setDirection(beginPoint, endPoint) {
    let line = new Line(beginPoint, endPoint)
    this.dx = line.dx / Math.abs(line.dx)
    this.dy = line.slope * this.dx
    let scale = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2))
    this.dx /= scale / this.speed
    this.dy /= scale / this.speed
  }

  findNeighbours(point, triangulation) {
    return this.edges[point]
  }

  drawBackground(canvas){
    if(this.xmasMode) {
      this.drawSnow(canvas)
    }
  }

  drawSnow(canvas){

    let ctx = canvas.getContext("2d")

    let grd = ctx.createLinearGradient(0, this.height, 0, 0);

    // Add colors
    grd.addColorStop(0.000, 'rgba(255, 255, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(86, 170, 255, 1.000)');

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    for(let i = 0; i < this.mp; i++)
    {
      let p = this.particles[i];
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
    }
    ctx.fill();
    this.updateSnow();
  }

  updateSnow(){
    this.snowAngle += 0.01;
    for(let i = 0; i < this.mp; i++)
    {
      let p = this.particles[i];
      p.y += Math.cos(this.snowAngle+p.d) + 1 + p.r/2;
      p.x += Math.sin(this.snowAngle) * 2;


      if(p.x > this.width+5 || p.x < -5 || p.y > this.height)
      {
        if(i%3 > 0) //66.67% of the flakes
        {
          this.particles[i] = {x: Math.random()*this.width, y: -10, r: p.r, d: p.d};
        }
        else
        {
          //If the flake is exitting from the right
          if(Math.sin(this.snowAngle) > 0)
          {
            //Enter from the left
            this.particles[i] = {x: -5, y: Math.random()*this.height, r: p.r, d: p.d};
          }
          else
          {
            //Enter from the right
            this.particles[i] = {x: this.width+5, y: Math.random()*this.height, r: p.r, d: p.d};
          }
        }
      }
    }
  }

  // animateSprite(x, y, image, spriteWidth, spriteHeight, nbFrames) {
  //   this.ctx.save()
  //   this.ctx.translate(x, y)
  //   this.ctx.rotate((this.angle * Math.PI) / 180)
  //   this.ctx.translate(-x, -y)
  //
  //   if (this.endPoint[0] >= this.firstPoint[0]) {
  //     this.ctx.drawImage(
  //       image,
  //       (this.frame * spriteWidth) / nbFrames,
  //       0,
  //       spriteWidth / nbFrames,
  //       spriteHeight,
  //       x - spriteWidth / (2 * nbFrames),
  //       y - spriteHeight / 2,
  //       spriteWidth / nbFrames,
  //       spriteHeight
  //     )
  //   } else {
  //     this.ctx.save()
  //     this.ctx.translate(this.width, 0)
  //     this.ctx.scale(-1, 1)
  //     this.ctx.drawImage(
  //       image,
  //       (this.frame * spriteWidth) / nbFrames,
  //       0,
  //       spriteWidth / nbFrames,
  //       spriteHeight,
  //       -(x + spriteWidth / (2 * nbFrames)) + this.width,
  //       y - spriteHeight / 2,
  //       spriteWidth / nbFrames,
  //       spriteHeight
  //     )
  //     this.ctx.restore()
  //   }
  //   this.ctx.restore()
  // }
}
