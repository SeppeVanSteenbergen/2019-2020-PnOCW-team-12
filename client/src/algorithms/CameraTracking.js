import Brief from './Brief'
import './FASTDetector'

export default class CameraTracking {
  constructor(callback) {
    console.log('start tracking')
    this.framerate = 30
    this.video = document.createElement('video')
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.previousDescriptor = null
    this.confidence = 0.75

    //Setup sensors
    this.startMatrix = null

    Promise.all([
      navigator.permissions.query({ name: 'accelerometer' }),
      navigator.permissions.query({ name: 'gyroscope' })
    ]).then(results => {
      if (results.every(result => result.state === 'granted')) {
        const options = { frequency: 10, coordinateSystem: 'device' }
        this.sensor = new RelativeOrientationSensor(options)

        this.sensor.addEventListener('error', error => {
          if (event.error.name === 'NotReadableError') {
            console.log('Sensor is not available.')
          }
        })

        this.sensor.start()
      } else {
        console.log('No permissions to use RelativeOrientationSensor.')
      }
    })
    console.log('setted up sensors')

    //setup camera en beginnen lezen (door toe te wijzen aan video element)
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment'
        },
        audio: false
      })
      .then(stream => {
        console.log(stream)
        this.video.srcObject = stream

        console.log('setted up video')
        let video = this.video
        let canvas = this.canvas
        this.video.onloadedmetadata = function(event) {
          console.log('print')
          video.play()
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

/*
          this.calculateTransformation(callback)
*/
        }
      })
      .catch(function(err) {
        // deal with an error (such as no webcam)
      })
  }

  resetStartMatrix() {
    this.startMatrix = null
  }

  startSensor() {
    this.sensor.start()
    this.video.play()
  }
  stopSensor() {
    this.sensor.stop()
    this.video.pause()
  }

  calculateTransformation(callback) {
    let fictiveDistance = 1000

    //transformatie (rotatie) door de sensors
    let rotationMatrix = new DOMMatrix()
    this.sensor.populateMatrix(rotationMatrix)
    if (this.startMatrix === null) {
      this.startMatrix = DOMMatrix.fromMatrix(rotationMatrix.inverse())
    }

    rotationMatrix.multiplySelf(this.startMatrix)
    console.log('calculated tranformation matrix from sensors')
    console.log(rotationMatrix)
    //translatie door camera
    this.ctx.drawImage(this.video, 0, 0)
    let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height)
    let corners = FASTDetector(imageData.data, canvas.width, hold)
    console.log('founded corners with fast')
    let transformedcorners = []
    for (let i = 0; i < corners.length; i += 2) {
      let point = new DOMPoint(corners[i], corners[i + 1], fictiveDistance)
      point.matrixTransform(rotationMatrix)
      //TODO kan probleem zijn dat rotationmatrix ingesteld staat op roteren rond middenpunt
      //  punten staan t.o.v. linkerbovenhoek
      transformedcorners.push(point.x)
      transformedcorners.push(point.y)
    }

    console.log('founded transformed corners')

    let descriptor = Brief.getDescriptors(
      grayScaleImgData(imageData, false),
      canvas.width,
      transformedcorners
    )
    let trans = {
      x: 0,
      y: 0
    }
    if (this.previousDescriptor !== null) {
      matches = Brief.reciprocalMatch(
        this.previousCorners,
        this.previousDescriptor,
        transformedcorners,
        descriptor
      )
      let selectedCount = 0
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].confidence > this.confidence) {
          selectedCount++
          trans.x += matches[i].keypoint2[0] - matches[i].keypoint1[0]
          trans.y += matches[i].keypoint2[1] - matches[i].keypoint1[1]
        }
      }
      if (selectedCount > 0) {
        trans.x = trans.x / selectedCount
        trans.y = trans.y / selectedCount
      }
    }

    console.log('found transformation x: ' + trans.x + ' y: ' + trans.y)
    if (this.previousDescriptor === null) {
      this.previousDescriptor = descriptor
      this.previousCorners = transformedcorners
    }

    rotationMatrix.translateSelf(trans.x, trans.y)
    console.log('final rotation Matrix')
    console.log(rotationMatrix)
    callback(rotationMatrix.toString())
    console.log('callback succeeded')
    //en opnieuw
    this.calculateTransformation(callback)
  }
}
