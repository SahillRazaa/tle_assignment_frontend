import React from 'react';
import styled from 'styled-components';

export const Button = ({ children, isLoading, ...props }) => {
  return (
    <StyledButton disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </StyledButton>
  );
};

const StyledButton = styled.button`
  width: 100%;
  background-color: #1e293b;
  color: white;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #0f172a;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
