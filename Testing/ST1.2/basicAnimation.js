// modified example code from: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

var start = null;
var element = document.getElementById('box');

function step(timestamp) {
  if (!start) start = timestamp;
  var progress = timestamp - start;
  element.style.transform = 'translateX(' + Math.min(progress / 10, 200) + 'px)';
  if (progress < 2000) {
    window.requestAnimationFrame(step);
  }
}

// is this a change??

window.requestAnimationFrame(step);