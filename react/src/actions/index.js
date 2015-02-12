/**
 * Created by Christopher on 2/10/15.
 */
var Reflux = require('reflux')

var appActions = Reflux.createActions([
    'searchUpdate',
    'loadTweet'
])

module.exports = appActions
