const options = { frequency: 60, referenceFrame: 'device' };
const sensor = new AbsoluteOrientationSensor(options);
Promise.all([navigator.permissions.query({ name: "accelerometer" }),
    navigator.permissions.query({ name: "magnetometer" }),
    navigator.permissions.query({ name: "gyroscope" })])
    .then(results => {
        if (results.every(result => result.state === "granted")) {
            sensor.addEventListener('reading', () => {
                // model is a Three.js object instantiated elsewhere.
                console.log(sensor.populateMatrix());
            });
            sensor.addEventListener('error', error => {
                if (event.error.name == 'NotReadableError') {
                    console.log("Sensor is not available.");
                }
            });

            sensor.start();
        } else {
            console.log("No permissions to use AbsoluteOrientationSensor.");
        }
    });