const Lokijs = require('lokijs')
const fs = require('fs')
const measureTime = require('measure-time')

let db = new Lokijs()
let buildings = db.addCollection('buildings', { indices: [ 'minlon', 'minlat', 'maxlon', 'maxlat' ] })

let bbox = {
  minlat: 48.1813,
  minlon: 16.3201,
  maxlat: 48.2352,
  maxlon: 16.4195
}

let data = JSON.parse(fs.readFileSync('data.json'))

let loadElapsed = measureTime()

data.elements.forEach(
  (element) => {
    let data = element.bounds
    data.id = element.id

    buildings.insert(data)
  }
)

console.log('loading: ', loadElapsed().millisecondsTotal + 'ms')

let getElapsed = measureTime()
let count = 0

for (var i = 0; i < 1000; i++) {
  let lat = Math.random() * (bbox.maxlat - bbox.minlat) + bbox.minlat
  let lon = Math.random() * (bbox.maxlon - bbox.minlon) + bbox.minlon
  let size = Math.random() * 0.2

  let items = buildings.find({
    minlat: { '$gte': lat },
    minlon: { '$gte': lon },
    maxlat: { '$lte': lat + size },
    maxlon: { '$lte': lon + size }
  })

  count += items.length
}

console.log('avg: ' + count / 1000, getElapsed().millisecondsTotal + 'ms')
