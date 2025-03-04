let cssMatrix = "matrix3d(0.74572, -0.0274542, 0.665696, 0, 0.0461469, 0.998881, -0.0104958, 0, -0.664664, 0.0385486, 0.746149, 0, 0, 0, 0, 1)";
let originalTransformation = new DOMMatrix(cssMatrix);
let startMatrix = null;

Promise.all([
  navigator.permissions.query({ name: "accelerometer" }),
  navigator.permissions.query({ name: 'gyroscope' })
]).then(results => {
  if (results.every(result => result.state === "granted")) {
    const options = { frequency: 60, coordinateSystem: 'device' }
    const sensor = new RelativeOrientationSensor(options);

    sensor.addEventListener("reading", () => {
      let rotationMatrix = new DOMMatrix();
      sensor.populateMatrix(rotationMatrix);

      if (startMatrix === null) startMatrix = rotationMatrix.inverse();
      rotationMatrix.multiplySelf(startMatrix);
/*
      rotationMatrix.multiplySelf(originalTransformation);
*/
      rotationMatrix.invertSelf();

      let image = document.getElementById("image");
      image.style.transform = rotationMatrix;
      image.style.MozTransform = rotationMatrix;

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
})
