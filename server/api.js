"use strict"

var SpacerApi = new Restivus({
	useDefaultAuth: true,
	prettyJson: true,
	enableCors: true,
	apiPath: 'api',
	defaultHeaders: {
		'Content-Type': 'application/json',
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
	}
})

SpacerApi.addRoute('ping', {authRequired: false}, {
	post: function(){
		console.log(this.request.url)
		console.log(this.request.originalUrl)
		console.log(this.request.body)
		return {status: 'success', jo: 'pong'}
	}
})

SpacerApi.addRoute('space/:query', {authRequired: false}, {
	get: function(){
		var query = String(this.urlParams.query)
		var space = Spaces.findOne({'name': {$regex: query, $options: 'i'}})
		if(space) return {status: 'success', space: space}
		return {statusCode: 404, body: {status: 'fail', message: 'Space not found'}}
	}
})

