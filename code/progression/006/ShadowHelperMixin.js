/**
 * This pattern of defining a function that takes a base class
 * as a parameter and returns a new class extending the base
 * is one that mixin libraries like Elix employ.
 */
function ShadowHelperMixin(Base) {
  return class ShadowHelper extends Base {
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
  };
}

export default ShadowHelperMixin;