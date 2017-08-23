import _ from 'lodash';
import util from '../util';

const jsyaml = require('js-yaml');

let innerSource = null;
let innerConfig = null;
let innerJson = null;

class Fragment {
  constructor(title, content) {
    const hash = util.randomString();

    _.forEach(content, (value, key) => {
      this[key] = value;
    });

    this.getHash = () => hash;
    this.getTitle = () => title;
  }
}

export const setConfig = (config) => {
  innerConfig = config;
};

export const setSource = (source) => {
  innerSource = source;
};

export const getJSON = () => {
  if (innerJson) {
    return innerJson;
  }
  let json = jsyaml.load(innerSource);
  if (innerConfig.contentPath) {
    json = _.get(json, innerConfig.contentPath);
  }
  json = _.mapValues(json, (value, key) => new Fragment(key, value));

  innerJson = json;

  return json;
};

export const updateFragment = (hash, title, content) => {
  innerJson = _.reduce(
    innerJson,
    (result, value, key) => {
      if (value.getHash() === hash) {
        result[title] = new Fragment(title, content);
      } else {
        result[key] = value;
      }
      return result;
    },
    {},
  );

  let cleanJson = _.mapValues(innerJson, value =>
    _.pickBy(_.mapValues(value, x => (_.isDate(x) ? x.toString() : x)), _.negate(_.isFunction)),
  );

  if (innerConfig.contentPath) {
    const sourceJson = jsyaml.load(innerSource);
    _.set(sourceJson, innerConfig.contentPath, cleanJson);
    cleanJson = sourceJson;
  }

  innerSource = jsyaml.safeDump(cleanJson);
};

export const deleteFragment = (hash) => {
  innerJson = _.reduce(
    innerJson,
    (result, value, key) => {
      if (value.getHash() !== hash) {
        result[key] = value;
      }
      return result;
    },
    {},
  );

  let cleanJson = _.mapValues(innerJson, value =>
    _.pickBy(_.mapValues(value, x => (_.isDate(x) ? x.toString() : x)), _.negate(_.isFunction)),
  );

  if (innerConfig.contentPath) {
    const sourceJson = jsyaml.load(innerSource);
    _.set(sourceJson, innerConfig.contentPath, cleanJson);
    cleanJson = sourceJson;
  }

  innerSource = jsyaml.safeDump(cleanJson);
};

export const addFragment = (title, content) => {
  const update = {};
  update[title] = new Fragment(title, content);
  _.assign(innerJson, update);

  let cleanJson = _.mapValues(innerJson, value =>
    _.pickBy(_.mapValues(value, x => (_.isDate(x) ? x.toString() : x)), _.negate(_.isFunction)),
  );

  if (innerConfig.contentPath) {
    const sourceJson = jsyaml.load(innerSource);
    _.set(sourceJson, innerConfig.contentPath, cleanJson);
    cleanJson = sourceJson;
  }

  innerSource = jsyaml.safeDump(cleanJson);
};

export const getSource = () => innerSource;
