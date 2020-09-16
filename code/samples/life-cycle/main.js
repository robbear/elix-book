//
// Adapted from https://github.com/mdn/web-components-examples/tree/master/life-cycle-callbacks
//
// Vanilla Javascript. Changing web component properties through attributes only.
//

const add = document.querySelector('.add');
const update = document.querySelector('.update');
const remove = document.querySelector('.remove');
let square = document.querySelector('custom-square');

add.disabled = true;
update.disabled = false;
remove.disabled = false;

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

add.onclick = function() {
  // Create a custom square element
  square = document.createElement('custom-square');
  square.setAttribute('square-size', '100');
  square.setAttribute('square-color', 'red');
  document.body.appendChild(square);

  update.disabled = false;
  remove.disabled = false;
  add.disabled = true;
};

update.onclick = function() {
  // Randomly update square's attributes
  square.setAttribute('square-size', random(50, 200));
  square.setAttribute('square-color', `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`);
};

remove.onclick = function() {
  // Remove the square
  document.body.removeChild(square);

  update.disabled = true;
  remove.disabled = true;
  add.disabled = false;
};    
