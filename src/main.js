const _ = require('lodash');
const jsyaml = require('js-yaml');
const Ractive = require('ractive');
const createHistory = require('history').createBrowserHistory;
const qs = require('qs');
const GitHub = require('github-api')

const util = require('./util');
const Tamis = require('./filter');
const history = createHistory();
const mainTpl = require('./templates/main.tpl.html');

// Load deps
const dependencyPromise = Promise.all([
  util.loadStyle('https://cdnjs.cloudflare.com/ajax/libs/Primer/9.2.0/build.css'),
  util.loadStyle('../styles/github-markdown.css'),
  util.loadStyle('../styles/main.css'),
  util.loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js')
])
.then(() => console.log('LOADED DEPS'));

const init = (config) => {
  document.getElementById(config.container).innerHTML = mainTpl;

  const schema = config.schema;

  const SOURCE_FILE = 'scratchpad.yaml';

  const t = Tamis();
  let masterSource;
  let editor;

  const render = (source) => {
    const result = util.json2html(source)
    document.getElementById('target').innerHTML = result;
  }

  const filterUI = new Ractive({
    target: '#filters',
    template: require('./templates/filter.tpl.html'),
    data: {
      inputs: t.makeFilterInputs(schema),
      activeInputs: [],
      currentFilter: {},
      filterFormOperators: [],
      filterFormType: '',
    },
    observe: {
      'currentFilter.name': {
        handler(value) {
          const input = this.get('inputs')[value];
          this.set('filterFormOperators', input ? input.availableOperators : []);
          this.set('filterFormType', input ? input.type : '');
        },
        init: true
      }
    },
  });

  filterUI.on('addFilter', function(event) {
    event.original.preventDefault();

    const currentFilter = this.get('currentFilter');
    const srcFilter = this.get('inputs')[currentFilter.name];
    const newInput = _.assign(_.cloneDeep(srcFilter), currentFilter);

    this.set({
      'showFilterForm': false,
      'currentFilter': {},
    });

    newInput.hash = util.randomString();

    this.push('activeInputs', newInput);

    filterAndRender(this.get('activeInputs'));
  });

  filterUI.on('updateFilter', function(event) {
    event.original.preventDefault();

    const currentFilter = this.get('currentFilter');

    const inputs = this.get('activeInputs').map((item) => {
      if (item.hash === currentFilter.hash) {
        return currentFilter;
      } else {
        return item;
      }
    });

    this.set({
      'activeInputs': inputs,
      'showFilterForm': false,
      'currentFilter': {},
    });

    filterAndRender(inputs);
  });

  filterUI.on('removeInput', function(event, input) {
    event.original.preventDefault();
    this.set('activeInputs', this.get('activeInputs').filter((a) => a.hash !== input.hash));

    filterAndRender(this.get('activeInputs'));
  });

  filterUI.on('editInput', function(event, input) {
    event.original.preventDefault();
    this.set({
      'showFilterForm': true,
      'currentFilter': input
    });
  });

  const filterAndRender = (inputs) => {
    let src = _.cloneDeep(masterSource);
    inputs.forEach((input) => {
      src = t.filter(src, input);
    });

    const { pathname } = history.location;
    history.push({
      pathname,
      search: qs.stringify(inputs.map(({ name, operator, value }) => ({
        n: name,
        o: operator,
        v: value,
      }))),
    });

    render(src);
  };

  let username = localStorage.getItem('gh-username');
  let password = localStorage.getItem('gh-password');

  if (!username) {
    username = window.prompt('username');
    localStorage.setItem('gh-username', username);
  }

  if (!password) {
    password = window.prompt('password');
    localStorage.setItem('gh-password', password);
  }

  // auth
  const gh = new GitHub({
    username,
    password
  });

  const user = gh.getUser(); // no user specified defaults to the user for whom credentials were provided

  user.getProfile().then(({ data }) => {
    console.log(data);
  });

  const repo = gh.getRepo('resin-io', 'scratchpad')

  console.log(repo);

  repo.getDetails().then((resp) => {
    console.log('DETAILS', resp);
  });

  repo.getContents('master', SOURCE_FILE)
  .then(({ data }) => {
    const rawYaml = atob(data.content);
    const source = jsyaml.load(rawYaml).Scratchpad;
    masterSource = source;

    filterUI.set('source', source);

    if (history.location.search) {
      const parsed = qs.parse(history.location.search.replace(/^\?/, ''));
      const inputs = _.map(parsed, (input) => {
        const filter = {
          name: input.n,
          operator: input.o,
          value: input.v
        };

        const srcFilter = filterUI.get('inputs')[filter.name];
        const newInput = _.assign(_.cloneDeep(srcFilter), filter);

        newInput.hash = util.randomString();

        return newInput;
      });

      filterUI.set('activeInputs', inputs);
      filterAndRender(inputs);
    } else {
      render(source);
    }

    // setup editor
    document.getElementById('editor').innerHTML = rawYaml;
    editor = ace.edit('editor');
  });

  document.getElementById('edit-link').addEventListener('click', function() {
    document.getElementById('target').style.display = 'none';
    document.getElementById('filters').style.display = 'none';
    document.getElementById('edit-link').style.display = 'none';
    document.getElementById('save-link').style.display = 'block';
    document.getElementById('editor').style.display = 'block';
  }, false);

  document.getElementById('save-link').addEventListener('click', function() {
    const content = editor.getValue();
    const commitMessage = window.prompt('Please provide a commit message');

    if (!commitMessage) {
      return;
    }

    repo.writeFile('master', SOURCE_FILE, content, commitMessage, {
      encode: true
    })
    .then((resp) => {
      console.log('WRITE RESPONSE', resp);
      window.location.reload();
    });
  });
};

// Setup cross platform support for exposing the module
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    define(function() {
      return (root.Pasteur = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    if (process.browser) {
      window.Pasteur = factory();
    } else {
      module.exports = (root.Pasteur = factory());
    }
  } else {
    root.Pasteur = factory();
  }
}(this, function() {
  return (config) =>
    dependencyPromise.then(() =>
      init(config));
}));
