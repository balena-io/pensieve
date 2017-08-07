const _ = require('lodash');
const moment = require('moment');

const filterTests = {
  string: {
    'is': (target, value) => target === value,
    'contains': (target, value) => target && target.includes(value),
    'does not contain': (target, value) => !target || !target.includes(value),
  },
  number: {
    'equals': (target, value) => _.isNumber(target) && target === value,
    'more than': (target, value) => _.isNumber(target) && target > value,
    'less than': (target, value) => _.isNumber(target) && target < value,
  },
  boolean: {
    'is true': (target) => !!target,
    'is false': (target) => !target,
  },
  /**
    Date types use momentjs for comparison, so the input and target value
    should be in one of the following forms:
    - ISO 8601
    - Unix timestamp (seconds or milliseconds)
    - JS Date object
    See https://momentjs.com/docs/#/parsing/ for more information
  */
  date: {
    'is': (target, value) => {
      return target && moment(target).isSame(value);
    },
    'is before': (target, value) => {
      return target && moment(target).isBefore(value);
    },
    'is after': (target, value) => {
      return target && moment(target).isAfter(value);
    },
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

  filter(collection, input) {
    if (_.isObject(collection)) {
      return this.filterObject(collection, input);
    }
    if (_.isArray(collection)) {
      return this.filterArray(collection, input);
    }

    throw new Error(`collection argument must be either object or array.`);
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
