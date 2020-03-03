/*
Basic idea:
Elke pixel sorteren in zijn/haar kleur mbv colorRange.
ColorRange met meeste pixels in zich is de kleur
Gemiddelde van alle kleuren in deze color range is benaderde kleur. En dus het verschil met de echte.
 */
function inspector() {
    let imageURLs = []
    let filesInput = document.getElementById("fileInput");
    let files = filesInput.files;
    let list = []
    if(document.getElementById("colorCount").value == "one")
        inspecting(files, files.length - 1, list)
    if(document.getElementById("colorCount").value == "two")
        inspecting2(files, files.length - 1, list)

    console.log(list)
}
function inspecting2(fileList, nb, list) {
    if (nb < 0) {
        alert("done")
        return list
    }
    let file = fileList[nb]
    let picReader = new FileReader()
    picReader.addEventListener("load", function (event) {
        let picFile = event.target;
        list.push(picFile.result)
        let expColor = document.getElementById("color").value
        let expColor2 = document.getElementById("color2").value
        inspectColorHSL(picFile.result, expColor)
        inspectColorRGB(picFile.result, expColor)
        inspectColorHSL(picFile.result, expColor2)
        inspectColorRGB(picFile.result, expColor2)
        inspecting(fileList, nb - 1, list)
    })
    picReader.readAsDataURL(file);
}

function inspecting(fileList, nb, list) {
    if (nb < 0) {
        alert("done")
        return list
    }
    let file = fileList[nb]
    let picReader = new FileReader()
    picReader.addEventListener("load", function (event) {
        let picFile = event.target;
        list.push(picFile.result)
        let expColor = document.getElementById("color").value
        inspectColorHSL(picFile.result, expColor)
        inspectColorRGB(picFile.result, expColor)
        inspecting(fileList, nb - 1, list)
    })
    picReader.readAsDataURL(file);
}

function inspectColorHSL(imgURL, expColor) {
    let canvas = document.createElement("canvas")
    let img = new Image()

    img.onload = function () {
        canvas.width = img.width
        canvas.height = img.height
        let ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)

        let imgData = ctx.getImageData(
            0,
            0,
            img.width,
            img.height)
        let pixelsRgba = imgData.data
        let pixelsHsla = ColorSpace.rgbaToHsla(pixelsRgba.slice())

        let colorCount = {
            'red1': 0,
            'red2': 0,
            'green': 0,
            'blue': 0,
            'purple': 0,
            'blueGreen': 0,
            'yellow': 0,
            'white': 0,
            'black': 0,
            'red':0
        }

        let averageColor = [0,0,0]
        let count = 0
        let widthStart = Math.floor(img.width / 3)
        let widthEnd = 2 * widthStart + 1
        let heightStart = Math.floor(img.height / 3)
        let heightEnd = 2 * heightStart + 1

        for (let i = heightStart; i < heightEnd; i++) {
            for (let j = widthStart; j < widthEnd; j++) {
                let pos = pixelToPosition(i, j, img.width)
                let h = pixelsHsla[pos] * 2
                let s = pixelsHsla[pos + 1]
                let l = pixelsHsla[pos + 2]
                averageColor = calcAverage(averageColor, count++, [h, s, l])
                colorCount[ColorRange.closestColor(h,s,l)]++
            }
        }
        colorCount.red = colorCount.red1 + colorCount.red2
        let coverageExp = (colorCount[expColor] / ((widthEnd - widthStart) * (heightEnd - heightStart))) * 100
        let max = Math.max(...Object.values(colorCount))
        let maxColor = Object.keys(colorCount).find(key => colorCount[key] === max)
        let coverageFound = max / ((widthEnd - widthStart) * (heightEnd - heightStart)) * 100

        setInspectedValues(expColor, maxColor, averageColor, coverageExp, coverageFound, "HSL")
    }
    img.src = imgURL;
}

/*
Deze functie gaat de kleur zoeken met behulp van de kleurafstand
 */
