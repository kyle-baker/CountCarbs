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

function deleteMessage() {
  return `
  <div class='result-display'>
    <p> Item deleted. </p>
  </div>
  `
}

function handleDelete() {
$('.delete-link').click(event => {
  event.preventDefault();
  const deleteID = $('#item-id').val();
  console.log('Here is the delete item ID in handleDelete' + deleteID)
  fetch(`/carb-items/${deleteID}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    }).then(res => {
      return res
    }).then(response => {
      let message = deleteMessage();
      console.log(response);
      $('.edit-container').html(message);
    })
  })
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
  checkAuthentication();
  retrieveItem();
  editItem();
  handleDelete();
});