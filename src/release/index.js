
let NIEMObject = require("../niem-object/index");

/**
 * A coherent set of namespaces bundled together for a release, IEPD, EIEM, etc.
 */
class Release extends NIEMObject {

  /**
   * @param {string} releaseKey
   * @param {string} niemReleaseKey
   * @param {import("../release-object/index").NDRVersionType} [ndrVersion="6.0"] Defaults to "6.0"
   * @param {string} [version]
   * @param {StatusType} [status]
   * @param {string} [baseURI]
   * @param {string} [branch]
   * @param {string} [description]
   */
  constructor(releaseKey="default", niemReleaseKey="", ndrVersion="6.0", version="", status, baseURI="", branch="", description="") {

    super();

    /** @type {import("../model/index")} */
    this.model;

    this.releaseKey = releaseKey;
    this.niemReleaseKey = niemReleaseKey;
    this.ndrVersion = ndrVersion;
    this.version = version;
    this.status = status;
    this.baseURI = baseURI;
    this.branch = branch;
    this.description = description;
    this.previousReleaseKey = "";

    /** @type {"major"|"minor"|"micro"|"core supplement"|"domain update"|"patch"|"other"|""} */
    this.style = "";

    this.date = "";

  }

  get niem() {
    return this.model.niem;
  }

  get source() {
    return this.model.source;
  }

  /**
   * @param {string} releaseKey
   * @param {string} [niemReleaseKey]
   * @param {"3.0"|"4.0"|"5.0"|"6.0"} [ndrVersion="6.0"] Defaults to "6.0"
   * @param {string} [version]
   * @param {"draft"|"published"} [status]
   * @param {string} [baseURI]
   * @param {string} [branch]
   * @param {string} [description]
   */
  static create(releaseKey, niemReleaseKey, ndrVersion="6.0", version, status, baseURI, branch, description) {
    return new Release(releaseKey, niemReleaseKey, ndrVersion, version, status, baseURI, branch, description);
  }

  get sourceDataSet() {
    return this.source.releases;
  }

  get namespaces() {
    let Namespace = require("../namespace/index");

    /** @type {Mappings<Namespace>} */
    let mappings = (this.source.mappings);

    return {

      /**
       * @param {string} prefix
       * @param {Namespace.StyleType} [style]
       * @param {string} [uri]
       * @param {string} [fileName]
       * @param {string} [definition]
       * @param {string} [version]
       * @param {string} [relativePath]
       * @returns {Promise<Namespace>}
       */
      add: async (prefix, style, uri, fileName, definition, version, relativePath) => {
        // Use Namespace builder to return the right NDR-version of a namespace
        let namespace = Namespace.create(this.ndrVersion, prefix, style, uri, fileName, definition, version);
        namespace.release = this;
        namespace.relativePath = relativePath;
        return namespace.add();
      },

      /**
       * @param {Namespace[]} namespaces
       */
      addMultiple: async(namespaces) => {
        namespaces.forEach( namespace => namespace.release = this );
        return Namespace.addMultiple(this.releaseKey, this.source.namespaces, namespaces);
      },

      /**
       * @param {string} prefix
       */
      get: async (prefix) => {
        return this.source.namespaces.get({...this.identifiers, prefix});
      },

      /**
       * @param {Namespace.CriteriaType} [criteria]
       * @param {Function} [sortFunction]
       */
      find: async (criteria={}, sortFunction) => {
        Object.assign(criteria, this.identifiers);
        return this.source.namespaces.find(criteria, sortFunction);
      },

      /**
       * @param {Namespace.CriteriaType} criteria
       */
      count: async (criteria={}) => {
        Object.assign(criteria, this.identifiers);
        return this.source.namespaces.count(criteria);
      },


      mappings: {

        /**
         * @param {string} newPrefix
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Namespace>>}
         */
        add: async (newPrefix="", changes=[]) => {
          let newID = Namespace.route(this.userKey, this.modelKey, this.releaseKey, newPrefix);

          return mappings.add(this.source.namespaces, this.userKey, this.modelKey, this.releaseKey, "add", "Namespace", "", newID, undefined, changes);
        },

        /**
         * @param {string} oldPrefix
         * @param {string} newPrefix
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Namespace>>}
         */
        edit: async (oldPrefix="", newPrefix="", changes=[]) => {
          let oldID = Namespace.route(this.userKey, this.modelKey, this.previousReleaseKey, oldPrefix);
          let newID = Namespace.route(this.userKey, this.modelKey, this.releaseKey, newPrefix);

          return mappings.add(this.source.namespaces, this.userKey, this.modelKey, this.releaseKey, "edit", "Namespace", oldID, newID, undefined, changes);
        },

        /**
         * @param {string} oldPrefix
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Namespace>>}
         */
        delete: async (oldPrefix="", changes=[]) => {
          let oldID = Namespace.route(this.userKey, this.modelKey, this.previousReleaseKey, oldPrefix);

          return mappings.add(this.source.namespaces, this.userKey, this.modelKey, this.releaseKey, "delete", "Namespace", oldID, "", undefined, changes);
        },

        /**
         * @param {string} prefix
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Namespace>>}
         */
        load: async (prefix="", changes=[]) => {
          let oldID = Namespace.route(this.userKey, this.modelKey, this.previousReleaseKey, prefix);
          let newID = Namespace.route(this.userKey, this.modelKey, this.releaseKey, prefix);

          return mappings.add(this.source.namespaces, this.userKey, this.modelKey, this.releaseKey, "load", "Namespace", oldID, newID, undefined, changes);
        },

        /**
         * @param {Mapping.OperationType} [operation]
         * @returns {Promise<Array<Mapping<Namespace>>>}
         */
        find: async (operation) => {
          /** @type {Mappings.CriteriaType} */
          let criteria = Object.assign({}, this.identifiers, {operation});
          criteria.className = "Namespace";
          return mappings.find(criteria);
        }

      }

    };
  }

