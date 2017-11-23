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
      if (segmentKey.trim().length) {
        entry[segmentKey.trim()] = segmentValue.trim()
      } else if (segmentValue.trim().length) {
        // If there is a value, but no key, then we need to add a key to hold the content so it's not lost
        // This key should not already exist on the entry, otherwise we may accidentally overwrite data
        let key = 'Imported copy '
        let count = 1
        while (entry.hasOwnProperty(key + count)) {
          count++
        }

        entry[key + count] = segmentValue.trim()
      }
    })
    return entry
  })
  return collection
}
