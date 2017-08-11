import GitHub from 'github-api';
import Promise from 'bluebird';
import _ from 'lodash';
import events from './events';

let gh;
let repo;
let _config;

export const setConfig = (config) => {
  _config = _.cloneDeep(config);
};

export const login = (username, password) => {
  if (gh) {
    return Promise.resolve();
  }

  const innerGH = new GitHub({ username, password });

  return Promise.resolve(
    innerGH.getUser().getProfile().then(({ data }) => {
      // If this was successful assign the gh variable
      gh = innerGH;
      console.log('SUCCESS');
    }),
  );
};

export const getFile = ({ account, name, ref, file }) => {
  console.log('GETTING FILE');
  repo = gh.getRepo(account, name);
  return Promise.resolve(repo.getContents(ref, file).then(({ data }) => atob(data.content)));
};

export const commit = ({ message, content }) => {
  if (!message) {
    message = `Edited ${_config.file} using Pensieve`;
  }

  return Promise.resolve(
    repo
      .writeFile(_config.ref, _config.file, content, message, {
        encode: true,
      })
      .then(() => {
        events.emit('commit');
      }),
  );
};
