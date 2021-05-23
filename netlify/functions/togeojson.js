const got = require('got')
const xmldom = require('xmldom')
const toGeoJSON = require('@mapbox/togeojson')

exports.handler = async function ({ queryStringParameters }) {
  const { url } = queryStringParameters
  const response = await got(url)
  const doc = new xmldom.DOMParser().parseFromString(response.body)
  const result = toGeoJSON.kml(doc)
  return { statusCode: 200, body: JSON.stringify(result, null, 2) }
}