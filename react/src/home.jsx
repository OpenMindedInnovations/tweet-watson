/** @jsx React.DOM */
'use strict'

var React = require('react/addons')
var DocumentTitle = require('react-document-title')

var Home = React.createClass({

  render: function() {
    return (<DocumentTitle title="Analyze My Tweets"></DocumentTitle>)
  }

})

module.exports = Home