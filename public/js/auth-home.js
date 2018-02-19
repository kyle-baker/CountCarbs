function checkAuthentication() {
  const token = localStorage.getItem('token');
  if (token) {
    //Check if the token is valid
    fetch('/user/protected', { 
      method: 'GET',
      headers: {
        'Accept': 'application/json', 
        'Content-Type': 'application/json', 
        'Authorization' : `Bearer ${token}`
       },
      }).then(res => {
        return res.json()
      }).then(response => {
        return response;
      }).catch(err => {
        window.location.href="log-in.html";
      })
    }
  else {
    window.location.href="log-in.html";
  }
}

function getCarbItem(query) {
  const token = localStorage.getItem('token');
    fetch('/carb-items?name=' + query , { 
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json', 
        'Authentication' : `Bearer ${token}`
       },
    }).then(res => {
      return res.json()
    }).then(response => {
      storeSearchData(response);
    })
}


function storeSearchData(data) {
  const resultsAsString = JSON.stringify(data);
  localStorage.setItem('results', resultsAsString);
  window.location.href="auth-results.html";  
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
    getCarbItem(query);
  });
}

$(checkAuthentication);
$(watchSubmit);