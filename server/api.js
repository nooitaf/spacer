
Router.route('/ping', function () {
  var req = this.request;
  var res = this.response;
	console.log(this.request.url)
	console.log(this.request.originalUrl)
	console.log(this.request.body)
	res.end(JSON.stringify({status: 'success', jo: 'pong'},null,2))
}, {where:'server'});

Router.route('/space/:query', function () {
	var query = String(this.urlParams.query)
	var space = Spaces.findOne({'name': {$regex: query, $options: 'i'}})
	if(space) this.response.end(JSON.stringify({status: 'success', space: space},null,2))
	this.response.end(JSON.stringify({statusCode: 404, body: {status: 'fail', message: 'Space not found'}},null,2))
}, {where:'server'});


// "use strict"

// var SpacerApi = new Restivus({
// 	useDefaultAuth: true,
// 	prettyJson: true,
// 	enableCors: true,
// 	apiPath: 'api',
// 	defaultHeaders: {
// 		'Content-Type': 'application/json',
// 		"Access-Control-Allow-Origin": "*",
// 		"Access-Control-Allow-Headers": "Content-Type",
// 		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
// 	}
// })

// SpacerApi.addRoute('ping', {authRequired: false}, {
// 	post: function(){
// 		console.log(this.request.url)
// 		console.log(this.request.originalUrl)
// 		console.log(this.request.body)
// 		return {status: 'success', jo: 'pong'}
// 	}
// })

// SpacerApi.addRoute('space/:query', {authRequired: false}, {
// 	get: function(){
// 		var query = String(this.urlParams.query)
// 		var space = Spaces.findOne({'name': {$regex: query, $options: 'i'}})
// 		if(space) return {status: 'success', space: space}
// 		return {statusCode: 404, body: {status: 'fail', message: 'Space not found'}}
// 	}
// })

