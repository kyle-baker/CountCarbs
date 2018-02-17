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
      return res.json()
    }).then(response => {
      localStorage.setItem('token', response.authToken)
      window.location.href="auth-home.html";
      clearFields();
    })
  })
}

function clearFields() {
  $('#username').val("");
  $('#user-password').val("");
}

$(registerEvent());