'use strict'

var xtend = require('xtend')
// var reusify = require('reusify')
var defaults = {
  released: nop,
  results: true
}

function fastseries (options) {
  options = xtend(defaults, options)

  var released = options.released
  var queue = reusify(options.results ? resultsHolder : noResultsHolder)

  return series

  function series (state, toCall, arg, done) {
    var holder = queue.get()
    holder._released = release

    done = done || nop

    if (toCall.length === 0) {
      done(undefined, state)
      release(holder)
    } else {
      holder._callback = done

      if (toCall instanceof Function) {
        holder._list = arg
        holder._each = toCall
      } else {
        holder._list = toCall
        holder._arg = arg
      }

      holder._callThat = state
      holder.release()
    }
  }

  function release (holder) {
    queue.release(holder)
    released()
  }
}

function reset (state) {
  state._list = null
  state._arg = null
  state._callThat = null
  state._callback = nop
  state._each = null
}

function noResultsHolder () {
  var i = 0
  var state = {
    next: null,
    _released: null,
    release: function () {
      if (i < state._list.length) {
        if (state._each) {
          state._each(state._callThat, state._list[i++], state.release)
        } else {
          state._list[i++](state._callThat, state._arg, state.release)
        }
      } else {
        state._callback(undefined, state._callThat)
        reset(state)
        i = 0
        state._released(state)
      }
    }
  }
  reset(state)
  return state
}

function resultsHolder (_release) {
  var i = 0
  var state = {
    _results: [],
    next: null,
    _released: null,
    release: function (err, result) {
      if (i !== 0) state._results[i - 1] = result

      if (!err && i < state._list.length) {
        if (state._each) {
          state._each(state._callThat, state._list[i++], state.release)
        } else {
          state._list[i++](state._callThat, state._arg, state.release)
        }
      } else {
        state._callback(err, state._callThat, state._results)
        reset(state)
        state._results = []
        i = 0
        state._released(state)
      }
    }
  }

  reset(state)
  return state
}

function nop () { }

function reusify (factory) {
  var head = factory()
  var tail = head

  function get () {
    var current = head

    if (current.next) {
      head = current.next
    } else {
      head = factory()
      tail = head
    }

    current.next = null

    return current
  }

  function release (obj) {
    tail.next = obj
    tail = obj
  }

  return {
    get: get,
    release: release
  }
}

module.exports = fastseries
