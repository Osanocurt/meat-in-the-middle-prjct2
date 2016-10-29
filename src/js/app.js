$(() =>{

  let $main = $('main');
  let $mapDiv = $('#map');

  $('.register').on('click', showRegisterForm);
  $('.login').on('click', showLoginForm);
  $('.friends').on('click', getFriends);
  $('.logout').on('click', logout);
  $main.on('submit', 'form', handleForm);
  $main.on('click', 'button.delete', deleteFriend);
  $main.on('click', 'button.edit', getFriend);

  let map;
  let center = { lat: 51.5074, lng: -0.1278 };
  let user = { lat: 51.5074, lng: -0.1278 };
  let friend1 = { lat: 52.1074, lng: -1.8278 };

  function mapInit(){
    map = new google.maps.Map($mapDiv[0], {
      center,
      zoom: 13
    });

    addMarker(user);
    addMarker(friend1);
    calculateMidPoint();
  }
  mapInit();

  function addMarker(location){

    let position = {
      lat: location.lat,
      lng : location.lng
    };

    let marker = new google.maps.Marker({
      position,
      map
    });
  }

  function calculateMidPoint(){

      let midLat = (user.lat + friend1.lat)/2;
      let midLng = (user.lng + friend1.lng)/2;

      let midPoint = {
        lat: midLat,
        lng: midLng
      };
      addMarker(midPoint);

      map.panTo(midPoint);
      map.zoom=8;
  }

  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  // if(isLoggedIn()) {
  //   getFriends();
  // } else {
  //   showLoginForm();
  // }

  function showRegisterForm() {
    if(event) event.preventDefault();
    $main.html(`
      <h2>Register</h2>
      <form method="post" action="/api/register">
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
    $main.html(`
      <h2>Login</h2>
      <form method="post" action="/api/login">
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

  function showEditForm(friend) {
    if(event) event.preventDefault();
    $main.html(`
      <h2>Edit Friend</h2>
      <form method="put" action="/api/friends/${friend._id}">
        <div class="form-group">
          <label for="name">
          <input class="form-control" name="name" value="${friend.name}">
          <label for="location">
          <input class="form-control" name="name" value="${friend.location}">
          <label for="rating">
          <input class="form-control" name="name" value="${friend.rating}">
        </div>
        <button class="btn btn-primary">Update</button>
      </form>
    `);
  }

  function handleForm() {
    if(event) event.preventDefault();
    let token = localStorage.getItem('token');
    let $form = $(this);

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
    }).done((data) => {
      if(data.token) localStorage.setItem('token', data.token);
      getFriends();
    }).fail(showLoginForm);
  }

  function getFriends() {
    if(event) event.preventDefault();

    let token = localStorage.getItem('token');
    $.ajax({
      url: '/api/friends',
      method: "GET",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done(showFriends)
    .fail(showLoginForm);
  }

  function showFriends(friends) {
    let $row = $('<div class="row"></div>');
    friends.forEach((friend) => {
      $row.append(`
        <div class="col-md-4">
          <div class="card">
            <img class="card-img-top" src="http://fillmurray.com/300/300" alt="Card image cap">
            <div class="card-block">
              <h4 class="card-title">${friend.name}</h4>
            </div>
          </div>
          <button class="btn btn-danger delete" data-id="${friend._id}">Delete</button>
          <button class="btn btn-primary edit" data-id="${friend._id}">Edit</button>
        </div>
      `);
    });

    $main.html($row);
  }

  function deleteFriend() {
    let id = $(this).data('id');
    let token = localStorage.getItem('token');

    $.ajax({
      url: `/api/friends/${id}`,
      method: "DELETE",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done(getFriends)
    .fail(showLoginForm);
  }

  function getFriend() {
    let id = $(this).data('id');
    let token = localStorage.getItem('token');

    $.ajax({
      url: `/api/friends/${id}`,
      method: "GET",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done(showEditForm)
    .fail(showLoginForm);
  }

  function logout() {
    if(event) event.preventDefault();
    localStorage.removeItem('token');
    showLoginForm();
  }
});
