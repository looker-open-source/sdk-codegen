export const testJsonResponse = {
  contentType: 'application/json',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('[{"key1": "value1" }]'),
}

export const testTextResponse = {
  contentType: 'text/plain;charset=utf-8',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some text data'),
}

export const testHtmlResponse = {
  contentType: 'text/html;charset=utf-8',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from(
    '<table>\n' +
      '<tr><th>Orders Created Date</th><th>Orders Count</th></tr>\n' +
      '<tr><td>2019-12-22</td><td>39</td></tr>\n' +
      '</table>'
  ),
}

export const testImageResponse = (contentType = 'image/png') => ({
  contentType,
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some image data'),
})

export const testUnknownResponse = {
  contentType: 'bogus',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some data'),
}

export const testErrorResponse = {
  body: Buffer.from(
    '{"message": "Not found", "documentation_url": "http://docs.looker.com"}'
  ),
  contentType: 'text',
  ok: false,
  statusCode: 404,
  statusMessage: 'some status message',
}
