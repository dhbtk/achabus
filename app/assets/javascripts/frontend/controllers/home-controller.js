function HomeController($scope, $q) {
	var self = this;
	self.places = {};
	self.search = {
		place: null,
		text: null
	};
	self.searchPlaces = function() {
		return $q.defer().promise;
	}

	$('<img />').attr('src', '/cataratas.jpg').load(function() {
		$('#home-container').css('background-image','url(/cataratas.jpg)').fadeIn('slow');
	})
}
