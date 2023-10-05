const got = require('got')
const cheerio = require('cheerio')
const REDCROSS_HOST = "https://www.redcross.sg"
const BLOOD_GROUPS_CLASS_NAMES = [
  {"class_": "a_group", "name": "A"},
  {"class_": "b_group", "name": "B"},
  {"class_": "o_group", "name": "O"},
  {"class_": "ab_group", "name": "AB"},
]


async function extractBloodStocks(url) {
  const response = await got(url);
  const $ = cheerio.load(response.body)

  let state = []
  
  // Each blood type has a class name of the form "a_group", "b_group", "o_group", "ab_group"
  // However getting this class returns two html trees, one for positive and one for negative
  for (const group of BLOOD_GROUPS_CLASS_NAMES) {
    // Get data for individual blood types
    const classname = `.${group["class_"]}`
    const bloodgroup_html = $(classname);
    // Iterate through each of the two html trees
    bloodgroup_html.each(function(i, elem) {
      // Get the blood type
      const bloodType = $(this).find("h3").text().trim()
      console.log(`Blood type: ${bloodType}`)
      // The status is contained within the text of the h5 tag, which is under a div with class "blood-grp-text"
      const status = $(this).find(".blood-grp-text h5").text().trim()
      console.log(`Status: ${status}`)
      // The fill-level is the text within a HTML comment, which is the first child of the div with class "blood-grp-hover"
      const fillLevel = $(this).find(".blood-grp-hover").contents().map((i, el) => {
        if (el.type === 'comment') {
          console.log(el.data.trim())
          return el.data.trim()
        }
      }).get(0)
      console.log(`Fill level: ${fillLevel}`)
      state.push({ bloodType, status, fillLevel })
    })
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

