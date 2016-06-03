
Router.route('/ping', function () {
  var res = this.response;
	res.end(JSON.stringify({status: 'success', jo: 'pong'},null,2))
}, {where:'server'});

Router.route('/space/:query', function () {
  var res = this.response;
	var query = String(this.params.query).trim()
	console.log(query)
	var space = Spaces.findOne({'name': {$regex: query, $options: 'i'}})
	console.log(space)
	if(space) {
		res.end(JSON.stringify({status: 'success', space: space},null,2))
	} else {
		res.end(JSON.stringify({statusCode: 404, body: {status: 'fail', message: 'Space not found'}},null,2))
	}
}, {where:'server'});
