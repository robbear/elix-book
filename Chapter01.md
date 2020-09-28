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

## SpinBox Web Component

This base class implementation isn't hard to remember. Now let's build on it by defining a simple but working web component that we'll call SpinBox which allows a user to increment or decrement an integer value. Our SpinBox implementation will leverage other aspects of the Web Components specification, including shadow DOM and templates.

**SpinBox**
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

This is no different than what we had above, except for name changes and support for the `value` attribute. There is no internal DOM structure and nothing to display. Let's fix that by attaching some HTML, with an `<input>` element and two `<button>` elements:

**SpinBox HTML**
```
<input id="input" value="7">
<button id="upButton">▲</button>
<button id="downButton">▼</button>
```

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

We'll create the `<input>` and `<button>` elements (and style them) and append them to a shadow root which we'll also create. We need to do this only once, but where? The constructor seems like a good place for initializing the shadow DOM, but we could also consider doing this work in `connectedCallback` which, like the constructor, is also called only once in the component's lifetime. The benefit of "inflating" the web component in `connectedCallback` is that it pushes this work back later in the lifecycle, after basic initialization work that might take place in the constructor or elsewhere (such as property settings as we'll see later). Let's hold onto the idea that the later in the component lifecycle we can build the shadow DOM, the more opportunity we might have for beneficial code patterns having to do with drawing, or *rendering*, the component.

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

And we implement the `render` method to display the current `_value` state by finding the `input` element inside our shadow DOM. We need to check for the existence of the shadowRoot in cases where `render` may be called prior to the creation of the shadow root, such as in an initial change in attribute at component creation time.

```
render() {
  if (this.shadowRoot) {
    this.shadowRoot.getElementById('input').value = this._value;
  }
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
    if (this.shadowRoot) {
      this.shadowRoot.getElementById('input').value = this._value;
    }
  }
}

customElements.define('spin-box', SpinBox);
```

**CodePen**
<p>
  <p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js" data-user="robbear" data-slug-hash="bGpZwwz" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="SpinBox-001">
    <span>See the Pen <a href="https://codepen.io/robbear/pen/bGpZwwz">
    SpinBox-001</a> by Rob Bearman (<a href="https://codepen.io/robbear">@robbear</a>)
    on <a href="https://codepen.io">CodePen</a>.</span>
  </p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>

## Property API and State

In our first pass, we use the member variable, `_value`, to maintain state and whenever we change `_value`, we call the `render` method. Let's refine this a bit, in preparation of exposing a public `value` property on the SpinBox web component and to enhance the flow pattern of the code.

Notice that we call the `render` method five times in the implementation above. We can minimize that if we centralize where we detect a change to the `_value` state, and we can get a leg up on future work by defining a `value` property where we call the `render` method in the `value` property `setter` if there's a change in the `_value` state. That is, we keep `_value` private in the class as a state object while exposing access to that state through a property. The property's `getter` and `setter` allows us to inject any actions we want to take during the reading or writing of the property.

Here's our property implementation:

**Value property getter and setter**
```
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
```

The `getter` simply returns the `_value` state, while the `setter` looks for a change in state, assigns the change to the state member variable and calls `render` to display the change in visualization.

Next, we just need to walk through the code and replace instances where we access the `_value` member variable with the use of our new property. When we do so, we can reduce our calls to `_render` from five to two &mdash; as part of `connectedCallback` and in the `value` property setter. Remember that we no longer need to call `_render` when we change the `value` *property* as opposed to the `_value` state variable directly, because when we set the property, the property `setter` takes care of making the call to `render` for us.

We've introduced a new pattern here.

> Centralize change in state where possible in a property `setter`

Here's the new code where we replace direct access to the `_value` state member variable with the `value` property `getter` and `setter`:

**SpinBox.js with a `value` property**
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

  render() {
    if (this.shadowRoot) {
      this.shadowRoot.getElementById('input').value = this.value;
    }
  }
}

