
// https://trackingjs.com/api/Brief.js.html
let N = 512,
    randomImageOffsets = {},
    randomWindowOffsets = {};
export default class Brief {
  static getDescriptors(pixels, width, keyPoints) {
    // Optimizing divide by 32 operation using binary shift
    // (this.N >> 5) === this.N/32.
    let descriptors = new Int32Array((keyPoints.length >> 1) * (N >> 5));
    let descriptorWord = 0;
    let offsets = this.getRandomOffsets(width);
    let position = 0;
    for (let i = 0; i < keyPoints.length; i += 2) {
      let w = width * keyPoints[i + 1] + keyPoints[i];
      let offsetsPosition = 0;
      for (let j = 0, n = N; j < n; j++) {
        if (pixels[offsets[offsetsPosition++] + w] < pixels[offsets[offsetsPosition++] + w]) {
          // The bit in the position `j % 32` of descriptorWord should be set to 1. We do
          // this by making an OR operation with a binary number that only has the bit
          // in that position set to 1. That binary number is obtained by shifting 1 left by
          // `j % 32` (which is the same as `j & 31` left) positions.
          descriptorWord |= 1 << (j & 31);
        }
        // If the next j is a multiple of 32, we will need to use a new descriptor word to hold
        // the next results.
        if (!((j + 1) & 31)) {
          descriptors[position++] = descriptorWord;
          descriptorWord = 0;
        }
      }
    }
    return descriptors;
  }

  static getRandomOffsets(width) {
    if (!randomWindowOffsets) {
      let windowPosition = 0;
      let windowOffsets = new Int32Array(4 * this.N);
      for (let i = 0; i < this.N; i++) {
        windowOffsets[windowPosition++] = Math.round(this.uniformRandom(-15, 16));
        windowOffsets[windowPosition++] = Math.round(this.uniformRandom(-15, 16));
        windowOffsets[windowPosition++] = Math.round(this.uniformRandom(-15, 16));
        windowOffsets[windowPosition++] = Math.round(this.uniformRandom(-15, 16));
      }
      randomWindowOffsets = windowOffsets;
    }
    if (!randomImageOffsets[width]) {
      let imagePosition = 0;
      let imageOffsets = new Int32Array(2 * this.N);
      for (let j = 0; j < this.N; j++) {
        imageOffsets[imagePosition++] = randomWindowOffsets[4 * j] * width + randomWindowOffsets[4 * j + 1];
        imageOffsets[imagePosition++] = randomWindowOffsets[4 * j + 2] * width + randomWindowOffsets[4 * j + 3];
      }
      randomImageOffsets[width] = imageOffsets;
    }
    return randomImageOffsets[width];
  }

  static uniformRandom(a, b) {
    return a + Math.random() * (b - a)
  }

  static reciprocalMatch(keypoints1, descriptors1, keypoints2, descriptors2) {
    let matches = [];
    if (keypoints1.length === 0 || keypoints2.length === 0) {
      return matches;
    }
    let matches1 = this.match(keypoints1, descriptors1, keypoints2, descriptors2);
    let matches2 = this.match(keypoints2, descriptors2, keypoints1, descriptors1);
    for (let i = 0; i < matches1.length; i++) {
      if (matches2[matches1[i].index2].index2 === i) {
        matches.push(matches1[i]);
      }
    }
    return matches;
  }

  static match(keypoints1, descriptors1, keypoints2, descriptors2) {
    let len1 = keypoints1.length >> 1;
    let len2 = keypoints2.length >> 1;
    let matches = new Array(len1);
    for (let i = 0; i < len1; i++) {
      let min = Infinity;
      let minj = 0;
      for (let j = 0; j < len2; j++) {
        let dist = 0;
        // Optimizing divide by 32 operation using binary shift
        // (this.N >> 5) === this.N/32.
        for (let k = 0, n = this.N >> 5; k < n; k++) {
          dist += this.hammingWeight(descriptors1[i * n + k] ^ descriptors2[j * n + k]);
        }
        if (dist < min) {
          min = dist;
          minj = j;
        }
      }
      matches[i] = {
        index1: i,
        index2: minj,
        keypoint1: [keypoints1[2 * i], keypoints1[2 * i + 1]],
        keypoint2: [keypoints2[2 * minj], keypoints2[2 * minj + 1]],
        confidence: 1 - min / this.N
      }
    }
    return matches
  }

  static hammingWeight(i) {
    i = i - ((i >> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
    return ((i + (i >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
  }
}