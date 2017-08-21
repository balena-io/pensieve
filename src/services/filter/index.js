/* eslint class-methods-use-this: 0 */
const _ = require('lodash');

const filterTests = require('./types');

class SchemaSieve {
  constructor(tests = {}) {
    this.tests = _.assign(_.cloneDeep(filterTests), tests);
  }

  baseTest(item, input) {
    const { type } = input;
    if (type in filterTests) {
      const { name, operator, value } = input;
      const target = item[name];

      if (operator in filterTests[type].rules) {
        return filterTests[type].rules[operator](target, value);
      }

      throw new Error(`${operator} is not a valid operator for ${type} types`);
    }
    throw new Error(`There is no filter test for type ${type}`);
  }

  filter(collection, input) {
    if (_.isObject(collection)) {
      return this.filterObject(collection, input);
    }
    if (_.isArray(collection)) {
      return this.filterArray(collection, input);
    }

    throw new Error('collection argument must be either object or array.');
  }

  filterArray(collection, input) {
    return collection.filter(item => this.baseTest(item, input));
  }

  filterObject(collection, input) {
    return _.pickBy(collection, value => this.baseTest(value, input));
  }

  getOperators(type) {
    if (type in filterTests) {
      return Object.keys(filterTests[type].rules);
    }
    return [];
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

  validate(type, value) {
    // If the type is unknown just return true
    if (!(type in filterTests)) {
      return true;
    }

    return filterTests[type].validate(value);
  }
}

module.exports = tests => new SchemaSieve(tests);
