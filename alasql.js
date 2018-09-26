const alasql = require('alasql')
const fs = require('fs')
const measureTime = require('measure-time')

alasql('CREATE TABLE buildings ( minlat FLOAT, minlon FLOAT, maxlat FLOAT, maxlon FLOAT, id INT)')

let bbox = {
  minlat: 48.1813,
  minlon: 16.3201,
  maxlat: 48.2352,
  maxlon: 16.4195
}

let data = JSON.parse(fs.readFileSync('data.json'))

let loadElapsed = measureTime()

alasql.tables.buildings.data = data.elements.map(
  (element) => {
    let data = element.bounds
    data.id = element.id

    return data
  }
)

alasql('CREATE INDEX minlat ON buildings(minlat)')
alasql('CREATE INDEX minlon ON buildings(minlon)')
alasql('CREATE INDEX maxlat ON buildings(maxlat)')
alasql('CREATE INDEX maxlon ON buildings(maxlon)')
console.log('loading: ', loadElapsed().millisecondsTotal + 'ms')

let getElapsed = measureTime()
let count = 0

for (var i = 0; i < 1000; i++) {
  let lat = Math.random() * (bbox.maxlat - bbox.minlat) + bbox.minlat
  let lon = Math.random() * (bbox.maxlon - bbox.minlon) + bbox.minlon
  let size = Math.random() * 0.2

  let items = alasql('select * from buildings where minlat >= ' + lat + ' and minlon >= ' + lon + ' and maxlat <= ' + (lat + size) + ' and maxlon <= ' + (lon + size))

  count += items.length
}

console.log('avg: ' + count / 1000, getElapsed().millisecondsTotal + 'ms')
