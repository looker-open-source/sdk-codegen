describe('get operations', () => {
  test('sets work as expected', () => {
    const x = new Set<{ value: string }>([{ value: '1' }, { value: '2' }])
    x.add({ value: '1' })
    const y = Array.from(x.values())
    expect(y).toHaveLength(2)
  })
})
