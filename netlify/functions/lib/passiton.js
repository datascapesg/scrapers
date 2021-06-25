const got = require('got')
const cheerio = require('cheerio')

const PASSITON_HOST = 'https://www.passiton.org.sg'

function extractPageCount(html) {
  const $ = cheerio.load(html)
  const pageCount = $(
    'div[class^=iveo_pipe_passiton_list_] > form#f td[align=right] a:last-child'
  ).text()
  return pageCount
}

function childrenArray(children) {
  return new Array(children.length).fill(0)
    .map((_v, i) => children.eq(i))
}

async function extractAllItems(url, rowMapper = r => r) {
  const response = await got(url)
  const pageCount = extractPageCount(response.body)
  // generate the urls of pages to be fetched, typically
  // pages 2 to `pageCount`
  const pageUrls = pageCount 
    ? new Array(pageCount - 1)
      .fill(0)
      .map((_v, i) => `${url}${url.includes('?')  ? '&' : '?' }pg=${i + 2}`)
    : []
  const pagePromises = [
    Promise.resolve(response.body),
    ...pageUrls.map(url => got(url).then((response) => response.body))
  ].map((bodyPromise) => bodyPromise.then((body) => {
    const $ = cheerio.load(body)
    const children = $('div[class^=iveo_pipe_passiton_list_] > table[class^=tbl_form] tr[class^=line]')
    return childrenArray(children)
      .map(row => childrenArray(row.children()))
      .map(rowMapper)
  }))
  const pageItems = await Promise.all(pagePromises)
  return [].concat(...pageItems)
}

async function extractRequestsByCategory(url, rowCategoryMapper = c => r => r) {
  const response = await got(url)
  const $ = cheerio.load(response.body)
  const categories = childrenArray($('form .tbl_form td[colspan=7] a'))
    .map((c)=> c.text())
  const pageItems = await Promise.all(
    categories.map(
      category => extractAllItems(
        `${url}?cat=${category}`, 
        rowCategoryMapper(category)
      )
    )
  )
  return [].concat(...pageItems)
}

module.exports = { PASSITON_HOST, extractAllItems, extractRequestsByCategory }
