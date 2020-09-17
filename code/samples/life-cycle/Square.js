//
// Adapted from https://github.com/mdn/web-components-examples/tree/master/life-cycle-callbacks
//
// Vanilla Javascript. Changing web component properties through attributes only.
// Notice how the attributeChangedCallback serves as a sort of state, causing a
// render to be invoked upon change.
//

// Create a class for the element
class Square extends HTMLElement {

  // Specify observed attributes for invocation of attributeChangedCallback
  static get observedAttributes() {
    return ['square-color', 'square-size'];
  }  

  constructor() {
    // Always call super first in constructor
    super();

    console.log('Custom square element constructor called');

    // Initialize properties
    this._squareSize = 100;
    this._squareColor = '#0000ff';

    // Create and attach a shadow root to the HTMLElement
    const shadow = this.attachShadow({mode: 'open'});

    // Create a template element and populate its html with our template string
    const templateElement = document.createElement('template');
    templateElement.innerHTML = this.templateString;

    // "Stamp" the template into the shadow root
    shadow.appendChild(templateElement.content.cloneNode(true));
  }

  get squareSize() {
    return this._squareSize;
  }
  set squareSize(squareSize) {
    console.log('Setting squareSize property and calling render');
    this._squareSize = squareSize;    
    this.render();
  }

  get squareColor() {
    return this._squareColor;
  }
  set squareColor(squareColor) {
    console.log('Setting squareColor property and calling render');
    this._squareColor = squareColor;
    this.render();
  }

  get templateString() {
    return `
      <style>
        #square {
          width: ${this.squareSize}px;
          height: ${this.squareSize}px;
          background-color: ${this.squareColor};
        }              
      </style>
      <div id="square">
      </div>
    `;
  }

  connectedCallback() {
    console.log('Custom square element added to page: connectedCallback');
    this.render();
  }

  disconnectedCallback() {
    console.log('Custom square element removed from page: disconnectedCallback');
  }

  adoptedCallback() {
    console.log('Custom square element moved to new page: adoptedCallback');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('Custom square element attributes changed: attributeChangedCallback');

    const propertyName = attributeToPropertyName(name);

    this[propertyName] = newValue;
  }

  render() {
    const customSquare = this.shadowRoot.getElementById('square');

    customSquare.style.width = `${this.squareSize}px`;
    customSquare.style.height = `${this.squareSize}px`;
    customSquare.style.backgroundColor = `${this.squareColor}`;
  }
}

customElements.define('custom-square', Square);

// Convert "kabob-case" to "camelCase"
function attributeToPropertyName(attributeName) {
  const hypenRegEx = /-([a-z])/g;
  return attributeName.replace(hypenRegEx, (match) => 
    match[1].toUpperCase()
  );
}