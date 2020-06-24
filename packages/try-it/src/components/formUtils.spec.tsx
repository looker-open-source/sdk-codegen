import { screen, fireEvent, render } from '@testing-library/react'
import {
  renderWithTheme,
  withThemeProvider,
} from '@looker/components-test-utils'
import userEvent from '@testing-library/user-event'
import { BaseSyntheticEvent } from 'react'

import { TryItInput } from '../TryIt'
import {
  createComplexItem,
  createSimpleItem,
  showDataChangeWarning,
} from './formUtils'

describe('Simple Items', () => {
  let requestContent = {}
  const handleChange = jest.fn()
  const handleNumberChange = jest.fn()
  const handleBoolChange = (e: BaseSyntheticEvent) => {
    requestContent = { ...requestContent, [e.target.name]: e.target.checked }
  }
  const handleDateChange = jest.fn()
  const initSimpleTestItem = (input: TryItInput) =>
    createSimpleItem(
      input,
      handleChange,
      handleNumberChange,
      handleBoolChange,
      handleDateChange,
      requestContent
    )

  afterEach(() => {
    handleNumberChange.mockClear()
    handleDateChange.mockClear()
    handleChange.mockClear()
  })

  describe('Boolean Items', () => {
    test('it creates a boolean item', () => {
      const name = 'Item name'
      const description = 'A simple item of type boolean'
      const BoolItem = initSimpleTestItem({
        name,
        location: 'query',
        type: 'boolean',
        required: true,
        description,
      })
      renderWithTheme(BoolItem)
      expect(screen.getByText(description)).toBeInTheDocument()
      const item = screen.getByRole('switch', { name })
      expect(item).not.toBeChecked()
    })

    test('a boolean items state changes when clicked', () => {
      const name = 'Item name'
      const description = 'A simple item of type boolean'
      const BoolItem = initSimpleTestItem({
        name,
        location: 'query',
        type: 'boolean',
        required: true,
        description,
      })
      renderWithTheme(BoolItem)

      const item = screen.getByRole('switch', { name })
      expect(item).not.toBeChecked()
      fireEvent.change(item, { target: { checked: true } })
      expect(item).toBeChecked()
    })
  })

  describe.each(['int64', 'integer', 'float', 'double'])(
    '%s type input item',
    (type) => {
      const name = `Type ${type} item`
      const description = `A simple item of type ${type}`
      const NumberItem = initSimpleTestItem({
        name,
        location: 'query',
        type,
        required: true,
        description,
      })

      test('it creates a number item', () => {
        renderWithTheme(NumberItem)
        expect(
          screen.getByLabelText(name, { exact: false })
        ).toBeInTheDocument()
        const input = screen.getByRole('spinbutton', { name })
        expect(input).toHaveAttribute('name', name)
        expect(input).toHaveAttribute('type', 'number')
        expect(input).toHaveAttribute('placeholder', `(number) ${description}`)
        expect(input).toBeRequired()
      })

      test('it takes a numeric input', () => {
        renderWithTheme(NumberItem)
        const input = screen.getByRole('spinbutton', { name })
        userEvent.type(input, '123.456')
        expect(input).toHaveValue(123.456)
        expect(handleNumberChange).toHaveBeenCalled()
      })

      test('it does not allow non numeric inputs', () => {
        renderWithTheme(NumberItem)
        const input = screen.getByRole('spinbutton', { name })
        userEvent.type(input, 'not a number!')
        expect(input).not.toHaveValue('not a number!')
        expect(handleNumberChange).not.toHaveBeenCalled()
      })
    }
  )

  describe.each`
    inputType     | createdItemType
    ${'string'}   | ${'text'}
    ${'hostname'} | ${'text'}
    ${'uuid'}     | ${'text'}
    ${'uri'}      | ${'text'}
    ${'ipv4'}     | ${'text'}
    ${'ipv6'}     | ${'text'}
    ${'email'}    | ${'email'}
    ${'password'} | ${'password'}
  `('$inputType type input item', ({ inputType, createdItemType }) => {
    const name = `Type ${inputType} item`
    const description = `A simple item of type ${inputType}`
    const TextItem = initSimpleTestItem({
      name,
      location: 'path',
      type: inputType,
      required: false,
      description,
    })

    test(`it creates a ${createdItemType} item`, () => {
      renderWithTheme(TextItem)
      const input = screen.getByLabelText(name)
      expect(input).toHaveAttribute('name', name)
      expect(input).toHaveAttribute('type', createdItemType)
      expect(input).toHaveAttribute('placeholder', `(string) ${description}`)
      expect(input).not.toBeRequired()
    })

    test('it takes a text input', () => {
      renderWithTheme(TextItem)
      const input = screen.getByLabelText(name)
      const text = 'Text123'
      userEvent.type(input, text)
      expect(input).toHaveValue(text)
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Datetime item', () => {
    const DateItem = initSimpleTestItem({
      name: 'Type datetime item',
      location: 'path',
      type: 'datetime',
      required: false,
      description: 'A simple item of type datetime',
    })

    test('it creates a datetime item', () => {
      renderWithTheme(DateItem)
      expect(screen.getByTestId('text-input')).toBeInTheDocument()
    })
  })
})

describe('Complex Item', () => {
  const handleComplexChange = jest.fn()
  const requestContent = {}

  test('it creates a complex item', () => {
    const body = {
      query_id: 'string',
      fields: 'string[]',
      limit: 1,
    }
    const ComplexItem = createComplexItem(
      {
        name: 'A complex item',
        location: 'body',
        type: body,
        required: true,
        description: 'A complex item with an object type',
      },
      handleComplexChange,
      requestContent
    )
    render(withThemeProvider(ComplexItem))
    expect(screen.getByText('A complex item')).toBeInTheDocument()
  })
})

describe('createWarning', () => {
  test('it creates a required checkbox with a warning label', () => {
    renderWithTheme(showDataChangeWarning())
    const warningCheckbox = screen.getByRole('checkbox')
    expect(warningCheckbox).toBeRequired()
    expect(
      screen.getByLabelText(
        'I understand that this API endpoint will change data.',
        { exact: false }
      )
    ).toBeInTheDocument()
    expect(warningCheckbox).not.toBeChecked()
    userEvent.click(warningCheckbox)
    expect(warningCheckbox).toBeChecked()
  })
})
