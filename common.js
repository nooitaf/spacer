// Collections
Spaces = new Mongo.Collection('spaces');
Info = new Mongo.Collection('info');

// -----

// Routes
Router.configure({
  layoutTemplate: 'defaultLayout'
});

Router.route('/', function () {
  this.render('home', {
    waitOn:function(){
      return Meteor.subscribe('spaces') && Meteor.subscribe('info');
    }
  });
});



// Commons
// log = function(x){
//   // console.log(x);
// }
