/**
 * SpinBox custom element
 * 
 * 003: We move away from imperatively creating the custom element
 * shadow DOM and use HTML templates, instead. We declare the
 * template in index.html and clone its content for appending
 * to the custom element's shadow root.
 * 
 */

// Create a class for the element
class SpinBox extends HTMLElement {

  constructor() {
    // Always call super first in constructor
    super();

    console.log('SpinBox constructor called');

    // Initialize the sole state member, _value.
    this._value = 0;
  }

  // Specify observed attributes for invocation of attributeChangedCallback
  static get observedAttributes() {
    return ['value'];
  }

  connectedCallback() {
    console.log('SpinBox added to page: connectedCallback');

    const root = this.attachShadow({ mode: 'open' });

    // Get the SpinBox's template and "stamp" its content to the shadow DOM
    const spinBoxTemplate = document.getElementById('spinBoxTemplate');
    const clone = document.importNode(spinBoxTemplate.content, true);
    root.appendChild(clone);

    // Hook up the 'input' element's event listener(s)
    const inputElement = root.getElementById('input');
    inputElement.addEventListener('input', () => {
      this.value = inputElem.value;
    });

    // Hook up the 'upButton' element's event listener(s)
    const upButton = root.getElementById('upButton');
    upButton.addEventListener('mousedown', () => {
      this.value++;
    });

    // Hook up the 'downButton' element's event listener(s)
    const downButton = root.getElementById('downButton');
    downButton.addEventListener('mousedown', () => {
      this.value--;
    });

    // Finally, render the element to reflect the state of
    // the "value" property
    this.render();
  }

  disconnectedCallback() {
    console.log('SpinBox removed from page: disconnectedCallback');
  }

  adoptedCallback() {
    console.log('SpinBox moved to new page: adoptedCallback');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('SpinBox attributes changed: attributeChangedCallback');

    if (name === 'value') {
      this.value = parseInt(newValue);
    }
  }

  get value() {
    return this._value;
  }
  set value(value) {
    // Look for a change in the "value" state and render if necessary
    if (value !== this._value) {
      this._value = value;
      this.render();
    }
  }

  //
  // We centralize our changes to the DOM here, based on changes to
  // the SpinBox's state, namely its "value" property.
  //
  render() {
    this.shadowRoot.getElementById('input').value = this.value;
  }
}

customElements.define('spin-box', SpinBox);
