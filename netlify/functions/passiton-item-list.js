const { PASSITON_HOST, extractAllItems } = require('./lib/passiton')

function mapOffer([idCell, detailsCell, locationCell, _pictureCell, specificationsCell]) {
  const id = idCell.text().trim()
  const name = detailsCell.find('b').text().trim()
  const description = detailsCell.find('div[id^=desc_]').text().trim()
  const location = locationCell.find('b').text() || null
  const deliveryCostsCoveredByDonor = locationCell.find('img').length > 0

  const [validTillText, ageText, dimensionsText] = specificationsCell.html().split('<br>').map(s => s.trim()).filter(Boolean)

  const validTill = validTillText.replace('valid til ', '')
  const ageInYears = Number(ageText.split(' ')[0])
  const dimensions = dimensionsText === '-' ? null : dimensionsText

  return { id, name, description, location, validTill, ageInYears, dimensions, deliveryCostsCoveredByDonor }
}

exports.handler = async function () {
  const result = await extractAllItems(`${PASSITON_HOST}/item-list`, mapOffer)
  return { statusCode: 200, body: JSON.stringify(result, null, 2) }
}