  get localTerms() {

    let LocalTerm = require("../local-term/index");

    /** @type {Mappings<LocalTerm>} */
    let mappings = (this.source.mappings);

    return {

      /**
       * @param {string} prefix
       * @param {string} term
       * @param {string} [literal]
       * @param {string} [definition]
       * @returns {Promise<LocalTerm>}
       */
      add: async (prefix, term, literal, definition) => {
        let localTerm = LocalTerm.create(this.ndrVersion, prefix, term, literal, definition);
        localTerm.release = this;
        return localTerm.add();
      },

      /**
       * @param {LocalTerm[]} localTerms
       */
      addMultiple: async(localTerms) => {
        localTerms.forEach( localTerm => localTerm.release = this );
        return LocalTerm.addMultiple(this.releaseKey, this.source.localTerms, localTerms);
      },

      /**
       * @param {string} prefix
       * @param {string} term
       */
      get: async (prefix, term) => {
        return this.source.localTerms.get({...this.identifiers, prefix, term});
      },

      /**
       * @param {LocalTerm.CriteriaType} [criteria]
       * @param {Function} [sortFunction]
       */
      find: async (criteria={}, sortFunction) => {
        Object.assign(criteria, this.identifiers);
        return this.source.localTerms.find(criteria, sortFunction);
      },

      /**
       * @param {LocalTerm.CriteriaType} criteria
       */
      count: async (criteria={}) => {
        Object.assign(criteria, this.identifiers);
        return this.source.localTerms.count(criteria);
      },

      mappings: {

        /**
         * @param {string} newPrefix
         * @param {string} newTerm
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<LocalTerm>>}
         */
        add: async (newPrefix="", newTerm="", changes=[]) => {
          let newID = LocalTerm.route(this.userKey, this.modelKey, this.releaseKey, newPrefix, newTerm);

          return mappings.add(this.source.localTerms, this.userKey, this.modelKey, this.releaseKey, "add", "LocalTerm", "", newID, undefined, changes);
        },

        /**
         * @param {string} oldPrefix
         * @param {string} oldTerm
         * @param {string} newPrefix
         * @param {string} newTerm
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<LocalTerm>>}
         */
        edit: async (oldPrefix="", oldTerm="", newPrefix="", newTerm="", changes=[]) => {
          let oldID = LocalTerm.route(this.userKey, this.modelKey, this.previousReleaseKey, oldPrefix, oldTerm);
          let newID = LocalTerm.route(this.userKey, this.modelKey, this.releaseKey, newPrefix, newTerm);

          return mappings.add(this.source.localTerms, this.userKey, this.modelKey, this.releaseKey, "edit", "LocalTerm", oldID, newID, undefined, changes);
        },

        /**
         * @param {string} oldPrefix
         * @param {string} oldTerm
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<LocalTerm>>}
         */
        delete: async (oldPrefix="", oldTerm="", changes=[]) => {
          let oldID = LocalTerm.route(this.userKey, this.modelKey, this.previousReleaseKey, oldPrefix, oldTerm);

          return mappings.add(this.source.localTerms, this.userKey, this.modelKey, this.releaseKey, "delete", "LocalTerm", oldID, "", undefined, changes);
        },

        /**
         * @param {string} prefix
         * @param {string} term
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<LocalTerm>>}
         */
        load: async (prefix="", term="", changes=[]) => {
          let oldID = LocalTerm.route(this.userKey, this.modelKey, this.previousReleaseKey, prefix, term);
          let newID = LocalTerm.route(this.userKey, this.modelKey, this.releaseKey, prefix, term);

          return mappings.add(this.source.localTerms, this.userKey, this.modelKey, this.releaseKey, "load", "LocalTerm", oldID, newID, undefined, changes);
        },

        /**
         * @param {Mapping.OperationType} [operation]
         * @returns {Promise<Array<Mapping<LocalTerm>>>}
         */
        find: async (operation) => {
          /** @type {Mappings.CriteriaType} */
          let criteria = Object.assign({}, this.identifiers, {operation});
          criteria.className = "LocalTerm";
          return mappings.find(criteria);
        }
      }

    };
  }

