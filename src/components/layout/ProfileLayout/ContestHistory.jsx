import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import 'react-calendar-heatmap/dist/styles.css';
import axios from 'axios';

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
    width: 100%;
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
    height: 200px;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
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
    display: block;
  }
`;

const TableHeader = styled.thead`
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.secondaryBackground : themeSetter.dark.background};

  @media (max-width: 768px) {
    display: none;
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
    display: block;
    margin-bottom: 0.75rem;
    border: 1px solid ${({ theme, themeSetter }) => theme === 'light' ? '#edf2f7' : themeSetter.dark.secondaryBackground};
    border-radius: 8px;
    padding: 0.75rem;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  width: 10%;
  border-bottom: 1px solid ${({ theme, themeSetter }) => theme === 'light' ? '#edf2f7' : themeSetter.dark.secondaryBackground};
  text-align: ${({ align }) => align || 'left'};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    text-align: right;
    padding: 0.25rem 0;
    border-bottom: none;

    &::before {
      content: attr(data-label);
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
  
        <TableContainer>
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

export default ContestHistory;