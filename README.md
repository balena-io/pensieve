Pensieve
========

> An in browser module for viewing and editing yaml documents stored on GitHub

[![CircleCI](https://circleci.com/gh/resin-io/pensieve/tree/master.svg?style=shield)](https://circleci.com/gh/resin-io/pensieve/tree/master)

Usage
-----

Add the following to the `<head>` element on your page:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto|Ubuntu+Mono">
<script src="https://resin-production-downloads.s3.amazonaws.com/pensieve/latest/pensieve.js"></script>
```

Pensieve uses fontawesome icons and the Roboto and Ubuntu mono fonts, so these should be loaded as well.
Make sure there is a container element with the id `pensieve` on your page, then execute the `Pensieve` global using your desired configuration.


Assuming that:
- you have a repository called `document-repo` held under the account `resin-io`
- the repo contains a yaml file called `schema.yaml` in its root
- the structure of `schema.yaml` is:
  ```yaml
  My string field:
    type: String
  My number field:
    type: Integer
  My boolean field:
    type: Boolean
  ```

- the repo contains a yaml file called `document.yaml` in its root
- the structure of `document.yaml` is:
  ```yaml
  content:
    Entry 1:
      My string field: foobar
      My number field: 1
      My boolean field: true
    Entry 2:
      My string field: barbaz
      My number field: 2
      My boolean field: false
  meta:
    info: example metadata
  ```

Your HTML page would look like this:


``` html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Pensieve</title>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto|Ubuntu+Mono">
    <script src="https://resin-production-downloads.s3.amazonaws.com/pensieve/latest/pensieve.js"></script>
  </head>
  <body>
    <div id="pensieve"></div>

    <script>
      Pensieve({
        // The path to your schema file or an object literal of your schema
        schema: 'schema.yaml',
        // The attribute that your document's content is set under
        contentPath: 'content',
        repo: {
          // The name of the repo containing the yaml document
          name: 'document-repo',
          // The account the repo is held under
          account: 'resin-io',
          // The path to the yaml file in your github repo
          file: 'document.yaml',
          // The name of the commit/branch/tag. usually the repository’s default branch (eg master)
          ref: 'master'
        }
      });
    </script>
  </body>
</html>
```

Schema
------

Your schema is used to construct filters and validate your data when editing or adding a new entry.
The schema should be an object composed of key/value pairs, where the fields name is the key and the type definition is the value.
The type paramater should be one of:
- Boolean
- Case Insensitive Text
- Date Time
- Date
- Integer
- Real
- Short Text
- Text
- Time
- semver-range
- semver

Here's an example of a schema file in yaml:

```yaml
GitHub issue:
  type: Short Text
Difficulty:
  type: Integer
Description:
  type: Text
Pull Logs:
  type: Boolean
Last Updated:
  type: Date Time
Versions Affected:
  type: semver-range
Fixed in Version:
  type: semver
```

Types
-----

### Boolean
A `true` or `false` value.

### Case Insensitive Text
A string value of any length. When filtering on a field of this type, the match is always case insensitive.

### Date Time
A date time string or unix timestamp. Under the hood Pensieve uses momentjs to parse values, so your string value should be in a known ISO 8601 or RFC 2822 Date time format.
See https://momentjs.com/docs/#/parsing/string/ for more information.

### Date
Similar to the `Date Time` type but ignores the time part. The lowest level of comparison is the day when filtering, making `2013-02-08 09:30:26.123` and `2013-02-08 15:03:42.321` equal.

### Integer
An integer value.

### Real
A number value, can be an integer or decimal.

### Short Text
A string value with a maximum length of 255 characters.

### Text
A string value with no maximum length.

### Time
Similar to the `Date Time` type but ignores the date part. Only the time of day is evaluated when filtering, making `2013-02-08 09:30:26.123` and `2017-08-12 09:30:26.123` equal.

### semver
A valid semver value http://semver.org/
Under the hood the [resin-semver](https://github.com/resin-io-modules/resin-semver) module is used, so we support resinified semver strings like `Resin OS 2.0.5 (prod)`.

### semver-range
A semver-range value https://github.com/npm/node-semver#advanced-range-syntax


Views
-----

Filters can be saved as "Views", allowing the filter to be loaded at a later date. Views are saved to a file named `views.yaml` in the root of the connected GitHub repository. When saving a view you can set it's visibility to 'just me' (Local), meaning that only you will see the saved views, or 'everyone' (Global) which will make the view visible to anyone using the document.

Default Views
-------------

You can specify a default view to be loaded when Pensieve is initialised by adding a `defaultView` attribute to the Pensieve config. The value can either be the name of a Global view (visible to everyone) or an array of filter rules.

Markdown
--------

The types `Text`, `Short Text` and `Case Insensitive Text` are all rendered as
markdown.

