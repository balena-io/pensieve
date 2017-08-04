const _ = require('lodash');
const jsyaml = require('js-yaml');
const showdown = require('showdown');
const Ractive = require('ractive');

const schema = require('./schema');
const FilterFactory = require('./filter');

const filter = FilterFactory();

let converter = new showdown.Converter()

let masterSource;

let makeNameClass = (name) =>
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
    return `<span class='_string${nameClass}'>${converter.makeHtml(data)}</span>`
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
    inputs: filter.makeFilterInputs(schema),
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

  this.push('activeInputs', newInput);

  filterAndRender(this.get('activeInputs'));
});

filterUI.on('removeInput', function(event, input) {
  event.original.preventDefault();
  this.set('activeInputs', this.get('activeInputs').filter((a) => a.name !== input.name));

  filterAndRender(this.get('activeInputs'));
});

const filterAndRender = (inputs) => {
  let src = _.cloneDeep(masterSource);
  inputs.forEach((input) => {
    src = filter.testObject(src, input);
  });

  render(src);
};

fetch('scratchpad.yaml').then(res => res.text()).then((rawYaml) => {
  const source = jsyaml.load(rawYaml).Scratchpad;
  masterSource = source;
  filterUI.set('source', source);
  render(source);
})

