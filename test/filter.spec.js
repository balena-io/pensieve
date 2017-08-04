const { expect } = require('chai');
const _ = require('lodash');
const jsyaml = require('js-yaml');
const fs = require('fs');
const FilterFactory = require('../src/filter');
const schema = require('../src/schema');
const rawYaml = fs.readFileSync('./scratchpad.yaml', 'utf8');
const source = jsyaml.load(rawYaml);

describe('resin-filter', () => {
  describe('.testObject()', () => {

    it('should correctly test string values using the "contains" operator', () => {
      const filter = FilterFactory();
      const collection = source.Scratchpad;
      const inputs = filter.makeFilterInputs(schema)
      const input = inputs['Signs and Symptoms'];

      // Set the 'contains' operator
      input.operator = input.availableOperators[0];
      // Set a value
      input.value = 'windows';

      expect(filter.testObject(collection, input)).to.have.all.keys('Issues with Line Endings');
    });

    it('should correctly test string values using the "does not contain" operator', () => {
      const filter = FilterFactory();
      const collection = source.Scratchpad;
      const inputs = filter.makeFilterInputs(schema)
      const input = inputs['Signs and Symptoms'];

      // Set the 'does not contain' operator
      input.operator = input.availableOperators[1];
      // Set a value
      input.value = 'windows';

      expect(filter.testObject(collection, input)).to.not.have.all.keys('Issues with Line Endings');
      expect(filter.testObject(collection, input)).to.have.all.keys(
        "Docker won't start",
        "Bluetooth not working"
      );
    });
  });

  describe('.testArray()', () => {
    it('should correctly test string values using the "contains" operator', () => {
      const filter = FilterFactory();
      const collection = _.map(source.Scratchpad, (value, key) =>
        _.assign(_.cloneDeep(value), { key }));

      const inputs = filter.makeFilterInputs(schema)
      const input = inputs['Signs and Symptoms'];

      // Set the 'contains' operator
      input.operator = input.availableOperators[0];
      // Set a value
      input.value = 'windows';

      expect(filter.testArray(collection, input)).to.have.length(1);
      expect(filter.testArray(collection, input)[0].key).to.equal('Issues with Line Endings');
    });

    it('should correctly test string values using the "does not contain" operator', () => {
      const filter = FilterFactory();
      const collection = _.map(source.Scratchpad, (value, key) =>
        _.assign(_.cloneDeep(value), { key }));

      const inputs = filter.makeFilterInputs(schema)
      const input = inputs['Signs and Symptoms'];

      // Set the 'does not contain' operator
      input.operator = input.availableOperators[1];
      // Set a value
      input.value = 'windows';

      expect(filter.testArray(collection, input)).to.have.length(2);
      expect(filter.testArray(collection, input).map(x => x.key)).to.eql([
        "Docker won't start",
        "Bluetooth not working"
      ]);
    });
  });
});
