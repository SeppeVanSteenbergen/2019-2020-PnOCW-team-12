const axios = require('axios')
const { GoogleSpreadsheet } = require('google-spreadsheet')

//User access data
const creds = require('./SheetsAccessData.json')

/**
 * Voeg een resultaat toe aan de spreadsheet
 *
 * @param {string} sheetName name van de sheet voor verschillende testen
 * @param {*} worldTimeDiff het toe te voegen resultaat van de test (nog te formateren)
 */
async function addResult(sheetName, info) {
    const doc = new GoogleSpreadsheet(
        '1EmCMgxQU1lcrSWjA_ZNNX56SQm4W5Tn7bzrSKo85rqw'
    )
    await doc.useServiceAccountAuth(creds)
    await doc.loadInfo()
    const sheet = await doc.sheetsByIndex[sheetToId(sheetName)]

    await sheet.addRow(info)

    console.log('Added %s to spreadsheet', info.time)
}

function sheetToId(sheet) {
    switch (sheet) {
        case 'TCP':
            return 0

        case 'UDP':
            return 1

        case "Drift":
            return 2

        default:
            return 0
    }
}

async function calcServerOffset() {
    let timeSend = Date.now()
    let result = await axios.get(
        'http://worldtimeapi.org/api/timezone/Europe/Brussels'
    )
    let serverTime = Date.now()
    let worldTime = new Date(result.data.datetime)
    let ping = serverTime - timeSend
    let deltaTime = worldTime - serverTime + ping / 2
    // console.log(serverTime)
    // console.log(worldTime)
    // console.log(deltaTime)
    addResult("Drift", {Drift : deltaTime, Ping: ping })

}


setInterval(function(){ calcServerOffset() }, 5000);




