export default class CameraTracking {
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

    startSensor() {
        this.sensor.start()
    }
    stopSensor() {
        this.sensor.stop()
    }

}
