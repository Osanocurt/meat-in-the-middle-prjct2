$(() =>{

  let $main = $('main');

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

  if(isLoggedIn()) {
    getPubs();
  } else {
    showLoginForm();
  }

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

  function showEditForm(pub) {
    if(event) event.preventDefault();
    $main.html(`
      <h2>Edit Pub</h2>
      <form method="put" action="/api/pubs/${pub._id}">
        <div class="form-group">
          <label for="name">
          <input class="form-control" name="name" value="${pub.name}">
          <label for="location">
          <input class="form-control" name="name" value="${pub.location}">
          <label for="rating">
          <input class="form-control" name="name" value="${pub.rating}">
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
      getPubs();
    }).fail(showLoginForm);
  }

  function getPubs() {
    if(event) event.preventDefault();

    let token = localStorage.getItem('token');
    $.ajax({
      url: '/api/pubs',
      method: "GET",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done(showPubs)
    .fail(showLoginForm);
  }

  function showPubs(pubs) {
    let $row = $('<div class="row"></div>');
    pubs.forEach((pub) => {
      $row.append(`
        <div class="col-md-4">
          <div class="card">
            <img class="card-img-top" src="http://fillmurray.com/300/300" alt="Card image cap">
            <div class="card-block">
              <h4 class="card-title">${pub.name}</h4>
            </div>
          </div>
          <button class="btn btn-danger delete" data-id="${pub._id}">Delete</button>
          <button class="btn btn-primary edit" data-id="${pub._id}">Edit</button>
        </div>
      `);
    });

    $main.html($row);
  }

  function deletePub() {
    let id = $(this).data('id');
    let token = localStorage.getItem('token');

    $.ajax({
      url: `/api/pubs/${id}`,
      method: "DELETE",
      beforeSend: function(jqXHR) {
        if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    })
    .done(getPubs)
    .fail(showLoginForm);
  }

  function getPub() {
    let id = $(this).data('id');
    let token = localStorage.getItem('token');

    $.ajax({
      url: `/api/pubs/${id}`,
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
