// modified example code from: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

var start = null;
var reqBox = document.getElementById('request-box');

const stepSize = 20;

var position = 0;

function step(timestamp) {
  if (!start) start = timestamp;
  var progress = timestamp - start;
  reqBox.style.transform = 'translateX(' + Math.min(position, 400) + 'px)';
  position += stepSize;

  // busy waiting (fake workload van frame)
  // sleep(30)

  if (progress < 4000) {
    window.requestAnimationFrame(step);
  }
}

// busy wait loop
function sleep(time) {

  var start = new Date();
  var now;

  while (true) {
    now = new Date();
    if (now - start >= time) {
      break;
    }
  }
}

var position2 = 0;
var timeoutBox = document.getElementById("timeout-box")
const FREQ = 16.6; //frame speed (16.6ms voor 60fps)

function moveBox(){
  timeoutBox.style.transform = 'translateX(' + Math.min(position2, 400) + 'px)';
  position2 += stepSize;

  // sleep( 30)

  setTimeout(moveBox, FREQ);
  // queueMicrotask(moveBox)
}

const alphabet = "abcdefghijklmnopqrstuvwxyz";

function animateTextTimeout(){
  // timeoutBox.innerHTML = nextLetter()

  timeoutBox.style.transform = 'translateX(' + Math.min(position2, 400) + 'px)';
  position2 += stepSize;

  timeoutBox.innerHTML = nextLetter();
  
  // sleep(15)

  setTimeout(animateTextTimeout, FREQ)
}

var letterIndex = 0;
function nextLetter(){

  letterIndex++;

  if (letterIndex >= alphabet.length) {
    letterIndex = 0;
  }

  return alphabet[letterIndex];

}


// initial start of animations
// moveBox();
// window.requestAnimationFrame(step);
// moveBox()

animateTextTimeout()