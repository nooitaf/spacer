Meteor.startup(function() {
	console.log('Server started: ', new Date())
	// init Info
	if (!Info.findOne()) Info.insert({ checkedCount: 0, ping: 0 });
	if (!Spaces.findOne()) {
		Meteor.setTimeout(function(){Meteor.call('checkSpaces')},5000);
	}

	// Check Spaces Interval
	Meteor.setInterval(function() {
		// -- check all
		Meteor.call('checkSpaces')
			// -- check just one
			//var checkedCount = checkSpace('NURDSpace');
	}, 300000);

	// Info Ping Interval
	Meteor.setInterval(function() {
		if (Info.findOne()) {
			Info.update({ _id: Info.findOne()._id }, { $set: { ping: parseInt(Math.random() * 1000) } });
		}
	}, 5000);

})


// --- Publish
Meteor.publish('info', function() {
	return Info.find({});
})

Meteor.publish('spaces', function() {
	return Spaces.find({});
})


Meteor.methods({
	checkSpaces: function() {
		log('checkSpaces');
		var response = HTTP.get('https://spaceapi.fixme.ch/directory.json', { timeout: 5000 });
		if (response.statusCode === 200) {
			var spaceDict = JSON.parse(response.content);
			var spaceIds = _.keys(spaceDict);
			var spaceList = _.map(spaceIds, function(spaceId) {
				return {
					name: spaceId,
					api: spaceDict[spaceId]
				}
			})
			log('Fetched ' + spaceList.length + ' spaces.');
			//log(spaceList);
			log('Updating Space List');
			Meteor.call('updateSpaceList',spaceList);
			log('Updating Space Data');
			Meteor.call('updateSpaces');
			log('Update done.');

			infoPing(spaceList.length || 0)

		} else {
			log('checkSpaces failed');
		}

	},
	updateSpaceList: function(spaceList) {
		_.each(spaceList, function(space) {
			var s = Spaces.findOne({ name: space.name });
			if (!s) {
				Spaces.insert(space);
				log('Added: ' + space.name);
			} else {
				if (s.api != space.api) {
					Spaces.update({ _id: s }, { $set: { api: space.api } })
					log('Updated: ' + space.name);
				}
			}
		})
	},
	updateSpaces: function() {
		Spaces.find({}).forEach(function(space) {
			Meteor.call('fetchSpaceData',space);
		})
	},
	fetchSpaceData: function(space) {
		log('fetching: ' + space.name + ' @ ' + space.api)
		try {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			var response = HTTP.get(space.api, { timeout: 5000, followRedirects: true });
			if (response.statusCode === 200) {
				var spaceDict;
				// data is first choice
				if (response.data) {
					spaceDict = response.data;
				}
				// some ignore data (shrug)
				if (!response.data && response.content) {
					spaceDict = JSON.parse(response.content);
					log('took content value'.blue)
						//log(spaceDict)
				}

				if (spaceDict) {
					if (spaceDict.api === '0.13') {
						console.log('API 0.13'.pink);
						spaceDict = fixSpaceDict(spaceDict);
						Spaces.update({ _id: space._id }, { $set: { data: spaceDict, lastUpdate: new Date().valueOf() } });
					}
					if (spaceDict.api === '0.12') {
						console.log('API 0.12'.pink);
						spaceDict = fixSpaceDict(spaceDict);
						//console.log(spaceDict)
						Spaces.update({ _id: space._id }, { $set: { data: spaceDict, lastUpdate: new Date().valueOf() } });
					}
					log('success: '.green + space.name)
				} else {
					log('no data: '.yellow + space.name)
					log(response)
				}
			} else {
				log('checkSpace ' + space.name + ' failed');
			}
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
			return true;
		} catch (e) {
			log('failed '.red + space.name)
			return false;
		}
	}
})




function infoPing(checkedCount) {
	Info.update({ _id: Info.findOne()._id }, {
		$set: {
			lastUpdate: new Date().valueOf(),
			checkedCount: checkedCount
		}
	});
}

function patchGeoBugs(dict) {
	log('Patching:'.blue)
	var latlonbugs = [
		"Liege Hackerspace",
		"Dingfabrik",
		"flipdot",
		"FabLab Neustadt a. d. Aisch - Bad Windsheim",
		"Tarlab",
		"BinarySpace",
		"Tangleball"
		// "Bhack", // ??
		//"HackSpace CaTania", // wrong name
		// "Hacklab", // ??
		// "Codersfield", // ??
		// "Kamloops MakerSpace" // ??
	]
	for (var i in latlonbugs){
		if (dict.space === latlonbugs[i]) {
			var lat = dict.location.lon
			var lon = dict.location.lat
			dict.location.lat = lat
			dict.location.lon = lon
		}
	}

	// Laboratório Hacker
	// var space = Spaces.findOne({ name: "Laboratório Hacker" });
	return dict
}

function fixSpaceDict(dict) {
	var output = {};
	if (dict.api === '0.13') {
		output = {
			api: dict.api,
			space: dict.space || null,
			logo: dict.logo || null,
			url: dict.url || null,
			location: {
				lat: dict.location.lat || null,
				lon: dict.location.lon || null,
				address: dict.location.address || null
			},
			cam: dict.cam || null,
			stream: dict.stream || null,
			state: dict.state || null,
			contact: dict.contact || null,
			sensors: dict.sensors || null,
			feeds: dict.feeds || null
		}
	}
	if (dict.api === '0.12') {
		output = {
			api: dict.api,
			space: dict.space || null,
			logo: dict.logo || null,
			url: dict.url || null,
			location: {
				lat: dict.lat || null,
				lon: dict.lon || null,
				address: dict.address || null
			},
			cam: dict.cam || null,
			stream: dict.stream || null,
			state: {
				open: dict.open || null,
				lastchange: dict.lastchange || null,
				icon: dict.icon || null
			},
			contact: dict.contact || null,
			sensors: dict.sensors || null,
			feeds: dict.feeds || null
		}
	}
	output.logo = removeHttps(output.logo);
	output = patchGeoBugs(output)
	return output;
}

function removeHttps(str) {
	return str.replace('https:', 'http:');
}
