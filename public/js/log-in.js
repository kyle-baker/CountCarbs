function registerEvent() {
  $("#log-in").submit(event => {
    event.preventDefault();
    let username = $("#username").val();
    let password = $("#user-password").val();

    let payload = {
      username: username,
      password: password
    }
    let id;
    fetch('/user/login', { 
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)      
    }).then(res => {
      if (res.status === 401)
        return res
      else {
        return res.json()
      }
    }).then(response => {
      if (response.status === 401) {
        $('.display-error').html(errorMessage())
      }
      else {
        $('.display-error').html("")
        localStorage.setItem('token', response.authToken)
        window.location.href="auth-home.html";
      }
      clearFields();
    })
  })
}

function errorMessage() {
  return `
  <p class="error-message">Incorrect username or password</p>
  `;
}

function clearFields() {
  $('#username').val("");
  $('#user-password').val("");
}

$(registerEvent());