
function testFacet() {

  let { Model, Release, Facet } = require("../../index");

  describe("Facet", () => {

    let model = new Model(null, "user", "test");
    let release = new Release(model, "1.0");

    test("enum route", () => {
      let facet = new Facet(release, "nc:HairColorCodeSimpleType", "BLK", "black");
      expect(facet.route).toBe(release.route + "/types/nc:HairColorCodeSimpleType/facets/enumeration/BLK");
      expect(facet.kind).toBe("enumeration");
    });

    test("pattern route", () => {
      let facet = new Facet(release, "nc:ORICodeSimpleType", "\d{9}", "9 digit code", "pattern");
      // TODO: escape special characters in patterns
      expect(facet.route).toBe(release.route + "/types/nc:ORICodeSimpleType/facets/pattern/\d{9}");
      expect(facet.kind).toBe("pattern");

    });

    test("prefix", () => {
      let facet = new Facet(release, "ext:IDCodeSimpleType");
      expect(facet.typePrefix).toBe("ext");

      facet = new Facet(release, "IDCodeSimpleType");
      expect(facet.typePrefix).toBe("");

      facet = new Facet(release, null);
      expect(facet.typePrefix).toBe("");
    });

  });

}

module.exports = testFacet;