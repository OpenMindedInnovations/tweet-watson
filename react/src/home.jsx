/** @jsx React.DOM */
'use strict'

var React = require('react/addons')
var DocumentTitle = require('react-document-title')

var Home = React.createClass({

  render: function() {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-xs-12'>
            <input placeholder='Enter twitter screenname' id='screename-input'/>
          </div>
        </div>
      </div>
    )
  }

})

module.exports = Home