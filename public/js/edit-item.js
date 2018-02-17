function retrieveItem() {
  let retrievedItem = localStorage.getItem('editItem');
  let item = JSON.parse(retrievedItem);
  $('#item-name').val(item.name);
  $('#item-carbs').val(item.carbs);
  $('#item-serving').val(item.serving);
  $('#item-calories').val(item.calories);
  $('#item-id').val(item._id);
}

function editItem() {
  $(".form-submit").click(event => {
    event.preventDefault();
    let name = $("#item-name").val();
    let carbs = $("#item-carbs").val();
    let serving = $("#item-serving").val();
    let calories = $("#item-calories").val();
    let id = $("#item-id").val();

    let payload = {
      name: name,
      carbs: carbs,
      serving: serving,
      calories: calories,
      id: id,
    };

    fetch(`/carb-items/${id}`, {
      method: 'PUT',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)

    }).then(res => {
      return res
    })
    clearFields();
    getUpdatedItem(payload.id);
  })

}

function getUpdatedItem(id) {
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
  $('#item-id').val("");
}
//Call Functions
$(function() {
  retrieveItem();
  editItem();
});