function FASTDetector(pixels, width, height, threshold) {
  let blocks = 20
  //Width and height of video are 640x480.
  let blockWidth = width / blocks
  let blockHeight = height / blocks
  let interestingPoints = []
  for (let i = 0; i < blocks * blocks; i++) {
    let blockX = i % blocks
    let blockY = (i / blocks) >> 0

    let point = blockFASTDetector(
      pixels,
      width,
      blockX,
      blockY,
      blockWidth,
      blockHeight,
      threshold
    )
    if (point !== null) {
      interestingPoints.push(point[0])
      interestingPoints.push(point[1])
    }
  }

  return interestingPoints
}

function blockFASTDetector(
  pixels,
  width,
  blockX,
  blockY,
  blockWidth,
  blockHeight,
  threshold
) {
  let offsets = bresenhamCircle(width)

  for (let i = 0; i < (blockWidth - 6) * (blockHeight - 6); i++) {
    let x = blockX * blockWidth + 3 + (i % (blockWidth - 6))
    let y = (blockY * blockHeight + 3 + i / blockWidth) >> 0
    let position = y * width + x

    let intensity = pixels[position]
    let circles = new Int32Array(16)
    for (let j = 0; j < 16; j++) {
      circles[j] = pixels[position + offsets[j]]
    }

    if (circleIsPossible(intensity, circles, threshold)) {
      //Check all possible startPositions
      for (let startPos = 0; startPos < 16; startPos++) {
        let darker = true
        let brighter = true
        for (let dist = 0; dist < 9; dist++) {
          let circle = circles[(startPos + dist) & 15]
          if (!isBrighter(intensity, circle, threshold)) {
            brighter = false
            if (darker === false) {
              break
            }
          }
          if (!isDarker(intensity, circle, threshold)) {
            darker = false
            if (brighter === false) {
              break
            }
          }
        }
        if (brighter || darker) {
          return [x, y]
        }
      }
    }
  }

  return null
}

//radius = 3 voor FAST! => dit moet 16 pixels teruggeven
function bresenhamCircle(width) {
  let circle = new Int32Array(16)

  circle[0] = -width - width - width
  circle[1] = circle[0] + 1
  circle[2] = circle[1] + width + 1
  circle[3] = circle[2] + width + 1
  circle[4] = circle[3] + width
  circle[5] = circle[4] + width
  circle[6] = circle[5] + width - 1
  circle[7] = circle[6] + width - 1
  circle[8] = circle[7] - 1
  circle[9] = circle[8] - 1
  circle[10] = circle[9] - width - 1
  circle[11] = circle[10] - width - 1
  circle[12] = circle[11] - width
  circle[13] = circle[12] - width
  circle[14] = circle[13] - width + 1
  circle[15] = circle[14] - width + 1

  return circle
}

function isBrighter(middle, circle, threshold) {
  return circle - middle > threshold
}

function isDarker(middle, circle, threshold) {
  return middle - circle > threshold
}

function circleIsPossible(middle, circles, threshold) {
  let count = 0
  if (isBrighter(middle, circles[0], threshold)) count++
  if (isBrighter(middle, circles[4], threshold)) count++
  if (isBrighter(middle, circles[8], threshold)) count++
  if (isBrighter(middle, circles[12], threshold)) count++

  if (count < 3) {
    count = 0
    if (isDarker(middle, circles[0], threshold)) count++
    if (isDarker(middle, circles[4], threshold)) count++
    if (isDarker(middle, circles[8], threshold)) count++
    if (isDarker(middle, circles[12], threshold)) count++
  }

  return count >= 3
}

function grayScaleImgData(pixels) {
  let gray = new Uint8ClampedArray(pixels.length >> 2)
  let w = 0
  for (let p = 0; p < pixels.length; p += 4)
    gray[w++] =
      pixels[p] * 0.299 + pixels[p + 1] * 0.587 + pixels[p + 2] * 0.114

  return gray
}
