export default class Sensors {
  constructor(callback) {
    this.startMatrix = null

    Promise.all([
      navigator.permissions.query({ name: 'accelerometer' }),
      navigator.permissions.query({ name: 'gyroscope' })
    ]).then( results => {
      if (results.every(result => result.state === 'granted')) {
        const options = { frequency: 30, coordinateSystem: 'device' }
        this.sensor = new RelativeOrientationSensor(options)

        this.sensor.addEventListener('reading', () => {
          if (this.startMatrix === null) this.setStartMatrix()

          let rotationMatrix = new DOMMatrix()
          this.sensor.populateMatrix(rotationMatrix)
          rotationMatrix.multiplySelf(this.startMatrix)
          rotationMatrix.invertSelf()

          callback(rotationMatrix.toString())
        })
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
  }

  setStartMatrix() {
    let startMatrix = new DOMMatrix()
    this.sensor.populateMatrix(startMatrix)
    this.startMatrix = startMatrix.inverse()
  }

  static transformationMatrix(originalCSS, rotationMatrix) {
    let originalTransformation = new DOMMatrix(originalCSS[0])
    let translation = originalCSS[1].split(' ')
    let translationMatrix = new DOMMatrix(
      'translate(' + 0+ 'px, ' + 0 + 'px)'
    )
/*    translationMatrix.m41 -= originalCSS[2] / 2
    translationMatrix.m42 -= originalCSS[3] / 2*/
    rotationMatrix = new DOMMatrix(rotationMatrix)

    let orientationMatrix = DOMMatrix.fromMatrix(translationMatrix.inverse())
    orientationMatrix.multiplySelf(rotationMatrix)
    orientationMatrix.multiplySelf(translationMatrix)
    orientationMatrix.multiplySelf(originalTransformation)

    return orientationMatrix
  }

  startSensor() {
    this.sensor.start()
  }
  stopSensor() {
    this.sensor.stop()
  }

}
