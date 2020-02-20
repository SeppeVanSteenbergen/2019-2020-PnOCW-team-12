const { GoogleSpreadsheet } = require('google-spreadsheet')

//User access data
const creds = require('./SheetsAccessData.json')

/**
 * Voeg een resultaat toe aan de spreadsheet
 *
 * @param {string} sheetName name van de sheet voor verschillende testen
 * @param {*} worldTimeDiff het toe te voegen resultaat van de test (nog te formateren)
 */
async function addResult(sheetName, worldTimeDiff, platform, software) {
  const doc = new GoogleSpreadsheet(
    '1EmCMgxQU1lcrSWjA_ZNNX56SQm4W5Tn7bzrSKo85rqw'
  )

  //async access to sheet
  await doc.useServiceAccountAuth(creds)

  //add row of data
  await doc.loadInfo()
  const sheet = await doc.sheetsByIndex[sheetToId(sheetName)]

  //TODO: laat result al geformateerd als param zijn!
  await sheet.addRow({ time: worldTimeDiff, os: platform, browser: software})

  console.log('Added %s to spreadsheet', worldTimeDiff)
}

function sheetToId(sheet) {
  switch (sheet) {
    case 'TCP':
      return 0

    case 'UDP':
      return 1

    default:
      return 0
  }
}

exports.addResult = addResult

//testcall
//addResult('TCP', 200)
