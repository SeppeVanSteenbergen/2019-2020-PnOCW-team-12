const factLen = 5 // Length of factoradic  (5 allows to encode 120 states)

module.exports = class PermutationConverter {


  // Permutable is a string with numbers 0 to 4

  // logic http://keithschwarz.com/interesting/code/?dir=factoradic-permutation

  // permutable to factoradic https://www.researchgate.net/figure/The-Lehmer-code-A-complete-translation-from-permutation-to-decimal-by-way-of-the_fig1_230831447

  // factoradic and permutation must be a string of numbers  -> 0 can't go in front of int


  static encode(num) {
    let fact = this.numberToFactoradic(num)
    let perm = this.factoradicToPermutation(fact)
    return perm
  }
  static decode(permutable) {
    let fact = this.permutationToFactoradic(permutable)
    let num = this.factoradicToNumber(fact)
    return num
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

    for (let i = factLen; i > 0; i--) {
      factoradicList.push(num % i)
      num = Math.floor(num / i)
    }

    // converting list to number
    return factoradicList.toString().replace(/,/g, '')
  }

  static factoradicToPermutation(fact) {
    let permutable = [0, 1, 2, 3, 4]
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