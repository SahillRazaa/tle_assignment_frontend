import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 19px 5%;
  background: #1e293b;
  color: white;
  font-weight: bold;
  text-align: center;

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
  return (
    <FooterContainer>
      <CopyrightText> 2025 ChairManager. All Rights Reserved.</CopyrightText>
      <MadeWithLove>
        Made With
        <Heart>❤️</Heart>
        By Certimate Infotech Pvt. Ltd.
      </MadeWithLove>
    </FooterContainer>
  );
}