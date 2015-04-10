var xtend = require('xtend')
var defaults = {
  released: nop,
  results: true
}

function series (options) {
  options = xtend(defaults, options)

  var released = options.released
  var Holder = options.results ? ResultsHolder : NoResultsHolder
  var last = new Holder(release)

  function instance (that, toCall, arg, done) {
    var holder = last || new Holder(release)

    last = null

    if (toCall.length === 0) {
      done()
      released(last)
    } else {
      holder._callback = done
      if (typeof toCall === 'function') {
        holder._list = arg
        holder._arg = toCall
      } else {
        holder._list = toCall
        holder._arg = arg
      }
      holder._callThat = that
      holder.release()
    }
  }

  function release (holder) {
    last = holder
    released()
  }

  return instance
}

function reset () {
  this._list = null
  this._arg = null
  this._callThat = null
  this._callback = nop
}

function NoResultsHolder (_release) {
  reset.call(this)

  var that = this
  this.release = function () {
    var next = that._list.shift()

    if (typeof next === 'function') {
      next.call(that._callThat, that._arg, that.release)
    } else if (next) {
      that._arg.call(that._callThat, next, that.release)
    } else {
      that._callback()
      reset.call(that)
      _release(that)
    }
  }
}

function ResultsHolder (_release) {
  reset.call(this)

  this._results = []
  this._err = null
  this._first = true

  var that = this
  this.release = function (err, result) {
    if (that._first) {
      that._first = false
    } else {
      that._err = err
      that._results.push(result)
    }

    var next = that._list.shift()

    if (typeof next === 'function') {
      next.call(that._callThat, that._arg, that.release)
    } else if (next) {
      that._arg.call(that._callThat, next, that.release)
    } else {
      that._callback(that._err, that._results)
      reset.call(that)
      that._results = []
      that._err = null
      that._first = true
      _release(that)
    }
  }
}

function nop () { }

module.exports = series
