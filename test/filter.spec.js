const { expect } = require('chai');
const _ = require('lodash');
const jsyaml = require('js-yaml');
const fs = require('fs');
const Tamis = require('../src/filter');
const schema = require('../src/schema');
const rawYaml = fs.readFileSync('./scratchpad.yaml', 'utf8');
const source = jsyaml.load(rawYaml);

describe('resin-filter', () => {
  describe('.filterObject()', () => {

    it('should correctly test string values using the "contains" operator', () => {
      const t = Tamis();
      const collection = source.Scratchpad;
      const inputs = t.makeFilterInputs(schema)
      const input = inputs['Signs and Symptoms'];

      // Set the 'contains' operator
      input.operator = 'contains';
      // Set a value
      input.value = 'windows';

      expect(t.filterObject(collection, input)).to.have.all.keys('Issues with Line Endings');
    });

    it('should correctly test string values using the "does not contain" operator', () => {
      const t = Tamis();
      const collection = source.Scratchpad;
      const inputs = t.makeFilterInputs(schema)
      const input = inputs['Signs and Symptoms'];

      // Set the 'does not contain' operator
      input.operator = 'does not contain';
      // Set a value
      input.value = 'windows';

      expect(t.filterObject(collection, input)).to.not.have.all.keys('Issues with Line Endings');
      expect(t.filterObject(collection, input)).to.have.all.keys(
        "Docker won't start",
        "Bluetooth not working"
      );
    });
  });

  describe('.filterArray()', () => {
    it('should correctly test string values using the "contains" operator', () => {
      const t = Tamis();
      const collection = _.map(source.Scratchpad, (value, key) =>
        _.assign(_.cloneDeep(value), { key }));

      const inputs = t.makeFilterInputs(schema)
      const input = inputs['Signs and Symptoms'];

      // Set the 'contains' operator
      input.operator = 'contains';
      // Set a value
      input.value = 'windows';

      expect(t.filterArray(collection, input)).to.have.length(1);
      expect(t.filterArray(collection, input)[0].key).to.equal('Issues with Line Endings');
    });

    it('should correctly test string values using the "does not contain" operator', () => {
      const t = Tamis();
      const collection = _.map(source.Scratchpad, (value, key) =>
        _.assign(_.cloneDeep(value), { key }));

      const inputs = t.makeFilterInputs(schema)
      const input = inputs['Signs and Symptoms'];

      // Set the 'does not contain' operator
      input.operator = 'does not contain';
      // Set a value
      input.value = 'windows';

      expect(t.filterArray(collection, input)).to.have.length(2);
      expect(t.filterArray(collection, input).map(x => x.key)).to.eql([
        "Docker won't start",
        "Bluetooth not working"
      ]);
    });
  });
});