  get properties() {

    let Property = require("../property/index");

    /** @type {Mappings<Property>} */
    let mappings = (this.source.mappings);

    return {

      /**
       * @param {string} prefix
       * @param {string} name
       * @param {string} [definition]
       * @param {string} [typeQName]
       * @param {string} [groupQName]
       * @param {boolean} [isElement=true] Defaults to true
       * @param {boolean} [isAbstract=false] Defaults to false
       * @returns {Promise<Property>}
       */
      add: async (prefix, name, definition, typeQName, groupQName, isElement=true, isAbstract=false) => {
        let property = Property.create(prefix, name, definition, typeQName, groupQName, isElement, isAbstract, this.ndrVersion);
        property.release = this;
        return property.add();
      },

      /**
       * @param {Property[]} properties
       */
      addMultiple: async(properties) => {
        properties.forEach( property => property.release = this );
        return Property.addMultiple(this.releaseKey, this.source.properties, properties);
      },

      /**
       * @param {string} qname
       */
      get: async (qname) => {
        return this.source.properties.get({
          ...this.identifiers,
          prefix: Component.getPrefix(qname),
          name: Component.getName(qname)
        });
      },

      /**
       * @param {Property.CriteriaType} [criteria]
       * @param {Function} [sortFunction]
       */
      find: async (criteria={}, sortFunction) => {
        Object.assign(criteria, this.identifiers);
        return this.source.properties.find(criteria, sortFunction);
      },

      /**
       * @param {Property.CriteriaType} criteria
       */
      count: async (criteria={}) => {
        Object.assign(criteria, this.identifiers);
        return this.source.properties.count(criteria);
      },

      mappings: {

        /**
         * @param {string} newQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Property>>}
         */
        add: async (newQName="", changes=[]) => {
          let [newPrefix, newName] = newQName.split(":") || ["", ""];
          let newID = Property.route(this.userKey, this.modelKey, this.releaseKey, newPrefix, newName);

          return mappings.add(this.source.properties, this.userKey, this.modelKey, this.releaseKey, "add", "Property", "", newID, undefined, changes);
        },

        /**
         * @param {string} oldQName
         * @param {string} newQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Property>>}
         */
        edit: async (oldQName="", newQName="", changes=[]) => {
          let [oldPrefix, oldName] = oldQName.split(":") || ["", ""];
          let [newPrefix, newName] = newQName.split(":") || ["", ""];

          let oldID = Property.route(this.userKey, this.modelKey, this.previousReleaseKey, oldPrefix, oldName);
          let newID = Property.route(this.userKey, this.modelKey, this.releaseKey, newPrefix, newName);

          return mappings.add(this.source.properties, this.userKey, this.modelKey, this.releaseKey, "edit", "Property", oldID, newID, undefined, changes);
        },

        /**
         * @param {string} oldQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Property>>}
         */
        delete: async (oldQName="", changes=[]) => {
          let [oldPrefix, oldName] = oldQName.split(":") || ["", ""];
          let oldID = Property.route(this.userKey, this.modelKey, this.previousReleaseKey, oldPrefix, oldName);

          return mappings.add(this.source.properties, this.userKey, this.modelKey, this.releaseKey, "delete", "Property", oldID, "", undefined, changes);
        },

        /**
         * @param {string} qname
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Property>>}
         */
        load: async (qname="", changes=[]) => {
          let [prefix, name] = qname.split(":") || ["", ""];
          let oldID = Property.route(this.userKey, this.modelKey, this.previousReleaseKey, prefix, name);
          let newID = Property.route(this.userKey, this.modelKey, this.releaseKey, prefix, name);

          return mappings.add(this.source.properties, this.userKey, this.modelKey, this.releaseKey, "load", "Property", oldID, newID, undefined, changes);
        },

        /**
         * @param {Mapping.OperationType} [operation]
         * @returns {Promise<Array<Mapping<Property>>>}
         */
        find: async (operation) => {
          /** @type {Mappings.CriteriaType} */
          let criteria = Object.assign({}, this.identifiers, {operation});
          criteria.className = "Property";
          return mappings.find(criteria);
        }

      }

    };
  }

