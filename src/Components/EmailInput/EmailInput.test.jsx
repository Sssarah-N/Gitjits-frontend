import { render, screen, fireEvent } from '@testing-library/react';
import EmailInput from './EmailInput';

const buildProps = (overrides = {}) => ({
  field: {
    fld_nm: 'email',
    input_type: 'email',
    optional: false,
  },
  formData: {},
  handleChange: jest.fn(),
  ...overrides,
});

const renderEmailInput = (overrides = {}) => {
  const props = buildProps(overrides);
  render(<EmailInput {...props} />);
  const input = screen.getByRole('textbox');
  return { props, input };
};

const INVALID_MESSAGE = /please enter a valid email address\./i;

const VALID_EMAILS = [
  'simple@example.com',
  'user.name@example.com',
  'user_name@example.com',
  'user-name@example.com',
  'user+tag@example.com',
  'user123@example.co',
  'person@mail.example.com',
  'first.last@sub.domain.org',
];

const INVALID_EMAILS = [
  '',
  'plainaddress',
  'missing-at-sign.com',
  'missing-domain@',
  '@missing-local.com',
  'name@domain',
  'name @domain.com',
  'name@domain .com',
  'name@@domain.com',
];

describe('EmailInput', () => {
  test('calls handleChange with field name and typed value', () => {
    const { props, input } = renderEmailInput();

    fireEvent.change(input, { target: { value: 'person@example.com' } });

    expect(props.handleChange).toHaveBeenCalledWith('email', 'person@example.com');
  });

  test.each(VALID_EMAILS)('accepts valid email format: %s', (email) => {
    const { input } = renderEmailInput();

    fireEvent.change(input, { target: { value: email } });

    expect(screen.queryByText(INVALID_MESSAGE)).not.toBeInTheDocument();
  });

  test.each(INVALID_EMAILS)('rejects invalid email format: %s', (email) => {
    const { input } = renderEmailInput();

    fireEvent.change(input, { target: { value: email } });

    expect(screen.getByText(INVALID_MESSAGE)).toBeInTheDocument();
  });

  test('respects required attribute based on field optional flag', () => {
    const requiredProps = buildProps({
      field: { fld_nm: 'email', input_type: 'email', optional: false },
    });
    const { rerender } = render(<EmailInput {...requiredProps} />);
    expect(screen.getByRole('textbox')).toBeRequired();

    const optionalProps = buildProps({
      field: { fld_nm: 'email', input_type: 'email', optional: true },
    });
    rerender(<EmailInput {...optionalProps} />);
    expect(screen.getByRole('textbox')).not.toBeRequired();
  });
});
