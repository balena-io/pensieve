process.version = '1.0.0';
const _ = require('lodash');
const jsyaml = require('js-yaml');
const showdown = require('showdown');
const Ractive = require('ractive');
const createHistory = require('history').createBrowserHistory;
const qs = require('qs');
const GitHub = require('github-api')

const history = createHistory();

const schema = require('./schema');
const Tamis = require('./filter');

const SOURCE_FILE = 'scratchpad.yaml';

const t = Tamis();

let converter = new showdown.Converter()

let masterSource;
let editor;

const randomString = (length = 16) => {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const makeNameClass = (name) =>
  name ? ` ${name.replace(/\s+/g, '_').toLowerCase()}` : ``;

let json2html = (data, name) => {
  let nameClass = makeNameClass(name);

  if(_.isPlainObject(data)){
    return `<ul class='_object${nameClass}'>
      ${_.map(data, (e,k) => `
        <li class="${makeNameClass(k)}">
          <span class="doc-label">${k}:</span>
          ${json2html(e,k)}
        </li>
      `).join('')}
    </ul>`
  } else if (_.isArray(data)) {
    return `<ol class='_array${nameClass}'>
      ${data.map((e,k) => `
        <li class="${k}">
          ${json2html(e)}
        </li>
      `).join('')}
    </ol>`
  } else if (_.isNumber(data)) {
    return `<span class='_number${nameClass}'>${data}</span>`
  } else if (_.isString(data)) {
    if (name === 'Versions Affected') {
      return `<span class='_string${nameClass}'>${converter.makeHtml('`' + data + '`')}</span>`
    } else {
      return `<span class='_string${nameClass}'>${converter.makeHtml(data)}</span>`
    }
  } else if (_.isBoolean(data)) {
    return `<span class='_boolean${nameClass}'>${data}</span>`
  } else if (_.isNull(data)) {
    return `<span class='_null${nameClass}'></span>`
  } else {
    return data
  }
}

const render = (source) => {
  const result = json2html(source)
  document.getElementById('target').innerHTML = result;
}

const filterUI = new Ractive({
  target: '#filters',
  template: require('./filter.tpl.html'),
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

  newInput.hash = randomString();

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

      newInput.hash = randomString();

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

window.gh = gh;
