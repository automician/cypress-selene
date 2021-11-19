import { Locator } from "../../../../../../src"


export const Component = {
  /** @returns {Locator} */
  element() {
    return typeof this.selector === 'string' ? 
      s(this.selector) 
      : this.selector
  },
  toString() {
    return (this.selector).toString()
  }
}