  get types() {

    let Type = require("../type/index");

    /** @type {Mappings<Type>} */
    let mappings = (this.source.mappings);

    return {

      /**
       * @param {string} prefix
       * @param {string} name
       * @param {string} [definition]
       * @param {Type.StyleType} [style]
       * @param {string} [baseQName]
       * @returns {Promise<Type>}
       */
      add: async (prefix, name, definition, style, baseQName) => {
        let type = Type.create(this.ndrVersion, prefix, name, definition, style, baseQName);
        type.release = this;
        return type.add();
      },

      /**
       * @param {Type[]} types
       */
      addMultiple: async(types) => {
        types.forEach( type => type.release = this );
        return Type.addMultiple(this.releaseKey, this.source.types, types);
      },

      /**
       * @param {string} qname
       */
      get: async (qname) => {
        return this.source.types.get({
          ...this.identifiers,
          prefix: Component.getPrefix(qname),
          name: Component.getName(qname)
        });
      },

      /**
       * @param {Type.CriteriaType} [criteria]
       * @param {Function} [sortFunction]
       */
      find: async (criteria={}, sortFunction) => {
        Object.assign(criteria, this.identifiers);
        return this.source.types.find(criteria, sortFunction);
      },

      /**
       * @param {Type.CriteriaType} criteria
       */
      count: async (criteria={}) => {
        Object.assign(criteria, this.identifiers);
        return this.source.types.count(criteria);
      },

      mappings: {

        /**
         * @param {string} newQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Type>>}
         */
        add: async (newQName="", changes=[]) => {
          let newID = Type.route(this.userKey, this.modelKey, this.releaseKey, newQName);

          return mappings.add(this.source.types, this.userKey, this.modelKey, this.releaseKey, "add", "Type", "", newID, undefined, changes);
        },

        /**
         * @param {string} oldQName
         * @param {string} newQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Type>>}
         */
        edit: async (oldQName="", newQName="", changes=[]) => {
          let oldID = Type.route(this.userKey, this.modelKey, this.previousReleaseKey, oldQName);
          let newID = Type.route(this.userKey, this.modelKey, this.releaseKey, newQName);

          return mappings.add(this.source.types, this.userKey, this.modelKey, this.releaseKey, "edit", "Type", oldID, newID, undefined, changes);
        },

        /**
         * @param {string} oldQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Type>>}
         */
        delete: async (oldQName="", changes=[]) => {
          let oldID = Type.route(this.userKey, this.modelKey, this.previousReleaseKey, oldQName);

          return mappings.add(this.source.types, this.userKey, this.modelKey, this.releaseKey, "delete", "Type", oldID, "", undefined, changes);
        },

        /**
         * @param {string} qname
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Type>>}
         */
        load: async (qname="", changes=[]) => {
          let oldID = Type.route(this.userKey, this.modelKey, this.previousReleaseKey, qname);
          let newID = Type.route(this.userKey, this.modelKey, this.releaseKey, qname);

          return mappings.add(this.source.types, this.userKey, this.modelKey, this.releaseKey, "load", "Type", oldID, newID, undefined, changes);
        },

        /**
         * @param {Mapping.OperationType} [operation]
         * @returns {Promise<Array<Mapping<Type>>>}
         */
        find: async (operation) => {
          /** @type {Mappings.CriteriaType} */
          let criteria = Object.assign({}, this.identifiers, {operation});
          criteria.className = "Type";
          return mappings.find(criteria);
        }

      }


    };
  }

