export default class Sensors {
  constructor(cssMatrix, callback) {
    this.originalTransformation = new DOMMatrix(cssMatrix);
    this.startMatrix = null;

    Promise.all([
      navigator.permissions.query({ name: 'accelerometer' }),
      navigator.permissions.query({ name: 'gyroscope' })
    ]).then(results => {
      if (results.every(result => result.state === 'granted')) {
        const options = {frequency: 60, coordinateSystem: 'device'};
        const sensor = new RelativeOrientationSensor(options);

        sensor.addEventListener('reading', () => {
          if (this.startMatrix === null) setStartMatrix();

          let rotationMatrix = new DOMMatrix();
          sensor.populateMatrix(rotationMatrix);
          rotationMatrix.multiplySelf(this.startMatrix);
          rotationMatrix.multiplySelf(this.originalTransformation);
          rotationMatrix.invertSelf();

          callback(rotationMatrix);
        });
        sensor.addEventListener('error', error => {
          if (event.error.name === 'NotReadableError') {
            console.log('Sensor is not available.')
          }
        });

        sensor.start()
      } else {
        console.log('No permissions to use RelativeOrientationSensor.')
      }
    });

   function setStartMatrix() {
      let rotationMatrix = new DOMMatrix();
      sensor.populateMatrix(rotationMatrix);
      this.startMatrix = rotationMatrix.inverse();
    }
  }
}
