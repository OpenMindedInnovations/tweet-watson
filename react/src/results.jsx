/** @jsx React.DOM */
'use strict'

var React = require('react/addons')
var DocumentTitle = require('react-document-title')
var request = require('superagent')
var Reflux = require('reflux')
var slug = require('to-slug-case')
var Link = require('react-router-component').Link

var appActions = require('./actions')
var searchStore = require('./stores/resultsStore')

var Results = React.createClass({

    mixins: [reactAsync.Mixin, Reflux.ListenerMixin],

    getInitialStateAsync: function(cb) {
        appActions.searchUpdate(this.props.query)
        searchStore.listen(function(data) {
            try {
                return cb(null, {
                    searchString: data.searchString,
                    searchResults: data.searchResults
                })
            } catch(err) { }
        })
    },

    componentDidMount: function() {
        this.listenTo(searchStore, this.refreshSearch)
    },

    componentWillReceiveProps: function() {
        if(typeof(nextProps.query) !== "undefined") {
            appActions.searchUpdate(nextProps.query)
        }
    },

    refreshSearch: function(data) {
        this.setState({
            searchString: data.SearchString,
            searchResults: data.searchResults
        })
    },

    render: function() {
        var results = []
        if(this.state.searchResults && this.state.searchResults.length) {
            this.state.searchResults.forEach(function(tweet) {
                //will add
            })
        }
    }
})

module.exports = Results