  get facets() {

    let Facet = require("../facet/index");

    /** @type {Mappings<Facet>} */
    let mappings = (this.source.mappings);

    return {

      /**
       * @param {string} typeQName
       * @param {string} value
       * @param {string} [definition]
       * @param {Facet.StyleType} [style="enumeration"] Default "enumeration"
       * @returns {Promise<Facet>}
       */
      add: async (typeQName, value, definition, style="enumeration") => {
        let facet = Facet.create(this.ndrVersion, typeQName, value, definition, style);
        facet.release = this;
        return facet.add();
      },

      /**
       * @param {Facet[]} facets
       */
      addMultiple: async(facets) => {
        facets.forEach( facet => facet.release = this );
        return Facet.addMultiple(this.releaseKey, this.source.facets, facets);
      },

      /**
       * @param {string} qname
       * @param {string} value
       * @param {Facet.StyleType} [style="enumeration"] Default "enumeration"
       */
      get: async (qname, value, style="enumeration") => {
        return this.source.facets.get({...this.identifiers, typeQName: qname, value, style});
      },

      /**
       * @param {Facet.CriteriaType} [criteria]
       * @param {Function} [sortFunction]
       */
      find: async (criteria={}, sortFunction) => {
        Object.assign(criteria, this.identifiers);
        return this.source.facets.find(criteria, sortFunction);
      },

      /**
       * @param {Facet.CriteriaType} criteria
       */
      count: async (criteria={}) => {
        Object.assign(criteria, this.identifiers);
        return this.source.facets.count(criteria);
      },

      mappings: {

        /**
         * @param {string} newQName
         * @param {string} newValue
         * @param {Facet.StyleType} newStyle
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Facet>>}
         */
        add: async (newQName="", newValue="", newStyle="enumeration", changes=[]) => {
          let newID = Facet.route(this.userKey, this.modelKey, this.releaseKey, newQName, newValue, newStyle);

          return mappings.add(this.source.facets, this.userKey, this.modelKey, this.releaseKey, "add", "Facet", "", newID, undefined, changes);
        },

        /**
         * @param {string} oldQName
         * @param {string} oldValue
         * @param {Facet.StyleType} oldStyle
         * @param {string} newQName
         * @param {string} newValue
         * @param {Facet.StyleType} newStyle
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Facet>>}
         */
        edit: async (oldQName="", oldValue="", oldStyle="enumeration", newQName="", newValue="", newStyle="enumeration", changes=[]) => {
          let oldID = Facet.route(this.userKey, this.modelKey, this.previousReleaseKey, oldQName, oldValue, oldStyle);
          let newID = Facet.route(this.userKey, this.modelKey, this.releaseKey, newQName, newValue, newStyle);

          return mappings.add(this.source.facets, this.userKey, this.modelKey, this.releaseKey, "edit", "Facet", oldID, newID, undefined, changes);
        },

        /**
         * @param {string} oldQName
         * @param {string} oldValue
         * @param {Facet.StyleType} oldStyle
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Facet>>}
         */
        delete: async (oldQName="", oldValue="", oldStyle="enumeration", changes=[]) => {
          let oldID = Facet.route(this.userKey, this.modelKey, this.previousReleaseKey, oldQName, oldValue, oldStyle);

          return mappings.add(this.source.facets, this.userKey, this.modelKey, this.releaseKey, "delete", "Facet", oldID, "", undefined, changes);
        },

        /**
         * @param {string} qname
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<Facet>>}
         */
        load: async (qname="", changes=[]) => {
          let [prefix, name] = qname.split(":") || ["", ""];
          let oldID = Facet.route(this.userKey, this.modelKey, this.previousReleaseKey, prefix, name);
          let newID = Facet.route(this.userKey, this.modelKey, this.releaseKey, prefix, name);

          return mappings.add(this.source.facets, this.userKey, this.modelKey, this.releaseKey, "load", "Facet", oldID, newID, undefined, changes);
        },

        /**
         * @param {Mapping.OperationType} [operation]
         * @returns {Promise<Array<Mapping<Facet>>>}
         */
        find: async (operation) => {
          /** @type {Mappings.CriteriaType} */
          let criteria = Object.assign({}, this.identifiers, {operation});
          criteria.className = "Facet";
          return mappings.find(criteria);
        }

      }


    };
  }

