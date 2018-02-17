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
  `;
}


//Call Functions
$(function () {
  retrieveSearchData();
});