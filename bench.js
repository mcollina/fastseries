var max = 1000000
var series = require('./')()
var seriesNoResults = require('./')({ results: false })
var async = require('async')
var obj = {}

function bench (func, done) {
  var key = max + '*' + func.name
  var count = -1

  console.time(key)
  end()

  function end () {
    if (++count < max) {
      func(end)
    } else {
      console.timeEnd(key)
      if (done) {
        done()
      }
    }
  }
}

function benchFastSeries (done) {
  series(obj, [somethingP, somethingP, somethingP], 42, done)
}

function benchFastSeriesNoResults (done) {
  seriesNoResults(obj, [somethingP, somethingP, somethingP], 42, done)
}

function benchFastSeriesEach (done) {
  seriesNoResults(obj, somethingP, [1, 2, 3], done)
}

function benchFastSeriesEachResults (done) {
  series(obj, somethingP, [1, 2, 3], done)
}

function benchAsyncSeries (done) {
  async.series([somethingA, somethingA, somethingA], done)
}

function benchAsyncEachSeries (done) {
  async.eachSeries([1, 2, 3], somethingP, done)
}

function benchAsyncMapSeries (done) {
  async.mapSeries([1, 2, 3], somethingP, done)
}

var nextDone
var nextCount

function benchSetImmediate (done) {
  nextCount = 3
  nextDone = done
  setImmediate(somethingImmediate)
}

function somethingImmediate () {
  nextCount--
  if (nextCount === 0) {
    nextDone()
  } else {
    setImmediate(somethingImmediate)
  }
}

function somethingP (arg, cb) {
  setImmediate(cb)
}

function somethingA (cb) {
  setImmediate(cb)
}

function run (next) {
  async.eachSeries([
    benchAsyncSeries,
    benchAsyncEachSeries,
    benchAsyncMapSeries,
    benchSetImmediate,
    benchFastSeries,
    benchFastSeriesNoResults,
    benchFastSeriesEach,
    benchFastSeriesEachResults
  ], bench, next)
}

run(run)
