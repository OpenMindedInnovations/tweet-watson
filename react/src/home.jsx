/** @jsx React.DOM */
'use strict'

var React = require('react/addons')
var DocumentTitle = require('react-document-title')

var Home = React.createClass({

  render: function() {
    return (<DocumentTitle title="Analyze my Tweets"></DocumentTitle>)
  }

})

module.exports = Home