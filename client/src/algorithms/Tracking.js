import { FASTDetector, grayScaleImgData } from './FASTDetector'
import Brief from './Brief'

export function initializeTracking(callback) {
  setupSensor().then(sensor => {
    setupCamera().then(video => {
      console.log(sensor)
      console.log(video)

      video.onloadedmetadata = event => {
        video.play()

        calculateTransformation(callback, sensor, video, null, null, null, {
          threshold: 20,
          fictiveDepth: 1000,
          confidence: 0.75
        })
      }
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
  previousDescriptor,
  previousCorners,
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

  let transformedcorners = []
  for (let i = 0; i < corners.length; i += 2) {
    let point = new DOMPoint(
      corners[i],
      corners[i + 1],
      parameters.fictiveDepth
    )
    //point.matrixTransform(startTransformation)
    //TODO kan probleem zijn dat rotationmatrix ingesteld staat op roteren rond middenpunt
    //  punten staan t.o.v. linkerbovenhoek
    transformedcorners.push(point.x)
    transformedcorners.push(point.y)
  }

  console.log('founded transformed corners')

  let descriptor = Brief.getDescriptors(
    grayScaleImgData(imageData, false),
    canvas.width,
    transformedcorners
  )
  let trans = {
    x: 0,
    y: 0
  }
  if (previousDescriptor !== null) {
    let matches = Brief.reciprocalMatch(
      previousCorners,
      previousDescriptor,
      transformedcorners,
      descriptor
    )
    let selectedCount = 0
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].confidence > parameters.confidence) {
        selectedCount++
        trans.x += matches[i].keypoint2[0] - matches[i].keypoint1[0]
        trans.y += matches[i].keypoint2[1] - matches[i].keypoint1[1]
      }
    }
    if (selectedCount > 0) {
      trans.x = trans.x / selectedCount
      trans.y = trans.y / selectedCount
    }
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
  previousDescriptor,
  previousCorners,
  videoParameters
) {
  calculateTransformationSensors(sensor, startMatrix).then(result => {
    calculateTransformationCamera(
      video,
      result.transformationMatrix,
      previousDescriptor,
      previousCorners,
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
          cameraResult.previousDescriptor,
          cameraResult.previousCorners,
          videoParameters
        )
      }, 50)
    })
    //calculateTransformation(callback, sensor, video, startMatrix, previousDescriptor, previousCorners, videoParameters)
  })
}
