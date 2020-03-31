function FASTDetector(rgbaPixels, width){
    let threshold = 50;
    let nbContiguous = 14;
    let interestingPoints = [];

  let grayMatrix = grayScaleMatrix(rgbaPixels, width);

  for (let y = 3; y < grayMatrix.length - 3; y++) {
    for (let x = 3; x < grayMatrix[0].length - 3; x++) {
      let intensity = grayMatrix[y][x];
      let circle = bresenhamCircle([x, y]);
      for (let i = 0; i < circle.length; i++)
          circle[i] = grayMatrix[circle[i][1]][circle[i][0]];
      let nbOutOfThreshold = 0;

      if (outOfThreshold(intensity, circle[0], threshold)) nbOutOfThreshold++;
      if (outOfThreshold(intensity, circle[4], threshold)) nbOutOfThreshold++;
      if (outOfThreshold(intensity, circle[8], threshold)) nbOutOfThreshold++;
      if (outOfThreshold(intensity, circle[12], threshold)) nbOutOfThreshold++;

      let intensityStreak = 0;

      if (nbOutOfThreshold >= 3) {
        nbOutOfThreshold = 0;
        for (let i in circle) {
          if (outOfThreshold(intensity, circle[i], threshold)) {
            nbOutOfThreshold++;
          } else {
            intensityStreak = Math.max(intensityStreak, nbOutOfThreshold);
            nbOutOfThreshold = 0;
          }
        }

        if (nbOutOfThreshold >= nbContiguous) interestingPoints.push([x, y]);
      }
    }
  }

  return interestingPoints;
}

function outOfThreshold(intensity1, intensity2, threshold) {
  return Math.abs(intensity1 - intensity2) > threshold;
}
//radius = 3 voor FAST! => dit moet 16 pixels teruggeven
function bresenhamCircle(midPointCoo) {
  let circle = [
    [0, -3],
    [1, -3],
    [2, -2],
    [3, -1],
    [3, 0],
    [3, 1],
    [2, 2],
    [1, 3],
    [0, 3],
    [-1, 3],
    [-2, 2],
    [-3, 1],
    [-3, 0],
    [-3, -1],
    [-2, -2],
    [-1, -3]
  ];
  for (let i = 0; i < circle.length; i++) {
    circle[i][0] += midPointCoo[0];
    circle[i][1] += midPointCoo[1];
  }

  return circle;
}

function grayScaleMatrix(rgbaPixels, width){
    let y = 0;
    let matrix = [[]];
    for(let i = 0; i < rgbaPixels.length; i += 4){
        //let grayScale = 0.3 * rgbaPixels[i] + 0.59 * rgbaPixels[i + 1] + 0.11 * rgbaPixels[i + 1];
        let grayScale = (rgbaPixels[i] + rgbaPixels[i + 1] + rgbaPixels[i + 2]) / 3;
        if(matrix[y].length >= width - 1){
            x = 0;
            y++;
            matrix.push([]);
        }
        matrix[y].push(grayScale);
  }

  return matrix;
}
