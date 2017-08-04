const _ = require('lodash');

const stringTest = (item, input) => {
  const { name, operator, value } = input;
  const target = item[name];

  if (operator === 'is') {
    return target && target === value;
  }

  if (operator === 'contains') {
    return target && target.includes(value);
  }
  if (operator === 'does not contain') {
    return !target || !target.includes(value);
  }

  throw new Error(`${operator} is not a valid operator for string types`);
}

const filterTests = {
  string: stringTest
};

class Filter {
  constructor(tests = {}) {
    this.tests = _.assign(
      _.cloneDeep(filterTests),
      tests
    );
  }

  baseTest(item, input) {
      const { type } = input;
      if (type in filterTests) {
        return filterTests[type](item, input);
      }
      throw new Error(`There is no filter test for type ${type}`);
  }

  testArray(collection, input) {

    return collection.filter((item) => {
      return this.baseTest(item, input);
    });
  }

  testObject(collection, input) {
    const result = _.pickBy(collection, (value) => {
      return this.baseTest(value, input);
    });

    return result;
  }

  getOperators(type) {
    if (type === 'string') {
      return ['contains', 'does not contain', 'is']
    }
  }


  makeFilterInputs(schema) {
    const inputs = {};

    _.forEach(schema, (value, key) => {
      inputs[key] = {
        type: value.type,
        name: key,
        availableOperators: this.getOperators(value.type),
        operator: null,
        value: null,
      };
    });

    return inputs;
  }


}

module.exports = (tests) => new Filter(tests);