  get subProperties() {

    let SubProperty = require("../subproperty/index");

    /** @type {Mappings<SubProperty>} */
    let mappings = (this.source.mappings);

    return {

      /**
       * @param {string} typeQName
       * @param {string} propertyQName
       * @param {string} [min]
       * @param {string} [max]
       * @param {string} [definition]
       * @param {"element"|"attribute"} [style]
       * @param {Number} [sequence]
       * @returns {Promise<SubProperty>}
       */
      add: async (typeQName, propertyQName, min, max, definition, style, sequence) => {
        let subProperty = SubProperty.create(this.ndrVersion, typeQName, propertyQName, min, max, definition, style, sequence);
        subProperty.release = this;
        return subProperty.add();
      },

      /**
       * @param {SubProperty[]} subProperties
       */
      addMultiple: async(subProperties) => {
        subProperties.forEach( subProperty => subProperty.release = this );
        return SubProperty.addMultiple(this.releaseKey, this.source.subProperties, subProperties);
      },

      /**
       * @param {string} typeQName
       * @param {string} propertyQName
       */
      get: async (typeQName, propertyQName) => {
        return this.source.subProperties.get({...this.identifiers, typeQName, propertyQName});
      },

      /**
       * @param {SubProperty.CriteriaType} [criteria]
       * @param {Function} [sortFunction]
       */
      find: async (criteria={}, sortFunction) => {
        Object.assign(criteria, this.identifiers);
        return this.source.subProperties.find(criteria, sortFunction);
      },

      /**
       * @param {SubProperty.CriteriaType} criteria
       */
      count: async (criteria={}) => {
        Object.assign(criteria, this.identifiers);
        return this.source.subProperties.count(criteria);
      },

      mappings: {

        /**
         * @param {string} newTypeQName
         * @param {string} newPropertyQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<SubProperty>>}
         */
        add: async (newTypeQName="", newPropertyQName="", changes=[]) => {
          let newID = SubProperty.route(this.userKey, this.modelKey, this.releaseKey, newTypeQName, newPropertyQName);

          return mappings.add(this.source.subProperties, this.userKey, this.modelKey, this.releaseKey, "add", "SubProperty", "", newID, undefined, changes);
        },

        /**
         * @param {string} oldTypeQName
         * @param {string} oldPropertyQName
         * @param {string} newTypeQName
         * @param {string} newPropertyQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<SubProperty>>}
         */
        edit: async (oldTypeQName="", oldPropertyQName="", newTypeQName="", newPropertyQName="", changes=[]) => {
          let oldID = SubProperty.route(this.userKey, this.modelKey, this.previousReleaseKey, oldTypeQName, oldPropertyQName);
          let newID = SubProperty.route(this.userKey, this.modelKey, this.releaseKey, newTypeQName, newPropertyQName);

          return mappings.add(this.source.subProperties, this.userKey, this.modelKey, this.releaseKey, "edit", "SubProperty", oldID, newID, undefined, changes);
        },

        /**
         * @param {string} oldTypeQName
         * @param {string} oldPropertyQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<SubProperty>>}
         */
        delete: async (oldTypeQName="", oldPropertyQName="", changes=[]) => {
          let oldID = SubProperty.route(this.userKey, this.modelKey, this.previousReleaseKey, oldTypeQName, oldPropertyQName);

          return mappings.add(this.source.subProperties, this.userKey, this.modelKey, this.releaseKey, "delete", "SubProperty", oldID, "", undefined, changes);
        },

        /**
         * @param {string} typeQName
         * @param {string} propertyQName
         * @param {Change[]} [changes]
         * @returns {Promise<Mapping<SubProperty>>}
         */
        load: async (typeQName="", propertyQName="", changes=[]) => {
          let oldID = SubProperty.route(this.userKey, this.modelKey, this.previousReleaseKey, typeQName, propertyQName);
          let newID = SubProperty.route(this.userKey, this.modelKey, this.releaseKey, typeQName, propertyQName);

          return mappings.add(this.source.subProperties, this.userKey, this.modelKey, this.releaseKey, "load", "SubProperty", oldID, newID, undefined, changes);
        },

        /**
         * @param {Mapping.OperationType} [operation]
         * @returns {Promise<Array<Mapping<SubProperty>>>}
         */
        find: async (operation) => {
          /** @type {Mappings.CriteriaType} */
          let criteria = Object.assign({}, this.identifiers, {operation});
          criteria.className = "SubProperty";
          return mappings.find(criteria);
        }

      }


    };
  }

  get mappings() {
    return {

      /**
       * @param {Mapping.OperationType} operation
       * @param {Mapping.ClassNameType} className
       * @param {string} previousID
       * @param {string} id
       * @param {string[]} differentFields
       * @param {Change[]} changes
       */
      insert: async(operation, className, previousID, id, differentFields=undefined, changes) => {
        let dataSet = getDataSet(this.source, className);
        return this.source.mappings.add(dataSet, this.userKey, this.modelKey, this.releaseKey, operation, className, previousID, id, differentFields, changes);
      },

      /**
       * @param {Mapping.ClassNameType} className
       * @param {Object.<string, any>} oldObject
       * @param {Object.<string, any>} newObject
       * @param {string[]} ignoredFields
       * @param {Change[]} changes
       */
      calculate: (className, oldObject, newObject, ignoredFields, changes) => {
        let dataSet = getDataSet(this.source, className);
        return this.source.mappings.calculate(dataSet, className, oldObject, newObject, ignoredFields, changes);
      },

      /**
       * @param {Object} criteria
       * @param {Mapping.ClassNameType} [criteria.className]
       * @param {Mapping.OperationType} [criteria.operation]
       */
      find: async (criteria={}) => {
        criteria["userKey"] = this.userKey;
        criteria["modelKey"] = this.modelKey;
        criteria["releaseKey"] = this.releaseKey;
        return this.source.mappings.find(criteria);
      }

    }
  }

