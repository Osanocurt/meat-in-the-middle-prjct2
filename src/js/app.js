$(() =>{

  let $main = $('main');
  let $mapDiv = $('#map');
  let midPoint = { lat: 0, lng: 0};

  $('.register').on('click', showRegisterForm);
  $('.login').on('click', showLoginForm);
  $('.profile').on('click', getFriends);
  $('.logout').on('click', logout);
  $main.on('click', "#go", calculateMidPoint);
  $main.on('submit', 'form', handleForm);
  $main.on('click', '#friendSaveLocation', saved);
  $main.on('click', '#userSaveLocation', saved);
  $main.on('click', 'button#addAFriend', getFriends);
  $main.on('click', 'button#addAnotherFriend', showFriendsToAdd);
  $main.on('click', 'button.delete', deleteFriend);
  $main.on('click', 'button.edit', getFriend);
  const $sidePanel = $("#sidePanel") ;

  function saved() {
    $(this).html("Saved");
  }

  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  if(isLoggedIn()) {
    // getFriends();
    console.log("logged in");
  } else {
    // showLoginForm();
    console.log("logged out");
  }

  function showRegisterForm() {
    if(event) event.preventDefault();
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
      console.log(address);
      document.getElementById("newFriendAdd").value = address;
      document.getElementById("input-lat").value = lat;
      document.getElementById("input-lng").value = lng;
    });

  }

  function handleForm() {
    if(event) event.preventDefault();
    let token = localStorage.getItem('token');
    let $form = $(this);
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
        if(data.token) localStorage.setItem('token', data.token);
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
    let nextView = "";

    if (!$(this).data('target')) {
      nextView = 'viewProfile';
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

  $sidePanel.on('click', 'button.addFriend', getFriend);

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
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    showLoginForm();
  }

//------------------------------------------------------------------------------------------------------------------------------------



  let map;
  let people = [];



  function mapInit(){
    map = new google.maps.Map($mapDiv[0], {
    center: { lat: 51.5074, lng: -0.1278 },
      zoom: 7
    });
  }
  mapInit();



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
      <button id="locationButton" class="btn btn-secondary">Use current location</button>
      <br>
      <button id="addAFriend" data-target="friendLocation" class="btn btn-primary">Add friend</button>
    `);
    createSearchBar();
  }

  showUserForm();

  let latLngList = [];
  $sidePanel.on('click', 'button#useSavedAdd', useHome);

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
      // console.log(addresses[0].formatted_address);
      document.getElementById("input-lat").value = `${personsPosition.lat}`;
      document.getElementById("input-lng").value = `${personsPosition.lng}`;
      people.push(personsPosition);
      // console.log(people);
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
    addMarker(midPoint);

    map.panTo(midPoint);
    nearbySearch(midPoint);
  }

  function nearbySearch(midPoint){

    let request = {
      location: midPoint,
      types: ['restaurant'],
      openNow: true,
      rankBy: google.maps.places.RankBy.DISTANCE
    };

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  }

  function callback(results, status) {
    let maxResults = 10;
    let resultsToShow = [];

    if (status === 'ZERO_RESULTS'){
      alert("No results found");
    } else if (status == google.maps.places.PlacesServiceStatus.OK) {
      let LatLngList = [];

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
  function populateCarousel(resultsToShow){
    let $carousel = $(
      `<div id='carousel-custom' class='carousel slide' data-ride='carousel'>
        <div class='carousel-outer'>
           <div class='carousel-inner'>

           </div>

           </div>
       </div>`);
    resultsToShow.forEach((result) => {
      $carousel.append(`<div class="item"><h4>${result.name}</h4></div>`);
    });
    $sidePanel.html($carousel);

  }

  function setMapBounds(latLngList){
    //  Create a new viewpoint bound
    let bounds = new google.maps.LatLngBounds ();
    //  Go through each marker...
    for (var j = 0, LatLngLen = latLngList.length; j < LatLngLen; j++) {
      // increase the bounds to take marker
      bounds.extend (latLngList[j]);
    }
    //  Fit  bonds to the map
    map.fitBounds (bounds);
  }

  function createMarker(place) {
     var placeLoc = place.geometry.location;
     var marker = new google.maps.Marker({
       map: map,
       position: place.geometry.location
     });

     google.maps.event.addListener(marker, 'click', function() {
       let infowindow = new google.maps.InfoWindow();

       infowindow.setContent(`<strong>${place.name}</strong><button class="directionButton"  data-lat=  ${place.geometry.location.lat()} data-lng=${place.geometry.location.lng()}>Get Direction</button>`);
       console.log(place.geometry.location.lng());
       infowindow.open(map, this);
     });
   }


//click listener to be assigned to "choose venue" button on pop up wndows.
  $main.on("click", ".directionButton", showDirections);

//user and venue variables for purpose of testing directions function
  let startingPos = { lat: 51.5074, lng: -0.1278 };
  // let venueChosen = { lat: 51.5074, lng: -0.1222};
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var directionsService = new google.maps.DirectionsService();



//function to generate route and directions panel upon choosing venue. other pins still remain on map!
  function showDirections() {
    let $venueChosen = { lat: $(this).data("lat"), lng: $(this).data("lng")};




    $("#travelModeDiv").css("visibility", "visible");
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('sidePanel'));
    var selectedMode = document.getElementById('travelSelect').value;
    directionsService.route({
      origin: startingPos,
      destination: $venueChosen,
      travelMode: google.maps.TravelMode[selectedMode]
    }, function(response, status) {
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


  document.getElementById("locationButton").addEventListener("click", function(){
   navigator.geolocation.getCurrentPosition((position) => {
     let personsPosition = {
       lat: position.coords.latitude,
       lng: position.coords.longitude
     };
     people.push(personsPosition);
     console.log(people);
     addMarker(personsPosition);
     setMapBounds(people);
   });
   showFriendForm();
  });

});
