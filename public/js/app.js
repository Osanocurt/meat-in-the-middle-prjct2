'use strict';

$(function () {

  var $main = $('main');
  var $mapDiv = $('#map');
  var $landing = $('#landing');
  var $sidePanel = $("#sidePanel");
  var $friendCarouselDiv = $("#friendCarouselDiv");
  var midPoint = { lat: 0, lng: 0 };
  var uniqueId = 0;
  var startingPos = null;
  var venueChosen = null;
  var resource = void 0;
  var map = void 0;
  var people = [];
  var allResults = [];
  var venueMarkers = [];
  var ids = [];
  var markerId = [];
  var latLngList = [];
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var directionsService = new google.maps.DirectionsService();
  var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7C00FFFF");
  var pinDefault = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7CEE99EE");

  $('.register').on('click', showRegisterForm);
  $('.login').on('click', showLoginForm);
  $('.profile').on('click', getFriends);
  $('.logout').on('click', logout);
  $main.on('submit', 'form', handleForm);
  $main.on('click', "#go", calculateMidPoint);
  $main.on('click', '#friendSaveLocation', saved);
  $main.on('click', '#userSaveLocation', saved);
  $main.on('click', 'button#addAFriend', getFriends);
  $main.on('click', 'button#addAnotherFriend', showFriendsToAdd);
  $main.on('click', 'button.delete', deleteFriend);
  $main.on('click', 'button.edit', getFriend);
  $main.on("click", ".directionButton", selectVenue);
  $main.on("click", "a#resource", updateResourceChoice);
  $sidePanel.on('submit', 'form#filterResults', filterResults);
  $sidePanel.on('click', 'button#locationButton', getUserCurrentPos);
  $sidePanel.on('click', 'button#clearFilterResults', clearFilterResults);
  $sidePanel.on('click', 'button#useSavedAdd', useHome);
  $sidePanel.on('click', 'button.addFriend', getFriend);
  $sidePanel.on("click", "#carouselChoice", setIcon);
  $landing.on('submit', 'form', handleForm);
  $landing.on('click', 'button#landingGetStarted', landingRegForm);
  $landing.on('click', 'button#landingLogin', landingLoginForm);
  $landing.on('click', 'button#resource', clearLandingPage);
  $("#travelSelect").on('change', showDirections);

  function saved() {
    $(this).html("Saved");
  }

  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  if (isLoggedIn()) {
    landingResourceForm();
    // console.log("logged in");
  } else {
    landingPage();
    // console.log("logged out");
  }

  function landingPage() {
    $landing.html('\n      <div class="landing">\n        <h1>Welcome</h1>\n        <p>We\'ve made finding somewhere to hang out with your mates super easy. Whether you\'re looking for a bite to eat, or your planning a trip to the zoo, we\'ve got you covered.</p>\n        <button id="landingGetStarted" class="btn btn-primary">Get started</button>\n      </div>');
  }

  function landingRegForm() {
    $landing.html('\n      <div class="landing">\n        <h1>Register</h1>\n        <p>Already registered? <button class="btn btn-secondary" id="landingLogin">Sign in</button></p>\n        <form method="post" action="/api/register" data-target="landingResourceForm">\n          <div class="form-group">\n            <input class="form-control" name="user[username]" placeholder="Username">\n          </div>\n          <div class="form-group">\n            <input class="form-control" name="user[email]" placeholder="Email">\n          </div>\n          <div class="form-group">\n            <input class="form-control" type="password" name="user[password]" placeholder="Password">\n          </div>\n          <div class="form-group">\n            <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password Confirmation">\n          </div>\n          <button class="btn btn-primary">Register</button>\n        </form>\n      </div>');
  }

  function landingLoginForm() {
    $landing.html('\n      <div class="landing">\n        <h2>Login</h2>\n        <form method="post" action="/api/login" data-target="landingResourceForm">\n          <div class="form-group">\n            <input class="form-control" name="email" placeholder="Email">\n          </div>\n          <div class="form-group">\n            <input class="form-control" type="password" name="password" placeholder="Password">\n          </div>\n          <button class="btn btn-primary">Login</button>\n        </form>\n      </div>\n    ');
  }

  function landingResourceForm() {

    var username = localStorage.getItem('username');
    var welcomeMessage = 'Hi ' + username + ',';

    if (!username) {
      welcomeMessage = 'Welcome back';
    }

    $landing.html('\n      <div class="landing">\n      <h1>' + welcomeMessage + '</h1>\n        <h2>What are you in the mood for?</h2>\n        <div class="row">\n          <div class="card">\n            <div class="card-block">\n              <h4 class="card-title">Eating & Drinking</h4>\n              <button id="resource" class="btn btn-secondary" data-id=\'restaurant\'>Restaurant</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'bar\'>Bar</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'cafe\'>Cafe</button>\n            </div>\n          </div>\n          <div class="card">\n            <div class="card-block">\n              <h4 class="card-title">Night Out</h4>\n              <button id="resource" class="btn btn-secondary" data-id=\'casino\'>Casino</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'night_club\'>Night Club</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'movie_theater\'>Theater</button>\n            </div>\n          </div>\n          <div class="card">\n            <div class="card-block">\n              <h4 class="card-title">Shopping</h4>\n              <button id="resource" class="btn btn-secondary" data-id=\'shopping_mall\'>Shopping</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'clothing_store\'>Clothes</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'florist\'>Florist</button>\n            </div>\n          </div>\n          <div class="card">\n            <div class="card-block">\n              <h4 class="card-title">Day Out</h4>\n              <button id="resource" class="btn btn-secondary" data-id=\'zoo\'>Zoo</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'park\'>Park</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'spa\'>Spa</button>\n              <button id="resource" class="btn btn-secondary" data-id=\'gym\'>Gym</button>\n            </div>\n          </div>\n        </div>\n      </div>');
  }

  function clearLandingPage() {
    resource = $(this).data('id');
    $landing.remove();
    showResourceForm();
    mapInit();
    showUserForm();
  }

  function showRegisterForm() {
    if (event) event.preventDefault();
    $friendCarouselDiv.css("visibility", "hidden");
    $("#travelModeDiv").css("visibility", "hidden");
    $sidePanel.html('\n      <h2>Register</h2>\n      <form method="post" action="/api/register" data-target="showUserForm">\n        <div class="form-group">\n          <input class="form-control" name="user[username]" placeholder="Username">\n        </div>\n        <div class="form-group">\n          <input class="form-control" name="user[email]" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[password]" placeholder="Password">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password Confirmation">\n        </div>\n        <button class="btn btn-primary">Register</button>\n      </form>\n    ');
  }

  function showLoginForm() {
    if (event) event.preventDefault();
    $friendCarouselDiv.css("visibility", "hidden");
    $("#travelModeDiv").css("visibility", "hidden");
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
      // console.log(address);
      document.getElementById("newFriendAdd").value = address;
      document.getElementById("input-lat").value = lat;
      document.getElementById("input-lng").value = lng;
    });
  }

  function handleForm() {
    if (event) event.preventDefault();
    var $form = $(this);
    var data = $form.serialize();

    if ($form[0].id === 'filterResults') {
      return;
    } else {
      (function () {
        var token = localStorage.getItem('token');
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
            if (data.user.username) localStorage.setItem('username', data.user.username);
            if (data.token) localStorage.setItem('token', data.token);
          }
          if (nextView === 'landingResourceForm') {
            landingResourceForm();
          } else if (nextView === 'showUserForm') {
            showUserForm();
          } else if (nextView === 'viewProfile') {
            getFriends();
          }
        });
        // .fail(showLoginForm);
      })();
    }
  }

  function getFriends() {
    $friendCarouselDiv.css("visibility", "hidden");
    $("#travelModeDiv").css("visibility", "hidden");

    var nextView = "";

    if (!$(this).data('target')) {
      if ($(event.srcElement).data('target') === 'friendLocation') {
        nextView = 'friendLocation';
      } else {
        nextView = 'viewProfile';
      }
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
      var $row = $('<div class="row"><h4>Saved Friends</h4></div>');
      friends.forEach(function (friend) {
        $row.append('\n          <div class="col-md-12">\n            <div class="card">\n              <div class="card-block">\n                <h4 class="card-title">' + friend.name + '</h4>\n                <p class="card-title">' + friend.address + '</p>\n              </div>\n            <button class="btn btn-primary addFriend" data-target="addToMap" data-id="' + friend._id + '">Add</button>\n            </div>\n          </div>\n        ');
      });
      $sidePanel.html($row);
      showFriendForm();
    });
  }

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
    $friendCarouselDiv.css("visibility", "hidden");
    $("#travelModeDiv").css("visibility", "hidden");
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    $main.empty();
    landingPage();
  }

  function mapInit() {
    map = new google.maps.Map($mapDiv[0], {
      center: { lat: 51.5074, lng: -0.1278 },
      zoom: 7
    });
  }

  function showResourceForm() {
    $main.prepend('\n      <ul class="nav nav-tabs">\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'restaurant\'>Restaurant</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'bar\'>Bar</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'cafe\'>Cafe</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'casino\'>Casino</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'night_club\'>Night Club</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'movie_theater\'>Theater</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'shopping_mall\'>Shopping</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'clothing_store\'>Clothes</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'florist\'>Florist</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'casino\'>Zoo</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'park\'>Park</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'spa\'>Spa</a>\n        </li>\n        <li class="nav-item">\n          <a class="nav-link" id="resource" data-id=\'gym\'>Gym</a>\n        </li>\n      </ul>');
  }

  function updateResourceChoice() {
    resource = $(this).data('id');
    mapInit();
    showUserForm();
  }

  function showUserForm() {
    if (event) event.preventDefault();
    var userId = localStorage.getItem('id');
    $sidePanel.html('<h2>Where Are You?</h2>\n      <button class="btn btn-secondary" id="useSavedAdd">Use saved address</button>\n      <h4>or</h4>\n      <input id="pac-input" class="controls" type="text" placeholder="Enter location">\n      <form id="userLocation" data-target="current" method="put" action="/api/users/' + userId + '">\n        <input type=\'hidden\' id="input-location" name="user[address]">\n        <input type=\'hidden\' id="input-lat" name="user[lat]">\n        <input type=\'hidden\' id="input-lng" name="user[lng]">\n        <button class="btn btn-secondary" id="userSaveLocation">Save</button>\n      </form>\n\n      <h4>or</h4>\n      <button id="locationButton" data-target="friendLocation" class="btn btn-secondary">Use current location</button>\n      <br>\n      <button id="addAFriend" data-target="friendLocation" class="btn btn-primary">Add friend</button>\n    ');
    createSearchBar();
  }

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
      document.getElementById("input-lat").value = '' + personsPosition.lat;
      document.getElementById("input-lng").value = '' + personsPosition.lng;
      people.push(personsPosition);
      addMarker(personsPosition);
      setMapBounds(people);
    });
  }

  function showFriendForm() {
    var userId = localStorage.getItem('id');
    if (event) event.preventDefault();
    $sidePanel.prepend('<h4>Add New Friend</h4>\n      <input id="pac-input" class="controls" type="text" placeholder="Address">\n      <form id="friendLocation" data-target="current" method="post" action="/api/users/' + userId + '/friends">\n        <input id="input-name" name="name" placeholder="Name">\n        <input type=\'hidden\' id="input-location" name="address">\n        <input type=\'hidden\' id="input-lat" name="lat">\n        <input type=\'hidden\' id="input-lng" name="lng">\n        <button class="btn btn-secondary" id="friendSaveLocation">Save</button>\n      </form>\n      <button id="go" class="btn btn-primary">Go!</button>\n      <button id="addAFriend" data-target=\'friendLocation\' class="btn btn-primary">Add another friend</button>\n    ');
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

    map.panTo(midPoint);
    nearbySearch();
  }

  function nearbySearch(maxPrice) {
    var request = {
      location: midPoint,
      types: [resource],
      rankBy: google.maps.places.RankBy.DISTANCE,
      maxPriceLevel: maxPrice
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  }

  function callback(results, status) {
    allResults = results;
    if (status === 'ZERO_RESULTS') {
      alert("No results found");
    } else if (status == google.maps.places.PlacesServiceStatus.OK) {
      populateMap(allResults);
    }
  }

  function populateMap(results) {
    var maxResults = 100;
    var LatLngList = [];
    var resultsToShow = [];
    mapInit();

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

  function clearFilterResults(e) {
    e.preventDefault();
    populateMap(allResults);
  }

  function filterResults(e) {
    e.preventDefault();
    var maxPrice = parseInt($(this).find('[name=price]').val());
    var minRating = parseInt($(this).find('[name=rating]').val());

    if (maxPrice === '--' && minRating === '--') {
      return;
    }

    var venuesToKeep = [];

    allResults.forEach(function (venue) {
      var hasPrice = !!venue.price_level;
      var hasRating = !!venue.rating;
      if (hasPrice && hasRating) {
        if (!!minRating && !!maxPrice) {
          if (venue.rating >= minRating && venue.price_level === maxPrice) {
            venuesToKeep.push(venue);
          }
        } else if (!minRating) {
          if (venue.price_level <= maxPrice) {
            venuesToKeep.push(venue);
          }
        } else if (!maxPrice) {
          if (venue.rating >= minRating) {
            venuesToKeep.push(venue);
          }
        }
      } else if (hasPrice || hasRating) {
        if (!minRating && !maxPrice) {
          if (venue.rating >= minRating || venue.price_level <= maxPrice) {
            venuesToKeep.push(venue);
          }
        } else if (!minRating) {
          if (venue.price_level <= maxPrice) {
            venuesToKeep.push(venue);
          }
        } else if (!maxPrice) {
          if (venue.rating >= minRating) {
            venuesToKeep.push(venue);
          }
        }
      }
    });

    if (venuesToKeep.length === 0) {
      mapInit();
      populateCarousel(venuesToKeep);
    } else {
      populateMap(venuesToKeep);
      populateCarousel(venuesToKeep);
    }
  }

  function populateCarousel(resultsToShow) {
    $sidePanel.empty();

    var $carousel = $('<div id=\'carousel-custom\' class=\'carousel slide\' data-ride=\'carousel\'>\n        <div id=\'filter\'>\n          <h4>Filter Results</h4>\n          <form id="filterResults">\n            <label for=\'price\'>Max price</label>\n            <select name="price">\n              <option value=\'null\'>--</option>\n              <option value=\'1\'>\xA3</option>\n              <option value=\'2\'>\xA3\xA3</option>\n              <option value=\'3\'>\xA3\xA3\xA3</option>\n              <option value=\'4\'>\xA3\xA3\xA3\xA3</option>\n            </select>\n            <br>\n            <label for=\'rating\'>Rating</label>\n            <select name="rating">\n              <option value=\'null\'>--</option>\n              <option value=\'1\'>*</option>\n              <option value=\'2\'>**</option>\n              <option value=\'3\'>***</option>\n              <option value=\'4\'>****</option>\n              <option value=\'5\'>*****</option>\n            </select>\n            <br>\n            <button id="filterResultsBtn" class="btn btn-danger" type="submit">Update</button>\n            <button id="clearFilterResults" class="btn btn-secondary" type="submit">Clear filter</button>\n          <form>\n          <hr>\n        </div>\n      </div>');

    resultsToShow.forEach(function (venue) {
      var imgSrc = '';
      var imgHtml = '';
      var ratingHtml = '';
      var priceHtml = '';
      var lat = venue.geometry.location.lat();
      var lng = venue.geometry.location.lng();

      if (!!venue.rating) {
        ratingHtml = '<p>' + venue.rating + ' stars</p>';
      }

      if (!!venue.photos) {
        imgSrc = venue.photos[0].getUrl({ maxWidth: 300, maxHeight: 500 });
        imgHtml = '<br><img src="' + imgSrc + '">';
      }

      if (!!venue.price_level) {
        var priceImg = '<img class="priceLevel" src="../images/pound.png">';
        switch (venue.price_level) {
          case 1:
            priceHtml = priceImg;
            break;
          case 2:
            priceHtml = '' + priceImg + priceImg;
            break;
          case 3:
            priceHtml = '' + priceImg + priceImg + priceImg;
            break;
          case 4:
            priceHtml = '' + priceImg + priceImg + priceImg + priceImg;
            break;
        }
      }

      $carousel.append('\n        <div class="item" id="carouselItem">\n          <a id="carouselChoice" data-id="' + uniqueId + '"><h4>' + venue.name + '</h4>\n          <p>' + venue.vicinity + '</p>\n          ' + ratingHtml + priceHtml + '\n          ' + imgHtml + '</a>\n          <button class="directionButton btn btn-primary" data-lat=' + lat + ' data-lng=' + lng + '>Directions</button>\n        </div>\n        <hr>');
      uniqueId++;
    });
    $sidePanel.html($carousel);
  }

  function setMapBounds(latLngList) {
    var bounds = new google.maps.LatLngBounds();
    for (var j = 0, LatLngLen = latLngList.length; j < LatLngLen; j++) {
      bounds.extend(latLngList[j]);
    }
    map.fitBounds(bounds);
  }

  function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      icon: pinDefault
    });

    marker.id = markerId;
    venueMarkers.push(marker);
    markerId++;

    google.maps.event.addListener(marker, 'click', function () {
      var infowindow = new google.maps.InfoWindow();

      infowindow.setContent('<h2>' + place.name + '</h2><br><button class="directionButton btn btn-secondary"  data-lat=  ' + place.geometry.location.lat() + ' data-lng=' + place.geometry.location.lng() + '>Directions</button>');
      //  console.log(place.geometry.location.lng());
      infowindow.open(map, this);
    });
  }

  function selectVenue() {
    startingPos = people[0];
    venueChosen = { lat: $(this).data("lat"), lng: $(this).data("lng") };
    showDirections();
  }

  function showDirections() {
    $sidePanel.empty();
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
        showFriendCarousel();
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  function getUserCurrentPos() {
    navigator.geolocation.getCurrentPosition(function (position) {
      var personsPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      people.push(personsPosition);
      addMarker(personsPosition);
      setMapBounds(people);
    });
    getFriends();
  }

  function showFriendCarousel() {
    $friendCarouselDiv.css("visibility", "visible");
    $friendCarouselDiv.html('<div id="friendCarousel">\n      <div id="carousel-example-generic" class="carousel slide" data-ride="carousel">\n        <div id="friendCarouselInner" class="carousel-inner" role="listbox">\n          <div class="carousel-item active">\n            <h4 class="chooseStart" data-lat="' + people[0].lat + '" data-lng="' + people[0].lng + '">Your directions</h4>\n          </div>\n        </div>\n        <a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">\n          <span class="icon-prev" aria-hidden="true"></span>\n          <span class="sr-only">Previous</span>\n        </a>\n        <a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">\n          <span class="icon-next" aria-hidden="true"></span>\n          <span class="sr-only">Next</span>\n        </a>\n        </div>\n     </div>');

    people.forEach(function (person) {
      if (people.indexOf(person) !== 0) {

        $("#friendCarouselInner").append('<div class="carousel-item">\n          <h4 class="chooseStart" data-lat="' + person.lat + '" data-lng="' + person.lng + '">Directions for friend ' + people.indexOf(person) + '</h4>\n          </div>');
        $main.on('click', '.chooseStart', chooseStart);
      }
    });
  }

  function chooseStart() {
    var startingLat = $(this).data("lat");
    var startingLng = $(this).data("lng");
    startingPos = { lat: startingLat, lng: startingLng };
    showDirections();
  }

  function setIcon() {
    for (var i = 0; i < venueMarkers.length; i++) {
      if (venueMarkers[i].id == $(this).data("id")) {
        venueMarkers[i].setIcon(pinImage);
      } else {
        venueMarkers[i].setIcon(pinDefault);
      }
    }
  }
});