/**
 * SpinBox custom element
 * 
 * 001: We create a simple SpinBox custom element that lets
 * you enter a numeric value into an input element and tap on
 * up/down buttons to increment/decrement the value. We use a
 * state member variable in the SpinBox class, _value, to track
 * the "value" attribute for display in the input element.
 * 
 * We use a reactive flow where the SpinBox element redraws
 * in reaction to changes in its "value" attribute. This happens
 * in the render method.
 * 
 * This implementation demonstrates implementation of the custom 
 * element lifecycle callbacks:
 * 
 * 1. connectedCallback
 * 2. disconnectedCallback
 * 3. attributeChangedCallback
 * 4. adoptedCallback
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
      this._value = inputElem.value;
      this.render();
    });

    // Create a <button> element for incrementing the SpinBox value,
    // set its style, and add an event listener
    const upButton = document.createElement('button');
    upButton.id = 'upButton';
    upButton.textContent = '▲';
    upButton.style.gridColumn = 2;
    upButton.style.userSelect = 'none';
    upButton.addEventListener('mousedown', () => {
      this._value++;
      this.render();
    });

    // Create a <button> element for decrementing the SpinBox value,
    // set its style, and add an event listener
    const downButton = document.createElement('button');
    downButton.id = 'downButton';
    downButton.textContent = '▼';
    downButton.style.gridColumn = 2;
    downButton.style.userSelect = 'none';
    downButton.addEventListener('mousedown', () => {
      this._value--;
      this.render();
    });

    // Append the input element and two buttons to the shadow root
    root.appendChild(inputElem);
    root.appendChild(upButton);
    root.appendChild(downButton);

    // Finally, render the element to reflect the state of
    // the "value" attribute
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

    // Look for a change in the "value" attribute and render if necessary
    if (name === 'value' && oldValue !== newValue) {
      this._value = parseInt(newValue);

      this.render();
    }
  }

  //
  // We centralize our changes to the DOM here, based on changes to
  // the SpinBox's state, namely its "value" attribute.
  //
  render() {
    this.shadowRoot.getElementById('input').value = this._value;
  }
}

customElements.define('spin-box', SpinBox);
