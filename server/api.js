
Router.route('/ping', function () {
  var res = this.response;
	res.end(JSON.stringify({status: 'success', jo: 'pong'},null,2))
}, {where:'server'});

Router.route('/space/:name', function () {
  var res = this.response;
	var query = String(this.params.name).trim()
	var space = Spaces.findOne({'name': {$regex: query, $options: 'i'}})
	if(space && space.data && space.data.location) {
		res.end(JSON.stringify({status: 'success', space: space},null,2))
	} else {
		res.end(JSON.stringify({statusCode: 404, body: {status: 'fail', message: 'Space not found'}},null,2))
	}
}, {where:'server'});
