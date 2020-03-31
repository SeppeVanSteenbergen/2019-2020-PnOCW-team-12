if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', deviceOrientationHandler, false);
} else {
    document.getElementById('logoContainer').innerText = 'Device Orientation API not supported.';
}

var initialOffset = null;
function deviceOrientationHandler (eventData) {
    if (initialOffset === null) {
        initialOffset = [eventData.alpha, eventData.beta, eventData.gamma];
    }

    var dir = eventData.alpha - initialOffset[0];
    dir = dir >= 0 ? dir : dir + 360;
    var tiltFB = eventData.beta - initialOffset[1];
    tiltFB = tiltFB >= 0 ? tiltFB : tiltFB + 360;
    var tiltLR = eventData.gamma - initialOffset[2];
    tiltLR = tiltLR >= 0 ? tiltLR : tiltLR + 360;

    document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR);
    document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB);
    document.getElementById("doDirection").innerHTML = Math.round(dir);

    var logo = document.getElementById("imgLogo");
    logo.style.webkitTransform = "rotate3d(1,0,0, " + (tiltFB * -1) + "deg) rotate3d(0,1,0, " + (tiltLR * -1) + "deg)";
    logo.style.MozTransform = "rotate(" + dir + "deg) rotate3d(1,0,0, " + (tiltFB * -1) + "deg) rotate3d(0,1,0, " + (tiltLR * -1) + "deg)";
    logo.style.transform = "rotate(" + dir + "deg) rotate3d(1,0,0, " + (tiltFB * -1) + "deg) rotate3d(0,1,0, " + (tiltLR * -1) + "deg)";
}