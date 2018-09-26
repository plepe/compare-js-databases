const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const fs = require('fs')
const measureTime = require('measure-time')
const async = require('async')

let buildings = new PouchDB('buildings')

let bbox = {
  minlat: 48.1813,
  minlon: 16.3201,
  maxlat: 48.2352,
  maxlon: 16.4195
}

let data = JSON.parse(fs.readFileSync('data.json'))
let getElapsed
let count = 0

buildings.createIndex({
  index: {
    fields: [ 'minlat', 'maxlat', 'minlon', 'maxlon' ]
  }
},
load)

function load () {
  let loadElapsed = measureTime()

  async.each(
    data.elements,
    (element, done) => {
      let data = element.bounds
      data._id = element.id.toString()

      buildings.put(data, done)
    },
    () => {
      console.log('loading: ', loadElapsed().millisecondsTotal + 'ms')

      cont()
    }
  )
}

function cont () {
  getElapsed = measureTime()

  async.timesLimit(100, 1, (n, done) => {
    let lat = Math.random() * (bbox.maxlat - bbox.minlat) + bbox.minlat
    let lon = Math.random() * (bbox.maxlon - bbox.minlon) + bbox.minlon
    let size = Math.random() * 0.2

    let result = buildings.find({
      selector: {
        minlat: { '$gte': lat },
        minlon: { '$gte': lon },
        maxlat: { '$lte': lat + size },
        maxlon: { '$lte': lon + size }
      }
    }, (err, items) => {
      count += items.docs.length
      done()
    })
  }, end)
}

function end () {
  console.log('avg: ' + count / 1000, getElapsed().millisecondsTotal + 'ms')
}
