import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { Base } from './index.stories'

describe('Box', () => {
  afterEach(cleanup)
  test('renders the box', () => {
    const { container } = render(<Base {...Base.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the box with the right attributes', () => {
    const { container } = render(<Base {...Base.args} />)

    const box = container.querySelector('div')
    expect(box).toHaveStyle('width: auto;')
    expect(box).toHaveStyle('position: flex;')
    expect(box).toHaveStyle('border: 1;')
    expect(box).toHaveStyle('align-items: center;')
    expect(box).toHaveStyle('justify-content: space-between;')
    expect(box).toHaveStyle('background-color: blue;')
    expect(box).toHaveStyle('padding: 32px;')
  })
})
