
function registerEvent () {
  $('#sign-up').submit(event => {
    event.preventDefault()
    let username = $('#username').val()
    let password = $('#user-password').val()
    let confirmation = $('#confirm-password').val()

    if (password !== confirmation) {
      $('#user-password').val('')
      $('#confirm-password').val('')
      $('.display-error').html(`<p class="error-message">The password and confirmation fields must match!</p>`)
    } else {
      let payload = {
        username: username,
        password: password,
        confirmation: confirmation
      }

      fetch('/user/signup', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => {
        return res.json()
      }).then(response => {
        if (response.code === 422) {
          $('.display-error').html(errorMessage(response.location, response.message))
        } else {
          $('.signup-page').html(`
            <div class="success-message ">
              <p>Your account has been created. Click <a href="log-in.html">here</a> to log in.</p>
            </div> 
            `)
        }
        clearFields()
      })
    }
  })
}

function errorMessage (location, message) {
  return `
  <p class="error-message">${location} ${message}</p>
  `
}

function clearFields () {
  $('#username').val('')
  $('#user-password').val('')
  $('#confirm-password').val('')
}

$(registerEvent())
