var app = {

	Models : {},
	Views : {},
	Collections : {},

	init : function () {

		this.map = new app.Views.Map;
		this.form = new app.Views.Form;
		this.geocoder = new google.maps.Geocoder();

		seedEvents.forEach(function( seedEvent ) {

			this.map.addPin( seedEvent );

		}.bind( this ));

	}

};

app.Models.Map = Backbone.Model.extend({

	defaults : {

		options : {

			center : {

				lat : 54.6,
				lng : -2.5

			},

			zoom : 6

		}

	}

});

app.Views.Map = Backbone.View.extend({

	el : '#map',

	model : new app.Models.Map,

	map : null,

	initialize : function ( e ) {

		this.render( e );

	},

	render : function ( e ) {

		this.map = new google.maps.Map( this.el, this.model.get('options') );

	},

	addPin : function ( params ) {

		new app.Views.Pin({ model : new app.Models.Pin( params ) });

	}

});

app.Models.Pin = Backbone.Model.extend({

	defaults : {

		pin : null,
		address : null,
		title : null,
		position : null,
		iconUrl : null,
		eventType : null

	},

	initialize : function ( e ) {

		this.setIcon();

	},

	setIcon : function () {

		var eventType = this.get( 'eventType' );

		var baseUrl = 'http://maps.google.com/mapfiles/ms/micons/';
		var iconUrl;
		var icon;
		
		switch ( eventType ) {

			case 'action' :
				icon = 'red-dot.png';
				break;

			case 'meeting' :
				icon = 'blue-dot.png';
				break;

			case 'appearance':
				icon = 'yellow-dot.png';
				break;

			default:
				icon = 'red-dot.png';

		}

		iconUrl = baseUrl + icon;

		this.set( 'iconUrl', iconUrl );

	}
	
});

// TODO
// app.Collections.Pins = Backbone.Collection.extend({

// 	model : app.Models.Pin

// });

app.Views.Pin = Backbone.View.extend({

	initialize : function ( e ) {

		this.getPosition( this.model.get( 'address' ) );

	},

	render : function ( position, title ) {

		var pin = new google.maps.Marker({ 

			map : app.map.map,
			position : this.model.get('position'), 
			title : this.model.get('title'),
			icon : this.model.get( 'iconUrl' ) 

		});

		var infoWindow = this.createInfoWindow();

		pin.addListener( 'mouseover', function ( e ) {

			infoWindow.open( app.map.map, pin );

		});

		pin.addListener( 'mouseout', function ( e ) {

			infoWindow.close();

		});

		this.model.set({ pin : pin });

	},

	getPosition : function ( address ) {

		app.geocoder.geocode({ address : address }, function(results, status) {

			if ( status === google.maps.GeocoderStatus.OK ) {

			    this.model.set( 'position', results[0].geometry.location );
			    this.render();

			} else {

			    alert( 'Geocode was not successful for the following reason: ' + status );

			}
	      
		}.bind( this ));

	},

	createInfoWindow : function () {

		var data = { 

			title : this.model.get( 'title' ), 
			description : this.model.get( 'description' ),
			time : this.model.get( 'time' ),
			date : this.model.get( 'date' ),
			eventType : this.model.get( 'eventType' ),
			address : this.model.get( 'address' ),

		};

		var template = _.template( $( '#infowindow-template' ).html() );

		var infoWindow = new google.maps.InfoWindow({

			content: template( data )

		});

		return infoWindow;

	}

});

app.Views.Form = Backbone.View.extend({

	el : '#form',

	events : {

		'click .submit' : 'onSubmit'

	},

	onSubmit : function ( e ) {

		var params = {

			date        : this.$( '.date' ).val(),
			time        : this.$( '.time' ).val(),
			title       : this.$( '.title' ).val(),
			address     : this.$( '.address' ).val(),
			eventType   : this.$( '.event-type' ).val(),
			description : this.$( '.description' ).val(),

		};

		app.map.addPin( params );

	}

});