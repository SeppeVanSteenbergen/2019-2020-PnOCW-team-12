function FASTDetector(pixels, width, height, threshold) {
    let blocks = 20
    //Width and height of video are 640x480.
    let blockWidth = width / blocks
    let blockHeight = height / blocks
    let interestingPoints = []
    for (let i = 0; i < blocks * blocks; i++) {
        let blockX = i % blocks
        let blockY = (i / blocks) >> 0

        let point = blockFASTDetector(pixels, width, blockX, blockY, blockWidth, blockHeight, threshold)
        if (point !== null) {
            interestingPoints.push(point[0])
            interestingPoints.push(point[1])
        }
    }

    return interestingPoints
}

function blockFASTDetector(pixels, width, blockX, blockY, blockWidth, blockHeight, threshold) {
    let nbContiguous = 12

    let offsets = bresenhamCircle(width)
    for (let i = 0; i < (blockWidth - 6) * (blockHeight - 6); i++) {
        let x = blockX * blockWidth + 3 + (i % (blockWidth - 6))
        let y = (blockY * blockHeight + 3 + i / blockWidth) >> 0
        let position = y * width + x

        let intensity = pixels[position]
        let circles = new Array(offsets.length)
        for (let j = 0; j < offsets.length; j++) {
            circles[j] = pixels[position + offsets[j]]
        }

        let nbOutOfThreshold = 0
        if (outOfThreshold(intensity, circles[0], threshold)) nbOutOfThreshold++
        if (outOfThreshold(intensity, circles[4], threshold)) nbOutOfThreshold++
        if (outOfThreshold(intensity, circles[8], threshold)) nbOutOfThreshold++
        if (outOfThreshold(intensity, circles[12], threshold)) nbOutOfThreshold++

        let intensityStreak = 0
        if (nbOutOfThreshold >= 3) {
            nbOutOfThreshold = 0
            for (let circle of circles) {
                if (outOfThreshold(intensity, circle, threshold)) {
                    nbOutOfThreshold++
                } else {
                    intensityStreak = Math.max(intensityStreak, nbOutOfThreshold)
                    nbOutOfThreshold = 0
                }
            }
            //x en y apart, dit is efficiënter qua geheugen
            if (intensityStreak >= nbContiguous) {
                return [x, y]
            }
        }
    }

    return null
}

//radius = 3 voor FAST! => dit moet 16 pixels teruggeven
function bresenhamCircle(width) {
    return [
        -3 * width,
        -3 * width + 1,
        -2 * width + 2,
        -1 * width + 3,
        3,
        1 * width + 3,
        2 * width + 2,
        3 * width + 1,
        3 * width,
        3 * width - 1,
        2 * width - 2,
        1 * width - 3,
        -3,
        -1 * width - 3,
        -2 * width - 2,
        -3 * width - 1
    ]
}

function outOfThreshold(intensity1, intensity2, threshold) {
    return Math.abs(intensity1 - intensity2) > threshold
}

function grayScaleImgData(pixels) {
    let gray = new Uint8ClampedArray(pixels.length >> 2)
    let w = 0
    for (let p = 0; p < pixels.length; p += 4)
        gray[w++] =
            pixels[p] * 0.299 + pixels[p + 1] * 0.587 + pixels[p + 2] * 0.114

    return gray
}
