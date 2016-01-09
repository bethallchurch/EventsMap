var app = {

	Models : {},
	Views : {},
	Collections : {},

	init : function () {

		this.map = new app.Views.Map;
		this.form = new app.Views.Form;
		this.geocoder = new google.maps.Geocoder();

	}

};

app.Models.Map = Backbone.Model.extend({

	defaults : {

		options : {

			center : {

				lat : 54.6,
				lng : -2.5

			},

			zoom : 5

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

	addPin : function ( address, title ) {

		var model = new app.Models.Pin({ 
			
			address : address,
			title : title 

		}); 

		new app.Views.Pin({ model : model });

	}

});

app.Models.Pin = Backbone.Model.extend({

	defaults : {

		pin : null,
		address : null,
		title : null,
		position : null

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

	getPosition : function ( address ) {

		app.geocoder.geocode({ address : address }, function(results, status) {

			if ( status === google.maps.GeocoderStatus.OK ) {

			    this.model.set( 'position', results[0].geometry.location );
			    this.render( this.model.get('position'), this.model.get('title') );

			} else {

			    alert( 'Geocode was not successful for the following reason: ' + status );

			}
	      
		}.bind( this ));

	},

	render : function ( position, title ) {

		var pin = new google.maps.Marker({ 

			map : app.map.map,
			position : position, 
			title : title 

		});

	}

});

app.Views.Form = Backbone.View.extend({

	el : '#form',

	events : {

		'click .submit' : 'onSubmit'

	},

	onSubmit : function ( e ) {

		console.log('hello')

		var address = this.$( '.address' ).val();
		var title = this.$( '.title' ).val();

		app.map.addPin( address, title );

	}

});