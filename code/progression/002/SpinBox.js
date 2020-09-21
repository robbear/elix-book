/**
 * SpinBox custom element
 * 
 * 002: We revisit how we manage state and attributes. State
 * is represented by the _value member variable, but it should be
 * internal and private. We add a public property getter/setter for
 * the "value" property, and call render in the setter. Now the only
 * places where we call render is in the connectedCallback method and
 * the value property setter.
 * 
 * Using public properties as a custom element API will be helpful 
 * down the road. We get started here by refining the reactive flow,
 * minimizing the number of places where we call render.
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
    
    // Set the custom element host style
    this.style.display = 'inline-grid';

    // Create an <input> element, set its style, and add
    // an event listener
    const inputElem = document.createElement('input');
    inputElem.id = 'input';
    inputElem.style.gridRowEnd = 3;
    inputElem.style.gridRowStart = 1;
    inputElem.style.textAlign = 'right';
    inputElem.addEventListener('input', () => {
      this.value = inputElem.value;
    });

    // Create a <button> element for incrementing the SpinBox value,
    // set its style, and add an event listener
    const upButton = document.createElement('button');
    upButton.id = 'upButton';
    upButton.textContent = '▲';
    upButton.style.gridColumn = 2;
    upButton.style.userSelect = 'none';
    upButton.addEventListener('mousedown', () => {
      this.value++;
    });

    // Create a <button> element for decrementing the SpinBox value,
    // set its style, and add an event listener
    const downButton = document.createElement('button');
    downButton.id = 'downButton';
    downButton.textContent = '▼';
    downButton.style.gridColumn = 2;
    downButton.style.userSelect = 'none';
    downButton.addEventListener('mousedown', () => {
      this.value--;
    });

    // Append the input element and two buttons to the shadow root
    root.appendChild(inputElem);
    root.appendChild(upButton);
    root.appendChild(downButton);

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
