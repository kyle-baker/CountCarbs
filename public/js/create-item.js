function registerEvent() {
  $("#create-form").submit(event => {
    event.preventDefault();
    let name = $("#item-name").val();
    let carbs = $("#item-carbs").val();
    let serving = $("#item-serving").val();
    let calories = $("#item-calories").val();
    let fiber = $("#item-fiber").val();

    let payload = {
      name: name,
      carbs: carbs,
      serving: serving,
      calories: calories,
      fiber: fiber,
      publicAccess: true
    }
    let id;
    fetch('/create-carb-item', { 
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)      
    }).then(res => {
      return res.json()
    }).then(response => {
      id = response.id;
      getNewItem(id);
    })
    clearFields();
  })
}

function getNewItem(id) {
    fetch('/carb-items/' + id , { 
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    }).then(res => {
      return res.json()
    }).then(response => {
      storeUpdatedItem(response);
    })  
}

function storeUpdatedItem(data) {
  const resultsAsString = JSON.stringify(data);
  localStorage.setItem('item', resultsAsString);
  window.location.href="show-item.html";  
}

function clearFields() {
  $('#item-name').val("");
  $('#item-carbs').val("");
  $('#item-serving').val("");
  $('#item-calories').val("");
  $("#item-fiber").val("");
}

$(registerEvent());