function getCarbItem(query) {
    fetch('/carb-items?name=' + query , { 
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    }).then(res => {
      return res.json()

    }).then(response => {
      console.log(response);
      storeSearchData(response);
    })
}

function storeSearchData(data) {
  const resultsAsString = JSON.stringify(data);
  localStorage.setItem('results', resultsAsString);
  debugger
  window.location.href="results.html";  
}


// Event Listeners 
function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    const query = queryTarget.val();
    //Store query to display on results page
    const queryAsString = JSON.stringify(query);
    localStorage.setItem('query', queryAsString);
    //Clear out the input
    queryTarget.val("");
    console.log(query);
    getCarbItem(query);
  });
}

// Call Functions
$(watchSubmit);