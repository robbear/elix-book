/**
 * SpinBox custom element
 * 
 * 004: Let's push the creation of the shadow DOM a bit further
 * in the process, and make the render method the center of our
 * reactive flow. When we move the work to create the shadow DOM 
 * from our template to the render method, interesting patterns
 * emerge.
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

    // The connectedCallback method reduces simply to calling
    // the render method with initial state, emphasizing render as the core 
    // of our reactive functional programming model.
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
  // the SpinBox's state, namely its "value" property. We also
  // handle the special case of the first render method call, where
  // we instantiate the shadow DOM and connect the custom element's
  // event handlers.
  //
  render() {
    const firstRender = !this.shadowRoot;
    if (firstRender) {
      //
      // This portion looks like it might be code common to any
      // custom element we design.
      //
      const root = this.attachShadow({ mode: 'open' });
      const spinBoxTemplate = document.getElementById('spinBoxTemplate');
      const clone = document.importNode(spinBoxTemplate.content, true);
      root.appendChild(clone);

      //
      // This next section looks like initialization of elements
      // appended to the shadow DOM, another potential pattern.
      //
  
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
    }

    // Finally, render the changes in state, which in this case
    // is the value property.
    this.shadowRoot.getElementById('input').value = this.value;
  }
}

customElements.define('spin-box', SpinBox);
