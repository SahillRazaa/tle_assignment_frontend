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
    min-height: auto; /* Remove fixed height on smaller screens */
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
    min-width: unset; /* Remove min-width on smaller screens */
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
    min-width: unset; /* Remove min-width on smaller screens */
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
  word-break: break-word; /* Ensure long words break */

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

const StarRating = styled.div`
  display: flex;
  gap: 0.125rem;
  margin-bottom: 1rem;
`;

const Star = styled.span`
  color: ${({ filled, theme, themeSetter }) => (filled
    ? '#f6ad55'
    : (theme === 'light' ? '#e2e8f0' : themeSetter.dark.secondaryBackground)
  )};
  font-size: 1.125rem;
`;

const ContestHistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 480px) {
    gap: 1rem;
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
    width: 100%; /* Make select full width on small screens */
  }
`;

const RatingGraph = styled.div`
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.background : themeSetter.dark.primaryColor};
  border-radius: 12px;
  padding: 1rem;
  box-shadow: ${({ theme }) => theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.2)'};

  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-bottom: 100px;
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

const Graph = styled.div`
  height: 300px;

  @media (max-width: 480px) {
    height: 200px; /* Reduce graph height on small screens */
  }
`;

const TableContainer = styled.div`
  overflow-x: auto; /* Allow horizontal scrolling for the table */
  width: 100%;
`;

const ContestDetailsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.background : themeSetter.dark.primaryColor};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.2)'};

  @media (max-width: 768px) {
    display: block; /* Make table behave like a block element */
  }
`;

const TableHeader = styled.thead`
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.background};

  @media (max-width: 768px) {
    display: none; /* Hide table header on small screens */
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.background};
  }

  &:hover {
    background: ${({ theme, themeSetter }) => theme === 'light' ? '#edf2f7' : themeSetter.dark.secondaryBackground};
  }

  @media (max-width: 768px) {
    display: block; /* Make row behave like a block element */
    margin-bottom: 0.75rem;
    border: 1px solid ${({ theme, themeSetter }) => theme === 'light' ? '#edf2f7' : themeSetter.dark.secondaryBackground};
    border-radius: 8px;
    padding: 0.75rem;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  width: 10%; /* Keep for larger screens */
  border-bottom: 1px solid ${({ theme, themeSetter }) => theme === 'light' ? '#edf2f7' : themeSetter.dark.secondaryBackground};
  text-align: ${({ align }) => align || 'left'};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    display: block; /* Make cell behave like a block element */
    width: 100%;
    text-align: right; /* Align value to the right */
    padding: 0.25rem 0;
    border-bottom: none;

    &::before {
      content: attr(data-label); /* Use data-label for the pseudo-element label */
      float: left;
      font-weight: 600;
      color: ${({ theme, themeSetter }) => theme === 'light' ? '#4a5568' : themeSetter.dark.primaryText};
    }
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#4a5568' : themeSetter.dark.primaryText};
  text-align: ${({ align }) => align || 'left'};
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.background};
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
    grid-template-columns: repeat(2, 1fr); /* 2 columns on medium screens */
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr; /* 1 column on small screens */
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
      font-size: 8px; /* Adjust font size for heatmap labels on small screens */
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

