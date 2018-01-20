let MOCK_ITEMS = {
  "items": [
    {
      "name": 'Apple',
      "carbs": 30,
      "calories": 100,
      "serving": 'One Apple' 
    },
    {
      "name": 'White Rice',
      "carbs": 45,
      "calories": 250,
      "serving": 'One Cup'
    }
  ]
};

function getItems(callbackFn) {
    setTimeout(function(){ callbackFn(MOCK_ITEMS)}, 100);
}

function displayItems(data) {
    for (index in data.items) {
       $('.display-results').append('<p>' + data.items[index].name + '</p>');
    }
}

function getAndDisplayItems() {
    getItems(displayItems);
}

$(function() {
    getAndDisplayItems();
})