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

      if (toCall.call) {
        holder._list = arg
        holder._each = toCall
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
  this._each = null
}

function NoResultsHolder (_release) {
  reset.call(this)

  var that = this
  var i = 0
  this.release = function () {
    if (i < that._list.length) {
      if (that._each) {
        that._each.call(that._callThat, that._list[i++], that.release)
      } else {
        that._list[i++].call(that._callThat, that._arg, that.release)
      }
    } else {
      that._callback.call(that._callThat)
      reset.call(that)
      i = 0
      _release(that)
    }
  }
}

function ResultsHolder (_release) {
  reset.call(this)

  this._results = []

  var that = this
  var i = 0
  this.release = function (err, result) {
    if (i !== 0) that._results.push(result)

    if (!err && i < that._list.length) {
      if (that._each) {
        that._each.call(that._callThat, that._list[i++], that.release)
      } else {
        that._list[i++].call(that._callThat, that._arg, that.release)
      }
    } else {
      that._callback.call(that._callThat, err, that._results)
      reset.call(that)
      that._results = []
      i = 0
      _release(that)
    }
  }
}

function nop () { }

module.exports = series
