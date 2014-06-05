var Observ = require("observ")
var extend = require("xtend")
var put = require("./put")
var del = require("./del")

module.exports = ObservVarhash

function ObservVarhash(hash) {
  var keys = Object.keys(hash)

  var initialState = {}

  keys.forEach(function (key) {
    if (key === "name") {
      throw new Error("cannot create an observ-varhash " +
        "with a key named 'name'. Clashes with " +
        "`Function.prototype.name`.");
    }

    var observ = hash[key]
    initialState[key] = typeof observ === "function" ? observ() : observ
  })

  var obs = Observ(initialState)

  obs.get = get
  obs.put = put
  obs.delete = del

  obs._hash = hash

  keys.forEach(function (key) {
    var observ = hash[key]
    obs[key] = observ

    if (typeof observ === "function") {
      observ(function (value) {
        var state = extend(obs())
        state[key] = value
        var diff = {}
        diff[key] = value && value._diff ? value._diff : value
        state._diff = diff
        obs.set(state)
      })
    }
  })

  return obs
}

function get(key) {
  return this._hash[key]
}