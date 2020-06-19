import React from 'react'
import { highlightHTML } from './highlight'

describe('HTML highlighting', () => {
  const str = 'create_dashboard'

  test('it returns original string when there are no matches', () => {
    const result = highlightHTML('query', str)
    expect(result).toEqual(['create_dashboard'])
  })

  test('it returns original string when no pattern is provided', () => {
    const result = highlightHTML('', str)
    expect(result).toEqual(str)
  })

  test('it wraps matches with span tags', () => {
    const result = highlightHTML('dash', str)
    expect(result).toEqual([
      'create_',
      <span key="1" className="hi">
        dash
      </span>,
      'board',
    ])
  })
})
