
var Reflux = require('reflux')
var request = require('superagent')

var appConfig = require('./../config')
var appActions = require('./../actions')

var resultsStore = Reflux.createStore({

    init: function() {
        this.listenTo(appActions.searchUpdate, this.handleSearchUpdate)
    },

    handleSearchUpdate: function() {
        var self = this;
        var searchString = arguments[0];
        request
            .get(appConfig.LOCAL_API_HOST + '/results/:query' + searchString) //this is probably wrong
            .end(function(err, res) {
                if(res.body && res.body.results) {
                    self.trigger({
                        searchString: searchString,
                        searchResutls: res.body.results
                    })
                } else {
                    self.trigger({
                        searchString: searchString,
                        searchResults: []
                    })
                }
            })
    }

})

module.exports = resultsStore