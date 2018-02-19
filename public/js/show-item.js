// Variables
let entries = []

// Functions
function retrieveItem () {
  let retrievedStringResults = localStorage.getItem('item')
  let data = JSON.parse(retrievedStringResults)
  entries = data
  const results = displayItem(data)
  $('.display-results').html(results)
}

function displayItem (result) {
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
    let retrievedStringResults = localStorage.getItem('item')
    localStorage.setItem('editItem', retrievedStringResults)
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
      return res
    }).then(response => {
      let message = deleteMessage()
      $('.display-results').html(message)
    })
  })
}

function deleteMessage () {
  return `
    <p class='deleted-item'> "${entries.name}" has been Deleted. </p>
  `
}

// Call Functions
$(function () {
  retrieveItem()
  handleEdit()
  handleDelete()
})
