import _ from 'lodash';
import util from '../util';

const jsyaml = require('js-yaml');

let _source = null;
let _config = null;
let _json = null;

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
  _config = config;
};

export const setSource = (source) => {
  _source = source;
};

export const getJSON = () => {
  if (_json) {
    return _json;
  }
  let json = jsyaml.load(_source);
  if (_config.contentPath) {
    json = _.get(json, _config.contentPath);
  }
  json = _.mapValues(json, (value, key) => new Fragment(key, value));

  _json = json;

  return json;
};

export const updateFragment = (hash, yaml) => {
  const update = jsyaml.load(yaml);
  const updateTitle = Object.keys(update)[0];
  _json = _.reduce(
    _json,
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

  let cleanJson = _.mapValues(_json, (value, key) =>
    _.pickBy(_.mapValues(value, x => (_.isDate(x) ? x.toString() : x)), _.negate(_.isFunction)),
  );

  if (_config.contentPath) {
    const sourceJson = jsyaml.load(_source);
    _.set(sourceJson, _config.contentPath, cleanJson);
    cleanJson = sourceJson;

    console.log(cleanJson);
  }

  _source = jsyaml.safeDump(cleanJson);
};

export const getSource = () => _source;