const ContestHistory = ({ studentHandle, theme, themeSetter }) => {
  const [timeFilter, setTimeFilter] = useState("last360");
  const [contestData, setContestData] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [ratingGraphData, setRatingGraphData] = useState([]);

  const filterContestsByDate = (contests, filter) => {
    const now = Date.now();
    let daysAgo = 30;

    if (filter === "last90") daysAgo = 90;
    else if (filter === "last360") daysAgo = 360;

    const cutoff = now - daysAgo * 24 * 60 * 60 * 1000;

    return contests.filter(
      (contest) => contest.contestStartTime * 1000 >= cutoff
    );
  };

  useEffect(() => {
    if (contestData.length > 0) {
      const filtered = filterContestsByDate(contestData, timeFilter);
      setFilteredContests(filtered);

      const currRating = filtered.map((data) => ({
        date: new Date(data.contestStartTime * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        rating: data.newRating,
      }));

      setRatingGraphData(currRating.reverse());
    }
  }, [contestData, timeFilter]);

  const fetchContestData = async () => {
    const token = sessionStorage.getItem("adminToken");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/contest/all?handle=${studentHandle}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data.contests;
      setContestData(result);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (studentHandle) {
      fetchContestData();
    }
  }, [studentHandle]);

  return (
    <ContestHistoryContainer>
      <Filters theme={theme} themeSetter={themeSetter}>
        <FilterLabel theme={theme} themeSetter={themeSetter}>Filter By Days: </FilterLabel>
        <FilterSelect
          theme={theme} themeSetter={themeSetter}
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="last30">Last 30</option>
          <option value="last90">Last 90</option>
          <option value="last360">Last 360</option>
        </FilterSelect>
      </Filters>

      <RatingGraph theme={theme} themeSetter={themeSetter}>
        <GraphTitle theme={theme} themeSetter={themeSetter}>Rating Graph</GraphTitle>
        <Graph>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ratingGraphData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#edf2f7' : themeSetter.dark.secondaryBackground} />
              <XAxis dataKey="date" stroke={theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText} />
              <YAxis stroke={theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText} />
              <Tooltip
                contentStyle={{
                  background: theme === 'light' ? themeSetter.light.primaryColor : themeSetter.dark.primaryColor,
                  border: `1px solid ${theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.secondaryBackground}`,
                  color: theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText
                }}
                labelStyle={{ color: theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText }}
                itemStyle={{ color: theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rating"
                stroke={theme === 'light' ? '#667eea' : themeSetter.dark.secondaryBackground}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Graph>
      </RatingGraph>

      <TableContainer> {/* Added TableContainer for responsive table */}
        <ContestDetailsTable theme={theme} themeSetter={themeSetter}>
          <TableHeader theme={theme} themeSetter={themeSetter}>
            <TableRow theme={theme} themeSetter={themeSetter}>
              <TableHeaderCell theme={theme} themeSetter={themeSetter}>Contest Id</TableHeaderCell>
              <TableHeaderCell theme={theme} themeSetter={themeSetter}>Contest Name</TableHeaderCell>
              <TableHeaderCell theme={theme} themeSetter={themeSetter} align="center">Rank</TableHeaderCell>
              <TableHeaderCell theme={theme} themeSetter={themeSetter} align="center">Old Rating</TableHeaderCell>
              <TableHeaderCell theme={theme} themeSetter={themeSetter} align="center">New Rating</TableHeaderCell>
              <TableHeaderCell theme={theme} themeSetter={themeSetter} align="center">Unsolved</TableHeaderCell>
              <TableHeaderCell theme={theme} themeSetter={themeSetter} align="center">Contest Started</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {filteredContests.map((contest) => (
              <TableRow key={contest.contestId} theme={theme} themeSetter={themeSetter}>
                <TableCell theme={theme} themeSetter={themeSetter} data-label="Contest Id">{contest.contestId}</TableCell>
                <TableCell theme={theme} themeSetter={themeSetter} data-label="Contest Name">{contest.contestName}</TableCell>
                <TableCell theme={theme} themeSetter={themeSetter} align="center" data-label="Rank">{contest.rank}</TableCell>
                <TableCell theme={theme} themeSetter={themeSetter} align="center" data-label="Old Rating">{contest.oldRating}</TableCell>
                <TableCell theme={theme} themeSetter={themeSetter} align="center" data-label="New Rating">{contest.newRating}</TableCell>
                <TableCell theme={theme} themeSetter={themeSetter} align="center" data-label="Unsolved">{contest.unsolvedProblems}</TableCell>
                <TableCell theme={theme} themeSetter={themeSetter} align="center" data-label="Contest Started">
                  {new Date(contest.contestStartTime * 1000).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </ContestDetailsTable>
      </TableContainer>
    </ContestHistoryContainer>
  );
};

const ProblemSolving = ({ studentHandle, theme, themeSetter }) => {
  const [timeFilter, setTimeFilter] = useState('All');

  const [problemData, setProblemData] = useState({
    totalProblems: 0,
    avgProbRate: 0,
    problemPerDay: 0,
    mostDifficult: 0,
    ratingDistribution: [],
    problemHeatMap: []
  })

  const fetchSubmissionData = async () => {
    const token = sessionStorage.getItem("adminToken");

    let totalDays = 360;
    if (timeFilter === "last7") totalDays = 7;
    else if (timeFilter === "last30") totalDays = 30;
    else if (timeFilter === "last90") totalDays = 90;
    else if (timeFilter === "All") totalDays = 365 * 5;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/submission/all?handle=${studentHandle}&days=${totalDays}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data.data;
      const totalSolved = result?.totalSolved || 0;
      const allRatings = result?.ratings || [];
      const allCreationTimes = result?.creationTimes || [];

      if (allRatings.length > 0 || allCreationTimes.length > 0) {
        const sum = allRatings.reduce((a, b) => a + b, 0);
        const avg = allRatings.length > 0 ? Math.round(sum / allRatings.length) : 0;
        const maxRate = allRatings.length > 0 ? Math.max(...allRatings) : 0;

        const problemBarData = {};
        allRatings.forEach((rating) => {
          problemBarData[rating] = (problemBarData[rating] || 0) + 1;
        });

        const ratingDistribution = Object.entries(problemBarData)
          .map(([rating, count]) => ({
            ratings: Number(rating),
            count,
          }))
          .sort((a, b) => a.ratings - b.ratings);

        const problemHeatData = {};
        allCreationTimes.forEach((unixSec) => {
          const dateStr = new Date(unixSec * 1000)
            .toISOString()
            .slice(0, 10);
          problemHeatData[dateStr] = (problemHeatData[dateStr] || 0) + 1;
        });

        const problemHeatMap = Object.entries(problemHeatData)
          .map(([date, count]) => ({
            date,
            count,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setProblemData({
          totalProblems: totalSolved,
          avgProbRate: avg,
          problemPerDay: totalSolved && totalDays ? Math.round(totalSolved / totalDays) : 0,
          mostDifficult: maxRate,
          ratingDistribution,
          problemHeatMap
        });
      } else {
        setProblemData({
          totalProblems: 0,
          avgProbRate: 0,
          problemPerDay: 0,
          mostDifficult: 0,
          ratingDistribution: [],
          problemHeatMap: [],
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (studentHandle) {
      fetchSubmissionData();
    }
  }, [timeFilter, studentHandle]);

  return (
    <ProblemSolvingData>
      <Filters theme={theme} themeSetter={themeSetter}>
        <FilterLabel theme={theme} themeSetter={themeSetter}>Filter By Days: </FilterLabel>
        <FilterSelect
          theme={theme} themeSetter={themeSetter}
          value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="last7">Last 7</option>
          <option value="last30">Last 30</option>
          <option value="last90">Last 90</option>
        </FilterSelect>
      </Filters>

      <StatsContainer theme={theme} themeSetter={themeSetter}>
        <StatCard theme={theme} themeSetter={themeSetter}>
          <StatValue theme={theme} themeSetter={themeSetter}>{problemData.totalProblems}</StatValue>
          <StatLabel theme={theme} themeSetter={themeSetter}>Total Problems Solved</StatLabel>
        </StatCard>
        <StatCard theme={theme} themeSetter={themeSetter}>
          <StatValue theme={theme} themeSetter={themeSetter}>{problemData.avgProbRate}</StatValue>
          <StatLabel theme={theme} themeSetter={themeSetter}>Average Problem Rating</StatLabel>
        </StatCard>
        <StatCard theme={theme} themeSetter={themeSetter}>
          <StatValue theme={theme} themeSetter={themeSetter}>{problemData.problemPerDay}</StatValue>
          <StatLabel theme={theme} themeSetter={themeSetter}>Problems Per Day</StatLabel>
        </StatCard>
        <StatCard theme={theme} themeSetter={themeSetter}>
          <StatValue theme={theme} themeSetter={themeSetter}>{problemData.mostDifficult}</StatValue>
          <StatLabel theme={theme} themeSetter={themeSetter}>Most Difficult Problem</StatLabel>
        </StatCard>
      </StatsContainer>

      <ChartContainer theme={theme} themeSetter={themeSetter}>
        <GraphTitle theme={theme} themeSetter={themeSetter}>Problems Solved by Rating</GraphTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={problemData.ratingDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#edf2f7' : themeSetter.dark.secondaryBackground} />
            <XAxis dataKey="ratings" stroke={theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText} />
            <YAxis stroke={theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText} />
            <Tooltip
              contentStyle={{
                background: theme === 'light' ? themeSetter.light.primaryColor : themeSetter.dark.primaryColor,
                border: `1px solid ${theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.secondaryBackground}`,
                color: theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText
              }}
              labelStyle={{ color: theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText }}
              itemStyle={{ color: theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText }}
            />
            <Bar dataKey="count" fill={theme === 'light' ? '#667eea' : themeSetter.dark.secondaryBackground} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <HeatmapContainer theme={theme} themeSetter={themeSetter}>
        <HeatmapTitle theme={theme} themeSetter={themeSetter}>Submission Heatmap</HeatmapTitle>
        <CalendarHeatmap
          startDate={new Date(Date.now() - 365 * 86400 * 1000)}
          endDate={new Date()}
          values={problemData.problemHeatMap}
          classForValue={(value) => {
            if (!value || value.count === 0) return `color-empty-${theme}`;
            if (value.count <= 2) return `color-scale-1-${theme}`;
            if (value.count <= 4) return `color-scale-2-${theme}`;
            if (value.count <= 6) return `color-scale-3-${theme}`;
            return `color-scale-4-${theme}`;
          }}
          tooltipDataAttrs={(value) => {
            if (!value?.date) return { 'data-tip': 'No data' };

            const formatted = new Date(value.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return {
              'data-tip': `${formatted}: ${value.count} problem${value.count !== 1 ? 's' : ''} solved`,
            };
          }}
        />
      </HeatmapContainer>
    </ProblemSolvingData>
  );
};

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