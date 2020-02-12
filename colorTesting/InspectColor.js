/*
Basic idea:
Elke pixel sorteren in zijn/haar kleur mbv colorRange.
ColorRange met meeste pixels in zich is de kleur
Gemiddelde van alle kleuren in deze color range is benaderde kleur. En dus het verschil met de echte.
 */
function inspectColor() {
    let inputCanvas = document.getElementById('inputImage');
    let inputContext = inputCanvas.getContext('2d');
    let inputImgData = inputContext.getImageData(
        0,
        0,
        imgElement.width,
        imgElement.height
    );
    let pixelsRgba = inputImgData.data
    let pixelsHsla = ColorSpace.rgbaToHsla(pixelsRgba.slice())

    let colorCount = {
        'red':0,
        'green':0,
        'blue':0,
        'purple':0,
        'blueGreen':0,
        'yellow':0,
        'white':0,
        'black':0,
        'other':0
    }

    let guessedColor ={
        'red': [0,0,0],
        'green':[0,0,0],
        'blue':[0,0,0],
        'purple':[0,0,0],
        'blueGreen':[0,0,0],
        'yellow':[0,0,0],
        'white':[0,0,0],
        'black':[0,0,0],
        'other':[0,0,0]
    }

    for(let i = 0; i < pixelsHsla.length; i += 4){
        let h = pixelsHsla[i] * 2
        let s = pixelsHsla[i + 1]
        let l = pixelsHsla[i + 2]
        if(ColorRange.inRedRange(h, s, l)) {
            guessedColor.red = calcAverage(guessedColor.red, colorCount.red, [h, s, l])
            colorCount.red++
        }
        else if(ColorRange.inGreenRange(h, s, l)){
            guessedColor.green = calcAverage(guessedColor.green, colorCount.green, [h, s, l])
            colorCount.green++
        }
        else if(ColorRange.inBlueRange(h, s, l)){
            guessedColor.blue = calcAverage(guessedColor.blue, colorCount.blue, [h, s, l])
            colorCount.blue++
        }
        else if(ColorRange.inBlueGreenRange(h, s, l)){
            guessedColor.blueGreen = calcAverage(guessedColor.blueGreen, colorCount.blueGreen, [h, s, l])
            colorCount.blueGreen++
        }
        else if(ColorRange.inYellowRange(h, s, l)){
            guessedColor.yellow = calcAverage(guessedColor.yellow, colorCount.yellow, [h, s, l])
            colorCount.yellow++
        }
        else if(ColorRange.inWhiteRange(h, s, l)){
            guessedColor.white = calcAverage(guessedColor.white, colorCount.white, [h, s, l])
            colorCount.white++
        }
        else if(ColorRange.inBlackRange(h, s, l)){
            guessedColor.black = calcAverage(guessedColor.black, colorCount.black, [h, s, l])
            colorCount.black++
        }
        else {
            guessedColor.other = calcAverage(guessedColor.other, colorCount.other, [h, s, l])
            colorCount.other++
        }
    }

    let max = Math.max(...Object.values(colorCount))
    let maxColor = Object.keys(colorCount).find(key => colorCount[key] === max)
    let coverage = max / (pixelsHsla.length / 4) * 100



    let maxColorRgb = displayInspection(maxColor, guessedColor[maxColor], coverage)


    return [maxColor, guessedColor[maxColor], maxColorRgb, max, coverage]
}

function calcAverage(prevAverage, prevCount, newColor){
    return prevAverage.map((v, i) => ((v * prevCount) + newColor[i])/(prevCount+1))
}

function displayInspection(maxColorName, maxColorValue, coverage){
    document.getElementById('foundColor').innerText = "Found Color: " + maxColorName
    document.getElementById('coverage').innerText = "Coverage: " + coverage + "%"

    maxColorValue[0] /= 2
    let maxColorRgb = ColorSpace.hslaToRgba(maxColorValue)
    maxColorValue[0] *= 2

    let previewColor = document.getElementById('guessedColor')
    let previewColorCtx = previewColor.getContext('2d')
    previewColorCtx.beginPath();
    previewColorCtx.rect(0, 0, 100, 100);
    previewColorCtx.fillStyle = 'rgb(' + maxColorRgb[0] + ', ' + maxColorRgb[1] + ', ' + maxColorRgb[2] + ')';
    previewColorCtx.fill();
    let colorValue = nameToColor(maxColorName)
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