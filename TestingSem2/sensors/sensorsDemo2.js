const sensor = new AbsoluteOrientationSensor();
let axisOffset = new THREE.Quaternion(0, 0, 0, 1);
let offset = null;
Promise.all([navigator.permissions.query({ name: "accelerometer" }),
    navigator.permissions.query({ name: "gyroscope" })])
    .then(results => {
        if (results.every(result => result.state === "granted")) {
            sensor.addEventListener('reading', () => {
                let [x, y, z, w] = sensor.quaternion;
                let quaternion = new THREE.Quaternion(x, y, z, w);

                if (offset === null) {
                   offset = quaternion
                } else {
                    quaternion.multiplyQuaternions(quaternion, offset.inverse())
                    quaternion.multiplyQuaternions(quaternion, axisOffset.inverse())
                    x = quaternion.x;
                    y = quaternion.y;
                    z = quaternion.z;
                    w = quaternion.w;
                    offset.inverse()
                    axisOffset.inverse()
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
                logo.style.webkitTransform = `matrix3d(${b1}, ${-c1}, ${a1}, ${d1}, ${b2}, ${-c2}, ${a2}, ${d2}, ${b3}, ${-c3}, ${a3}, ${d3}, ${b4}, ${-c4}, ${a4}, ${d4})` + "rotate(90deg)";
                logo.style.MozTransform = `matrix3d(${b1}, ${-c1}, ${a1}, ${d1}, ${b2}, ${-c2}, ${a2}, ${d2}, ${b3}, ${-c3}, ${a3}, ${d3}, ${b4}, ${-c4}, ${a4}, ${d4})` + "rotate(90deg)";
                logo.style.transform = `matrix3d(${b1}, ${-c1}, ${a1}, ${d1}, ${b2}, ${-c2}, ${a2}, ${d2}, ${b3}, ${-c3}, ${a3}, ${d3}, ${b4}, ${-c4}, ${a4}, ${d4})` + "rotate(90deg)";
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