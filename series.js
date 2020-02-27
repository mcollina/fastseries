'use strict'

var defaults = {
  released: nop,
  results: true
}

function fastseries (options) {
  options = Object.assign({}, defaults, options)

  var seriesEach
  var seriesList

  if (options.results) {
    seriesEach = resultEach
    seriesList = resultList
  } else {
    seriesEach = noResultEach
    seriesList = noResultList
  }

  var released = options.released

  return series

  function series (that, toCall, arg, done) {
    done = (done || nop).bind(that)

    if (toCall.length === 0) {
      done.call(that)
      released()
    } else if (toCall.bind) {
      seriesEach(toCall.bind(that), arg, done, released)
    } else {
      var _list
      if (that) {
        _list = new Array(toCall.length)
        for (var i = 0; i < toCall.length; i++) {
          _list[i] = toCall[i].bind(that)
        }
      } else {
        _list = toCall
      }

      seriesList(_list, arg, done, released)
    }
  }
}

function noResultEach (each, list, cb, released) {
  var i = 0
  var length = list.length
  var makeCall

  if (cb.length === 1) {
    makeCall = makeCallOne
  } else {
    makeCall = makeCallTwo
  }

  release()

  function release () {
    if (i < length) {
      makeCall(each, list[i++], release)
    } else {
      cb()
      released()
    }
  }
}

function noResultList (list, arg, cb, released) {
  var i = 0
  var length = list.length
  var makeCall

  if (list[0].length === 1) {
    makeCall = makeCallOne
  } else {
    makeCall = makeCallTwo
  }

  release()

  function release () {
    if (i < length) {
      makeCall(list[i++], arg, release)
    } else {
      cb()
      released()
    }
  }
}

function resultEach (each, list, cb, released) {
  var i = 0
  var length = list.length
  var makeCall

  if (cb.length === 1) {
    makeCall = makeCallOne
  } else {
    makeCall = makeCallTwo
  }

  var results = new Array(length)

  release(null, null)

  function release (err, result) {
    if (err) {
      cb(err)
      released()
      return
    }

    if (i > 0) {
      results[i - 1] = result
    }

    if (i < length) {
      makeCall(each, list[i++], release)
    } else {
      cb(null, results)
      released()
    }
  }
}

function resultList (list, arg, cb, released) {
  var i = 0
  var length = list.length
  var makeCall

  if (list[0].length === 1) {
    makeCall = makeCallOne
  } else {
    makeCall = makeCallTwo
  }

  var results = new Array(length)

  release()

  function release (err, result) {
    if (err) {
      cb(err)
      released()
      return
    }

    if (i > 0) {
      results[i - 1] = result
    }

    if (i < length) {
      makeCall(list[i++], arg, release)
    } else {
      cb(null, results)
      released()
    }
  }
}

function makeCallOne (cb, arg, release) {
  cb(release)
}

function makeCallTwo (cb, arg, release) {
  cb(arg, release)
}

function nop () { }

module.exports = fastseries
