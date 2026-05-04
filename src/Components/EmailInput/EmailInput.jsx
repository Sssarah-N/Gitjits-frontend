import PropTypes from 'prop-types';
import { useState } from 'react';
import './EmailInput.css';

const EmailInput = ({ field, formData, handleChange }) => {
    const [email, setEmail] = useState(formData[field.fld_nm] || '');
    const [touched, setTouched] = useState(false);

    const validateEmail = (value) => {
        return value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) !== null;
    };

    const isInvalid = touched && !validateEmail(email);

    return (
        <>
        <input
            type={field.input_type || 'text'}
            id={field.fld_nm}
            value={email}
            onChange={(e) => {
                setEmail(e.target.value);
                handleChange(field.fld_nm, e.target.value);
            }}
            onBlur={() => setTouched(true)}
            required={!field.optional}
            className="form-input"
        />
        {isInvalid && <p className="email-invalid">Please enter a valid email address.</p>}
        </>
    );
};

EmailInput.propTypes = {
  field: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default EmailInput;