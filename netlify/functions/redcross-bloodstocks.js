const got = require('got')
const cheerio = require('cheerio')
const REDCROSS_HOST = "https://www.redcross.sg"

async function extractBloodStocks(url) {
  const response = await got(url);
  const $ = cheerio.load(response.body)

  let state = []

  const bloodTypes = [...$('.blood-grp-img h3')]
    .map(n => n.children[0].data.trim())
  const statuses = [...$('.blood-grp-img h5[class]')]
    .map(n => n.children[0].data.trim())
  const fillLevels = [...$('.blood-grp-img .blood-grp-hover')]
    .map(
      ({ childNodes }) => [...childNodes].find(
        d => d.nodeType === 8).data.trim() + '%'
    )


  for (let i = 0; i < bloodTypes.length; ++i) {
    const bloodType = bloodTypes[i]
    const status = statuses[i]
    const fillLevel = fillLevels[i]
    state.push({ bloodType, status, fillLevel })
  }

  return state
}

async function runExtracter() {
  const result = await extractBloodStocks(`${REDCROSS_HOST}`)
  return { statusCode: 200, body: JSON.stringify(result, null, 2) }
}


exports.handler = async function () {
  return await runExtracter();
}

