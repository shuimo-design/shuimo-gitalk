export const queryParse = (search = window.location.search) => {
  if (!search) return {}
  const queryString = search[0] === '?' ? search.slice(1) : search
  const query: Record<string, any> = {}
  queryString.split('&').forEach((queryStr) => {
    const [key, value] = queryStr.split('=')
    if (key) query[decodeURIComponent(key)] = decodeURIComponent(value)
  })

  return query
}

export const queryStringify = (query: Record<string, any>) => {
  const queryString = Object.keys(query)
    .map((key) => `${key}=${encodeURIComponent(query[key] || '')}`)
    .join('&')
  return queryString
}

export const getMetaContent = (name: string, content: string) => {
  content || (content = 'content')
  const el = window.document.querySelector(`meta[name='${name}']`)
  return el && el.getAttribute(content)
}

export const hasClassInParent = (
  element: HTMLElement,
  ...className: string[]
): boolean => {
  let yes = false
  if (typeof element.className === 'undefined') return false
  const classes = element.className.split(' ')
  className.forEach((c) => {
    if (classes.includes(c)) {
      yes = true
    }
  })
  if (yes) return yes
  return (
    !!element.parentNode &&
    hasClassInParent(element.parentNode as HTMLElement, ...className)
  )
}
