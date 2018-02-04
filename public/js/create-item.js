function registerEvent() {
  console.log("registerEvent ran");
  $("#create-form").submit(event => {
    event.preventDefault();
    console.log("event listener worked!");
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

    $("#item-name").val("");
    $("#item-carbs").val("");
    $("#item-serving").val("");
    $("#item-calories").val("");
    $("#item-fiber").val("");

    fetch('/create-carb-item', { 
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)      
    }).then(res => {
      return res.json()
    }).then(response => {
      console.log(response);
    })
  })
}

$(registerEvent());