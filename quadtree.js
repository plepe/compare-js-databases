const Quadtree = require('quadtree-lookup')
const fs = require('fs')
const measureTime = require('measure-time')


let qt = new Quadtree.Quadtree(new Quadtree.Box(
  new Quadtree.Point(-90, -180),
  new Quadtree.Point(90, 180)
))

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
    let box = new Quadtree.Box(
      new Quadtree.Point(element.bounds.minlat, element.bounds.minlon),
      new Quadtree.Point(element.bounds.maxlat, element.bounds.maxlon)
    )
    qt.insert(box, element)
  }
)

console.log('loading: ', loadElapsed().millisecondsTotal + 'ms')

let getElapsed = measureTime()
let count = 0

for (var i = 0; i < 1000; i++) {
  let lat = Math.random() * (bbox.maxlat - bbox.minlat) + bbox.minlat
  let lon = Math.random() * (bbox.maxlon - bbox.minlon) + bbox.minlon
  let size = Math.random() * 0.2

  let box = new Quadtree.Box(
    new Quadtree.Point(lat, lon),
    new Quadtree.Point(lat + size, lon + size) 
  )

  let items = qt.queryRange(box)

  count += items.length
}

console.log('avg: ' + count / 1000, getElapsed().millisecondsTotal + 'ms')