function inspectColorRGB(imgURL, expColor) {
    let canvas = document.createElement("canvas")
    let img = new Image()

    img.onload = function () {
        canvas.width = img.width
        canvas.height = img.height
        let ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)
        let imgData = ctx.getImageData(
            0,
            0,
            img.width,
            img.height)

        let pixels = imgData.data

        let colorCount = {
            'red': 0,
            'green': 0,
            'blue': 0,
            'purple': 0,
            'blueGreen': 0,
            'yellow': 0,
            'white': 0,
            'black': 0,
            'other': 0
        }

        let averageColor = [0,0,0]
        let count = 0
        let widthStart = Math.floor(img.width / 3)
        let widthEnd = 2 * widthStart + 1
        let heightStart = Math.floor(img.height / 3)
        let heightEnd = 2 * heightStart + 1

        for (let i = heightStart; i < heightEnd; i++) {
            for (let j = widthStart; j < widthEnd; j++) {
                let pos = pixelToPosition(i, j, img.width)
                let color = [pixels[pos], pixels[pos + 1], pixels[pos + 2]]
                averageColor = calcAverage(averageColor, count++, color)
                let redDistance = calcColorDistance(nameToColor("red"), color)
                let greenDistance = calcColorDistance(nameToColor("green"), color)
                let blueDistance = calcColorDistance(nameToColor("blue"), color)
                let purpleDistance = calcColorDistance(nameToColor("purple"), color)
                let blueGreenDistance = calcColorDistance(nameToColor("blueGreen"), color)
                let yellowDistance = calcColorDistance(nameToColor("yellow"), color)
                let whiteDistance = calcColorDistance(nameToColor("white"), color)
                let blackDistance = calcColorDistance(nameToColor("black"), color)

                let min = Math.min(redDistance, greenDistance, blueDistance,
                    purpleDistance, blueGreenDistance, yellowDistance, whiteDistance, blackDistance)

                switch (min) {
                    case redDistance:
                        colorCount.red++
                        break
                    case greenDistance:
                        colorCount.green++
                        break
                    case blueDistance:
                        colorCount.blue++
                        break
                    case purpleDistance:
                        colorCount.purple++
                        break
                    case blueGreenDistance:
                        colorCount.blueGreen++
                        break
                    case yellowDistance:
                        colorCount.yellow++
                        break
                    case whiteDistance:
                        colorCount.white++
                        break
                    case blackDistance:
                        colorCount.black++
                        break
                }
            }
        }
        let coverageExp = (colorCount[expColor] / ((widthEnd - widthStart) * (heightEnd - heightStart))) * 100

        let max = Math.max(...Object.values(colorCount))
        let maxColor = Object.keys(colorCount).find(key => colorCount[key] === max)
        let coverageFound = max / ((widthEnd - widthStart) * (heightEnd - heightStart)) * 100

        setInspectedValues(expColor, maxColor, averageColor, coverageExp, coverageFound, "RGB")
    }
    img.src = imgURL;
}

function calcAverage(prevAverage, prevCount, newColor) {
    return prevAverage.map((v, i) => ((v * prevCount) + newColor[i]) / (prevCount + 1))
}

function setInspectedValues(expColor, colorName, color, coverageExp, coverageFound, colorSpace) {
    $.ajax({
        type: 'post',
        url: '../peno/database.php',
        data: {
            expColor: '"' + expColor + '"',
            foundColor: '"' + colorName + '"',
            colorValue1: color[0],
            colorValue2: color[1],
            colorValue3: color[2],
            distance: calcColorDistance(nameToColor(expColor), color),
            coverageExp: coverageExp,
            coverageFound: coverageFound,
            colorSpace: '"' + colorSpace + '"',
            environment: '"' + document.getElementById("env").value + '"',
            light: '"' + document.getElementById("light").value + '"',
            brightness:'"' + document.getElementById("brightness").value + '"'
        }
    });

}

function displayInspection(maxColorName, maxColorValue, coverage, colorSpace) {
    document.getElementById('foundColor').innerText = "Found Color: " + maxColorName
    document.getElementById('coverage').innerText = "Coverage: " + coverage + "%"

    let maxColorRgb
    if (colorSpace === "HSL") {
        maxColorValue[0] /= 2
        maxColorRgb = ColorSpace.hslaToRgba(maxColorValue)
        maxColorValue[0] *= 2
    } else {
        maxColorRgb = maxColorValue
    }

    let previewColor = document.getElementById('guessedColor')
    let previewColorCtx = previewColor.getContext('2d')
    previewColorCtx.beginPath();
    previewColorCtx.rect(0, 0, 100, 100);
    previewColorCtx.fillStyle = 'rgb(' + maxColorRgb[0] + ', ' + maxColorRgb[1] + ', ' + maxColorRgb[2] + ')';
    previewColorCtx.fill();
    let colorValue = nameToColor(document.getElementById("color").value)
    let distance = calcColorDistance(maxColorValue, colorValue)

    document.getElementById('distance').innerText = "Colordistance: " + distance
    return maxColorRgb
}

function nameToColor(name) {
    switch (name) {
        case 'red' :
            return [255, 0, 0]
        case 'green' :
            return [0, 255, 0]
        case 'blue' :
            return [0, 0, 255]
        case 'blueGreen' :
            return [0, 128, 128]
        case 'purple' :
            return [128, 0, 128]
        case 'yellow' :
            return [128, 128, 0]
        case 'white' :
            return [255, 255, 255]
        case 'black' :
            return [0, 0, 0]
        default:
            return [Infinity, Infinity, Infinity]
    }
}

function calcColorDistance(color1, color2) {
    let r = Math.pow(color2[0] - color1[0], 2)
    let g = Math.pow(color2[1] - color1[1], 2)
    let b = Math.pow(color2[2] - color1[2], 2)
    return Math.sqrt(r + g + b)
}

function positionToPixel(position, width) {
    position /= 4
    let x = position % width
    let y = (position - x) / width
    return [x, y]
}

function pixelToPosition(x, y, width) {
    return (width * y + x) * 4
}