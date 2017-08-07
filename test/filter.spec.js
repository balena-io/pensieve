const { expect } = require('chai');
const _ = require('lodash');
const jsyaml = require('js-yaml');
const fs = require('fs');
const Tamis = require('../src/filter');
const schema = require('./resources/schema');
const rawYaml = fs.readFileSync('./test/resources/test.yaml', 'utf8');
const source = jsyaml.load(rawYaml);

describe('resin-filter', () => {
  describe('.filter()', () => {
    describe('string types', () => {
      it('should correctly test values using the "is" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['GitHub issue'];

        input.operator = 'is';
        // Set a value
        input.value = 'https://github.com/resin-io/hq/issues/784';

        expect(t.filter(collection, input)).to.have.all.keys("Docker won't start");
      });

      it('should correctly test values using the "contains" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Signs and Symptoms'];

        // Set the 'contains' operator
        input.operator = 'contains';
        // Set a value
        input.value = 'windows';

        expect(t.filter(collection, input)).to.have.all.keys('Issues with Line Endings');
      });

      it('should correctly test values using the "does not contain" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Signs and Symptoms'];

        // Set the 'does not contain' operator
        input.operator = 'does not contain';
        // Set a value
        input.value = 'windows';

        expect(t.filter(collection, input)).to.not.have.all.keys('Issues with Line Endings');
      });
    });

    describe('number types', () => {
      it('should correctly test values using the "equals" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Fix Difficulty'];

        input.operator = 'equals';
        // Set a value
        input.value = 4;

        expect(t.filter(collection, input)).to.have.all.keys('Issues with Line Endings');
        expect(t.filter(collection, input)).to.not.have.all.keys(
          "Docker won't start",
          "Bluetooth not working"
        );
      });

      it('should correctly test values using the "more than" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Fix Difficulty'];

        input.operator = 'more than';
        // Set a value
        input.value = 3;

        expect(t.filter(collection, input)).to.have.all.keys('Issues with Line Endings');
        expect(t.filter(collection, input)).to.not.have.all.keys(
          "Docker won't start",
          "Bluetooth not working"
        );
      });

      it('should correctly test values using the "less than" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Fix Difficulty'];

        input.operator = 'less than';
        // Set a value
        input.value = 3;

        expect(t.filter(collection, input)).to.have.all.keys(
          "Docker won't start",
          "Bluetooth not working"
        );
        expect(t.filter(collection, input)).to.not.have.all.keys('Issues with Line Endings');
      });
    });

    describe('boolean types', () => {
      it('should correctly test values using the "is true" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Pull Leech Logs'];

        input.operator = 'is true';

        expect(t.filter(collection, input)).to.have.all.keys('Bluetooth not working');
      });

      it('should correctly test values using the "is false" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Pull Leech Logs'];

        input.operator = 'is false';

        expect(t.filter(collection, input)).to.have.all.keys(
          "Docker won't start",
          "Issues with Line Endings"
        );
      });
    });

    describe('date types', () => {
      it('should correctly test values using the "is" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Last Updated'];

        input.operator = 'is';
        input.value = '2017-05-02T00:00:00.000Z';

        expect(t.filter(collection, input)).to.have.all.keys('Bluetooth not working');
      });

      it('should correctly test values using the "is before" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Last Updated'];

        input.operator = 'is before';
        input.value = '2016-12-25T00:00:00.000Z';

        expect(t.filter(collection, input)).to.have.all.keys('Issues with Line Endings');
      });

      it('should correctly test values using the "is after" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Last Updated'];

        input.operator = 'is after';
        input.value = '2016-12-25T00:00:00.000Z';

        expect(t.filter(collection, input)).to.have.all.keys(
          "Docker won't start",
          'Bluetooth not working'
        );
      });
    });

    describe('semver-range types', () => {
      it('should correctly test values using the "contains" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Versions Affected'];

        input.operator = 'contains';
        input.value = 'Resin OS 2.0.5';

        expect(t.filter(collection, input)).to.have.all.keys(
          'Bluetooth not working',
          'Issues with Line Endings'
        );
      });

      it('should correctly test values using the "does not contain" operator', () => {
        const t = Tamis();
        const collection = source;
        const inputs = t.makeFilterInputs(schema)
        const input = inputs['Versions Affected'];

        input.operator = 'does not contain';
        input.value = 'Resin OS 1.24.0';

        expect(t.filter(collection, input)).to.have.all.keys('Bluetooth not working');
      });
    });
  });
});
