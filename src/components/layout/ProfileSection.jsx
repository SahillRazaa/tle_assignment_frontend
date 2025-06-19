import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../redux/hook';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import axios from 'axios';
import { useTheme } from '../../context/ThemeProvider';
import { themeSetter } from '../../utils/ThemeSetter';
import ContestHistory from './ProfileLayout/ContestHistory';
import ProblemSolving from './ProfileLayout/ProblemSolving';

const Container = styled.div`
  padding: 2rem;
  margin: 0 auto;
  margin-top: 64px;
  max-width: 1800px;
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.background : themeSetter.dark.background};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  @media (max-width: 1200px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    width: 95%;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const Wrapper = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  min-height: calc(100vh - 130px); 

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 1rem;
    min-height: auto;
  }
`;

const LeftWrapper = styled.div`
  flex: 1;
  min-width: 300px;
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryColor : themeSetter.dark.primaryColor};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme === 'light' ? '0 4px 20px rgba(0, 0, 0, 0.06)' : '0 4px 20px rgba(0, 0, 0, 0.3)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-y: auto;

  @media (max-width: 992px) {
    min-width: unset;
    width: 100%;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const RightWrapper = styled.div`
  flex: 3;
  min-width: 400px;
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryColor : themeSetter.dark.primaryColor};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme === 'light' ? '0 4px 20px rgba(0, 0, 0, 0.06)' : '0 4px 20px rgba(0, 0, 0, 0.3)'};
  overflow-y: auto;

  @media (max-width: 992px) {
    min-width: unset;
    width: 100%;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const Image = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  border: 4px solid ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.secondaryBackground};
  box-shadow: ${({ theme }) => theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.2)'};
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    margin-bottom: 1rem;
  }
`;

const StudentName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};
  margin: 0 0 0.25rem;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const StudentHandle = styled.p`
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#667eea' : themeSetter.dark.secondaryBackground};
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 1.5rem;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
`;

const DetailSection = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme, themeSetter }) => theme === 'light' ? '#edf2f7' : themeSetter.dark.secondaryBackground};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  @media (max-width: 480px) {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#718096' : themeSetter.dark.primaryText};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 2px;
    background: ${({ theme, themeSetter }) => theme === 'light' ? '#667eea' : themeSetter.dark.secondaryBackground};
    margin-right: 8px;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-bottom: 0.75rem;
    &::before {
      width: 10px;
      margin-right: 6px;
    }
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
`;

const DetailLabel = styled.span`
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#718096' : themeSetter.dark.primaryText};
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-break: break-word;

  a {
    color: ${({ theme, themeSetter }) => theme === 'light' ? '#4c51bf' : themeSetter.dark.secondaryBackground};
    text-decoration: none;
  }
`;

const RankBadge = styled.span`
  display: inline-block;
  background: ${({ theme, themeSetter }) => theme === 'light' ? 'linear-gradient(135deg, #667eea, #764ba2)' : themeSetter.dark.secondaryBackground};
  color: ${({ theme, themeSetter }) => theme === 'light' ? 'white' : themeSetter.dark.primaryText};
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    padding: 0.2rem 0.6rem;
    font-size: 0.625rem;
    margin-bottom: 0.75rem;
  }
`;

const Toggler = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.background};
  padding: 0.5rem;
  border-radius: 12px;

  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.4rem;
  }
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: ${({ active, theme, themeSetter }) => (active
    ? (theme === 'light' ? themeSetter.light.background : themeSetter.dark.primaryColor)
    : 'transparent'
  )};
  color: ${({ active, theme, themeSetter }) => (active
    ? (theme === 'light' ? '#4c51bf' : themeSetter.dark.primaryText)
    : (theme === 'light' ? '#718096' : themeSetter.dark.secondaryBackground)
  )};
  box-shadow: ${({ active, theme }) => (active ? (theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.2)') : 'none')};

  &:hover {
    color: ${({ theme, themeSetter }) => theme === 'light' ? '#4c51bf' : themeSetter.dark.primaryText};
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.75rem;
  }
`;

const ContentContainer = styled.div`
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.background};
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 480px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const RatingValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#4a5568' : themeSetter.dark.primaryText};

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const RatingChange = styled.span`
  font-size: 0.875rem;
  color: ${({ positive }) => (positive ? '#48bb78' : '#e53e3e')};
  font-weight: 600;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const Filters = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const FilterLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#4a5568' : themeSetter.dark.primaryText};

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ theme, themeSetter }) => theme === 'light' ? '#e2e8f0' : themeSetter.dark.secondaryBackground};
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.background : themeSetter.dark.primaryColor};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme, themeSetter }) => theme === 'light' ? '#cbd5e0' : themeSetter.dark.primaryText};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, themeSetter }) => theme === 'light' ? '#667eea' : themeSetter.dark.primaryText};
    box-shadow: ${({ theme }) => theme === 'light' ? '0 0 0 2px rgba(102, 126, 234, 0.2)' : '0 0 0 2px rgba(245, 245, 245, 0.2)'};
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    width: 100%;
  }
`;

const GraphTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};
  margin: 0 0 1rem;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
