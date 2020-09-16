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

    // Create and attach a shadow root to the HTMLElement
    const shadow = this.attachShadow({mode: 'open'});

    // Create a template element and populate its html with our template string
    const templateElement = document.createElement('template');
    templateElement.innerHTML = this.templateString;

    // "Stamp" the template into the shadow root
    shadow.appendChild(templateElement.content.cloneNode(true));
  }

  get templateString() {
    return `
      <style>
        #square {
          width: 100px;
          height: 100px;
          background-color: #0000ff;
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
    this.render();
  }

  render() {
    const customSquare = this.shadowRoot.getElementById('square');

    customSquare.style.width = `${this.getAttribute('square-size')}px`;
    customSquare.style.height = `${this.getAttribute('square-size')}px`;
    customSquare.style.backgroundColor = `${this.getAttribute('square-color')}`;
  }
}

customElements.define('custom-square', Square);