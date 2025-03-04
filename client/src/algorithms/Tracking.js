import { FASTDetector, grayScaleImgData } from './FASTDetector'

export function initializeTracking() {
  return new Promise(resolve => {
    setupSensor().then(sensor => {
      setupCamera().then(video => {
        video.onloadedmetadata = event => {
          resolve({ sensors: sensor, camera: video })
        }
      })
    })
  })
}

function setupSensor() {
  return Promise.all([
    navigator.permissions.query({ name: 'accelerometer' }),
    navigator.permissions.query({ name: 'gyroscope' })
  ]).then(results => {
    if (results.every(result => result.state === 'granted')) {
      const options = { frequency: 10, coordinateSystem: 'device' }
      let sensor = new RelativeOrientationSensor(options)

      sensor.addEventListener('error', error => {
        if (error.name === 'NotReadableError') {
          console.log('Sensor is not available.')
          this.$notif('Sensor is not available', 'error')
        }
      })

      return sensor
    } else {
      console.log('No permissions to use RelativeOrientationSensor.')
      this.$notif('No permissions to use RelativeOrientationSensor.', 'error')

      return null
    }
  })
}

function setupCamera() {
  return navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: { exact: 'environment' },
        width: 640,
        height: 480
      },
      audio: false
    })
    .then(stream => {
      let video = document.createElement('video')
      video.srcObject = stream

      return video
    })
}

export function stopTracking(sensor, video) {
  sensor.stop()
  video.pause()
}

export function startTracking(sensor, video) {
  sensor.start()
  video.play()
}

export function calculateRotation(sensors, startMatrix) {
  let rotationMatrix = new DOMMatrix()
  sensors.populateMatrix(rotationMatrix)

  if (startMatrix === null) {
    startMatrix = DOMMatrix.fromMatrix(rotationMatrix.inverse())
  }
  rotationMatrix.multiplySelf(startMatrix)

  return { calculatedRotation: rotationMatrix, startMatrix: startMatrix }
}

//Parameters consists of threshold and confidence
export async function calculateFrameTranslation(
  video,
  context,
  brief,
  parameters,
  previousResults
) {
/*
  let t1 = performance.now()
*/
  context.drawImage(video, 0, 0)
  let imageData = context.getImageData(
    0,
    0,
    video.videoWidth,
    video.videoHeight
  )
/*  let t2 = performance.now()
  console.log('Drawing video on canvas took: ' + (t2 - t1) + 'ms')

  t1 = performance.now()*/
  let grayScalePixels = grayScaleImgData(imageData.data)
/*  t2 = performance.now()
  console.log('Creating gray scale pixels took: ' + (t2 - t1) + 'ms')

  t1 = performance.now()*/
  let corners = FASTDetector(
    grayScalePixels,
    video.videoWidth,
    video.videoHeight,
    parameters.threshold
  )
/*  t2 = performance.now()
  console.log('FastDetector took: ' + (t2 - t1) + 'ms')

  t1 = performance.now()*/
  let descriptor = brief.getDescriptors(
    grayScalePixels,
    video.videoWidth,
    corners
  )
/*  t2 = performance.now()
  console.log('making descriptor took: ' + (t2 - t1) + 'ms')*/

  let trans = {x: 0, y: 0}
  if (previousResults.descriptor !== null) {
/*
    t1 = performance.now()
*/
    let matches = brief.reciprocalMatch(
      previousResults.corners,
      previousResults.descriptor,
      corners,
      descriptor
    )
/*    t2 = performance.now()

    console.log('matching took: ' + (t2 - t1) + 'ms')

    t1 = performance.now()*/
    let selectedCount = 0
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].confidence > parameters.confidence) {
        selectedCount++
        trans.x += matches[i].keypoint1[0] - matches[i].keypoint2[0]
        trans.y += matches[i].keypoint1[1] - matches[i].keypoint2[1]
      }
    }
    if (selectedCount > 0) {
      trans.x = trans.x / selectedCount
      trans.y = trans.y / selectedCount
    }

/*    t2 = performance.now()
    console.log('calculating translation took: ' + (t2 - t1) + 'ms')*/
  }
  return {
    trans: trans,
    corners: corners,
    descriptor: descriptor
  }
}
