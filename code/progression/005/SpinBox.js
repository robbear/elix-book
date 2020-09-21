/**
 * SpinBox custom element
 * 
 * 005: Now we act on the patterns we saw earlier and begin to
 * abstract out code that will become shared between custom elements.
 * This is our first step toward a framework.
 * 
 * We separate out the common code that we use to populate the
 * shadow DOM from a specified template.
 * 
 * We also break out initialization code that happens during the first
 * render for initializing shadow DOM elements particular to our
 * custom element.
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
  // called from the common code that populates the shadow DOM. We're
  // naming that common code for now, "renderHelper".
  //
  get template() {
    return document.getElementById('spinBoxTemplate');
  }

  //
  // Common code that we're factoring out that asks for a template
  // and "stamps" that template into the shadow DOM. Notice how
  // this method contains no code at all pertaining to the details
  // of the SpinBox class.
  //
  renderHelper() {
    const firstRender = !this.shadowRoot;

    if (firstRender) {
      const root = this.attachShadow({ mode: 'open' });
      const templateElement = this.template;
      const clone = document.importNode(templateElement.content, true);
      root.appendChild(clone);
    }

    // Return the value of firstRender, since the initialization
    // state may be of great interest.
    return firstRender;
  }

  //
  // We centralize our changes to the DOM here, based on changes to
  // the SpinBox's state, namely its "value" property. We also
  // handle the special case of the first render method call, where
  // we instantiate the shadow DOM and connect the custom element's
  // event handlers.
  //
  render() {
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
