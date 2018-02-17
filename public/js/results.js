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
  retrieveQueryValue();
}

//Display query user entered
function retrieveQueryValue() {
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
  console.log("handleEdit ran")
  const editId = $(event.currentTarget).attr("id");
  let entry = entries.find(object => {
    return object._id == editId;
  })
  let entryAsString = JSON.stringify(entry);
  localStorage.setItem('editItem', entryAsString);
  window.location.href="edit-item.html";  

})
}

function handleDelete() {
  $('.deleteLink').click(event => {
    event.preventDefault();
    const deleteID = $(event.currentTarget).attr("id");

    fetch(`/carb-items/${deleteID}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      }).then(res => {
        return res.json;
      }).then(response => {
        let retrievedStringResults = localStorage.getItem('results');
        let data = JSON.parse(retrievedStringResults);
        entries = data;
        let deletedItem = data.find( object => {
          return object._id == deleteID;
        })
        let filtered = data.filter( item => {
          return item._id !== deleteID;
        })
        let deletedItemName = JSON.stringify(deletedItem.name)
        const results = filtered.map(item => {
          return displaySearchResults(item);
        });
        $('.display-results').html(results);      
        let retrievedDeletedItem = localStorage.getItem('deletedItem');
        $('.deleted-item').html(deletedItemName);
        handleEdit();
        handleDelete(); 
      })
  })
}

//Call Functions
$(function () {
  retrieveSearchData();
  handleEdit();
  handleDelete();
});