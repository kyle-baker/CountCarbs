//Variables
let entries = [];

//Functions
function retrieveSearchData() {
  let retrievedStringResults = localStorage.getItem('results');
  let data = JSON.parse(retrievedStringResults);
  entries = data;
  const results = data.map(item => {
    return displaySearchResults(item);
  });
  $('.display-results').html(results);
  retreiveQueryValue();
}

//Display query user entered
function retreiveQueryValue() {
  let query = localStorage.getItem('query');
  $('.display-query').html(query);
}

function displaySearchResults(result) {
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
  `;
}

//Event Listeners
function handleEdit() {
$('.editLink').click(event => {
  event.preventDefault();
  const editId = $(event.currentTarget).attr("id");
  console.log(editId);
  let entry = entries.find(object => {
    return object._id = editId;
  })
  console.log(entry);
  let entryAsString = JSON.stringify(entry);
  localStorage.setItem('editItem', entryAsString);
  window.location.href="edit-item.html";  

})
}

function handleDelete() {
$('.deleteLink').click(event => {
  event.preventDefault();
  const deleteID = $(event.currentTarget).attr("id");
  console.log(deleteID);
  let entry = entries.find(object => {
    return object._id = deleteID;
  })
  console.log(entry);
  fetch(`/carb-items/${deleteID}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    }).then(res => {
      return res
    })

})
}

//Call Functions
$(function () {
  retrieveSearchData();
  handleEdit();
  handleDelete();
});