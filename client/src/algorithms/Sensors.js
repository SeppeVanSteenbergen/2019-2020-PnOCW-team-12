export default class Sensors {
  constructor(callback) {
    this.startMatrix = null

    Promise.all([
      navigator.permissions.query({ name: 'accelerometer' }),
      navigator.permissions.query({ name: 'gyroscope' })
    ]).then(results => {
      if (results.every(result => result.state === 'granted')) {
        const options = { frequency: 10, coordinateSystem: 'device' }
        this.sensor = new RelativeOrientationSensor(options)

        this.sensor.addEventListener('reading', () => {
          let rotationMatrix = new DOMMatrix()
          this.sensor.populateMatrix(rotationMatrix)

          if (this.startMatrix === null) {
            this.startMatrix = DOMMatrix.fromMatrix(rotationMatrix.inverse())
          }
          rotationMatrix.preMultiplySelf(this.startMatrix)

          callback(rotationMatrix.toString())
        })
        this.sensor.addEventListener('error', error => {
          if (event.error.name === 'NotReadableError') {
            console.log('Sensor is not available.')
          }
        })

        this.startSensor()
      } else {
        console.log('No permissions to use RelativeOrientationSensor.')
      }
    })
  }
  startSensor() {
    this.sensor.start()
  }
  stopSensor() {
    this.sensor.stop()
  }
}