  get majorDigit() {
    if (!this.releaseKey) return;
    return Number(this.releaseKey[0]);
  }

  async dependents() {
    let namespaces = await this.namespaces.find();
    return { namespaces, count: namespaces.length };
  }

  async loadBuiltIns() {

    // Add XML schema namespace
    let xs = await this.namespaces.add("xs", "built-in", "http://www.w3.org/2001/XMLSchema");

    // Add XML schema simple types
    await xs.types.add("base64Binary", "A data type for Base64-encoded binary data.", "simple");
    await xs.types.add("boolean", "A data type for binary-valued logic (true/false).", "simple");
    await xs.types.add("byte", "A data type that is  is derived from short by setting the value of maxInclusive to be 127 and minInclusive to be -128.", "simple");
    await xs.types.add("anyURI", "anyURI represents a Uniform Resource Identifier Reference (URI).", "simple");
    await xs.types.add("double", "The double datatype is patterned after the IEEE double-precision 64-bit floating point type [IEEE 754-1985].", "simple");
    await xs.types.add("gDay", "gDay is a gregorian day that recurs, specifically a day of the month such as the 5th of the month.", "simple");
    await xs.types.add("date", "A data type for a calendar date with the format CCYY-MM-DD.", "simple");
    await xs.types.add("dateTime", "dateTime values may be viewed as objects with integer-valued year, month, day, hour and minute properties, a decimal-valued second property, and a boolean timezoned property.", "simple");
    await xs.types.add("decimal", "A data type for arbitrary precision decimal numbers.", "simple");
    await xs.types.add("duration", "A data type for a duration of time with the format PnYnMnDTnHnMnS, where nY is the number of years, nM is the number of months, nD is the number of days, nH is the number of hours, nM is the number of minutes, and nS is the number of seconds.", "simple");
    await xs.types.add("gYear", "A data type for a Gregorian calendar year with the format CCYY.", "simple");
    await xs.types.add("gYearMonth", "A data type for a specific gregorian month in a specific gregorian year.", "simple");
    await xs.types.add("float", "A data type that is patterned after the IEEE single-precision 32-bit floating point type [IEEE 754-1985]. The basic value space of float consists of the values m x 2^e, where m is an integer whose absolute value is less than 2^24, and e is an integer between -149 and 104, inclusive. In addition to the basic value space described above, the value space of float also contains the following three special values: positive and negative infinity and not-a-number (NaN).", "simple");
    await xs.types.add("gMonth", "A data type for a Gregorian month with the format --MM--.", "simple");
    await xs.types.add("gMonthDay", "A data type for a gregorian date that recurs, specifically a day of the year such as the third of May. Arbitrary recurring dates are not supported by this datatype. The value space of gMonthDay is the set of calendar dates, as defined in Section 3 of [ISO 8601]. Specifically, it is a set of one-day long, annually periodic instances.", "simple");
    await xs.types.add("language", "A data type that represents natural language identifiers as defined by by [RFC 3066].", "simple");
    await xs.types.add("hexBinary", "A data type for hex-encoded binary data.", "simple");
    await xs.types.add("int", "A data type that is  is derived from long by setting the value of maxInclusive to be 2147483647 and minInclusive to be -2147483648.", "simple");
    await xs.types.add("integer", "A data type for the standard mathematical concept of integer numbers.", "simple");
    await xs.types.add("long", "A data type that is derived from integer by setting the value of maxInclusive to be 9223372036854775807 and minInclusive to be -9223372036854775808.", "simple");
    await xs.types.add("negativeInteger", "A data type that is derived from nonPositiveInteger by setting the value of maxInclusive to be -1.", "simple");
    await xs.types.add("nonNegativeInteger", "A data type for an integer with a minimum value of 0.", "simple");
    await xs.types.add("nonPositiveInteger", "A data type for a lexical representation consisting of an optional preceding sign followed by a finite-length sequence of decimal digits.", "simple");
    await xs.types.add("normalizedString", "A data type that represents white space normalized strings. The value space of normalizedString is the set of strings that do not contain the carriage return, line feed nor tab characters.", "simple");
    await xs.types.add("token", "A data type for tokenized strings.", "simple");
    await xs.types.add("positiveInteger", "positiveInteger is derived from nonNegativeInteger by setting the value of minInclusive to be 1.", "simple");
    await xs.types.add("short", "A data type that is derived from int by setting the value of maxInclusive to be 32767 and minInclusive to be -32768.", "simple");
    await xs.types.add("time", "A data type for an instant of time with the format hh:mm:ss.sss.", "simple");
    await xs.types.add("string", "A data type for character strings in XML.", "simple");
    await xs.types.add("unsignedByte", "A data type that is derived from unsignedShort by setting the value of maxInclusive to be 255.", "simple");
    await xs.types.add("unsignedInt", "A data type that is derived from unsignedLong by setting the value of maxInclusive to be 4294967295.", "simple");
    await xs.types.add("unsignedLong", "A data type that is derived from nonNegativeInteger by setting the value of maxInclusive to be 18446744073709551615.", "simple");
    await xs.types.add("unsignedShort", "A data type that is derived from unsignedInt by setting the value of maxInclusive to be 65535.", "simple");

    // Add XML namespace
    let xml = await this.namespaces.add("xml", "built-in", "");

    // Add attribute xml:lang
    await xml.properties.add("lang", "A human language used in the scope of the element to which it's attached.", undefined, undefined, false);

  }

