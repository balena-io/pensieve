import { PineTypes } from 'resin-components'

export const PENSIEVE_IMPORTED_COPY_FIELD_KEY =
  '$PENSIEVE_IMPORTED_COPY_FIELD_KEY'

/**
 * @description
 * Converts a markdown file into an array of objects, using the headers as keys.
 * A header using `##` indicates a new object, the key of this header is used as the title of the returned object
 * (the title field is denoted by the first element in the schema)
 *
 * @param {object} schema
 * @param {string} markdown
 */
export const convert = (schema, markdown) => {
  const titleKey = schema[0].name
  const sections = markdown.split(/^##\s/gm).filter(x => !!x)
  const collection = sections.map(string => {
    const [title] = string.match(/^.*$/m)
    const segments = string
      .replace(title, '')
      .split(/\s###\s/)
      .filter(x => !!x)
    const entry = {
      [titleKey]: title
    }

    segments.forEach(segment => {
      const [segmentKey] = segment.match(/^.*$/m)
      const segmentValue = segment.replace(segmentKey, '')
      const name = segmentKey.trim()
      const value = segmentValue.trim()
      if (name) {
        const schemaEntry = schema.find(e => e.name === name)
        entry[name] =
          schemaEntry && schemaEntry.type
            ? PineTypes[schemaEntry.type].normalize(value)
            : value
      } else if (value) {
        // If there is a value, but no key, then we need to add a key to hold the content so it's not lost
        // This key should not already exist on the entry, otherwise we may accidentally overwrite data
        let key = PENSIEVE_IMPORTED_COPY_FIELD_KEY
        let count = 1
        while (entry.hasOwnProperty(key + count)) {
          count++
        }

        entry[key + count] = value
      }
    })
    return entry
  })
  return collection
}
