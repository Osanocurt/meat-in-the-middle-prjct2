$(() =>{

  const $main = $('main');
  const $mapDiv = $('#map');
  const $landing = $('#landing');
  const $sidePanel = $("#sidePanel");
  const $friendCarouselDiv = $("#friendCarouselDiv");
  let midPoint = { lat: 0, lng: 0};
  let uniqueId = 0;
  let startingPos = null;
  let venueChosen = null;
  let resource;
  let map;
  let people = [];
  let allResults =[];
  let venueMarkers = [];
  let markerId = [];
  let latLngList = [];
  var directionsDisplay = new google.maps.DirectionsRenderer({ suppressBicyclingLayer: true });
  var directionsService = new google.maps.DirectionsService();
  const pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7CDDFC74");
  const pinDefault = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7CE01A4F");

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

  if(isLoggedIn()) {
    landingResourceForm();
    // console.log("logged in");
  } else {
    landingPage();
    // console.log("logged out");
  }

  function landingPage(){
    $landing.html(`
      <div class="container">
        <h1>Welcome</h1>
        <p>We've made finding somewhere to hang out with your mates super easy. Whether you're looking for a bite to eat, or your planning a trip to the zoo, we've got you covered.</p>
        <button id="landingGetStarted" class="btn btn-secondary">Get started</button>
      </div>`);

  }

  function landingRegForm(){
    $landing.html(`
      <div class="container">
        <h1>Register</h1>
        <p>Already registered? <button class="btn btn-secondary" id="landingLogin">Sign in</button></p>
        <form method="post" action="/api/register" data-target="landingResourceForm">
          <div class="form-group">
            <input class="form-control" name="user[username]" placeholder="Username">
          </div>
          <div class="form-group">
            <input class="form-control" name="user[email]" placeholder="Email">
          </div>
          <div class="form-group">
            <input class="form-control" type="password" name="user[password]" placeholder="Password">
          </div>
          <div class="form-group">
            <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password Confirmation">
          </div>
          <button class="btn btn-primary">Register</button>
        </form>
      </div>`);
  }

  function landingLoginForm(){
    $landing.html(`
      <div class="container">
        <h2>Login</h2>
        <form method="post" action="/api/login" data-target="landingResourceForm">
          <div class="form-group">
            <input class="form-control" name="email" placeholder="Email">
          </div>
          <div class="form-group">
            <input class="form-control" type="password" name="password" placeholder="Password">
          </div>
          <button class="btn btn-primary">Login</button>
        </form>
      </div>
    `);
  }

  function landingResourceForm(){


  let username = localStorage.getItem('username');
  let welcomeMessage = `Hi ${username},`;

  if (!username) {
     welcomeMessage = (`Welcome back`);
  }

    $landing.html(`
      <div class="container">
      <h1>${welcomeMessage}</h1>
        <h2>What are you in the mood for?</h2>
        <div class="row">
          <div class="card">
            <div class="card-block">
              <h4 class="card-title">Eating & Drinking</h4>
              <button id="resource" class="btn btn-secondary" data-id='restaurant'>Restaurant</button>
              <button id="resource" class="btn btn-secondary" data-id='bar'>Bar</button>
              <button id="resource" class="btn btn-secondary" data-id='cafe'>Cafe</button>
            </div>
          </div>
          <div class="card">
            <div class="card-block">
              <h4 class="card-title">Night Out</h4>
              <button id="resource" class="btn btn-secondary" data-id='casino'>Casino</button>
              <button id="resource" class="btn btn-secondary" data-id='night_club'>Night Club</button>
              <button id="resource" class="btn btn-secondary" data-id='movie_theater'>Theater</button>
            </div>
          </div>
          <div class="card">
            <div class="card-block">
              <h4 class="card-title">Shopping</h4>
              <button id="resource" class="btn btn-secondary" data-id='shopping_mall'>Shopping</button>
              <button id="resource" class="btn btn-secondary" data-id='clothing_store'>Clothes</button>
              <button id="resource" class="btn btn-secondary" data-id='florist'>Florist</button>
            </div>
          </div>
          <div class="card">
            <div class="card-block">
              <h4 class="card-title">Day Out</h4>
              <button id="resource" class="btn btn-secondary" data-id='zoo'>Zoo</button>
              <button id="resource" class="btn btn-secondary" data-id='park'>Park</button>
              <button id="resource" class="btn btn-secondary" data-id='spa'>Spa</button>
              <button id="resource" class="btn btn-secondary" data-id='gym'>Gym</button>
            </div>
          </div>
        </div>
      </div>`);
  }

  function clearLandingPage(){
    resource = $(this).data('id');
    $landing.remove();
    showResourceForm();
    mapInit();
    showUserForm();
  }

  function showRegisterForm() {
    if(event) event.preventDefault();
    $friendCarouselDiv.css("visibility", "hidden");
    $("#travelModeDiv").css("visibility", "hidden");
    $sidePanel.html(`
      <h2>Register</h2>
      <form method="post" action="/api/register" data-target="showUserForm">
        <div class="form-group">
          <input class="form-control" name="user[username]" placeholder="Username">
        </div>
        <div class="form-group">
          <input class="form-control" name="user[email]" placeholder="Email">
        </div>
        <div class="form-group">
          <input class="form-control" type="password" name="user[password]" placeholder="Password">
        </div>
        <div class="form-group">
          <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password Confirmation">
        </div>
        <button class="btn btn-primary">Register</button>
      </form>
    `);
  }

  function showLoginForm() {
    if(event) event.preventDefault();
    $friendCarouselDiv.css("visibility", "hidden");
    $("#travelModeDiv").css("visibility", "hidden");
    $sidePanel.html(`
      <h2>Login</h2>
      <form method="post" action="/api/login" data-target="showUserForm">
        <div class="form-group">
          <input class="form-control" name="email" placeholder="Email">
        </div>
        <div class="form-group">
          <input class="form-control" type="password" name="password" placeholder="Password">
        </div>
        <button class="btn btn-primary">Login</button>
      </form>
    `);
  }

  function showFriendEditForm(friend) {
    if(event) event.preventDefault();
    let userId = localStorage.getItem('id');

    $sidePanel.html(`
      <h2>Edit Friend</h2>
      <form id="friendUpdate" method="put" action="/api/users/${userId}/friends/${friend._id}"  data-target="viewProfile">
        <div class="form-group">
          <label for="name">
          <input class="form-control" name="name" value="${friend.name}">
          <input type="hidden" id="input-lat" name="lat" value="${friend.lat}">
          <input type="hidden" id="input-lng" name="lng" value="${friend.lng}">
          <label for="address">
          <input id="friendAddr" class="controls" type="text" placeholder='Address' value="${friend.address}">
          <input type="hidden" id="newFriendAdd" name='address' type="text" value='${friend.address}'>
          <button id="friendUpdateBtn" class="btn btn-primary" type='submit'>Update</button>
          <button id="backToProfile" class="btn btn-secondary">Back</button>
        </div>
      </form>`);

    var input = document.getElementById('friendAddr');
    var searchBox = new google.maps.places.SearchBox(input);

    searchBox.addListener('places_changed', function() {
      let newAddress = searchBox.getPlaces()[0];
      let lat = newAddress.geometry.location.lat();
      let lng = newAddress.geometry.location.lng();
      let address = newAddress.formatted_address;
      // console.log(address);
      document.getElementById("newFriendAdd").value = address;
      document.getElementById("input-lat").value = lat;
      document.getElementById("input-lng").value = lng;
    });

  }

  function handleForm() {
    if(event) event.preventDefault();
    let $form = $(this);
    let data = $form.serialize();

    if ($form[0].id === 'filterResults') {
      return;
    } else {
      let token = localStorage.getItem('token');
      let nextView = $form.data('target');

      let url = $form.attr('action');
      let method = $form.attr('method');
      let data = $form.serialize();

      $.ajax({
        url,
        method,
        data,
        beforeSend: function(jqXHR) {
          if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      })
      .done((data) => {
        if (!!data.user) {
          let userId = data.user._id;
          if(userId) localStorage.setItem('id', userId);
          if(data.user.username) localStorage.setItem('username', data.user.username);
          if(data.token) localStorage.setItem('token', data.token);
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
    }
  }

  function getFriends() {
    $friendCarouselDiv.css("visibility", "hidden");
    $("#travelModeDiv").css("visibility", "hidden");

    let nextView = "";

    if (!$(this).data('target')) {
      if ($(event.srcElement).data('target') === 'friendLocation') {
        nextView = 'friendLocation';
      } else {
        nextView = 'viewProfile';
      }
    } else {
      nextView = $(this).data('target');
    }

    if(event) event.preventDefault();
    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('id');


    $.ajax({
      url: `/api/users/${userId}/friends`,
      method: "GET",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done((friends) => {
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

    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('id');

    $.ajax({
      url: `/api/users/${userId}`,
      method: "GET",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done((user) => {
      if (src === 'viewProfile') {
        showFriendsInProfile(user, friends);
      } else if (src === 'useSavedAddress'){
        updateMap(user);
      } else {
        console.log("Get user src of request unknown");
      }
    });
  }

  function showFriendsInProfile(user, friends){
    let $row = $(`<div class="row"><h2>${user.username}</h2><p>${user.address}</div>`);
    friends.forEach((friend) => {
      $row.append(`
        <div class="col-md-12">
          <div class="card">
            <div class="card-block">
              <h4 class="card-title">${friend.name}</h4>
              <h4 class="card-title">${friend.address}</h4>
            </div>
          </div>
          <button class="btn btn-danger delete" data-id="${friend._id}">Delete</button>
          <button class="btn btn-primary edit" data-target='updateFriend' data-id="${friend._id}">Edit</button>
        </div>
      `);
    });

    $sidePanel.html($row);
  }

  function showFriendsToAdd(friends) {
    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('id');

    $.ajax({
      url: `/api/users/${userId}`,
      method: "GET",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done((user) => {
      let $row = $(`<div class="row"><h4>Saved Friends</h4></div>`);
      friends.forEach((friend) => {
        $row.append(`
          <div class="col-md-12">
            <div class="card">
              <div class="card-block">
                <h4 class="card-title">${friend.name}</h4>
                <p class="card-title">${friend.address}</p>
              </div>
            <button class="btn btn-primary addFriend" data-target="addToMap" data-id="${friend._id}">Add</button>
            </div>
          </div>
        `);
      });
      $sidePanel.html($row);
      showFriendForm();
    });
  }

  function deleteFriend() {
    let userId = localStorage.getItem('id');
    let friendId = $(this).data('id');
    let token = localStorage.getItem('token');

    $.ajax({
      url: `/api/users/${userId}/friends/${friendId}`,
      method: "DELETE",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done(getFriends);
    // .fail(showLoginForm);
  }

  function getFriend() {
    let userId = localStorage.getItem('id');
    let friendId = $(this).data('id');
    let token = localStorage.getItem('token');

    $.ajax({
      url: `/api/users/${userId}/friends/${friendId}`,
      method: "GET",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done((person) => {
      let next = $(this).data('target');
      if (next === 'addToMap') {
        updateMap(person);
      } else if (next === 'updateFriend'){
        showFriendEditForm(person);
      }
    });
    // .fail(showLoginForm);
  }

  function updateMap(person){
    let pos = { lat: person.lat, lng: person.lng };
    people.push(pos);
    addMarker(pos);
    setMapBounds(people);
  }

  function logout() {
    if(event) event.preventDefault();
    $friendCarouselDiv.css("visibility", "hidden");
    $("#travelModeDiv").css("visibility", "hidden");
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    $main.empty();
    landingPage();
  }

let mapStyle = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#00a6fb"
            },
            {
                "visibility": "on"
            }
        ]
    }
];

// -------------------------------

  function mapInit(){
    map = new google.maps.Map($mapDiv[0], {
    center: { lat: 51.5074, lng: -0.1278 },
      zoom: 9,
      styles: mapStyle,
      scrollwheel: false

    });
  }

  function showResourceForm(){
    $main.prepend(`

      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='restaurant'>Restaurant</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='bar'>Bar</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='cafe'>Cafe</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='casino'>Casino</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='night_club'>Night Club</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='movie_theater'>Theater</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='shopping_mall'>Shopping</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='clothing_store'>Clothes</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='florist'>Florist</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='casino'>Zoo</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='park'>Park</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='spa'>Spa</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="resource" data-id='gym'>Gym</a>
        </li>
      </ul>


      <div class="dropdown open nav-tabs-mobile">
        <a class="btn btn-secondary dropdown-toggle" href="#" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Select category
        </a>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
          <a class="dropdown-item" id="resource" data-id='restaurant'>Restaurant</a>
          <a class="dropdown-item" id="resource" data-id='bar'>Bar</a>
          <a class="dropdown-item" id="resource" data-id='cafe'>Cafe</a>
          <a class="dropdown-item" id="resource" data-id='casino'>Casino</a>
          <a class="dropdown-item" id="resource" data-id='night_club'>Night Club</a>
          <a class="dropdown-item" id="resource" data-id='movie_theater'>Theater</a>
          <a class="dropdown-item" id="resource" data-id='shopping_mall'>Shopping</a>
          <a class="dropdown-item" id="resource" data-id='clothing_store'>Clothes</a>
          <a class="dropdown-item" id="resource" data-id='florist'>Florist</a>
          <a class="dropdown-item" id="resource" data-id='casino'>Zoo</a>
          <a class="dropdown-item" id="resource" data-id='park'>Park</a>
          <a class="dropdown-item" id="resource" data-id='spa'>Spa</a>
          <a class="dropdown-item" id="resource" data-id='gym'>Gym</a>
        </div>
      </div>




      `);
  }

  function updateResourceChoice(){
    resource = $(this).data('id');
    mapInit();
    showUserForm();
  }

  function showUserForm() {
    if(event) event.preventDefault();
    let userId = localStorage.getItem('id');
    $sidePanel.html(
      `<h2>Where Are You?</h2>
      <button class="btn btn-secondary" id="useSavedAdd">Use saved address</button>
      <h4>or</h4>
      <input id="pac-input" class="controls" type="text" placeholder="Enter location">
      <form id="userLocation" data-target="current" method="put" action="/api/users/${userId}">
        <input type='hidden' id="input-location" name="user[address]">
        <input type='hidden' id="input-lat" name="user[lat]">
        <input type='hidden' id="input-lng" name="user[lng]">
        <button class="btn btn-secondary" id="userSaveLocation">Save</button>
      </form>

      <h4>or</h4>
      <button id="locationButton" data-target="friendLocation" class="btn btn-secondary">Use current location</button>
      <br>
      <button id="addAFriend" data-target="friendLocation" class="btn btn-primary">Add friend</button>
    `);
    createSearchBar();
  }

  function useHome(){
    let friends = [];
    let src = "useSavedAddress";
    getUser(friends, src);
  }

  function createSearchBar() {
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    searchBox.addListener('places_changed', function() {
      var addresses = searchBox.getPlaces();
      let personsPosition = {
        lat: addresses[0].geometry.location.lat(),
        lng: addresses[0].geometry.location.lng()
      };

      document.getElementById("input-location").value = addresses[0].formatted_address;
      document.getElementById("input-lat").value = `${personsPosition.lat}`;
      document.getElementById("input-lng").value = `${personsPosition.lng}`;
      people.push(personsPosition);
      addMarker(personsPosition);
      setMapBounds(people);
      }
    );
  }

  function showFriendForm() {
    let userId = localStorage.getItem('id');
    if(event) event.preventDefault();
    $sidePanel.prepend(
      `<h4>Add New Friend</h4>
      <input id="pac-input" class="controls" type="text" placeholder="Address">
      <form id="friendLocation" data-target="current" method="post" action="/api/users/${userId}/friends">
        <input id="input-name" name="name" placeholder="Name">
        <input type='hidden' id="input-location" name="address">
        <input type='hidden' id="input-lat" name="lat">
        <input type='hidden' id="input-lng" name="lng">
        <button class="btn btn-secondary" id="friendSaveLocation">Save</button>
      </form>
      <button id="go" class="btn btn-primary">Go!</button>
      <button id="addAFriend" data-target='friendLocation' class="btn btn-primary">Add another friend</button>
    `);
    createSearchBar();
  }

  function addMarker(location){
    let position = {
      lat: location.lat,
      lng: location.lng
    };

    let marker = new google.maps.Marker({
      position,
      map
    });
  }

  function calculateMidPoint(){

    let midLatSum = 0;
    let midLngSum = 0;

    people.forEach((person) => {
      midLatSum += person.lat;
      midLngSum += person.lng;
    });

    let midLat = midLatSum/people.length;
    let midLng = midLngSum/people.length;

    midPoint = {
      lat: midLat,
      lng: midLng
    };

    map.panTo(midPoint);
    nearbySearch();
  }

  function nearbySearch(maxPrice){
    let request = {
      location: midPoint,
      types: [resource],
      rankBy: google.maps.places.RankBy.DISTANCE,
      maxPriceLevel: maxPrice
    };

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  }

  function callback(results, status) {
    allResults = results;
    if (status === 'ZERO_RESULTS'){
      alert("No results found");
    } else if (status == google.maps.places.PlacesServiceStatus.OK) {
      populateMap(allResults);
    }
  }

  function populateMap(results) {
    let maxResults = 100;
    let LatLngList = [];
    let resultsToShow = [];
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

  function filterResults(e){
    e.preventDefault();
    let maxPrice = parseInt($(this).find('[name=price]').val());
    let minRating = parseInt($(this).find('[name=rating]').val());

    if (maxPrice === '--' && minRating==='--'){
      return;
    }

    let venuesToKeep = [];

    allResults.forEach((venue) => {
      let hasPrice = !!venue.price_level;
      let hasRating = !!venue.rating;
      if (hasPrice && hasRating) {
        if (!!minRating && !!maxPrice){
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
          if (venue.rating >= minRating || venue.price_level <= maxPrice){
            venuesToKeep.push(venue);
          }
        } else if (!minRating) {
          if (venue.price_level <= maxPrice){
            venuesToKeep.push(venue);
          }
        } else if (!maxPrice) {
          if (venue.rating >= minRating){
            venuesToKeep.push(venue);
          }
        }
      }
    });

    if (venuesToKeep.length === 0){
      mapInit();
      populateCarousel(venuesToKeep);
    } else {
      populateMap(venuesToKeep);
      populateCarousel(venuesToKeep);
    }
  }

  function populateCarousel(resultsToShow){
    $sidePanel.empty();

    let $carousel = $(
      `<div id='carousel-custom' class='carousel slide' data-ride='carousel'>
        <div id='filter'>
          <h4>Filter Results</h4>
          <form id="filterResults">
            <label for='price'>Max price</label>
            <select name="price">
              <option value='null'>--</option>
              <option value='1'>£</option>
              <option value='2'>££</option>
              <option value='3'>£££</option>
              <option value='4'>££££</option>
            </select>
            <br>
            <label for='rating'>Rating</label>
            <select name="rating">
              <option value='null'>--</option>
              <option value='1'>*</option>
              <option value='2'>**</option>
              <option value='3'>***</option>
              <option value='4'>****</option>
              <option value='5'>*****</option>
            </select>
            <br>
            <button id="filterResultsBtn" class="btn btn-danger" type="submit">Update</button>
            <button id="clearFilterResults" class="btn btn-secondary" type="submit">Clear filter</button>
          <form>
          <hr>
        </div>
      </div>`);

    resultsToShow.forEach((venue) => {
      let imgSrc = '';
      let imgHtml = '';
      let ratingHtml = '';
      let priceHtml = '';
      let lat = venue.geometry.location.lat();
      let lng = venue.geometry.location.lng();

      if (!!venue.rating) {
        ratingHtml = `<p>${venue.rating} stars</p>`;
      }

      if (!!venue.photos) {
        imgSrc = venue.photos[0].getUrl({ maxWidth:300, maxHeight: 500});
        imgHtml = `<br><img src="${imgSrc}">`;
      }

      if (!!venue.price_level) {
        let priceImg =  `<img class="priceLevel" src="../images/pound.png">`;
        switch (venue.price_level) {
          case 1:
            priceHtml = priceImg;
            break;
          case 2:
            priceHtml = `${priceImg}${priceImg}`;
            break;
          case 3:
            priceHtml = `${priceImg}${priceImg}${priceImg}`;
            break;
          case 4:
            priceHtml = `${priceImg}${priceImg}${priceImg}${priceImg}`;
            break;
        }
      }

      $carousel.append(`
        <div class="item" id="carouselItem">
          <a id="carouselChoice" data-id="${uniqueId}"><h4>${venue.name}</h4>
          <p>${venue.vicinity}</p>
          ${ratingHtml}${priceHtml}
          ${imgHtml}</a>
          <button class="directionButton btn btn-primary" data-lat=${lat} data-lng=${lng}>Directions</button>
        </div>
        <hr>`);
        uniqueId ++;
     });
    $sidePanel.html($carousel);
  }

  function setMapBounds(latLngList){
    let bounds = new google.maps.LatLngBounds ();
    for (var j = 0, LatLngLen = latLngList.length; j < LatLngLen; j++) {
      bounds.extend (latLngList[j]);
    }
    map.fitBounds (bounds);
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

    google.maps.event.addListener(marker, 'click', function() {
      let infowindow = new google.maps.InfoWindow();

      infowindow.setContent(`<h2>${place.name}</h2><br><button class="directionButton btn btn-secondary"  data-lat=  ${place.geometry.location.lat()} data-lng=${place.geometry.location.lng()}>Directions</button>`);
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
    }, function(response, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(response);
        showFriendCarousel();
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  function getUserCurrentPos(){
    navigator.geolocation.getCurrentPosition((position) => {
      let personsPosition = {
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
    $friendCarouselDiv.html(
    `<div id="friendCarousel">
      <div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
        <div id="friendCarouselInner" class="carousel-inner" role="listbox">
          <div class="carousel-item active">
            <h4 class="chooseStart" data-lat="${people[0].lat}" data-lng="${people[0].lng}">Your directions</h4>
          </div>
        </div>
        <a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
          <span class="icon-prev" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
          <span class="icon-next" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
        </div>
     </div>`);

    people.forEach((person) => {
      if (people.indexOf(person) !== 0) {

        $("#friendCarouselInner").append(
          `<div class="carousel-item">
          <h4 class="chooseStart" data-lat="${person.lat}" data-lng="${person.lng}">Directions for friend ${people.indexOf(person)}</h4>
          </div>`
        );
        $main.on('click', '.chooseStart', chooseStart);
      }
    });
  }

  function chooseStart() {
    let startingLat = $(this).data("lat");
    let startingLng =  $(this).data("lng");
    startingPos = { lat: startingLat, lng: startingLng};
    showDirections();
  }

  function setIcon() {
    for (var i=0; i< venueMarkers.length; i++) {
      if (venueMarkers[i].id == $(this).data("id")) {
        venueMarkers[i].setIcon(pinImage);
      } else {
        venueMarkers[i].setIcon(pinDefault);
      }
    }
  }
});
