import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { Base } from './InlineBox.stories'

it('renders without error', () => {
  render(<Base {...Base.args} />)
})
