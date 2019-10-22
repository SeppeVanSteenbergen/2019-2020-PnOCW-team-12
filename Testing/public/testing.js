const sourceFolder = '/Images/'

function runAllTests() {
  console.log("----------Start tests----------")
  console.log("----------Sreen detection tests----------")
  checkNbScreens(0)
  checkSize(0)
  checkOrientation(0);
  console.log("----------Barcode tests----------")
  checkBarcode(0);
}
