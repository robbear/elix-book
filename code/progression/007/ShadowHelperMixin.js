/**
 * The shared Symbol object, "template", lets the mixin and
 * a custom element internally communicate without exposing internal
 * methods and properties in the component's public API. The use of
 * Symbols also helps avoid unintentional name collisions.
 */
export const template = Symbol("template");

/**
 * This pattern of defining a function that takes a base class
 * as a parameter and returns a new class extending the base
 * is one that mixin libraries like Elix employ.
 */
export const ShadowHelperMixin = (Base) => {
  return class ShadowHelper extends Base {
    renderHelper() {
      const firstRender = !this.shadowRoot;
  
      if (firstRender) {
        const root = this.attachShadow({ mode: 'open' });
        const templateElement = this[template];
        const clone = document.importNode(templateElement.content, true);
        root.appendChild(clone);
      }
  
      // Return the value of firstRender, since the initialization
      // state may be of great interest.
      return firstRender;
    }
  };
}