import showdown from 'showdown'
import sanitizeHtml from 'sanitize-html'

const converter = new showdown.Converter()

export const render = data => {
  const html = converter.makeHtml(data)

  return sanitizeHtml(html)
}