  async loadUtilities() {

    let structures = await this.namespaces.add("structures", "utility", "", "structures", "");

    await structures.types.add("ObjectType", undefined, "object");
    await structures.types.add("AssociationType", "", "augmentation");
    await structures.types.add("AugmentationType", undefined, "augmentation");

  }

  get modelKey() {
    return this.model.modelKey;
  }

  get userKey() {
    return this.model.userKey;
  }

  get identifiers() {
    return {
      ...this.model.identifiers,
      releaseKey: this.releaseKey
    };
  }

  /**
   * @param {string} userKey
   * @param {string} modelKey
   * @param {string} releaseKey
   */
  static identifiers(userKey, modelKey, releaseKey) {
    return {userKey, modelKey, releaseKey};
  }

  /**
   * @example "niem model 4.0"
   * @example "lapd arrestReport 1.0"
   */
  get label() {
    return this.model.label + " " + this.releaseKey;
  }

  /**
   * @param {string} userKey
   * @param {string} modelKey
   * @param {string} releaseKey
   */
  static route(userKey, modelKey, releaseKey) {
    let Model = require("../model/index");
    return Model.route(userKey, modelKey) + "/" + releaseKey;
  }

  get route() {
    return Release.route(this.userKey, this.modelKey, this.releaseKey);
  }

  get modelRoute() {
    return this.model.route;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      releaseKey: this.releaseKey,
      niemReleaseKey: this.niemReleaseKey,
      version: this.version,
      baseURI: this.baseURI,
      branch: this.branch,
      description: this.description
    };
  }

}

/**
 * @param {import("../interfaces/source/interface")} source
 * @param {Mapping.ClassNameType} className
 */
function getDataSet(source, className) {
  switch (className) {
    case "Namespace":
      return source.namespaces;
    case "LocalTerm":
      return source.localTerms;
    case "Property":
      return source.properties;
    case "Type":
      return source.types;
    case "Facet":
      return source.facets;
    case "SubProperty":
      return source.subProperties;
  }

}

/**
 * @typedef {"draft"|"published"} StatusType
 * @type {StatusType}
 */
Release.ReleaseStatusType;

Release.Statuses = ["draft", "published"];

/**
 * Search criteria for release find operations.
 *
 * @typedef {object} CriteriaType
 * @property {string} [userKey]
 * @property {string} [modelKey]
 * @property {string} [releaseKey]
 * @property {string} [niemReleaseKey]
 * @property {"draft"|"published"}  [status]
 */
/**
 * @type {CriteriaType}
 */
Release.ReleaseCriteriaType = {};

/**
 * @typedef {object} IdentifiersType
 * @property {string} userKey
 * @property {string} modelKey
 * @property {string} releaseKey
 */
/**
 * @type {IdentifiersType}
 */
Release.ReleaseIdentifiersType;

module.exports = Release;

let Component = require("../component/index");
let Change = require("../interfaces/source/change/index");
let Mapping = require("../interfaces/source/mapping/index");
let Mappings = require("../interfaces/source/mappings/index");