`;

const ProblemSolvingData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const StatCard = styled.div`
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.background : themeSetter.dark.primaryColor};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.2)'};
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#4c51bf' : themeSetter.dark.secondaryBackground};
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#718096' : themeSetter.dark.primaryText};
  text-align: center;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const ChartContainer = styled.div`
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.background : themeSetter.dark.primaryColor};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.2)'};

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const HeatmapContainer = styled.div`
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.background : themeSetter.dark.primaryColor};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.2)'};

  @media (max-width: 480px) {
    padding: 1rem;
    .react-calendar-heatmap text {
      font-size: 8px;
    }
  }
`;

const HeatmapTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};
  margin: 0 0 1rem;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
`;

const ProfileSection = () => {
  const [toggleType, setToggleType] = useState('contest');
  const studentData = useAppSelector(state => state.student).studentData;

  const { theme } = useTheme();

  const {
    avatar,
    fullName,
    handle,
    rank,
    email,
    phoneNumber,
    organization,
    rating,
    maxRating,
    contribution,
    friendOfCount,
    lastOnlineTimeSeconds,
    registrationTimeSeconds,
  } = studentData;

  return (
    <Container theme={theme} themeSetter={themeSetter}>
      <Wrapper>
        <LeftWrapper theme={theme} themeSetter={themeSetter}>
          <Image src={avatar} alt="avatar" theme={theme} themeSetter={themeSetter} />
          <StudentName theme={theme} themeSetter={themeSetter}>{fullName}</StudentName>
          <StudentHandle theme={theme} themeSetter={themeSetter}>@{handle}</StudentHandle>
          <RankBadge theme={theme} themeSetter={themeSetter}>{rank}</RankBadge>

          <DetailSection theme={theme} themeSetter={themeSetter}>
            <SectionTitle theme={theme} themeSetter={themeSetter}>Personal Details</SectionTitle>
            <DetailRow>
              <DetailLabel theme={theme} themeSetter={themeSetter}>Email</DetailLabel>
              <DetailValue theme={theme} themeSetter={themeSetter}>
                <a href={`mailto:${email}`} style={{ color: theme === 'light' ? '#4c51bf' : themeSetter.dark.secondaryBackground }}>
                  {email}
                </a>
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel theme={theme} themeSetter={themeSetter}>Phone</DetailLabel>
              <DetailValue theme={theme} themeSetter={themeSetter}>{phoneNumber}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel theme={theme} themeSetter={themeSetter}>Organization</DetailLabel>
              <DetailValue theme={theme} themeSetter={themeSetter}>{organization}</DetailValue>
            </DetailRow>
          </DetailSection>

          <DetailSection theme={theme} themeSetter={themeSetter}>
            <SectionTitle theme={theme} themeSetter={themeSetter}>Codeforces Stats</SectionTitle>
            <RatingDisplay>
              <RatingValue theme={theme} themeSetter={themeSetter}>Current Rating: {rating}</RatingValue>
              <RatingChange positive={(rating - maxRating) > 0}>
                {(rating - maxRating) > 0 ? '+' : ''}{(rating - maxRating)}
              </RatingChange>
            </RatingDisplay>
            <DetailRow>
              <DetailLabel theme={theme} themeSetter={themeSetter}>Max Rating</DetailLabel>
              <DetailValue theme={theme} themeSetter={themeSetter}>{maxRating}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel theme={theme} themeSetter={themeSetter}>Contribution</DetailLabel>
              <DetailValue theme={theme} themeSetter={themeSetter}>{contribution}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel theme={theme} themeSetter={themeSetter}>Friends</DetailLabel>
              <DetailValue theme={theme} themeSetter={themeSetter}>{friendOfCount}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel theme={theme} themeSetter={themeSetter}>Last Online</DetailLabel>
              <DetailValue theme={theme} themeSetter={themeSetter}>{new Date(lastOnlineTimeSeconds * 1000).toLocaleString()}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel theme={theme} themeSetter={themeSetter}>Account Created</DetailLabel>
              <DetailValue theme={theme} themeSetter={themeSetter}>{new Date(registrationTimeSeconds * 1000).toLocaleString()}</DetailValue>
            </DetailRow>
          </DetailSection>
        </LeftWrapper>

        <RightWrapper theme={theme} themeSetter={themeSetter}>
          <Toggler theme={theme} themeSetter={themeSetter}>
            <ToggleButton
              active={toggleType === 'contest'}
              onClick={() => setToggleType('contest')}
              theme={theme} themeSetter={themeSetter}
            >
              Contest History
            </ToggleButton>
            <ToggleButton
              active={toggleType === 'problems'}
              onClick={() => setToggleType('problems')}
              theme={theme} themeSetter={themeSetter}
            >
              Problem Solving
            </ToggleButton>
          </Toggler>

          <ContentContainer theme={theme} themeSetter={themeSetter}>
            {toggleType === 'contest' ? (
              <ContestHistory studentHandle={handle} theme={theme} themeSetter={themeSetter} />
            ) : (
              <ProblemSolving studentHandle={handle} theme={theme} themeSetter={themeSetter} />
            )}
          </ContentContainer>
        </RightWrapper>
      </Wrapper>
    </Container>
  );
};

export default ProfileSection;