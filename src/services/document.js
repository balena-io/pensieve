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

export const updateFragment = (hash, yaml) => {
  const update = jsyaml.load(yaml);
  const updateTitle = Object.keys(update)[0];
  innerJson = _.reduce(
    innerJson,
    (result, value, key) => {
      if (value.getHash() === hash) {
        result[updateTitle] = new Fragment(updateTitle, update[updateTitle]);
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

export const addFragment = (yaml) => {
  const update = _.mapValues(jsyaml.load(yaml), (value, key) => new Fragment(key, value));
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
