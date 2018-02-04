function retrieveItem() {
  let retrievedItem = localStorage.getItem('editItem');
  let item = JSON.parse(retrievedItem);
  console.log(item);
  $('#item-name').val(item.name);
  $('#item-carbs').val(item.carbs);
  $('#item-serving').val(item.serving);
  $('#item-calories').val(item.calories);
  $('#item-id').val(item._id);
}

function editItem() {
  $(".form-submit").click(event => {
    event.preventDefault();
    console.log("editItem ran!")
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
  })
}
//Call Functions
$(function() {
  retrieveItem();
  editItem();
});