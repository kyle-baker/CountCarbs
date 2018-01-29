//Functions
function retrieveSearchData() {
  let retrievedStringResults = localStorage.getItem('results');
  let data = JSON.parse(retrievedStringResults);
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
    <p class="result-serving">Serving: ${result.serving}</p>
    </div>
  `;
}


//Call Functions
$(function () {
  retrieveSearchData();
});