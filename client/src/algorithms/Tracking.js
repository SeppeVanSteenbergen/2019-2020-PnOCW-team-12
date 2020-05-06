import { FASTDetector, grayScaleImgData } from './FASTDetector'
import Brief from './Brief'

export function initializeTracking() {
  return new Promise(resolve => {
    setupSensor().then(sensor => {
      setupCamera().then(video => {
        console.log(sensor)
        console.log(video)

        video.onloadedmetadata = event => {
          video.play()
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
        }
      })
      sensor.start()
      return sensor
    } else {
      console.log('No permissions to use RelativeOrientationSensor.')
      return null
    }
  })
}

function setupCamera() {
  return navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: { exact: 'environment' },
        width: 1280,
        height: 720
      },
      audio: false
    })
    .then(stream => {
      let video = document.createElement('video')
      video.srcObject = stream
      console.log(video.srcObject)

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

//Returns a DOMMatrix
async function calculateTransformationSensors(sensor, startMatrix) {
  if (!sensor.activated) {
    return null
  }

  //transformatie (rotatie) door de sensors
  let rotationMatrix = new DOMMatrix()
  sensor.populateMatrix(rotationMatrix)
  if (startMatrix === null) {
    startMatrix = DOMMatrix.fromMatrix(rotationMatrix.inverse())
  }

  rotationMatrix.multiplySelf(startMatrix)

  return { transformationMatrix: rotationMatrix, startMatrix: startMatrix }
}

//Parameters consists of threshold, fictiveDepth and confidence
async function calculateTransformationCamera(
  video,
  context,
  startTransformation,
  previousTranslation,
  previousDescriptor,
  previousCorners,
  brief,
  parameters
) {
  let t1 = performance.now()
  context.drawImage(video, 0, 0)
  let imageData = context.getImageData(
    0,
    0,
    video.videoWidth,
    video.videoHeight
  )
  let t2 = performance.now()
  console.log('Drawing video on canvas took: ' + (t2 - t1) + 'ms')

  t1 = performance.now()
  let grayScalePixels = grayScaleImgData(imageData.data)
  t2 = performance.now()
  console.log('Creating gray scale pixels took: ' + (t2 - t1) + 'ms')


  t1 = performance.now()
  let corners = FASTDetector(
    grayScalePixels,
    video.videoWidth,
    video.videoHeight,
    parameters.threshold
  )
  t2 = performance.now()
  console.log('FastDetector took: ' + (t2 - t1) + 'ms')

  t1 = performance.now()
  let descriptor = brief.getDescriptors(
    grayScalePixels,
    video.videoWidth,
    corners
  )
  t2 = performance.now()
  console.log('making descriptor took: ' + (t2 - t1) + 'ms')

  let trans = {
    x: 0,
    y: 0
  }

  if (previousDescriptor !== null) {
    t1 = performance.now()
    let matches = brief.reciprocalMatch(
      previousCorners,
      previousDescriptor,
      corners,
      descriptor
    )
    t2 = performance.now()

    console.log('matching took: ' + (t2 - t1) + 'ms')

    t1 = performance.now()
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
    let point = new DOMPoint(trans.x, trans.y, parameters.fictiveDepth)
    point.matrixTransform(startTransformation.inverse())

    trans.x = point.x + previousTranslation.x
    trans.y = point.y + previousTranslation.y
    t2 = performance.now()
    console.log('calculating translation took: ' + (t2 - t1) + 'ms')
  }
  return {
    transformation: trans,
    previousCorners: corners,
    previousDescriptor: descriptor
  }
}

export function calculateTransformation(
  callback,
  sensor,
  video,
  context,
  startMatrix,
  previousTransformation,
  previousDescriptor,
  previousCorners,
  brief,
  videoParameters
) {
  if (brief == null) brief = new Brief(512)
  calculateTransformationSensors(sensor, startMatrix).then(result => {
    if (result === null) return

    calculateTransformationCamera(
      video,
      context,
      result.transformationMatrix,
      previousTransformation,
      previousDescriptor,
      previousCorners,
      brief,
      videoParameters
    ).then(cameraResult => {
      result.transformationMatrix.translateSelf(
        cameraResult.transformation.x,
        cameraResult.transformation.y
      )
      callback(result.transformationMatrix.toString())

      setTimeout(() => {
        calculateTransformation(
          callback,
          sensor,
          video,
          context,
          result.startMatrix,
          cameraResult.transformation,
          cameraResult.previousDescriptor,
          cameraResult.previousCorners,
          brief,
          videoParameters
        )
      }, 50)
    })
    //calculateTransformation(callback, sensor, video, startMatrix, previousDescriptor, previousCorners, videoParameters)
  })
}
