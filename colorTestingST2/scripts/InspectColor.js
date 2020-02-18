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
    inspecting(files, files.length - 1, list)

    console.log(list)
}
function inspecting(fileList, nb, list){
    if(nb < 0) {
        alert("done")
        return list
    }
    let file = fileList[nb]
    let picReader = new FileReader()
    picReader.addEventListener("load", function(event){
        let picFile = event.target;
        list.push(picFile.result)
        inspectColor(picFile.result)
        inspectColor2(picFile.result)
        inspecting(fileList, nb - 1, list)
    })
    picReader.readAsDataURL(file);
}
function  inspectColor(imgURL) {
    let canvas = document.createElement("canvas")
    let img = new Image()

    img.onload = function (){

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

    let guessedColor = {
        'red': [0, 0, 0],
        'green': [0, 0, 0],
        'blue': [0, 0, 0],
        'purple': [0, 0, 0],
        'blueGreen': [0, 0, 0],
        'yellow': [0, 0, 0],
        'white': [0, 0, 0],
        'black': [0, 0, 0],
        'other': [0, 0, 0]
    }

    for (let i = 0; i < pixelsHsla.length; i += 4) {
        let h = pixelsHsla[i] * 2
        let s = pixelsHsla[i + 1]
        let l = pixelsHsla[i + 2]
        if (ColorRange.inRedRange(h, s, l)) {
            guessedColor.red = calcAverage(guessedColor.red, colorCount.red, [h, s, l])
            colorCount.red++
        } else if (ColorRange.inGreenRange(h, s, l)) {
            guessedColor.green = calcAverage(guessedColor.green, colorCount.green, [h, s, l])
            colorCount.green++
        } else if (ColorRange.inBlueRange(h, s, l)) {
            guessedColor.blue = calcAverage(guessedColor.blue, colorCount.blue, [h, s, l])
            colorCount.blue++
        } else if (ColorRange.inBlueGreenRange(h, s, l)) {
            guessedColor.blueGreen = calcAverage(guessedColor.blueGreen, colorCount.blueGreen, [h, s, l])
            colorCount.blueGreen++
        } else if (ColorRange.inYellowRange(h, s, l)) {
            guessedColor.yellow = calcAverage(guessedColor.yellow, colorCount.yellow, [h, s, l])
            colorCount.yellow++
        } else if (ColorRange.inWhiteRange(h, s, l)) {
            guessedColor.white = calcAverage(guessedColor.white, colorCount.white, [h, s, l])
            colorCount.white++
        } else if (ColorRange.inBlackRange(h, s, l)) {
            guessedColor.black = calcAverage(guessedColor.black, colorCount.black, [h, s, l])
            colorCount.black++
        } else {
            guessedColor.other = calcAverage(guessedColor.other, colorCount.other, [h, s, l])
            colorCount.other++
        }
    }

    let max = Math.max(...Object.values(colorCount))
    let maxColor = Object.keys(colorCount).find(key => colorCount[key] === max)
    let coverage = max / (pixelsHsla.length / 4) * 100

    setInspectedValues(maxColor, guessedColor[maxColor], coverage, "HSL")
    //displayInspection(maxColor, guessedColor[maxColor], coverage, "HSL")
    }
    img.src = imgURL;
}

/*
Deze functie gaat de kleur zoeken met behulp van de kleurafstand
 */
function inspectColor2(imgURL){
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

        let guessedColor = {
            'red': [0, 0, 0],
            'green': [0, 0, 0],
            'blue': [0, 0, 0],
            'purple': [0, 0, 0],
            'blueGreen': [0, 0, 0],
            'yellow': [0, 0, 0],
            'white': [0, 0, 0],
            'black': [0, 0, 0],
            'other': [0, 0, 0]
        }

        for (let i = 0; i < pixels.length; i += 4) {
            let color = [pixels[i], pixels[i + 1], pixels[i + 2]]

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
                    guessedColor.red = calcAverage(guessedColor.red, colorCount.red, color)
                    colorCount.red++
                    break
                case greenDistance:
                    guessedColor.green = calcAverage(guessedColor.green, colorCount.green, color)
                    colorCount.green++
                    break
                case blueDistance:
                    guessedColor.blue = calcAverage(guessedColor.blue, colorCount.blue, color)
                    colorCount.blue++
                    break
                case purpleDistance:
                    guessedColor.purple = calcAverage(guessedColor.purple, colorCount.purple, color)
                    colorCount.purple++
                    break
                case blueGreenDistance:
                    guessedColor.blueGreen = calcAverage(guessedColor.blueGreen, colorCount.blueGreen, color)
                    colorCount.blueGreen++
                    break
                case yellowDistance:
                    guessedColor.yellow = calcAverage(guessedColor.yellow, colorCount.yellow, color)
                    colorCount.yellow++
                    break
                case whiteDistance:
                    guessedColor.white = calcAverage(guessedColor.white, colorCount.white, color)
                    colorCount.white++
                    break
                case blackDistance:
                    guessedColor.black = calcAverage(guessedColor.black, colorCount.black, color)
                    colorCount.black++
                    break
            }
        }

        let max = Math.max(...Object.values(colorCount))
        let maxColor = Object.keys(colorCount).find(key => colorCount[key] === max)
        let coverage = max / (pixels.length / 4) * 100

        setInspectedValues(maxColor, guessedColor[maxColor], coverage, "RGB")
        //displayInspection(maxColor, guessedColor[maxColor], coverage, "RGB")
    }
    img.src = imgURL;
}
function calcAverage(prevAverage, prevCount, newColor){
    return prevAverage.map((v, i) => ((v * prevCount) + newColor[i])/(prevCount+1))
}

function setInspectedValues(colorName, color, coverage, colorSpace){
    $.ajax({
        type: 'post',
        url: '../peno/database.php',
        data: {
            Color: '"'+document.getElementById("color").value+'"',
            colorName: '"'+colorName+'"',
            colorValue1: color[0],
            colorValue2: color[1],
            colorValue3: color[2],
            distance: calcColorDistance(nameToColor(document.getElementById("color").value), color),
            coverage: coverage,
            colorSpace: '"'+colorSpace+'"',
            Environment: '"'+document.getElementById("env").value+'"',
            light: '"'+document.getElementById("light").value+'"',
            brightness: document.getElementById("brightness").value
        }
    });

}

function displayInspection(maxColorName, maxColorValue, coverage, colorSpace){
    document.getElementById('foundColor').innerText = "Found Color: " + maxColorName
    document.getElementById('coverage').innerText = "Coverage: " + coverage + "%"

    let maxColorRgb
    if(colorSpace === "HSL"){
        maxColorValue[0] /= 2
        maxColorRgb = ColorSpace.hslaToRgba(maxColorValue)
        maxColorValue[0] *= 2
    }else{
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

function nameToColor(name){
    switch(name) {
        case 'red' : return [255, 0, 0]
        case 'green' : return [0, 255, 0]
        case 'blue' : return [0, 0, 255]
        case 'blueGreen' : return [0, 128, 128]
        case 'purple' : return [128, 0, 128]
        case 'yellow' : return [128, 128, 0]
        case 'white' : return [255, 255, 255]
        case 'black' : return [0, 0, 0]
        default: return [Infinity, Infinity, Infinity]
    }
}

function calcColorDistance(color1, color2){
    let r = Math.pow(color2[0] - color1[0], 2)
    let g = Math.pow(color2[1] - color1[1], 2)
    let b = Math.pow(color2[2] - color1[2], 2)
    return Math.sqrt(r + g + b)
}