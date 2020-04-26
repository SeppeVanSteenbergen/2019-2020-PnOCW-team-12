let cssMatrix = "matrix3d(0.74572, -0.0274542, 0.665696, 0, 0.0461469, 0.998881, -0.0104958, 0, -0.664664, 0.0385486, 0.746149, 0, 0, 0, 0, 1)";
let originalTransformation = new DOMMatrix(cssMatrix);
let startMatrix = null;

let image = document.getElementById("image");
let translation = image.style.transformOrigin.split(" ");
let translationMatrix = new DOMMatrix();
translationMatrix.m13 = parseInt(translation[0]);
translationMatrix.m23 = parseInt(translation[1]);
let inverseTranslationMatrix = new DOMMatrix();
inverseTranslationMatrix.m13 = -parseInt(translation[0]);
inverseTranslationMatrix.m23 = -parseInt(translation[1]);

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
      let orientationMatrix = DOMMatrix.fromMatrix(translationMatrix);
      rotationMatrix.multiplySelf(startMatrix);
      orientationMatrix.multiplySelf(rotationMatrix);
      orientationMatrix.multiplySelf(inverseTranslationMatrix);

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
})
