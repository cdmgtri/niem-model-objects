
let NIEMObject = require("../niem-object/index");

/**
 * A root class for commonalities between properties and types.
 * @abstract
 */
class Component extends NIEMObject {

  /**
   * @param {Release} release
   * @param {string} prefix
   * @param {string} name
   * @param {string} definition
   */
  constructor(release, prefix, name, definition) {
    super();

    this.release = release;
    this.prefix = prefix;
    this.name = name;
    this.definition = definition;

    /** @type {"Property"|"Type"} */
    this.componentClass = this.constructor.name;
  }

  get label() {
    return this.qname;
  }

  get route() {
    return Component.buildRoute(this.userKey, this.modelKey, this.releaseKey, this.componentClass, this.qname);
  }

  /**
   *
   * @static
   * @param {String} userKey
   * @param {String} modelKey
   * @param {String} releaseKey
   * @param {"Property"|"Type"} componentClass
   * @param {String} qname
   * @returns {String}
   */
  static buildRoute(userKey, modelKey, releaseKey, componentClass, qname) {
    let str = Release.buildRoute(userKey, modelKey, releaseKey) + "/";
    str += componentClass == "Property" ? "properties/" : "types/";
    return str + qname;
  }

  get authoritativePrefix() {
    return this.prefix;
  }

  /**
   * Qualified name
   */
  get qname() {
    return this.prefix + ":" + this.name;
  }

  /**
   * An array of terms inferred from the name of the component based on camel casing.
   *
   * @readonly
   * @type {String[]}
   */
  get terms() {

    // Add a space between a lowercase letter (or number) and an uppercase letter
    let s = this.name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

    // Add a space before the last letter in a series of uppercase letters or nums
    s = s.replace(/([A-Z0-9])([A-Z][a-z])/g, "$1 $2");

    // Replace an underscore with a space
    s = s.replace(/_/g, " ");

    return s.split(" ");
  }

  /**
   * @param {"full"|"release"|"namespace"} [scope="full"]
   */
  serialize(scope="full") {

    let object = {};

    if (scope == "full") {
      object = this.releaseIdentifiers;
    }

    if (scope == "full" || scope == "release") {
      object.prefix = this.prefix;
    }

    object.name = this.name;
    object.definition = this.definition;

    return object;
  }

  /**
   * Custom sort function to order an array of components by qualified name.
   *
   * @static
   * @param {Component} component1
   * @param {Component} component2
   */
  static sortByQName(component1, component2) {
    return component1.qname.localeCompare(component2.qname);
  }

  /**
   * Custom sort function to order an array of components by name, and then by prefix.
   *
   * @static
   * @param {Component} component1
   * @param {Component} component2
   */
  static sortByName(component1, component2) {

    // Sort by prefix if names match
    if (component1.name == component2.name) {
      return component1.prefix.localeCompare(component2.prefix);
    }

    // Sort by name
    return component1.name.localeCompare(component2.name);
  }

}

module.exports = Component;

let Release = require("../release/index");