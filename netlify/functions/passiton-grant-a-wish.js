const { PASSITON_HOST, extractRequestsByCategory } = require('./lib/passiton')

function mapContactDetails(details) {
  const isEmail = s => s.includes('@') && s.includes('.')
  const email = details.find(isEmail) || null
  const phone = details.filter(s => !isEmail(s))
  return { email, phone }
}

function mapRequestByCategory(category) {
  return function mapRequest([idCell, detailsCell, contactCell]) {
    const nameCell = detailsCell.find('span[id^=span_name]')
    const descriptionCell = detailsCell.find('div.item_desc')

    const id = idCell.text().trim()
    const name = nameCell.text().trim()
    const description = (descriptionCell.text() || '').trim()

    detailsCell.children()
        .remove('span')
        .remove('div.item_desc')

    const specifications = detailsCell.text().trim() || null

    const deliveryCostsCoveredByDonor = contactCell.find('img').length > 0
    contactCell.children().remove('div')
    const contactText = contactCell.html().split('<br>').map(s => s.trim()).filter(Boolean)
    const [org, contactName, ...details] = contactText

    const date = details.pop()

    const contact = {
        org, name: contactName,
        ...mapContactDetails(details)
    }

    return { 
      id, category, name, description, specifications, contact, deliveryCostsCoveredByDonor, date 
    }
  }
}

exports.handler = async function () {
  const result = await extractRequestsByCategory(
    `${PASSITON_HOST}/grant-a-wish`, 
    mapRequestByCategory
  )
//   result.sort((a, b) => b.id - a.id)
  return { statusCode: 200, body: JSON.stringify(result, null, 2) }
}