import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import axios from 'axios';

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

export default ProblemSolving;