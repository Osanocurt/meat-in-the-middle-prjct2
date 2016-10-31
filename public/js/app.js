'use strict';

$(function () {

  var $main = $('main');
  var $mapDiv = $('#map');
  var midPoint = { lat: 0, lng: 0 };

  $('.register').on('click', showRegisterForm);
  $('.login').on('click', showLoginForm);
  $('.friends').on('click', getProfile);
  $('.logout').on('click', logout);
  $('.go').on('click', calculateMidPoint);
  $main.on('submit', 'form', handleForm);
  $main.on('click', 'button.delete', deleteFriend);
  $main.on('click', 'button.edit', getFriend);
  var $sidePanel = $("#sidePanel");

  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  if (isLoggedIn()) {
    // getFriends();
    console.log("logged in");
  } else {
    showLoginForm();
    console.log("logged out");
  }

  function showRegisterForm() {
    if (event) event.preventDefault();
    $sidePanel.html('\n      <h2>Register</h2>\n      <form method="post" action="/api/register">\n        <div class="form-group">\n          <input class="form-control" name="user[username]" placeholder="Username">\n        </div>\n        <div class="form-group">\n          <input class="form-control" name="user[email]" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[password]" placeholder="Password">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password Confirmation">\n        </div>\n        <button class="btn btn-primary">Register</button>\n      </form>\n    ');
  }

  function showLoginForm() {
    if (event) event.preventDefault();
    $sidePanel.html('\n      <h2>Login</h2>\n      <form method="post" action="/api/login">\n        <div class="form-group">\n          <input class="form-control" name="email" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="password" placeholder="Password">\n        </div>\n        <button class="btn btn-primary">Login</button>\n      </form>\n    ');
  }

  function showEditForm(friend) {
    if (event) event.preventDefault();
    var userId = localStorage.getItem('id');

    $sidePanel.html('\n      <h2>Edit Friend</h2>\n      <form method="put" action="/api/users/' + userId + '/friends/' + friend._id + '">\n        <div class="form-group">\n          <label for="name">\n          <input class="form-control" name="name" value="' + friend.name + '">\n          <label for="location">\n          <input class="form-control" name="lat" value="' + friend.lat + '">\n          <label for="rating">\n          <input class="form-control" name="lng" value="' + friend.lng + '">\n        </div>\n        <button class="btn btn-primary">Update</button>\n      </form>\n    ');
  }

  function handleForm() {
    if (event) event.preventDefault();
    var token = localStorage.getItem('token');
    var $form = $(this);

    var url = $form.attr('action');
    var method = $form.attr('method');
    var data = $form.serialize();

    $.ajax({
      url: url,
      method: method,
      data: data,
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(function (data) {
      console.log(data);
      if (!!data.user) {
        var userId = data.user._id;
        if (userId) localStorage.setItem('id', userId);
        if (data.token) localStorage.setItem('token', data.token);
      }
      getFriends();
    }).fail(showLoginForm);
  }

  function getFriends() {
    if (event) event.preventDefault();
    var token = localStorage.getItem('token');
    var userId = localStorage.getItem('id');
    console.log(userId);

    $.ajax({
      url: '/api/users/' + userId + '/friends',
      method: "GET",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(showFriends).fail(showLoginForm);
  }

  function showFriends(friends) {
    var $row = $('<div class="row"></div>');
    friends.forEach(function (friend) {
      $row.append('\n        <div class="col-md-4">\n          <div class="card">\n            <div class="card-block">\n              <h4 class="card-title">' + friend.name + '</h4>\n              <h4 class="card-title">' + friend.lat + '</h4>\n              <h4 class="card-title">' + friend.lng + '</h4>\n            </div>\n          </div>\n          <button class="btn btn-danger delete" data-id="' + friend._id + '">Delete</button>\n          <button class="btn btn-primary edit" data-id="' + friend._id + '">Edit</button>\n        </div>\n      ');
    });

    $sidePanel.html($row);
  }

  function deleteFriend() {
    //   let id = $(this).data('id');
    //   let token = localStorage.getItem('token');
    //
    //   $.ajax({
    //     url: `/api/friends/${id}`,
    //     method: "DELETE",
    //     beforeSend: function(jqXHR) {
    //       if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
    //     }
    //   })
    //   .done(getFriends)
    //   .fail(showLoginForm);
  }

  function getFriend() {
    var userId = localStorage.getItem('id');
    var friendId = $(this).data('id');
    var token = localStorage.getItem('token');

    $.ajax({
      url: '/api/users/' + userId + '/friends/' + friendId,
      method: "GET",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(showEditForm).fail(showLoginForm);
  }

  function logout() {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    showLoginForm();
  }

  //------------------------------------------------------------------------------------------------------------------------------------


  var map = void 0;
  var people = [];

  function mapInit() {
    map = new google.maps.Map($mapDiv[0], {
      center: { lat: 51.5074, lng: -0.1278 },
      zoom: 7
    });
    markerInit();
  }
  mapInit();

  function showForm() {
    if (event) event.preventDefault();
    $sidePanel.html('<h2>Choose your location</h2>\n      <h4>Either</h4>\n      <input id="pac-input" class="controls" type="text" placeholder="Enter your address">\n      <h4>or</h4>\n        <button class="btn btn-primary">Click here to find my location</button>\n      </form>\n    ');
    createSearchBar();
  }

  showForm();

  function createSearchBar() {
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    searchBox.addListener('places_changed', function () {
      var myPlaces = searchBox.getPlaces();
      var userPosition = {
        lat: myPlaces[0].geometry.location.lat(),
        lng: myPlaces[0].geometry.location.lng()
      };
      addMarker(userPosition);
    });
  }

  function markerInit() {

    var user = { lat: 51.5074, lng: -0.1278 };
    addMarker(user);
    people = [user];
    var LatLngList = [user];

    var friends = [{ lat: 51.6074, lng: -0.3278 }, { lat: 52.9074, lng: -3.3278 }, { lat: 52.6074, lng: 1.2278 }, { lat: 51.6074, lng: -0.2278 }];

    friends.forEach(function (friend) {
      LatLngList.push(friend);
      people.push(friend);
      addMarker(friend);
    });
    setMapBounds(LatLngList);
  }

  function addMarker(location) {
    var position = {
      lat: location.lat,
      lng: location.lng
    };

    var marker = new google.maps.Marker({
      position: position,
      map: map
    });
  }

  function calculateMidPoint() {

    var midLatSum = 0;
    var midLngSum = 0;

    people.forEach(function (person) {
      midLatSum += person.lat;
      midLngSum += person.lng;
    });

    var midLat = midLatSum / people.length;
    var midLng = midLngSum / people.length;

    midPoint = {
      lat: midLat,
      lng: midLng
    };
    addMarker(midPoint);

    map.panTo(midPoint);
    nearbySearch(midPoint);
  }

  function nearbySearch(midPoint) {

    var request = {
      location: midPoint,
      types: ['restaurant'],
      openNow: true,
      rankBy: google.maps.places.RankBy.DISTANCE
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  }

  function callback(results, status) {
    var maxResults = 9;
    if (status === 'ZERO_RESULTS') {
      alert("No results found");
    } else if (status == google.maps.places.PlacesServiceStatus.OK) {
      var LatLngList = [];

      if (results.length <= maxResults) {
        maxResults = results.length;
      }

      for (var i = 0; i < maxResults; i++) {
        var resource = results[i];
        LatLngList.push(resource.geometry.location);
        createMarker(resource);
      }
      setMapBounds(LatLngList);
    }
  }

  function setMapBounds(LatLngList) {
    //  Create a new viewpoint bound
    var bounds = new google.maps.LatLngBounds();
    //  Go through each marker...
    for (var j = 0, LatLngLen = LatLngList.length; j < LatLngLen; j++) {
      // increase the bounds to take marker
      bounds.extend(LatLngList[j]);
    }
    //  Fit  bonds to the map
    map.fitBounds(bounds);
  }

  function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function () {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  }

  //click listener to be assigned to "choose venue" button on pop up wndows.
  $(".direct").on("click", showDirections);

  //user and venue variables for purpose of testing directions function
  var startingPos = { lat: 51.5074, lng: -0.1278 };
  var venueChosen = { lat: 51.5074, lng: -0.1222 };
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var directionsService = new google.maps.DirectionsService();

  //function to generate route and directions panel upon choosing venue. other pins still remain on map!
  function showDirections() {
    $("#travelModeDiv").css("visibility", "visible");
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('sidePanel'));
    var selectedMode = document.getElementById('travelSelect').value;
    directionsService.route({
      origin: startingPos,
      destination: venueChosen,
      travelMode: google.maps.TravelMode[selectedMode]
    }, function (response, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  //directions and route live update based on choice of travel method from drop down menu which spawns on function firing.
  $("#travelSelect").on('change', showDirections);

  //function to link starting pos to user/friend clicked in carousel
  //friendnumber_.on('click', function() {
  //startingPos = friendnumber_.latlng;
  // })


  function getProfile() {
    $sidePanel.html('<div class="row"><h1>Profile</h1></div>');
    getFriends();
  }
});