import React from 'react';
import styled from 'styled-components';

export const Input = React.forwardRef(({ id, label, icon, error, ...props }, ref) => {
  return (
    <Field>
      {label && <Label htmlFor={id}>{label}</Label>}
      <InputWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <StyledInput id={id} ref={ref} {...props} />
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </Field>
  );
});

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #334155;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
`;

const IconWrapper = styled.div`
  margin-right: 0.5rem;
  color: #64748b;
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: #0f172a;
`;

const ErrorText = styled.span`
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
`;
