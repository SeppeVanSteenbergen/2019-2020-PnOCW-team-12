import {
  RelativeOrientationSensor
} from './motion-sensors-polyfill/src/motion-sensors.js'

let cssMatrix = "matrix3d(0.87179, 0.00184608, -0.489877, 0, -0.00213851, 0.999998, -3.76167e-05, 0, 0.489875, 0.00107975, 0.871792, 0, 338.739, -4.85365, 1288.4, 1)";
let originalTransformation = new DOMMatrix(cssMatrix);
let startMatrix = null;

let image = document.getElementById("image");
let translation = image.style.transformOrigin.split(" ");
let translationMatrix = new DOMMatrix("translate(" + translation[0] + ", " + translation[1] + ")");
translationMatrix.m41 -= image.width / 2;
translationMatrix.m42 -= image.height / 2;

Promise.all([
  navigator.permissions.query({ name: "accelerometer" }),
  navigator.permissions.query({ name: 'gyroscope' })
]).then(results => {
  if (results.every(result => result.state === "granted")) {
    const options = { frequency: 30, coordinateSystem: 'device' };
    const sensor = new RelativeOrientationSensor(options);

    sensor.addEventListener("reading", () => {
      let rotationMatrix = new DOMMatrix();
      sensor.populateMatrix(rotationMatrix);

      if (startMatrix === null) startMatrix = rotationMatrix.inverse();
      let orientationMatrix = DOMMatrix.fromMatrix(translationMatrix.inverse());
      rotationMatrix.multiplySelf(startMatrix);
      rotationMatrix.invertSelf();
      orientationMatrix.multiplySelf(rotationMatrix);
      orientationMatrix.multiplySelf(translationMatrix);
      orientationMatrix.multiplySelf(originalTransformation);


      image.style.transform = orientationMatrix;

      if (image.style.visibility === "hidden") {
        image.style.visibility = "visible";
      }
    });
    sensor.addEventListener("error", error => {
      if (event.error.name === 'NotReadableError') {
        console.log("Sensor is not available.");
      }
    });

    sensor.start();
  } else {
    console.log("No permissions to use RelativeOrientationSensor.");
  }
});
