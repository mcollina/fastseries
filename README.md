# fastseries [![Build Status](https://travis-ci.org/mcollina/fastseries.svg?branch=master)](https://travis-ci.org/mcollina/fastseries)

Zero-overhead series function call for node.js. Also supports each
and map!

Benchmark for doing 3 calls `setImmediate` 1 million times:

* non-reusable `setImmediate`: 5967ms
* `async.series`: 9573ms
* `async.eachSeries`: 6196ms
* `async.mapSeries`: 8495ms
* `fastseries` with results: 6231ms
* `fastseries` without results: 6182ms
* `fastseries` map: 6288ms
* `fastseries` each: 6137ms

These benchmarks where taken via `bench.js` on iojs 1.8.1, on a MacBook
Pro Retina 2014.

If you need zero-overhead parallel function call, check out
[fastparallel](http://npm.im/fastparallel).

[![js-standard-style](https://raw.githubusercontent.com/feross/standard/master/badge.png)](https://github.com/feross/standard)

## Example for series call

```js
var series = require('fastseries')({
  // this is a function that will be called
  // when a series completes
  released: completed,

  // if you want the results, then here you are
  results: true
})

series(
  {}, // what will be this in the functions
  [something, something, something], // functions to call
  42, // the first argument of the functions
  done // the function to be called when the series ends
)

function late (arg, cb) {
  console.log('finishing', arg)
  cb(null, 'myresult-' + arg)
}

function something (arg, cb) {
  setTimeout(late, 1000, arg, cb)
}

function done (err, results) {
  console.log('series completed, results:', results)
}

function completed () {
  console.log('series completed!')
}
```

## Example for each and map calls

```js
var series = require('fastseries')({
  // this is a function that will be called
  // when a series completes
  released: completed,

  // if you want the results, then here you are
  // passing false disables map
  results: true
})

series(
  {}, // what will be this in the functions
  something, // functions to call
  [1, 2, 3], // the first argument of the functions
  done // the function to be called when the series ends
)

function late (arg, cb) {
  console.log('finishing', arg)
  cb(null, 'myresult-' + arg)
}

function something (arg, cb) {
  setTimeout(late, 1000, arg, cb)
}

function done (err, results) {
  console.log('series completed, results:', results)
}

function completed () {
  console.log('series completed!')
}

```

## Caveats

The `done` function will be called only once, even if more than one error happen.

This library works by caching the latest used function, so that running a new series
does not cause **any memory allocations**.

## License

ISC
