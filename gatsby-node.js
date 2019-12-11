const _ = require('lodash')
const locales = require('./config/i18n')
const { replaceTrailing, localizedSlug, replaceBoth, wrapper } = require('./src/utils/gatsby-node-helpers')

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  if (page.path.includes('404')) {
    return
  }

  deletePage(page)

  Object.keys(locales).map(lang => {
    page.path = replaceTrailing(page.path)
    const name = replaceBoth(page.path)
    const localizedPath = locales[lang].default ? page.path : `${locales[lang].path}${page.path}`

    return createPage({
      ...page,
      path: localizedPath,
      context: {
        locale: lang,
        name,
      },
    })
  })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const postTemplate = require.resolve('./src/templates/post.jsx')
  const categoryTemplate = require.resolve('./src/templates/category.jsx')

  const result = await wrapper(
    graphql(`
      {
        posts: allPrismicPost(sort: { fields: [data___date], order: DESC }) {
          edges {
            node {
              id
              uid
              lang
            }
          }
        }
        categories: allPrismicCategory {
          edges {
            node {
              lang
              data {
                name
              }
            }
          }
        }
      }
    `)
  )

  const postsList = result.data.posts.edges
  const categoryList = result.data.categories.edges

  postsList.forEach(edge => {
    createPage({
      path: localizedSlug(edge.node),
      component: postTemplate,
      context: {
        uid: edge.node.uid,
        locale: edge.node.lang,
      },
    })
  })

  categoryList.forEach(c => {
    const category = c.node.data.name
    const { lang } = c.node

    const localizedPath = locales[lang].default
      ? `/categories/${_.kebabCase(category)}`
      : `/${locales[lang].path}/categories/${_.kebabCase(category)}`

    createPage({
      path: localizedPath,
      component: categoryTemplate,
      context: {
        category,
        locale: lang,
      },
    })
  })
}
