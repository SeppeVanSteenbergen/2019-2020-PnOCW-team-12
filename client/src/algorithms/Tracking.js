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
        facingMode: 'environment'
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
  console.log('calculated tranformation matrix from sensors')
  console.log(rotationMatrix)

  return { transformationMatrix: rotationMatrix, startMatrix: startMatrix }
}

//Parameters consists of threshold, fictiveDepth and confidence
async function calculateTransformationCamera(
  video,
  startTransformation,
  previousTranslation,
  previousDescriptor,
  previousCorners,
  brief,
  parameters
) {
  let canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  let ctx = canvas.getContext('2d')

  ctx.drawImage(video, 0, 0)

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let corners = FASTDetector(imageData.data, canvas.width, parameters.threshold)
  console.log('founded corners with fast')
/*
  let transformedcorners = []
  for (let i = 0; i < corners.length; i += 2) {
    let point = new DOMPoint(
      corners[i],
      corners[i + 1],
      parameters.fictiveDepth
    )
    point.matrixTransform(startTransformation)

    transformedcorners.push(point.x)
    transformedcorners.push(point.y)
  }

 */

  console.log(corners)
  console.log('founded transformed corners')

  console.log(imageData)
  console.log(grayScaleImgData(imageData, false))
  let descriptor = brief.getDescriptors(
    grayScaleImgData(imageData),
    canvas.width,
    corners
  )
  console.log('descriptor')
  console.log(descriptor)
  let trans = {
    x: 0,
    y: 0
  }

  if (previousDescriptor !== null) {
    console.log('nb previousCorners: ' + previousCorners.length)
    console.log('previousDescriptor')
    console.log(previousDescriptor)
    let matches = brief.reciprocalMatch(
      previousCorners,
      previousDescriptor,
      corners,
      descriptor
    )
    console.log(matches)
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
    point.matrixTransform(startTransformation)

    trans.x = point.x + previousTranslation.x
    trans.y = point.y + previousTranslation.y

    console.log('nb useful key points: ' + selectedCount)
  }

  console.log('found transformation x: ' + trans.x + ' y: ' + trans.y)

  return {
    transformation: trans,
    previousCorners: transformedcorners,
    previousDescriptor: descriptor
  }
}

export function calculateTransformation(
  callback,
  sensor,
  video,
  startMatrix,
  previousTransformation,
  previousDescriptor,
  previousCorners,
  brief,
  videoParameters
) {
  if(brief == null)
    brief = new Brief(512)
  calculateTransformationSensors(sensor, startMatrix).then(result => {
    if (result === null) return

    calculateTransformationCamera(
      video,
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
