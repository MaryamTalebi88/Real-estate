import { useEffect } from 'react'

/** Sets the document title + meta description/og tags for the current page. */
export default function usePageMeta({ title, description, image } = {}) {
  useEffect(() => {
    if (title) document.title = title

    const setMeta = (selector, attr, value) => {
      if (!value) return
      let tag = document.head.querySelector(selector)
      if (!tag) {
        tag = document.createElement('meta')
        const [key, val] = attr
        tag.setAttribute(key, val)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', value)
    }

    setMeta('meta[name="description"]', ['name', 'description'], description)
    setMeta('meta[property="og:title"]', ['property', 'og:title'], title)
    setMeta('meta[property="og:description"]', ['property', 'og:description'], description)
    setMeta('meta[property="og:image"]', ['property', 'og:image'], image)
  }, [title, description, image])
}
