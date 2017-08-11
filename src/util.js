const Promise = require('bluebird');
const _ = require('lodash');
const showdown = require('showdown');

const converter = new showdown.Converter();

exports.loadScript = url =>
  new Promise((resolve) => {
    const scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = resolve;
    scriptTag.onreadystatechange = resolve;

    document.body.appendChild(scriptTag);
  });

exports.loadStyle = url =>
  new Promise((resolve) => {
    const link = document.createElement('link');
    link.href = url;
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.onload = resolve;

    document.getElementsByTagName('head')[0].appendChild(link);
  });

const makeNameClass = name => (name ? ` ${name.replace(/\s+/g, '_').toLowerCase()}` : '');

const json2html = (data, name) => {
  const nameClass = makeNameClass(name);

  if (_.isPlainObject(data)) {
    return `<ul class='_object${nameClass}'>
      ${_.map(
    data,
    (e, k) => `
        <li class="${makeNameClass(k)}">
          <span class="doc-label">${k}:</span>
          ${json2html(e, k)}
        </li>
      `,
  ).join('')}
    </ul>`;
  } else if (_.isArray(data)) {
    return `<ol class='_array${nameClass}'>
      ${data
    .map(
      (e, k) => `
        <li class="${k}">
          ${json2html(e)}
        </li>
      `,
    )
    .join('')}
    </ol>`;
  } else if (_.isNumber(data)) {
    return `<span class='_number${nameClass}'>${data}</span>`;
  } else if (_.isString(data)) {
    if (name === 'Versions Affected') {
      return `<span class='_string${nameClass}'>${converter.makeHtml(`\`${data}\``)}</span>`;
    }
    return `<span class='_string${nameClass}'>${converter.makeHtml(data)}</span>`;
  } else if (_.isBoolean(data)) {
    return `<span class='_boolean${nameClass}'>${data}</span>`;
  } else if (_.isNull(data)) {
    return `<span class='_null${nameClass}'></span>`;
  }
  return data;
};

exports.randomString = (length = 16) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

exports.json2html = json2html;

exports.prettifyYaml = (sourceCode, indentCols = 3) => {
  let pretty = sourceCode.replace(/---\n/, '');
  pretty = pretty.replace(/".*\\n.*"/g, (match, offset) => {
    // Calculate how many space to indent multiline strings by
    const substring = pretty.substring(0, offset);
    const matches = /\n( +).+:/gm.exec(substring);
    const indent = matches ? `${matches[1]}  ` : '  ';

    console.log(matches);
    const parsed = match
      // Convert new line strings values into literals
      .replace(/\\n/g, `\n${indent}`)
      // Strip double quoutes from start and end
      .slice(1, -1);
    return `|\n${indent}${parsed}`;
  });

  return pretty;
};
