/**
 * SpinBox custom element
 * 
 * 006: Mixins
 */

import ShadowHelperMixin from './ShadowHelperMixin.js';

// Create a class for the element
class SpinBox extends ShadowHelperMixin(HTMLElement) {

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
  // We handle first render initialization, like hooking up
  // event handlers, here.
  //
  componentFirstRender() {
    console.log('SpinBox componentFirstRender called');

    // Hook up the 'input' element's event listener(s)
    const inputElement = this.shadowRoot.getElementById('input');
    inputElement.addEventListener('input', () => {
      this.value = inputElem.value;
    });

    // Hook up the 'upButton' element's event listener(s)
    const upButton = this.shadowRoot.getElementById('upButton');
    upButton.addEventListener('mousedown', () => {
      this.value++;
    });

    // Hook up the 'downButton' element's event listener(s)
    const downButton = this.shadowRoot.getElementById('downButton');
    downButton.addEventListener('mousedown', () => {
      this.value--;
    });  
  }

  //
  // This looks like a method that would be supplied by all components,
  // called from the common code, renderHelper, that populates the shadow DOM.
  //
  get template() {
    return document.getElementById('spinBoxTemplate');
  }

  //
  // We centralize our changes to the DOM here, based on changes to
  // the SpinBox's state, namely its "value" property. We also
  // handle the special case of the first render method call, where
  // we delegate to our componentFirstRender method.
  //
  render() {
    // We call renderHelper on the prototype chain. Notice that we're 
    // not implementing it in this class, so the implementation is being provided
    // by the ShadowHelperMixin.
    const firstRender = this.renderHelper();
    if (firstRender) {
      // Let's isolate one-time initialization code outside
      // our render method.
      this.componentFirstRender();  
    }

    // Finally, render the changes in state, which in this case
    // is the value property.
    this.shadowRoot.getElementById('input').value = this.value;
  }
}

customElements.define('spin-box', SpinBox);
