const locales = require('../../config/i18n')

exports.wrapper = promise =>
  promise.then(result => {
    if (result.errors) {
      throw result.errors
    }
    return result
  })

exports.replaceTrailing = path => (path === `/` ? path : path.replace(/\/$/, ``))

exports.replaceBoth = _path => _path.replace(/^\/|\/$/g, '')

exports.localizedSlug = node =>
  locales[node.lang].default ? `/${node.uid}` : `/${locales[node.lang].path}/${node.uid}`
