const Taffy = require('taffy')
const fs = require('fs')
const measureTime = require('measure-time')

let bbox = {
  minlat: 48.1813,
  minlon: 16.3201,
  maxlat: 48.2352,
  maxlon: 16.4195
}

let data = JSON.parse(fs.readFileSync('data.json'))

let loadElapsed = measureTime()

let db = Taffy(
  data.elements.map(
    (element) => {
      let data = element.bounds
      data.id = element.id

      return data
    }
  )
)
console.log('loading: ', loadElapsed().millisecondsTotal + 'ms')

let getElapsed = measureTime()
let count = 0

for (var i = 0; i < 1000; i++) {
  let lat = Math.random() * (bbox.maxlat - bbox.minlat) + bbox.minlat
  let lon = Math.random() * (bbox.maxlon - bbox.minlon) + bbox.minlon
  let size = Math.random() * 0.2

  let items = db({
    minlat: { 'gte': lat },
    minlon: { 'gte': lon },
    maxlat: { 'lte': lat + size },
    maxlon: { 'lte': lon + size }
  })

  count += items.count()
}

console.log('avg: ' + count / 1000, getElapsed().millisecondsTotal + 'ms')
