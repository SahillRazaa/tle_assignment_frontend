import React from 'react';
import styled from 'styled-components';

export const Card = ({ children, ...props }) => {
  return <CardContainer {...props}>{children}</CardContainer>;
};

export const CardHeader = ({ children, ...props }) => {
  return <CardHeaderWrapper {...props}>{children}</CardHeaderWrapper>;
};

export const CardTitle = ({ children, ...props }) => {
  return <CardTitleText {...props}>{children}</CardTitleText>;
};

export const CardContent = ({ children, ...props }) => {
  return <CardContentWrapper {...props}>{children}</CardContentWrapper>;
};

const CardContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
`;

const CardHeaderWrapper = styled.div`
  margin-bottom: 1rem;
`;

const CardTitleText = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
`;

const CardContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
