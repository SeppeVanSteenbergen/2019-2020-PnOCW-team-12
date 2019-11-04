class PermutationConverter {
  // Permutable is a string with numbers 1 to 5

  // logic http://keithschwarz.com/interesting/code/?dir=factoradic-permutation

  // permutable to factoradic https://www.researchgate.net/figure/The-Lehmer-code-A-complete-translation-from-permutation-to-decimal-by-way-of-the_fig1_230831447

  // factoradic and permutation must be a string of numbers  -> 0 can't go in front of int

  /**
   * Encode a number to a permuted array number
   * @param num
   *        int will always be transformed to modulo 120
   * @returns number
   *          A number representing a permuted array
   */
  static encode(num) {
    let fact = this.numberToFactoradic(num)
    return this.factoradicToPermutation(fact)
  }

  /**
   * Decodes a permuted number to a value
   * @param permutable
   *        The numbers 1-5 that are permuted
   * @returns number
   *          The value representing the given permutation
   */
  static decode(permutable) {
    let fact = this.permutationToFactoradic(permutable)
    return this.factoradicToNumber(fact)
  }

  static factoradicLength() {
    return 5
  }

  static permutableList() {
    return [1, 2, 3, 4, 5]
  }

  static factoradicToNumber(fact) {
    let numList = fact.toString().split('')
    let value = 0
    let counter = 5
    let multiplier = 1
    for (let i = 0; i < numList.length; i++) {
      value += numList[i] * multiplier
      multiplier *= counter--
    }
    return value
  }

  static numberToFactoradic(num) {
    let factoradicList = []

    for (let i = this.factoradicLength(); i > 0; i--) {
      factoradicList.push(num % i)
      num = Math.floor(num / i)
    }

    // converting list to number
    return factoradicList.toString().replace(/,/g, '')
  }

  static factoradicToPermutation(fact) {
    let permutable = this.permutableList()
    let factoradicList = fact.toString().split('')
    for (let i = 0; i < permutable.length; i++) {
      this.moveElementInArray(permutable, i + parseInt(factoradicList[i]), i)
    }
    return parseInt(permutable.toString().replace(/,/g, ''))
  }

  static moveElementInArray(array, startIndex, endIndex) {
    let num = array[startIndex]
    array.splice(startIndex, 1)
    array.splice(endIndex, 0, num)
  }

  static permutationToFactoradic(permutable) {
    let permutableList = permutable.toString().split('')
    let factoradicList = []

    while (permutableList.length > 0) {
      // check # of bigger elems after
      let biggerNumbers = 0
      for (let i = 1; i < permutableList.length; i++) {
        if (permutableList[i] < permutableList[0]) {
          biggerNumbers++
        }
      }

      // append answer to factoradic List
      factoradicList.push(biggerNumbers)

      // remove the first in permutable
      permutableList.splice(0, 1)
    }

    return factoradicList.toString().replace(/,/g, '')
  }
}
