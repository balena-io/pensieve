Pensieve
========

> An in browser module for viewing and editing yaml documents stored on GitHub

[![CircleCI](https://circleci.com/gh/resin-io/pensieve/tree/master.svg?style=shield)](https://circleci.com/gh/resin-io/pensieve/tree/master)

Usage
-----

Load the Pensieve JS and CSS files into your HTML page, then execuite the `Pensieve` global using your desired configuration.

Assuming that:
- you have a repository called `document-repo` held under the account `resin-io`
- the repo contains a yaml file called `schema.yaml` in its root
- the structure of `schema.yaml` is:
  ```yaml
  My string field:
    type: string
  My number field:
    type: number
  My boolean field:
    type: boolean
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
    <title>Scratchpad</title>
    <link href="https://resin-production-downloads.s3.amazonaws.com/pensieve/latest/static/css/main.css" type="text/css" rel="stylesheet">
  </head>
  <body>
    <div id="pensieve"></div>

    <script src="https://resin-production-downloads.s3.amazonaws.com/pensieve/latest/static/js/main.js"></script>
    <script>
      Pensieve({
        // The path to you schema file or an object literal of your schema
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
- string
- number
- boolean
- date
- semver-range
- semver

Here's an example of a schema file in yaml:

```yaml
GitHub issue:
  type: string
Difficulty:
  type: number
Pull Logs:
  type: boolean
Last Updated:
  type: date
Versions Affected:
  type: semver-range
Fixed in Version:
  type: semver
```
