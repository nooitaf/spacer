
Meteor.subscribe('spaces')
Meteor.subscribe('info')



UI.registerHelper('spaces',function(){
  return Spaces.find({},{sort:{name:1}});
})

Template.space_list.helpers({
  infoLastUpdate:function(){
    return Info.findOne() ? moment(Info.findOne().lastUpdate).fromNow() : 'never';
  },
  infoCheckedCount:function(){
    var count = Info.findOne() ? Info.findOne().checkedCount : 0;
    if (count === 1)
      return '1 space';
    else
      return count + ' spaces';
  },
  currentImage: function(){
    return this.data.logo || '';
  },
  tree: function(){
    return JSON.stringify(this.data, null, 2);
  }
})

Template.space_list.events({
  'click .space-list-toggle': function(){
    Session.set('show-space-list', !Session.get('show-space-list'))
  }
})

UI.registerHelper('showSpaceList', function(){
  return Session.get('show-space-list') || false
})

Template.space_map.rendered = function() {
  L.Icon.Default.imagePath = '/img';

  var map = L.map('map', {
    doubleClickZoom: false
  }).setView([20, 0], 2);

  // L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  //   maxZoom: 18
  // }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
  	subdomains: 'abcd',
  	maxZoom: 19
  }).addTo(map);

  var query = Spaces.find({'data.location.lat':{$exists:true},'data.location.lon':{$exists:true}});
  query.observe({
    added: function(space) {
      addMarker(map,space);
    },
    changed: function(newSpace, oldSpace){
      layers = map._layers;
      var key, val;
      for (key in layers) {
        val = layers[key];
        if (val._latlng) {
          if (val._latlng.lat === oldSpace.data.location.lat && val._latlng.lng === oldSpace.data.location.lon) {
            updateMarker(val,newSpace);
          }
        }
      }
    }
  });
};

function addMarker(map,space) {
  if (!space.data.location.lat || !space.data.location.lon) return false;
  var latlng = [space.data.location.lat,space.data.location.lon];
  var address = niceAddress(space.data.location.address);
  var marker = L.marker(latlng);
  marker.bindPopup(
    "<img src='" + space.data.logo + "' width='80px'></br>" +
    "</br>" +
    "<b><a href='" + space.data.url + "' taget='_blank'>" + space.name + "</a></b></br>" +
    "<i>" + address + "</i></br>" +
    (space.data.state.open ? "<b style='color:green;'>Open</b>" : "<b style='color:red;'>Closed</b>")
  );

  updateIcon(marker,space);

  //console.log(marker);
  marker.addTo(map);
}

function updateIcon(marker,space){
  if (space.data.state.open){
    marker.setIcon(
      L.icon({
        iconUrl: '/img/marker-icon-square-open.png',
        shadowUrl: '/img/marker-shadow-square.png',
        iconSize:     [25, 15],
        shadowSize:   [41, 15],
        iconAnchor:   [13, 15],
        shadowAnchor: [13, 15],
        popupAnchor:  [0, -17]
      })
    )
  } else {
    marker.setIcon(
      L.icon({
        iconUrl: '/img/marker-icon-square-closed.png',
        shadowUrl: '/img/marker-shadow-square.png',
        iconSize:     [25, 15],
        shadowSize:   [41, 15],
        iconAnchor:   [13, 15],
        shadowAnchor: [13, 15],
        popupAnchor:  [0, -17]
      })
    )
  }
}

function updateMarker(marker,space) {
  // update position
  var latlng = [space.data.location.lat,space.data.location.lon];
  marker.setLatLng(latlng);

  // update content
  var address = niceAddress(space.data.location.address);
  var content =
    "<img src='" + space.data.logo + "' width='80px'></br>" +
    "</br>" +
    "<b><a href='" + space.data.url + "' taget='_blank'>" + space.name + "</a></b></br>" +
    "<i>" + address + "</i></br>" +
    parseInt(Math.random()*1000) + "</br>" +
    (space.data.state.open ? "<b style='color:green;'>Open</b>" : "<b style='color:red;'>Closed</b>");

  updateIcon(marker,space);

  // check if popup open
  if (marker.setPopupContent) {
    // popup closed
    marker.setPopupContent(content);
  } else {
    // popup open
    marker.setContent(content);
  }
}

function niceAddress(str){
  var output = '';
  if (str){
    if (str.split(',')) {
      output = str.split(',').join('</br>')
    } else {
      output = str;
    }
    return output;
  } else {
    return output;
  }
}
