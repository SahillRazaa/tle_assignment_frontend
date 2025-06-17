import React from 'react';
import styled, { css } from 'styled-components';

const StyledBadge = styled.span`
  display: inline-block;
  padding: 0.15em 0.6em;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  color: white;
  user-select: none;
  white-space: nowrap;

  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return css`background-color: #4338ca;`;  
      case 'secondary':
        return css`background-color: #6b7280;`; 
      case 'success':
        return css`background-color: #22c55e;`;  
      case 'danger':
        return css`background-color: #ef4444;`;
      case 'warning':
        return css`background-color: #f59e0b;`; 
      default:
        return css`background-color: #9ca3af;`; 
    }
  }}
`;

const Badge = ({ variant = 'default', children, className }) => {
  return (
    <StyledBadge variant={variant} className={className}>
      {children}
    </StyledBadge>
  );
};

export default Badge;
