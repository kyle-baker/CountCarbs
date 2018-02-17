function registerEvent() {
  $("#sign-up").submit(event => {
    console.log("Register Event ran")
    event.preventDefault();
    let username = $("#username").val();
    let password = $("#user-password").val();
    let confirmation = $("#confirm-password").val();

    let payload = {
      username: username,
      password: password,
      confirmation: confirmation,
    }
    console.log(payload)
    let id;
    fetch('/user/signup', { 
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)      
    }).then(res => {
      return res.json()
    }).then(response => {
      id = response.id;
      clearFields();
    })
  })
}

function clearFields() {
  $('#username').val("");
  $('#user-password').val("");
  $('#confirm-password').val("");
}

$(registerEvent());