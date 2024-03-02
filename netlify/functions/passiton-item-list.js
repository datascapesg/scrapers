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
  const result = (await Promise.all(
    [
      'Attires/Clothings',
      'Electrical Home Appliances',
      'Home Furnishing',
      'Infant and Children Items',
      'Kitchen Utility Items',
      'Leisure and Healthy Lifestyle',
      'Learning Aids',
      'Medical Aids',
      'Mobility Aids',
      'Others',
    ].map(async (category) => {
      const offers = await extractAllItems(
        `${PASSITON_HOST}/item-list?ItemCat1=${encodeURIComponent(category)}`,
        mapOffer
      )
      return offers.map((offer) => ({ ...offer, category }))
    })
  )).flat()
  return { statusCode: 200, body: JSON.stringify(result, null, 2) }
}