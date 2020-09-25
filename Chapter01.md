# A Framework-Free SpinBox Web Component

In this chapter, we're going to create a simple SpinBox web component using nothing but the ES 2015 JavaScript and our knowledge of the DOM.

Let's start by agreeing to some terms. *Web component* and *custom element* are often used interchangeably. We're going to refer to *web component* as a component that extends the DOM tag space. *Custom elements* refer to a browser specification and set of APIs. *Shadow DOM* is also a browser specification and API. Together, custom elements and shadow DOM are used to build web components. We'll talk about the *web components* we're building as a finished piece &mdash; something that has an HTML tag associated with it and is attached to the DOM. Custom elements help us get there.

## What does a minimal web component look like?

A do-nothing, minimal web component has these pieces:

* A JavaScript class that extends HTMLElement
* A constructor
* A few callbacks
* A means for registering with the DOM

Let's look at the code:

```
class MyWebComponent extends HTML {
  constructor() {
    // Always call super
    super();
  }

  //
  // Custom element callbacks
  //

  connectedCallback() {
    console.log('connectedCallback - the component was added to the page');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attributeChangedCallback - an attribute was changed');
  }

  disconnectedCallback() {
    console.log('disconnectedCallback - the component was removed from the page');
  }

  adoptedCallback() {
    console.log('adoptedCallback - the component was moved to a new page');
  }
}

// Register the web component with the DOM
customElements.define('my-web-component', MyWebComponent);
```

A web component, at its core, is obviously very simple. The class extends `HTMLElement` a provides a constructor where the component can initialize itself, including state. Of the four callbacks, only the first two are commonly used. The connectedCallback method is called when the component has been added to the page and appears in the DOM. The attributeChangedCallback is called anytime an attribute is changed on the web component.

Finally, the `customElements` object, attached to `window`, presents the `define` method that asks for the new component's HTML tag string, and associates it with the component's class name. Remember that web component tag strings **must** contain at least one hyphen.

This base class implementation isn't hard to remember. Now let's build on it by defining a simple but working web component that we'll call SpinBox which allows a user to increment or decrement an integer value. Our SpinBox implementation will leverage other aspects of the Web Components specification, including shadow DOM and templates.

[Picture of SpinBox]

Our SpinBox implementation will follow the pattern above and add DOM elements that give it an actual shape and interactivity. We'll use an `<input>` element showing an integer count with two `<button>` elements, one for incrementing the count, the other for decrementing. We will make use of shadow DOM to encapsulate this group of HTML elements and its styling.

Let's look first at an HTML page making use of our SpinBox:

**index.html**
```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>SpinBox Test</title>
    <script defer src="SpinBox.js"></script>
  </head>
  <body>
    <h1>SpinBox Test</h1>
    <spin-box value="7"></spin-box>
  </body>
</html>
```

The `<spin-box>` tag represents our new web component, and the SpinBox's implementation is found in *SpinBox.js*. Let's start putting it together, starting with the basics as above but also taking into account that we'll maintain some internal state, namely the *value* of the SpinBox which we'll represent as a private member variable, `_value`.

Additionally, we'll notify the DOM that the string, `'value'`, represents an attribute that we want to watch. We'll associate the `value` attribute with our `_value` internal state and watch for changes in `attributeChangedCallback`. We need to let the DOM know of our interest in the `value` attribute by providing a static method called `observedAttributes`.

Finally, we're going to introduce a *reactive* code flow where, when the component's state changes, the component will make visual (and possibly other) changes to reflect that new state. We'll discuss this as we go forward, but let's introduce the notion of a `render` method that responds to change in state. Our introduction to this flow is in `render` being called in the `attributeChangedCallback` if there is a change in the `_value` state due to a change in the `value` attribute.

**SpinBox.js**
```
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

    // We'll build and attach the shadow DOM here
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('SpinBox attributes changed: attributeChangedCallback');

    // Look for a change in the "value" attribute and render if necessary
    if (name === 'value' && oldValue !== newValue) {
      this._value = parseInt(newValue);

      this.render();
    }
  }

  disconnectedCallback() {
    console.log('SpinBox removed from page: disconnectedCallback');
  }

  adoptedCallback() {
    console.log('SpinBox moved to new page: adoptedCallback');
  }

  render() {
    // Do something to reflect the change in state
  }
}

customElements.define('spin-box', SpinBox);
```

