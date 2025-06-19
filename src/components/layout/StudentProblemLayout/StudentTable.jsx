import React, { useCallback, useEffect } from 'react';
import { Edit, Delete } from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReminderToggler from '../../ui/ReminderToggler';
import axios from 'axios';
import { ShowToast } from '../../../utils/Toster';
import { useTheme } from '../../../context/ThemeProvider';
import { themeSetter } from '../../../utils/ThemeSetter';
import styled from 'styled-components';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  background: ${({ theme, themeSetter }) => theme === 'light' ? '#ffffff' : themeSetter.dark.secondaryBackground};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
`;

const TableGridStyles = `
  grid-template-columns: 1fr 2fr 1.5fr 1fr 1fr 1.2fr 2fr 1.5fr 1.1fr 2.5fr;
  min-width: 1200px;

  @media (max-width: 1024px) {
    min-width: 1000px;
    grid-template-columns: 1fr 1.8fr 1.2fr 1fr 0.8fr 1fr 1.8fr 1.2fr 1fr 2fr;
  }

  @media (max-width: 768px) {
    min-width: 900px;
    grid-template-columns: 1fr 1.5fr 1fr 1fr 0.8fr 0.8fr 1.5fr 1fr 0.8fr 2fr;
  }

  @media (max-width: 480px) {
    min-width: 700px;
    grid-template-columns: 1fr 1.2fr 0.8fr 0.8fr 0.7fr 0.7fr 1.2fr 0.8fr 0.7fr 1.5fr;
  }
