const _ = require('lodash');

const filterTests = {
  string: {
    'is': (target, value) => target && target === value,
    'contains': (target, value) => target && target.includes(value),
    'does not contain': (target, value) => !target || !target.includes(value),
  }
};

class Tamis {
  constructor(tests = {}) {
    this.tests = _.assign(
      _.cloneDeep(filterTests),
      tests
    );
  }

  baseTest(item, input) {
      const { type } = input;
      if (type in filterTests) {
        const { name, operator, value } = input;
        const target = item[name];

        if (operator in filterTests[type]) {
          return filterTests[type][operator](target, value);
        }

        throw new Error(`${operator} is not a valid operator for ${type} types`);
      }
      throw new Error(`There is no filter test for type ${type}`);
  }

  filterArray(collection, input) {
    return collection.filter((item) => {
      return this.baseTest(item, input);
    });
  }

  filterObject(collection, input) {
    return _.pickBy(collection, (value) => {
      return this.baseTest(value, input);
    });
  }

  getOperators(type) {
    if (type in filterTests) {
      return Object.keys(filterTests[type]);
    } else {
      return [];
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

module.exports = (tests) => new Tamis(tests);
