const NeDB = require('nedb')
const fs = require('fs')
const measureTime = require('measure-time')
const async = require('async')

let buildings = new NeDB()

let bbox = {
  minlat: 48.1813,
  minlon: 16.3201,
  maxlat: 48.2352,
  maxlon: 16.4195
}

let data = JSON.parse(fs.readFileSync('data.json'))
let getElapsed
let count = 0

async.each([ 'minlat', 'maxlat', 'minlon', 'maxlon' ],
  (key, done) => {
    buildings.ensureIndex({ fieldName: key }, done)
  },
  load
)

function load () {
  let loadElapsed = measureTime()

  async.each(
    data.elements,
    (element, done) => {
      let data = element.bounds
      data.id = element.id

      buildings.insert(data, done)
    },
    () => {
      console.log('loading: ', loadElapsed().millisecondsTotal + 'ms')
      cont()
    }
  )
}

function cont () {
  getElapsed = measureTime()

  async.times(1000, (n, done) => {
    let lat = Math.random() * (bbox.maxlat - bbox.minlat) + bbox.minlat
    let lon = Math.random() * (bbox.maxlon - bbox.minlon) + bbox.minlon
    let size = Math.random() * 0.2

    buildings.find({
      minlat: { '$gte': lat },
      minlon: { '$gte': lon },
      maxlat: { '$lte': lat + size },
      maxlon: { '$lte': lon + size }
    },
    (err, items) => {
      count += items.length
      done()
    })
  }, end)
}

function end () {
  console.log('avg: ' + count / 1000, getElapsed().millisecondsTotal + 'ms')
}
