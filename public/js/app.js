'use strict';

$(function () {

  var $main = $('main');
  var $mapDiv = $('#map');
  var midPoint = { lat: 0, lng: 0 };

  $('.register').on('click', showRegisterForm);
  $('.login').on('click', showLoginForm);
  $('.profile').on('click', getFriends);
  $('.logout').on('click', logout);
  $main.on('click', "#go", calculateMidPoint);
  $main.on('submit', 'form', handleForm);
  $main.on('click', '#friendSaveLocation', saved);
  $main.on('click', 'button.delete', deleteFriend);
  $main.on('click', 'button.edit', getFriend);
  var $sidePanel = $("#sidePanel");

  function saved() {
    $("#friendSaveLocation").html("Saved");
  }

  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  if (isLoggedIn()) {
    // getFriends();
    console.log("logged in");
  } else {
    // showLoginForm();
    console.log("logged out");
  }

  function showRegisterForm() {
    if (event) event.preventDefault();
    $sidePanel.html('\n      <h2>Register</h2>\n      <form method="post" action="/api/register" data-target="showUserForm">\n        <div class="form-group">\n          <input class="form-control" name="user[username]" placeholder="Username">\n        </div>\n        <div class="form-group">\n          <input class="form-control" name="user[email]" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[password]" placeholder="Password">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password Confirmation">\n        </div>\n        <button class="btn btn-primary">Register</button>\n      </form>\n    ');
  }

  function showLoginForm() {
    if (event) event.preventDefault();
    $sidePanel.html('\n      <h2>Login</h2>\n      <form method="post" action="/api/login" data-target="showUserForm">\n        <div class="form-group">\n          <input class="form-control" name="email" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="password" placeholder="Password">\n        </div>\n        <button class="btn btn-primary">Login</button>\n      </form>\n    ');
  }

  function showFriendEditForm(friend) {
    if (event) event.preventDefault();
    var userId = localStorage.getItem('id');

    $sidePanel.html('\n      <h2>Edit Friend</h2>\n      <form id="friendUpdate" method="put" action="/api/users/' + userId + '/friends/' + friend._id + '"  data-target="viewProfile">\n        <div class="form-group">\n          <label for="name">\n          <input class="form-control" name="name" value="' + friend.name + '">\n          <input type="hidden" id="input-lat" name="lat" value="' + friend.lat + '">\n          <input type="hidden" id="input-lng" name="lng" value="' + friend.lng + '">\n          <label for="address">\n          <input id="friendAddr" class="controls" type="text" placeholder=\'Address\' value="' + friend.address + '">\n          <input type="hidden" id="newFriendAdd" name=\'address\' type="text" value=\'' + friend.address + '\'>\n          <button id="friendUpdateBtn" class="btn btn-primary" type=\'submit\'>Update</button>\n          <button id="backToProfile" class="btn btn-secondary">Back</button>\n        </div>\n      </form>');

    var input = document.getElementById('friendAddr');
    var searchBox = new google.maps.places.SearchBox(input);

    searchBox.addListener('places_changed', function () {
      var newAddress = searchBox.getPlaces()[0];
      var lat = newAddress.geometry.location.lat();
      var lng = newAddress.geometry.location.lng();
      var address = newAddress.formatted_address;
      console.log(address);
      document.getElementById("newFriendAdd").value = address;
      document.getElementById("input-lat").value = lat;
      document.getElementById("input-lng").value = lng;
    });
  }

  function handleForm() {
    if (event) event.preventDefault();
    var token = localStorage.getItem('token');
    var $form = $(this);
    var nextView = $form.data('target');

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
      if (!!data.user) {
        var userId = data.user._id;
        if (userId) localStorage.setItem('id', userId);
        if (data.token) localStorage.setItem('token', data.token);
      }
      if (nextView === 'showUserForm') {
        showUserForm();
      } else if (nextView === 'viewProfile') {
        getFriends();
      }
    });
    // .fail(showLoginForm);
  }

  //-------------------------------------------------------------//

  function getFriends() {
    var nextView = "";

    if (!$(this).data('target')) {
      nextView = 'viewProfile';
    } else {
      nextView = $(this).data('target');
    }

    if (event) event.preventDefault();
    var token = localStorage.getItem('token');
    var userId = localStorage.getItem('id');

    $.ajax({
      url: '/api/users/' + userId + '/friends',
      method: "GET",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(function (friends) {
      if (nextView === 'friendLocation') {
        showFriendsToAdd(friends);
      } else if (nextView === 'viewProfile') {
        getUser(friends, nextView);
      } else {
        console.log("Error: Check the source of the request to getFriends");
      }
    });
    // .fail(showLoginForm);
  }

  function getUser(friends, src) {

    var token = localStorage.getItem('token');
    var userId = localStorage.getItem('id');

    $.ajax({
      url: '/api/users/' + userId,
      method: "GET",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(function (user) {
      if (src === 'viewProfile') {
        showFriendsInProfile(user, friends);
      } else if (src === 'useSavedAddress') {
        updateMap(user);
      } else {
        console.log("Get user src of request unknown");
      }
    });
  }

  function showFriendsInProfile(user, friends) {
    var $row = $('<div class="row"><h2>' + user.username + '</h2><p>' + user.address + '</div>');
    friends.forEach(function (friend) {
      $row.append('\n        <div class="col-md-12">\n          <div class="card">\n            <div class="card-block">\n              <h4 class="card-title">' + friend.name + '</h4>\n              <h4 class="card-title">' + friend.address + '</h4>\n            </div>\n          </div>\n          <button class="btn btn-danger delete" data-id="' + friend._id + '">Delete</button>\n          <button class="btn btn-primary edit" data-target=\'updateFriend\' data-id="' + friend._id + '">Edit</button>\n        </div>\n      ');
    });

    $sidePanel.html($row);
  }

  function showFriendsToAdd(friends) {
    var token = localStorage.getItem('token');
    var userId = localStorage.getItem('id');

    $.ajax({
      url: '/api/users/' + userId,
      method: "GET",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(function (user) {
      var $row = $('<div class="row"><h2>Add Friends</h2></div>');
      friends.forEach(function (friend) {
        $row.append('\n          <div class="col-md-12">\n            <div class="card">\n              <div class="card-block">\n                <h4 class="card-title">' + friend.name + '</h4>\n                <p class="card-title">' + friend.address + '</p>\n              </div>\n            <button class="btn btn-primary addFriend" data-target="addToMap" data-id="' + friend._id + '">Add</button>\n            </div>\n          </div>\n        ');
      });
      $sidePanel.html($row);
      showFriendForm();
    });
  }

  $sidePanel.on('click', 'button.addFriend', getFriend);

  function deleteFriend() {
    var userId = localStorage.getItem('id');
    var friendId = $(this).data('id');
    var token = localStorage.getItem('token');

    $.ajax({
      url: '/api/users/' + userId + '/friends/' + friendId,
      method: "DELETE",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(getFriends);
    // .fail(showLoginForm);
  }

  function getFriend() {
    var _this = this;

    var userId = localStorage.getItem('id');
    var friendId = $(this).data('id');
    var token = localStorage.getItem('token');

    $.ajax({
      url: '/api/users/' + userId + '/friends/' + friendId,
      method: "GET",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(function (person) {
      var next = $(_this).data('target');
      if (next === 'addToMap') {
        updateMap(person);
      } else if (next === 'updateFriend') {
        showFriendEditForm(person);
      }
    });
    // .fail(showLoginForm);
  }

  function updateMap(person) {
    var pos = { lat: person.lat, lng: person.lng };
    people.push(pos);
    addMarker(pos);
    setMapBounds(people);
  }

  function logout() {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('id');
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
  }
  mapInit();

  function showUserForm() {
    if (event) event.preventDefault();
    var userId = localStorage.getItem('id');
    $sidePanel.html('<h2>Where Are You?</h2>\n      <button class="btn btn-secondary" id="useSavedAdd">Use saved address</button>\n      <h4>or</h4>\n      <input id="pac-input" class="controls" type="text" placeholder="Enter location">\n      <form id="userLocation" data-target="current" method="put" action="/api/users/' + userId + '">\n        <input type=\'hidden\' id="input-location" name="user[address]">\n        <input type=\'hidden\' id="input-lat" name="user[lat]">\n        <input type=\'hidden\' id="input-lng" name="user[lng]">\n      </form>\n      <button class="btn btn-secondary" id="userSaveLocation">Save</button>\n      <h4>or</h4>\n      <button class="btn btn-secondary">Use current location</button>\n      <br>\n      <button id="addAFriend" data-target="friendLocation" class="btn btn-primary">Add friend</button>\n    ');
    createSearchBar();
  }

  showUserForm();

  var latLngList = [];
  $sidePanel.on('click', 'button#useSavedAdd', useHome);

  function useHome() {
    var friends = [];
    var src = "useSavedAddress";
    getUser(friends, src);
  }

  function createSearchBar() {
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    searchBox.addListener('places_changed', function () {
      var addresses = searchBox.getPlaces();
      var personsPosition = {
        lat: addresses[0].geometry.location.lat(),
        lng: addresses[0].geometry.location.lng()
      };

      document.getElementById("input-location").value = addresses[0].formatted_address;
      // console.log(addresses[0].formatted_address);
      document.getElementById("input-lat").value = '' + personsPosition.lat;
      document.getElementById("input-lng").value = '' + personsPosition.lng;
      people.push(personsPosition);
      // console.log(people);
      addMarker(personsPosition);
      setMapBounds(people);
    });
    $main.on('click', 'button#addAFriend', getFriends);
  }

  function showFriendForm() {
    var userId = localStorage.getItem('id');
    if (event) event.preventDefault();
    $sidePanel.append('<h4>New Friend</h4>\n      <input id="pac-input" class="controls" type="text" placeholder="Enter friend\'s address">\n      <form id="friendLocation" data-target="current" method="post" action="/api/users/' + userId + '/friends">\n        <input type=\'hidden\' id="input-name" name="name" placeholder="Friend\'s name">\n        <input type=\'hidden\' id="input-location" name="address">\n        <input type=\'hidden\' id="input-lat" name="lat">\n        <input type=\'hidden\' id="input-lng" name="lng">\n        <button class="btn btn-secondary" id="friendSaveLocation">Save</button>\n      </form>\n      <button id="go" class="btn btn-primary">Go!</button>\n      <button id="addAFriend" class="btn btn-primary">Add another friend</button>\n    ');
    createSearchBar();
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
    var maxResults = 10;
    var resultsToShow = [];

    if (status === 'ZERO_RESULTS') {
      alert("No results found");
    } else if (status == google.maps.places.PlacesServiceStatus.OK) {
      var LatLngList = [];

      if (results.length <= maxResults) {
        maxResults = results.length;
      }

      for (var i = 1; i < maxResults; i++) {
        var resource = results[i];
        resultsToShow.push(resource);
        LatLngList.push(resource.geometry.location);
        createMarker(resource);
      }
      setMapBounds(LatLngList);
      populateCarousel(resultsToShow);
    }
  }
  function populateCarousel(resultsToShow) {
    var $carousel = $('<div id=\'carousel-custom\' class=\'carousel slide\' data-ride=\'carousel\'>\n        <div class=\'carousel-outer\'>\n           <div class=\'carousel-inner\'>\n\n           </div>\n\n           </div>\n       </div>');
    resultsToShow.forEach(function (result) {
<<<<<<< HEAD
      // console.log(result);
=======
>>>>>>> 97181d29f3f326fde48926f27b4c8bdfcb89bdc1
      $carousel.append('<div class="item"><h4>' + result.name + '</h4></div>');
    });
    $sidePanel.html($carousel);
  }

  function setMapBounds(latLngList) {
    //  Create a new viewpoint bound
    var bounds = new google.maps.LatLngBounds();
    //  Go through each marker...
    for (var j = 0, LatLngLen = latLngList.length; j < LatLngLen; j++) {
      // increase the bounds to take marker
      bounds.extend(latLngList[j]);
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

    console.log(marker);
    google.maps.event.addListener(marker, 'click', function () {
      var infowindow = new google.maps.InfoWindow();

      infowindow.setContent('<strong>' + place.name + '</strong>');
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

  // function getProfile(){
  //   $sidePanel.html(`<div class="row"><h1>Profile</h1></div>`);
  //   getFriends();
  // }
});