`;

const TableHeader = styled.div`
  display: grid;
  ${TableGridStyles}
  padding: 1rem;
  background: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.dark.background : themeSetter.light.background};
  color: ${props => props.theme === 'light' ? props.themeSetter.dark.primaryText : props.themeSetter.light.primaryText};
  font-weight: 600;
  position: sticky;
  top: 0;

  @media (max-width: 1024px) {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
`;

const TableHeaderCell = styled.div`
  padding-right: 0.5rem;
`;

const TableBodyWrapper = styled.div`
  height: 580px;
  overflow-y: auto; /* Only allow vertical scrolling here, horizontal is on TableContainer */

  @media (max-width: 1024px) {
    height: 500px;
  }

  @media (max-width: 768px) {
    height: 400px;
  }
`;

const TableRow = styled.div`
  display: grid;
  ${TableGridStyles}
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  background: ${({ theme }) => theme === 'light' ? '#ffffff' : '#424242'};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  &:hover {
    background: ${({ theme }) => theme === 'light' ? '#f1f5f9' : '#545454'};
  }

  @media (max-width: 1024px) {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
`;

const TableCell = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5rem;
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-start;
  svg {
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.1);
    }
  }

  @media (max-width: 768px) {
    gap: 0.3rem;
    svg {
      font-size: 1rem !important;
    }
  }

  @media (max-width: 480px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ViewProfileButton = styled.a`
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  &:hover {
    background: #3b82f6;
    color: white;
  }

  @media (max-width: 768px) {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
  }
`;

const Loader = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1rem;
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#64748b' : themeSetter.dark.primaryText};
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 1rem;
  }
`;

const StudentTable = ({
  filteredData,
  loading,
  handleProfileView,
  initializeUpdate,
  handleDeleteClick,
  fetchStudents
}) => {
  const { theme } = useTheme();

  const calculateLastActive = (date) => {
    const currDate = Math.floor(Date.now() / 1000);
    const diff = currDate - date;
    const inDays = Math.floor(diff / (24 * 60 * 60));
    return inDays;
  };

  const handleToggleReminder = useCallback(async (handle, newState) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL}/students/reminderUpdate/${handle}`, {
        enabled: newState,
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      ShowToast({
        title: "Updated",
        type: "success",
        message: `Reminder ${newState ? "ON" : "OFF"} for ${handle}`
      });
      fetchStudents();
    } catch (error) {
      console.error(`Failed to update reminder for ${handle}:`, error);
      ShowToast({
        title: "Error",
        type: "error",
        message: `Failed to update reminder for ${handle}`
      });
    }
  }, [fetchStudents]);

  useEffect(() => {
    const getInactiveStudents = async () => {
      const currTime = Math.floor(Date.now() / 1000);
      const token = sessionStorage.getItem("adminToken");

      const inactiveStudents = filteredData.filter((student) => {
        const lastActive = student.lastOnlineTimeSeconds;
        const diffDays = Math.floor((currTime - lastActive) / (24 * 60 * 60));
        return (diffDays > 7) && (student.enabled);
      });

      if (inactiveStudents.length > 0) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/email/reminder`,
            {
              userData: inactiveStudents.map((s) => ({
                name: s.fullName,
                email: s.email,
                message: `<p>Hey ${s.fullName}, we noticed you haven’t been active on Codeforces. Let’s get back on track!</p>`,
              })),
              subject: "We Miss You on Codeforces!",
            },
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Reminder sent:", response.data);
        } catch (err) {
          console.error("Failed to send reminders", err);
        }
      }
    };

    if (filteredData.length > 0) {
      getInactiveStudents();
    }
  }, [filteredData]);

  const TableRowVirtualized = useCallback(({ index, style }) => {
    const student = filteredData[index];

    return (
      <TableRow theme={theme} themeSetter={themeSetter} style={style}>
        <TableCell>{student.fullName}</TableCell>
        <TableCell>{student.email}</TableCell>
        <TableCell>{student.phoneNumber}</TableCell>
        <TableCell>{student.handle}</TableCell>
        <TableCell>{student.rating || 0}</TableCell>
        <TableCell>{student.maxRating || 0}</TableCell>
        <TableCell>{new Date(student.lastSyncedAt).toDateString()}</TableCell>
        <TableCell>
          {(() => {
            const days = calculateLastActive(student.lastOnlineTimeSeconds);
            if (days === 0) return "Today";
            if (days === 1) return "Yesterday";
            return `${days} Days`;
          })()}
        </TableCell>
        <TableCell>{(student.emailReminder) / 4}</TableCell>
        <TableCell>
          <ActionIcons>
            <ViewProfileButton onClick={() => handleProfileView(student)}>
              View Profile
            </ViewProfileButton>
            <Edit onClick={() => initializeUpdate(student)} color="warning" fontSize="small" />
            <Delete onClick={() => handleDeleteClick(student.handle)} color="error" fontSize="small" />
            <ReminderToggler
              isOn={student.enabled}
              setIsOn={(val) => handleToggleReminder(student.handle, val)}
              handle={student.handle}
            />
          </ActionIcons>
        </TableCell>
      </TableRow>
    );
  }, [filteredData, theme, handleProfileView, initializeUpdate, handleDeleteClick, handleToggleReminder]);

  return (
    <TableContainer theme={theme} themeSetter={themeSetter}>
      <TableHeader theme={theme} themeSetter={themeSetter}>
        <TableHeaderCell>Name</TableHeaderCell>
        <TableHeaderCell>Email</TableHeaderCell>
        <TableHeaderCell>Phone No.</TableHeaderCell>
        <TableHeaderCell>CF Handle</TableHeaderCell>
        <TableHeaderCell>Rating</TableHeaderCell>
        <TableHeaderCell>Rating(Max)</TableHeaderCell>
        <TableHeaderCell>Last Synced</TableHeaderCell>
        <TableHeaderCell>Last Active</TableHeaderCell>
        <TableHeaderCell>Reminder</TableHeaderCell>
        <TableHeaderCell>Actions</TableHeaderCell>
      </TableHeader>
      <TableBodyWrapper>
        {loading ? (
          <Loader theme={theme} themeSetter={themeSetter}>Loading students...</Loader>
        ) : filteredData.length === 0 ? (
          <NoData theme={theme} themeSetter={themeSetter}>No student found.</NoData>
        ) : (
          <AutoSizer>
            {({ width }) => {
              let effectiveMinWidth = 1200;
              if (width <= 480) {
                effectiveMinWidth = 700;
              } else if (width <= 768) {
                effectiveMinWidth = 900;
              } else if (width <= 1024) {
                effectiveMinWidth = 1000;
              }

              const listWidth = Math.max(width, effectiveMinWidth);

              return (
                <List
                  height={580}
                  width={listWidth}
                  itemCount={filteredData.length}
                  itemSize={60}
                >
                  {TableRowVirtualized}
                </List>
              );
            }}
          </AutoSizer>
        )}
      </TableBodyWrapper>
    </TableContainer>
  );
};

export default StudentTable;