const _ = require('lodash');
const jsyaml = require('js-yaml');
const showdown = require('showdown');

let converter = new showdown.Converter()

let json2html = (data, name) => {
  //return JSON.stringify(data, null, 2)
  let nameClass = name ? ` ${name}` : ``

  if(_.isPlainObject(data)){
    return `<ul class='_object${nameClass}'>
      ${_.map(data, (e,k) => `
        <li class="${k}">
          <span class="label">${k}:</span>
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

fetch("scratchpad.yaml").then(res => res.text()).then(source => {
  let result = json2html(jsyaml.load(source))
  document.getElementById('target').insertAdjacentHTML('beforeend', result)
})
