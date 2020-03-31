const options = { frequency: 60, referenceFrame: 'screen' };
const sensor = new RelativeOrientationSensor(options);
let offset = null;
Promise.all([navigator.permissions.query({ name: "accelerometer" }),
    navigator.permissions.query({ name: "gyroscope" })])
    .then(results => {
        if (results.every(result => result.state === "granted")) {
            sensor.addEventListener('reading', () => {
                let [x, y, z, w] = sensor.quaternion;

                let quaternion = new THREE.Quaternion;

                if (offset === null) {
                   offset = [-1 / x, -1 / y, -1 / z, 1 / w];
                } else {
                    x *= offset[0];
                    y *= offset[1];
                    z *= offset[2];
                    w *= offset[3];

                    let length = Math.sqrt(x * x + y * y + z * z + w * w);
                    x /= length;
                    y /= length;
                    z /= length;
                    w /= length;
                }

                let a1 = 1 - 2 * y * y - 2 * z * z;
                let a2 = 2 * x * y - 2 * z * w;
                let a3 = 2 * x * z + 2 * w * y;
                let a4 = 0;
                let b1 = 2 * x * y + 2 * w * z;
                let b2 = 1 - 2 * x * x - 2 * z * z;
                let b3 = 2 * y * z - 2 * w * x;
                let b4 = 0;
                let c1 = 2 * x * z - 2 * w * y;
                let c2 = 2 * y * z + 2 * w * x;
                let c3 = 1 - 2 * x * x - 2 * y * y;
                let c4 = 0;
                let d1 = 0;
                let d2 = 0;
                let d3 = 0;
                let d4 = 1;

                var logo = document.getElementById("imgLogo");
                logo.style.webkitTransform = `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
                logo.style.MozTransform = `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
                logo.style.transform = `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
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