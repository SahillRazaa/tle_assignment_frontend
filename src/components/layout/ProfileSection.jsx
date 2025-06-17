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

const Container = styled.div`
  padding: 2rem;
  margin: 0 auto;
  margin-top: 64px;
  max-width: 1800px;
`;

const Wrapper = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  height: calc(100vh - 130px);
`;

const LeftWrapper = styled.div`
  flex: 1;
  min-width: 300px;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-y: auto;
`;

const RightWrapper = styled.div`
  flex: 3;
  min-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
`;

const Image = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  border: 4px solid #f8fafc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const StudentName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.25rem;
  text-align: center;
`;

const StudentHandle = styled.p`
  color: #667eea;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 1.5rem;
  text-align: center;
`;

const DetailSection = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #edf2f7;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #718096;
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
    background: #667eea;
    margin-right: 8px;
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
`;

const DetailLabel = styled.span`
  color: #718096;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #2d3748;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
`;

const RankBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Toggler = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 12px;
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
  background: ${({ active }) => (active ? '#ffffff' : 'transparent')};
  color: ${({ active }) => (active ? '#4c51bf' : '#718096')};
  box-shadow: ${({ active }) => (active ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none')};

  &:hover {
    color: #4c51bf;
  }
`;

const ContentContainer = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const RatingValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4a5568;
`;

const RatingChange = styled.span`
  font-size: 0.875rem;
  color: ${({ positive }) => (positive ? '#48bb78' : '#e53e3e')};
  font-weight: 600;
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.125rem;
  margin-bottom: 1rem;
`;

const Star = styled.span`
  color: ${({ filled }) => (filled ? '#f6ad55' : '#e2e8f0')};
  font-size: 1.125rem;
`;

const ContestHistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const Filters = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FilterLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e0;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const RatingGraph = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const GraphTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem;
`;

const Graph = styled.div`
  height: 300px;
`;

const ContestDetailsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8fafc;
  }

  &:hover {
    background: #edf2f7;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  width: 10%;
  border-bottom: 1px solid #edf2f7;
  text-align: ${({ align }) => align || 'left'};
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  text-align: ${({ align }) => align || 'left'};
  background: #f8fafc;
`;

const ProblemSolvingData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4c51bf;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  text-align: center;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HeatmapContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HeatmapTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem;
`;

const ContestHistory = () => {
  const [timeFilter, setTimeFilter] = useState("last360");
  const data = useAppSelector((state) => state.student).studentData;
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

  const fetchSubmissionData = async () => {
    const handle = data.handle;
    const token = sessionStorage.getItem("adminToken");

    try {
      const response = await axios.get(
        `http://localhost:8000/contest/all?handle=${handle}`,
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
    fetchSubmissionData();
  }, []);

  return (
    <ContestHistoryContainer>
      <Filters>
        <FilterLabel>Filter By Days: </FilterLabel>
        <FilterSelect
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="last30">Last 30</option>
          <option value="last90">Last 90</option>
          <option value="last360">Last 360</option>
        </FilterSelect>
      </Filters>

      <RatingGraph>
        <GraphTitle>Rating Graph</GraphTitle>
        <Graph>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ratingGraphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Graph>
      </RatingGraph>

      <ContestDetailsTable>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Contest Id</TableHeaderCell>
            <TableHeaderCell>Contest Name</TableHeaderCell>
            <TableHeaderCell align="center">Rank</TableHeaderCell>
            <TableHeaderCell align="center">Old Rating</TableHeaderCell>
            <TableHeaderCell align="center">New Rating</TableHeaderCell>
            <TableHeaderCell align="center">Unsolved</TableHeaderCell>
            <TableHeaderCell align="center">Contest Started</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {filteredContests.map((contest) => (
            <TableRow key={contest.contestId}>
              <TableCell>{contest.contestId}</TableCell>
              <TableCell>{contest.contestName}</TableCell>
              <TableCell align="center">{contest.rank}</TableCell>
              <TableCell align="center">{contest.oldRating}</TableCell>
              <TableCell align="center">{contest.newRating}</TableCell>
              <TableCell align="center">{contest.unsolvedProblems}</TableCell>
              <TableCell align="center">
                {new Date(contest.contestStartTime * 1000).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </ContestDetailsTable>
    </ContestHistoryContainer>
  );
};

const ProblemSolving = () => {
  const [timeFilter, setTimeFilter] = useState('All');
  const data = useAppSelector((state) => state.student).studentData;

  const [problemData, setProblemData] = useState({
    totalProblems: 0,
    avgProbRate: 0,
    problemPerDay: 0,
    mostDifficult: 0,
    ratingDistribution: [],
    problemHeatMap: []
  })

  const fetchSubmissionData = async () => {
    const handle = data.handle;
    const token = sessionStorage.getItem("adminToken");
  
    let totalDays = 360;
    if (timeFilter === "last7") totalDays = 7;
    else if (timeFilter === "last30") totalDays = 30;
    else if (timeFilter === "last90") totalDays = 90;
  
    try {
      const response = await axios.get(
        `http://localhost:8000/submission/all?handle=${handle}&days=${totalDays}`,
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
        const avg = Math.round(sum / allRatings.length);
        const maxRate = Math.max(...allRatings);
  
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
          problemPerDay: totalSolved ? Math.round(totalSolved / totalDays) : 0,
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
    fetchSubmissionData();
  }, [timeFilter]);

  return (
    <ProblemSolvingData>
      <Filters>
        <FilterLabel>Filter By Days: </FilterLabel>
        <FilterSelect value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="last7">Last 7</option>
          <option value="last30">Last 30</option>
          <option value="last90">Last 90</option>
        </FilterSelect>
      </Filters>

      <StatsContainer>
        <StatCard>
          <StatValue>{problemData.totalProblems}</StatValue>
          <StatLabel>Total Problems Solved</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{problemData.avgProbRate}</StatValue>
          <StatLabel>Average Problem Rating</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{problemData.problemPerDay}</StatValue>
          <StatLabel>Problems Per Day</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{problemData.mostDifficult}</StatValue>
          <StatLabel>Most Difficult Problem</StatLabel>
        </StatCard>
      </StatsContainer>

      <ChartContainer>
        <GraphTitle>Problems Solved by Rating</GraphTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={problemData.ratingDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
            <XAxis dataKey="ratings" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#667eea" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <HeatmapContainer>
        <HeatmapTitle>Submission Heatmap</HeatmapTitle>
        <CalendarHeatmap
          startDate={new Date(Date.now() - 365 * 86400 * 1000)}
          endDate={new Date()}
          values={problemData.problemHeatMap}
          classForValue={(value) => {
            if (!value || value.count === 0) return 'color-empty';
            if (value.count <= 2) return 'color-scale-1';
            if (value.count <= 4) return 'color-scale-2';
            if (value.count <= 6) return 'color-scale-3';
            return 'color-scale-4';
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

  return (
    <Container>
      <Wrapper>
        <LeftWrapper>
          <Image src={studentData.avatar} alt="avatar" />
          <StudentName>{studentData.fullName}</StudentName>
          <StudentHandle>@{studentData.handle}</StudentHandle>
          <RankBadge>{studentData.rank}</RankBadge>

          <DetailSection>
            <SectionTitle>Personal Details</SectionTitle>
            <DetailRow>
              <DetailLabel>Email</DetailLabel>
              <DetailValue>
                <a href={`mailto:${studentData.email}`} style={{ color: '#4c51bf', textDecoration: 'none' }}>
                  {studentData.email}
                </a>
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Phone</DetailLabel>
              <DetailValue>{studentData.phoneNumber}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Organization</DetailLabel>
              <DetailValue>{studentData.organization}</DetailValue>
            </DetailRow>
          </DetailSection>

          <DetailSection>
            <SectionTitle>Codeforces Stats</SectionTitle>
            <RatingDisplay>
              <RatingValue>Current Rating: {studentData.rating}</RatingValue>
              <RatingChange positive={(studentData.rating - studentData.maxRating) > 0}>
                {(studentData.rating - studentData.maxRating) > 0 ? '+' : ''}{(studentData.rating - studentData.maxRating)}
              </RatingChange>
            </RatingDisplay>
            <DetailRow>
              <DetailLabel>Max Rating</DetailLabel>
              <DetailValue>{studentData.maxRating}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Contribution</DetailLabel>
              <DetailValue>{studentData.contribution}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Friends</DetailLabel>
              <DetailValue>{studentData.friendOfCount}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Last Online</DetailLabel>
              <DetailValue>{new Date(studentData.lastOnlineTimeSeconds * 1000).toLocaleString()}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Account Created</DetailLabel>
              <DetailValue>{new Date(studentData.registrationTimeSeconds * 1000).toLocaleString()}</DetailValue>
            </DetailRow>
          </DetailSection>
        </LeftWrapper>

        <RightWrapper>
          <Toggler>
            <ToggleButton 
              active={toggleType === 'contest'} 
              onClick={() => setToggleType('contest')}
            >
              Contest History
            </ToggleButton>
            <ToggleButton 
              active={toggleType === 'problems'} 
              onClick={() => setToggleType('problems')}
            >
              Problem Solving
            </ToggleButton>
          </Toggler>

          <ContentContainer>
            {toggleType === 'contest' ? <ContestHistory /> : <ProblemSolving />}
          </ContentContainer>
        </RightWrapper>
      </Wrapper>
    </Container>
  );
};

export default ProfileSection;