/** @jsx React.DOM */
'use strict'

var React = require('react/addons')
var Reflux = require('reflux')

var resultsStore = require('./stores/resultsStore')

var Search = React.createClass({

    mixins: [Reflux.ListenerMixin],

    getInitialState: function() {
        if(this.props.entrypath == '/') {
            var defaultClass = 'search-home'
        } else {
            var defaultClass = 'search-blurred'
        }
        return {
            searchString: '',
            defaultClass: defaultClass,
            loading: false
        }
    },

    componentDidMount: function() {
        this.listenTo(resultsStore, this.stopLoading)
        this.refs.search.getDOMNode().focus()
    },

    handleSubmit: function(e) {
        e.preventDefault()
        if(this.state.searchString.trim().length) {
            this.setState({
                loading: true
            })
            this.props.onSearch(this.state.searchString)
        }
    },

    handleChange: function(e) {
        if(e.target.value.length) {
            this.setState({
                searchString: e.target.value,
                prevSearch: e.target.value
            })
        } else {
            this.setState({
                searchString: e.target.value
            })
        }
    },

    handleClick: function(e) {
        if(this.state.defaultClass != 'search-home') {
            this.setState({
                defaultClass: 'search-focused',
                searchString: ''
            })
        }
    },

    handleBlur: function(e) {
        if(this.state.defaultClass != 'search-home') {
            if(this.state.searchString && !this.state.searchString.length) {
                this.setState({
                    searchString: this.state.prevSearch,
                    defaultClass: 'search-blurred'
                })
            } else {
                this.setState({
                    defaultClass: 'search-blured'
                })
            }
        }
    },

    stopLoading: function() {
        this.setState({
            loading: false,
            defaultClass: 'search-blurred'
        })
    },

    render: function() {
        var searchContext
        if(this.state.loading) {
            searchContext = <img className="search-loading" src="" />
        } else {
            searchContext = <button className="search-submit" type="submit">search</button>
        }
        return (
            <div className={this.state.defaultClass}>
                <form method="get" action="/" className="search-form" onSubmit={this.handleSubmit}>
                    <input placeholder="Enter your twitter username" type="text" ref="search" className="search-input" name="q" onChange={this.handleChange} onClick={this.handleClick} onBlur={this.handleBlur} value={this.state.searchString} />
                {searchContex}
                </form>
            </div>
        )
    }

})

module.exports = Search