This is no different than what we had above, except for name changes and support for the `value` attribute. There is no internal DOM structure and nothing to display. Let's fix that by attaching some HTML so that we obtain a visual interface that looks like the following, with an `<input>` element and two `<button>` elements:

**SpinBox UI**
<p>
  <style>
    #spinContainer {
      display: inline-grid;
    }
    #input {
      grid-row-end: 3;
      grid-row-start: 1;
      text-align: right;
    }
    #upButton,
    #downButton {
      grid-column: 2;
      user-select: none;
    }
  </style>
  <div id="spinContainer">
    <input id="input" value="7">
    <button id="upButton">▲</button>
    <button id="downButton">▼</button>
  </div>
</p>

We'll create the `<input>` and `<button>` elements and append them to a shadow root which we'll also create. We need to do this only once, but where? The constructor seems like a good place for initializing the shadow DOM, but we could also consider doing this work in `connectedCallback` which, like the constructor, is also called only once in the component's lifetime. The benefit of "inflating" the web component in `connectedCallback` is that it pushes this work back later in the lifecycle, after basic initialization work that might take place in the constructor or elsewhere (such as property settings as we'll see later). Let's hold onto the idea that the later in the component lifecycle we can build the shadow DOM, the more opportunity we might have for beneficial code patterns having to do with drawing, or *rendering*, the component.

Here are the steps we'll take.

1. Create a shadow root and attach it to the class:  
``` 
const root = this.attachShadow({ mode: 'open' });
```
2. Set a style for component host. In our case, we just set the display mode to `inline-grid`:
``` 
this.style.display = 'inline-grid';
```
3. Create the `<input>` and `<button>` elements with `document.createElement`
4. Associate style with the `input` and `button` elements.
5. Add appropriate event listeners to the `input` and `button` elements.
6. Append these newly created elements to the shadow root.

Our `connectedCallback` becomes:

```
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
```

And we define the `render` method as such:

```
render() {
  this.shadowRoot.getElementById('input').value = this._value;
}
```

Our `render` method is simple in implementation, but the control flow is profound. The implementation simply assigns the value of the component's state, `_value`, to the value property of our `<input>` element, nestled safely in the component's shadow DOM. Whenever we notice a change in the `_value` state, either through a change in the component's `value` attribute or through something like an event handler, we make sure to call the `render` method so we can bring the `<input>` element up to date.

> When you detect a change in state, call the `render` method.

If you're not already familiar with "render-on-state-change" flows, such as in Facebook's *React* framework, you will get a sense for the power of functional reactive programming through this technique. When we centralize reactions to state changes in a single place, the `render` method, we reduce problems in code maintenance and increase code readability.

Here is the web component's complete code to this point, followed by an interactive CodePen session.

**SpinBox.js**
```
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
  
  attributeChangedCallback(name, oldValue, newValue) {
    console.log('SpinBox attributes changed: attributeChangedCallback');

    // Look for a change in the "value" attribute and render if necessary
    if (name === 'value' && oldValue !== newValue) {
      this._value = parseInt(newValue);

      this.render();
    }
  }

  disconnectedCallback() {
    console.log('SpinBox removed from page: disconnectedCallback');
  }

  adoptedCallback() {
    console.log('SpinBox moved to new page: adoptedCallback');
  }

  render() {
    this.shadowRoot.getElementById('input').value = this._value;
  }
}

customElements.define('spin-box', SpinBox);
```

**CodePen)**
<p>
  <p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js" data-user="robbear" data-slug-hash="bGpZwwz" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="SpinBox-001">
    <span>See the Pen <a href="https://codepen.io/robbear/pen/bGpZwwz">
    SpinBox-001</a> by Rob Bearman (<a href="https://codepen.io/robbear">@robbear</a>)
    on <a href="https://codepen.io">CodePen</a>.</span>
  </p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>
