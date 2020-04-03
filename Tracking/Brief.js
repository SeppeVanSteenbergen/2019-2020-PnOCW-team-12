
// https://trackingjs.com/api/Brief.js.html
class Brief {
  static N = 128
  static randomImageOffsets = {}
  static randomWindowOffsets = null

  static getDescriptors(pixels, width, keyPoints) {
    // Optimizing divide by 32 operation using binary shift
    // (this.N >> 5) === this.N/32.
    let descriptors = new Int32Array((keyPoints.length >> 1) * (this.N >> 5));
    let descriptorWord = 0;
    let offsets = this.getRandomOffsets(width);
    let position = 0;
    for (let i = 0; i < keyPoints.length; i += 2) {
      let w = width * keyPoints[i + 1] + keyPoints[i];
      let offsetsPosition = 0;
      for (let j = 0, n = this.N; j < n; j++) {
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
    if (!this.randomWindowOffsets) {
      let windowPosition = 0;
      let windowOffsets = new Int32Array(4 * this.N);
      for (let i = 0; i < this.N; i++) {
        windowOffsets[windowPosition++] = Math.round(this.uniformRandom(-15, 16));
        windowOffsets[windowPosition++] = Math.round(this.uniformRandom(-15, 16));
        windowOffsets[windowPosition++] = Math.round(this.uniformRandom(-15, 16));
        windowOffsets[windowPosition++] = Math.round(this.uniformRandom(-15, 16));
      }
      this.randomWindowOffsets = windowOffsets;
    }
    if (!this.randomImageOffsets[width]) {
      let imagePosition = 0;
      let imageOffsets = new Int32Array(2 * this.N);
      for (let j = 0; j < this.N; j++) {
        imageOffsets[imagePosition++] = this.randomWindowOffsets[4 * j] * width + this.randomWindowOffsets[4 * j + 1];
        imageOffsets[imagePosition++] = this.randomWindowOffsets[4 * j + 2] * width + this.randomWindowOffsets[4 * j + 3];
      }
      this.randomImageOffsets[width] = imageOffsets;
    }
    return this.randomImageOffsets[width];
  }

  static uniformRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}