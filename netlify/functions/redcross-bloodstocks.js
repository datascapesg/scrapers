const got = require('got')
const cheerio = require('cheerio')
const REDCROSS_HOST = "https://www.redcross.sg"
const BLOOD_BANK_LVL = "blood_bank_level"
const POS_NEG = [{"class_": "positives", "name": "+"}, {"class_": "negatives", "name": "-"}]
const BLOOD_GROUP_PREFIX = "blood_group"
const BLOOD_GROUPS = [
  {"class_": "a_group", "name": "A"},
  {"class_": "b_group", "name": "B"},
  {"class_": "o_group", "name": "O"},
  {"class_": "ab_group", "name": "AB"},
]


async function extractBloodStocks(url) {
  const response = await got(url);
  const $ = cheerio.load(response.body)

  let state = {}

  for (const pos_neg of POS_NEG) {
    // Get the entire positive or negative blood type row
    const classname = `.${BLOOD_BANK_LVL}.${pos_neg["class_"]}`
    const pos_or_negs = $(classname)
    for (const group of BLOOD_GROUPS) {
      // Get data for individual blood types
      const classname = `.${BLOOD_GROUP_PREFIX}.${group["class_"]}`
      const bloodgroup_html = pos_or_negs.children(classname);
      const info_text = bloodgroup_html.find(".info_text")
      const bloodtype = info_text.find(".status_text:nth-child(1)").text().split(' ')[0]
      const status = info_text.find(".status_text:nth-child(2)").text()
      const fill_level = bloodgroup_html.find(".fill_humam").css('height')
      // console.log(bloodtype);
      // console.log(status);
      // console.log(fill_level)
      state[bloodtype] = {"status": status, "fill_level": fill_level}
    }
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

// For testing
// runExtracter().then((data) => {
//     console.log(data)
// })
