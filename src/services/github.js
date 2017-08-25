import GitHub from 'github-api';
import Promise from 'bluebird';
import _ from 'lodash';
import jsyaml from 'js-yaml';
import events from './events';
import store from '../store';

let gh;
let repo;

export const login = (loginData) => {
  if (gh) {
    return Promise.resolve();
  }

  const innerGH = new GitHub(loginData);

  return Promise.resolve(
    innerGH.getUser().getProfile().then(({ data }) => {
      store.dispatch({ type: 'SET_USER', value: data });
      // If this was successful assign the gh variable
      gh = innerGH;
    }),
  );
};

export const getFile = ({ account, name, ref, file }) => {
  repo = gh.getRepo(account, name);
  return Promise.resolve(repo.getContents(ref, file).then(({ data }) => atob(data.content)));
};

export const loadSchema = (config) => {
  if (_.isObject(config.schema)) {
    return Promise.resolve(config.schema);
  }

  if (_.isString(config.schema)) {
    return getFile({
      account: config.repo.account,
      name: config.repo.name,
      ref: config.repo.ref,
      file: config.schema,
    }).then((rawSchema) => {
      const ext = config.schema.split('.').pop();
      if (ext === 'yaml') {
        return jsyaml.load(rawSchema);
      }
      if (ext === 'json') {
        return JSON.parse(rawSchema);
      }

      throw new Error(`${ext} is not a valid schema file type`);
    });
  }

  throw new Error('No schema provided');
};

export const commit = ({ message, content }) => {
  const { config } = store.getState();
  if (!message) {
    message = `Edited ${config.repo.file} using Pensieve`;
  }

  return Promise.resolve(
    repo
      .writeFile(config.repo.ref, config.repo.file, content, message, {
        encode: true,
      })
      .then(() => {
        events.emit('commit');
      }),
  );
};

export const commitSchema = ({ message, content }) => {
  message = `Edited schema file using Pensieve\n\n${message}`;

  const { config } = store.getState();

  if (!_.isString(config.schema)) {
    throw new Error('Expected schema path to be a string');
  }

  return Promise.resolve(
    repo
      .writeFile(config.repo.ref, config.schema, content, message, {
        encode: true,
      })
      .then(() => {
        events.emit('commit');
      }),
  );
};

export const commitViews = (views) => {
  const message = 'Views edited using Pensieve';

  const yaml = jsyaml.safeDump(views);

  const { config } = store.getState();

  return Promise.resolve(
    repo
      .writeFile(config.repo.ref, 'views.yaml', yaml, message, {
        encode: true,
      })
      .then(() => {
        events.emit('commit');
      }),
  );
};