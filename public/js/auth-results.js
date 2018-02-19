// Variables
let entries = []

// Functions

function checkAuthentication () {
  const token = localStorage.getItem('token')
  if (token) {
    // Check if the token is valid
    fetch('/user/protected', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(res => {
      return res.json()
    }).then(response => {
      return response
    }).catch(err => {
      window.location.href = 'log-in.html'
    })
  } else {
    window.location.href = 'log-in.html'
  }
}

function retrieveSearchData () {
  let retrievedStringResults = localStorage.getItem('results')
  let data = JSON.parse(retrievedStringResults)
  entries = data
  const results = data.map(item => {
    return displaySearchResults(item)
  })
  $('.display-results').html(results)
  retrieveQueryValue()
}

// Display query user entered
function retrieveQueryValue () {
  let query = localStorage.getItem('query')
  $('.display-query').html(query)
}

function displaySearchResults (result) {
  return `
    <div class="result-display">
    <h3 class="result-name">${result.name}</h3>
    <p class="result-id hidden">${result._id}</p>
    <p class="result-carbs">Carbohydrates: ${result.carbs}</p>
    <p class="result-calories">Calories: ${result.calories}</p>
    <p class="result-serving">Serving Size: ${result.serving}</p>
    <ul>
      <li><a href="#"" id="${result._id}" class="editLink">Edit</a></li>
      <li></li>
      <li><a href="#" id="${result._id}" class="deleteLink">Delete</a></li>
    </div>
  `
}

// Event Listeners
function handleEdit () {
  $('.editLink').click(event => {
    event.preventDefault()
    console.log('handleEdit ran')
    const editId = $(event.currentTarget).attr('id')
    let entry = entries.find(object => {
      return object._id == editId
    })
    let entryAsString = JSON.stringify(entry)
    localStorage.setItem('editItem', entryAsString)
    window.location.href = 'edit-item.html'
  })
}

function handleDelete () {
  $('.deleteLink').click(event => {
    event.preventDefault()
    const deleteID = $(event.currentTarget).attr('id')

    fetch(`/carb-items/${deleteID}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    }).then(res => {
      return res.json
    }).then(response => {
      let retrievedStringResults = localStorage.getItem('results')
      let data = JSON.parse(retrievedStringResults)
      entries = data
      let filtered = data.filter(item => {
        return item._id !== deleteID
      })
      const results = filtered.map(item => {
        return displaySearchResults(item)
      })
      $('.display-results').html(results)
      handleEdit()
      handleDelete()
    })
  })
}

// Call Functions
$(function () {
  checkAuthentication()
  retrieveSearchData()
  handleEdit()
  handleDelete()
})
