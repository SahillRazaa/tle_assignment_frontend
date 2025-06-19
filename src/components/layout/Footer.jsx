import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeProvider';
import { themeSetter } from '../../utils/ThemeSetter';

const FooterContainer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 19px 5%;
  background: ${props => props.theme === 'light' ? props.themeSetter.light.background : props.themeSetter.dark.background};
  color: ${props => props.theme === 'light' ? props.themeSetter.light.primaryText : props.themeSetter.dark.primaryText};
  font-weight: bold;
  text-align: center;
  box-shadow: 0 2px 10px ${props => props.theme === 'light' ? props.themeSetter.light.primaryText : props.themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 15px 5%;
  }
`;

const CopyrightText = styled.div`
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const MadeWithLove = styled.div`
  font-weight: normal;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const Heart = styled.span`
  color: red;
  margin: 0 4px;
`;

export default function Footer() {

  const { theme } = useTheme();

  return (
    <FooterContainer theme={theme} themeSetter={themeSetter}>
      <CopyrightText>© 2025 Sahil Raza Ansari. All rights reserved.
      </CopyrightText>
      <MadeWithLove>
        Made With
        <Heart>❤️</Heart>
        By Sahil Raza Ansari
      </MadeWithLove>
    </FooterContainer>
  );
}