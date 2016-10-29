'use strict';

$(function () {

  var $main = $('main');
  var $mapDiv = $('#map');

  $('.register').on('click', showRegisterForm);
  $('.login').on('click', showLoginForm);
  $('.friends').on('click', getFriends);
  $('.logout').on('click', logout);
  $('.go').on('click', calculateMidPoint);
  $main.on('submit', 'form', handleForm);
  $main.on('click', 'button.delete', deleteFriend);
  $main.on('click', 'button.edit', getFriend);

  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  // if(isLoggedIn()) {
  //   getFriends();
  // } else {
  //   showLoginForm();
  // }

  function showRegisterForm() {
    if (event) event.preventDefault();
    $main.html('\n      <h2>Register</h2>\n      <form method="post" action="/api/register">\n        <div class="form-group">\n          <input class="form-control" name="user[username]" placeholder="Username">\n        </div>\n        <div class="form-group">\n          <input class="form-control" name="user[email]" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[password]" placeholder="Password">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password Confirmation">\n        </div>\n        <button class="btn btn-primary">Register</button>\n      </form>\n    ');
  }

  function showLoginForm() {
    if (event) event.preventDefault();
    $main.html('\n      <h2>Login</h2>\n      <form method="post" action="/api/login">\n        <div class="form-group">\n          <input class="form-control" name="email" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="password" placeholder="Password">\n        </div>\n        <button class="btn btn-primary">Login</button>\n      </form>\n    ');
  }

  function showEditForm(friend) {
    if (event) event.preventDefault();
    $main.html('\n      <h2>Edit Friend</h2>\n      <form method="put" action="/api/friends/' + friend._id + '">\n        <div class="form-group">\n          <label for="name">\n          <input class="form-control" name="name" value="' + friend.name + '">\n          <label for="location">\n          <input class="form-control" name="name" value="' + friend.location + '">\n          <label for="rating">\n          <input class="form-control" name="name" value="' + friend.rating + '">\n        </div>\n        <button class="btn btn-primary">Update</button>\n      </form>\n    ');
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
      if (data.token) localStorage.setItem('token', data.token);
      getFriends();
    }).fail(showLoginForm);
  }

  function getFriends() {
    if (event) event.preventDefault();

    var token = localStorage.getItem('token');
    $.ajax({
      url: '/api/friends',
      method: "GET",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(showFriends).fail(showLoginForm);
  }

  function showFriends(friends) {
    var $row = $('<div class="row"></div>');
    friends.forEach(function (friend) {
      $row.append('\n        <div class="col-md-4">\n          <div class="card">\n            <img class="card-img-top" src="http://fillmurray.com/300/300" alt="Card image cap">\n            <div class="card-block">\n              <h4 class="card-title">' + friend.name + '</h4>\n            </div>\n          </div>\n          <button class="btn btn-danger delete" data-id="' + friend._id + '">Delete</button>\n          <button class="btn btn-primary edit" data-id="' + friend._id + '">Edit</button>\n        </div>\n      ');
    });

    $main.html($row);
  }

  function deleteFriend() {
    var id = $(this).data('id');
    var token = localStorage.getItem('token');

    $.ajax({
      url: '/api/friends/' + id,
      method: "DELETE",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(getFriends).fail(showLoginForm);
  }

  function getFriend() {
    var id = $(this).data('id');
    var token = localStorage.getItem('token');

    $.ajax({
      url: '/api/friends/' + id,
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

  var map = void 0;
  var center = { lat: 51.5074, lng: -0.1278 };
  var people = [];

  function mapInit() {
    map = new google.maps.Map($mapDiv[0], {
      center: center,
      zoom: 7
    });
    markerInit();
  }
  mapInit();

  function markerInit() {

    var user = { lat: 51.5074, lng: -0.1278 };
    addMarker(user);
    people = [user];

    var friends = [{ lat: 53.1074, lng: -1.8278 }, { lat: 52.9074, lng: -3.3278 }, { lat: 52.6074, lng: 1.2278 }, { lat: 52.8074, lng: -1.2278 }];

    friends.forEach(function (friend) {
      people.push(friend);
      addMarker(friend);
    });
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
    });

    people.forEach(function (person) {
      midLngSum += person.lng;
    });

    var midLat = midLatSum / people.length;
    var midLng = midLngSum / people.length;

    var midPoint = {
      lat: midLat,
      lng: midLng
    };
    addMarker(midPoint);

    map.panTo(midPoint);
    map.zoom = 8;
  }
});