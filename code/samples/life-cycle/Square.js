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

    const shadow = this.attachShadow({mode: 'open'});

    const div = document.createElement('div');
    const style = document.createElement('style');
    shadow.appendChild(style);
    shadow.appendChild(div);
  }

  connectedCallback() {
    console.log('Custom square element added to page: connectedCallback');
    this.updateStyle();
  }

  disconnectedCallback() {
    console.log('Custom square element removed from page: disconnectedCallback');
  }

  adoptedCallback() {
    console.log('Custom square element moved to new page: adoptedCallback');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('Custom square element attributes changed: attributeChangedCallback');
    this.updateStyle();
  }

  updateStyle() {
    const shadow = this.shadowRoot;
    shadow.querySelector('style').textContent = `
      div {
        width: ${this.getAttribute('square-size')}px;
        height: ${this.getAttribute('square-size')}px;
        background-color: ${this.getAttribute('square-color')};
      }
    `;
  }
}

customElements.define('custom-square', Square);