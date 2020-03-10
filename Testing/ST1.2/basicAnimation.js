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

  window.requestAnimationFrame(step);

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

function moveBox() {
  timeoutBox.style.transform = 'translateX(' + Math.min(position2, 400) + 'px)';
  position2 += stepSize;
  timeoutBox.style.width = '100px';

  // sleep( 30)

  setTimeout(moveBox, FREQ);
  // queueMicrotask(moveBox)
}

const alphabet = "abcdefghijklmnopqrstuvwxyz";

function animateTextTimeout() {
  // timeoutBox.innerHTML = nextLetter()

  timeoutBox.style.transform = 'translateX(' + Math.min(position2, 400) + 'px)';
  position2 += stepSize;

  timeoutBox.innerHTML = nextLetter();

  // sleep(15)

  setTimeout(animateTextTimeout, FREQ)
}

var letterIndex = 0;
function nextLetter() {

  letterIndex++;

  if (letterIndex >= alphabet.length) {
    letterIndex = 0;
  }

  return alphabet[letterIndex];

}

function animateLayout() {
  var w1 = document.getElementById("request-box").style.width;
  document.getElementById("request-box").style.width = w1 + 10 + 'px';

  var w2 = document.getElementById("timeout-box").style.width;
  document.getElementById("timeout-box").style.width = w2 + 10 + 'px';

  setTimeout(animateLayout, FREQ)
}

var drifts = [];
//modified drift test from https://github.com/nodejs/node/issues/21822  
function testDrift() {
  const start = Date.now();
  var counter = 1;
  setInterval(() => {
    var driftT = Date.now() - start - (counter * 1000);

    // do some work
    for (var i = 0; i < 100000; i++) {
      var d = new Date();
    }

    timeoutBox.style.transform = 'translateX(' + Math.min(position2, 400) + 'px)';
    position2 += stepSize;

    // log the drift from the start (this should be fluctuating around ~0)
    // you can run this in chrome, edge, etc (it does keep drifting in firefox)
    // in nodejs it keeps growing
    // console.log(`STEP: ${counter}, Drift: ${driftT}`);
    // console.log(driftT)

    drifts.push(driftT)

    if (drifts.length == 20) {
      console.log(drifts)
    }

    counter++;
  }, 1000);
}

//based on: https://medium.com/javascript-in-plain-english/better-understanding-of-timers-in-javascript-settimeout-vs-requestanimationframe-bf7f99b9ff9b
function testUitstel() {

  function print() {
    console.log('print');
  }

  function busy() {
    //dosomething
    let cnt = 0;
    for (let i = 0; i < 10e8; i += 1) {
      cnt += 1;
    }
  }

  setTimeout(print, 100);

  // busy();

}


// initial start of animations
// moveBox();
// req = window.requestAnimationFrame(step);
// moveBox()

// animateTextTimeout()
// animateLayout()

testUitstel();

// testDrift()