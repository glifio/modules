import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import {
  IconGlif,
  IconSuccess,
  IconFail,
  IconPending,
  IconSend,
  IconReceive,
  IconClose,
  IconApproximatelyEquals,
  IconViewAccountAddress,
  IconCopyAccountAddress,
  IconMessageStatus,
  IconLedger,
  IconViewAddress
} from './index.stories'

describe('Icons', () => {
  afterEach(cleanup)
  test(' renders IconGlif', () => {
    const { container } = render(<IconGlif {...IconGlif.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconSuccess', () => {
    const { container } = render(<IconSuccess {...IconSuccess.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconFail', () => {
    const { container } = render(<IconFail {...IconFail.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconPending', () => {
    const { container } = render(<IconPending {...IconPending.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconSend', () => {
    const { container } = render(<IconSend {...IconSend.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconReceive', () => {
    const { container } = render(<IconReceive {...IconReceive.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconClose', () => {
    const { container } = render(<IconClose {...IconClose.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconApproximatelyEquals', () => {
    const { container } = render(
      <IconApproximatelyEquals {...IconApproximatelyEquals.args} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconViewAccountAddress', () => {
    const { container } = render(
      <IconViewAccountAddress {...IconViewAccountAddress.args} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconCopyAccountAddress', () => {
    const { container } = render(
      <IconCopyAccountAddress {...IconCopyAccountAddress.args} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconMessageStatus', () => {
    const { container } = render(
      <IconMessageStatus {...IconMessageStatus.args} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconLedger', () => {
    const { container } = render(<IconLedger {...IconLedger.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
  test(' renders IconViewAddress', () => {
    const { container } = render(<IconViewAddress {...IconViewAddress.args} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
