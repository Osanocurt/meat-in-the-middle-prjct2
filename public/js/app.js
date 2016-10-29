'use strict';

$(function () {

  var $main = $('main');

  $('.register').on('click', showRegisterForm);
  $('.login').on('click', showLoginForm);
  $('.pubs').on('click', getPubs);
  $('.logout').on('click', logout);
  $main.on('submit', 'form', handleForm);
  $main.on('click', 'button.delete', deletePub);
  $main.on('click', 'button.edit', getPub);

  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  if (isLoggedIn()) {
    getPubs();
  } else {
    showLoginForm();
  }

  function showRegisterForm() {
    if (event) event.preventDefault();
    $main.html('\n      <h2>Register</h2>\n      <form method="post" action="/api/register">\n        <div class="form-group">\n          <input class="form-control" name="user[username]" placeholder="Username">\n        </div>\n        <div class="form-group">\n          <input class="form-control" name="user[email]" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[password]" placeholder="Password">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password Confirmation">\n        </div>\n        <button class="btn btn-primary">Register</button>\n      </form>\n    ');
  }

  function showLoginForm() {
    if (event) event.preventDefault();
    $main.html('\n      <h2>Login</h2>\n      <form method="post" action="/api/login">\n        <div class="form-group">\n          <input class="form-control" name="email" placeholder="Email">\n        </div>\n        <div class="form-group">\n          <input class="form-control" type="password" name="password" placeholder="Password">\n        </div>\n        <button class="btn btn-primary">Login</button>\n      </form>\n    ');
  }

  function showEditForm(pub) {
    if (event) event.preventDefault();
    $main.html('\n      <h2>Edit Pub</h2>\n      <form method="put" action="/api/pubs/' + pub._id + '">\n        <div class="form-group">\n          <label for="name">\n          <input class="form-control" name="name" value="' + pub.name + '">\n          <label for="location">\n          <input class="form-control" name="name" value="' + pub.location + '">\n          <label for="rating">\n          <input class="form-control" name="name" value="' + pub.rating + '">\n        </div>\n        <button class="btn btn-primary">Update</button>\n      </form>\n    ');
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
      getPubs();
    }).fail(showLoginForm);
  }

  function getPubs() {
    if (event) event.preventDefault();

    var token = localStorage.getItem('token');
    $.ajax({
      url: '/api/pubs',
      method: "GET",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(showPubs).fail(showLoginForm);
  }

  function showPubs(pubs) {
    var $row = $('<div class="row"></div>');
    pubs.forEach(function (pub) {
      $row.append('\n        <div class="col-md-4">\n          <div class="card">\n            <img class="card-img-top" src="http://fillmurray.com/300/300" alt="Card image cap">\n            <div class="card-block">\n              <h4 class="card-title">' + pub.name + '</h4>\n            </div>\n          </div>\n          <button class="btn btn-danger delete" data-id="' + pub._id + '">Delete</button>\n          <button class="btn btn-primary edit" data-id="' + pub._id + '">Edit</button>\n        </div>\n      ');
    });

    $main.html($row);
  }

  function deletePub() {
    var id = $(this).data('id');
    var token = localStorage.getItem('token');

    $.ajax({
      url: '/api/pubs/' + id,
      method: "DELETE",
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(getPubs).fail(showLoginForm);
  }

  function getPub() {
    var id = $(this).data('id');
    var token = localStorage.getItem('token');

    $.ajax({
      url: '/api/pubs/' + id,
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
});