customElements.define('spin-box', SpinBox);
```

**CodePen**
<p>
  <p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js" data-user="robbear" data-slug-hash="YzqgpWg" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="SpinBox-002">
    <span>See the Pen <a href="https://codepen.io/robbear/pen/YzqgpWg">
    SpinBox-002</a> by Rob Bearman (<a href="https://codepen.io/robbear">@robbear</a>)
    on <a href="https://codepen.io">CodePen</a>.</span>
  </p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>

## Shadow DOM and HTML Templates

In `connectedCallback` we painstakingly create our shadow DOM imperatively, writing code to create, style, and append the `input` and two `button` elements. While using the DOM API to create and append elements might be useful in certain scenarios, it is inefficient from a design iteration and visualization perspective. What we want is to see the HTML that makes up the shadow DOM in our web component. We want to construct the shadow DOM as we would construct a page, with HTML.

We can do that with an HTML Template. What we'll do is define a `template` element declaratively and find a way to "stamp" that structure into the shadow DOM of our web component. Let's start by adding a `template` to our `index.html` file.

**index.html**
```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>SpinBox Test</title>

    <template id="spinBoxTemplate">
      <style>
        :host {
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
      <input id="input"></input>
      <button id="upButton">▲</button>
      <button id="downButton">▼</button>
    </template>

    <script defer src="SpinBox.js"></script>
  </head>
  <body>
    <h1>SpinBox Test</h1>
    <spin-box></spin-box>
  </body>
</html>
```

The elements we created in JavaScript are not specified within the `template` element above: an `input` element and two `button` elements, along with styling.

Now, instead of creating the shadow DOM elements one by one with code, we can fetch the `template`, get its contents, and append to the shadow root.

```
const root = this.attachShadow({ mode: 'open' });

// Get the SpinBox's template and "stamp" its content to the shadow DOM
const spinBoxTemplate = document.getElementById('spinBoxTemplate');
const clone = document.importNode(spinBoxTemplate.content, true);
root.appendChild(clone);
```

Three lines and some declarative HTML replace the element-by-element code we wrote before. This change lets us layout and design the web component more naturally, gives us an inkling that delivering a `template` as part of our code pattern is something to watch for as we progress.

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

  render() {
    if (this.shadowRoot) {
      this.shadowRoot.getElementById('input').value = this.value;
    }
  }
}

customElements.define('spin-box', SpinBox);
```

**CodePen**
<p>
  <p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js" data-user="robbear" data-slug-hash="GRZLwjp" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="SpinBox-003">
    <span>See the Pen <a href="https://codepen.io/robbear/pen/GRZLwjp">
    SpinBox-003</a> by Rob Bearman (<a href="https://codepen.io/robbear">@robbear</a>)
    on <a href="https://codepen.io">CodePen</a>.</span>
  </p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>

## Attach the Shadow DOM in `render`

We chose to create the shadow DOM in the component's `connectedCallback` method, after which we call the `render` method. This seems curious. Isn't the creation of DOM elements for display kind of a render action? Certainly it happens only once, and `connectedCallback` is a useful place for one-time initializations, but what might we gain by pushing the shadow DOM creation off to the `render` method itself?

The `render` method has a curious guard &mdash; checking for the existence of the shadow root. That feels like a hint that maybe there's a better pattern. Since `render` is called potentially repeatedly in the component's lifetime, namely when the component's state changes, we'll need to make sure we create the shadow DOM only once, namely when we render the component for the first time. We also want to create event listeners for the elements in the shadow DOM once. So perhaps we consolidate all of this in the `render` method, noting the first render call. If we move the shadow DOM creation code from `connectedCallback` to `render`, we get this:

```
connectedCallback() {
  console.log('SpinBox added to page: connectedCallback');

  // The connectedCallback method reduces simply to calling
  // the render method with initial state, emphasizing render as the core 
  // of our reactive functional programming model.
  this.render();
}

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

  this.shadowRoot.getElementById('input').value = this.value;
}
```

At the bottom of the `render` method, we see our familiar call to set the `value` property of the `input` element to the current component state. We no longer have the guard in place, checking for the existence of the shadow root. The reason for that is that we check further up in the method. If no shadow root exists, if we haven't initialized the shadow DOM, we recognize that the code flow has entered the `render` method for the first time. If we're in that first render, we go ahead and initialize and attach the shadow DOM.

Let's back up a bit and see what we've gained. We've glossed over the fact that we've had two possibilities for entering the `render` method for the first time. Both `attributeChangedCallback` and `connectedCallback` result in calls to `render` &mdash; in the case of `attributeChangedCallback` that happens in the change of state in the case where the `value` attribute is set in the HTML tag (look again at the `template` we use). In the case of `connectedCallback`, the `render` method is called directly. So if we have no initial `value` attribute in the `template`, `connectedCallback` would be called first. We need to handle both cases. By moving the shadow DOM creation code as a "first render" case in the `render` method, we can drop the guard at the bottom of the `render` method and ensure the shadow DOM is initialized the first time through as well as having a convenient way of identifying the first render: when the shadow root doesn't yet exist.

Now we can see some patterns opening up that might be common to any web component we write. First, we force the code flow through the `render` method in both initialization cases of starting with an initial attribute/property setting, and in `connectedCallback`. So the `render` method is where we do "interesting" stuff, particularly revolving around, well, *rendering*.

Second, the section of code that fetches the `template` element and "stamps" the shadow DOM structure under the shadow root seems particular to any web component we might write. There's nothing in that section particular to this SpinBox component. It looks like common code:

```
const root = this.attachShadow({ mode: 'open' });
const spinBoxTemplate = document.getElementById('spinBoxTemplate');
const clone = document.importNode(spinBoxTemplate.content, true);
root.appendChild(clone);
```

Third, there is the section where we initialize event handlers and possibly other one-time tasks. This is particular to the SpinBox component, but common in the abstract. We have a pattern where component-internal initialization takes place in the component's first render.

And finally, we make changes to the DOM based on any change in component state.

Here's what our code looks like now:

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

  render() {
    const firstRender = !this.shadowRoot;
    if (firstRender) {
      const root = this.attachShadow({ mode: 'open' });
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
    }

    this.shadowRoot.getElementById('input').value = this.value;
  }
}

customElements.define('spin-box', SpinBox);
```

**CodePen**
<p>
  <p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js" data-user="robbear" data-slug-hash="WNwWLey" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="SpinBox-004">
    <span>See the Pen <a href="https://codepen.io/robbear/pen/WNwWLey">
    SpinBox-004</a> by Rob Bearman (<a href="https://codepen.io/robbear">@robbear</a>)
    on <a href="https://codepen.io">CodePen</a>.</span>
  </p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>