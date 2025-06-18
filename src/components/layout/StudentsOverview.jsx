import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Add, Edit, Delete, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShowToast } from '../../utils/Toster';
import { unparse } from 'papaparse';
import { useAppDispatch } from '../../redux/hook';
import { setStudentData } from '../../redux/slice/studentSlice';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import CronBuilder from './CronBuilder';
import ReminderToggler from '../ui/ReminderToggler';
import { useTheme } from '../../context/ThemeProvider';
import { themeSetter } from '../../utils/ThemeSetter';

const Container = styled.div`
  padding: 2rem;
  background: ${props => props.theme === 'light' ? props.themeSetter.light.primaryColor : props.themeSetter.dark.primaryColor};
  margin-top: 64px;
  font-family: 'Segoe UI', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 56px;
  }
`;

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h2`
  margin: 0;
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    gap: 0.8rem;
  }
`;

const Button = styled.button`
  background: ${({ type }) => (type === 'export' ? '#e0e7ff' : '#3b82f6')};
  color: ${({ type }) => (type === 'export' ? '#1e3a8a' : '#fff')};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    gap: 0.3rem;
  }

  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    svg {
      font-size: 1rem !important;
    }
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: ${({ theme, themeSetter }) => theme === 'light' ? '#ffffff' : themeSetter.dark.secondaryBackground};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    padding: 0.4rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    width: 100%;
    margin-bottom: 0.5rem;
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  min-width: 200px;
  background: ${({ theme, themeSetter }) => theme === 'light' ? '#ffffff' : themeSetter.dark.secondaryBackground};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    padding: 0.4rem;
    font-size: 0.9rem;
    min-width: unset;
    width: calc(50% - 0.4rem);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

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

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 1rem;
  button {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    &:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
  }

  @media (max-width: 768px) {
    margin-top: 1rem;
    gap: 0.8rem;
    button {
      padding: 0.4rem 0.8rem;
      font-size: 0.9rem;
    }
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme, themeSetter }) => theme === 'light' ? '#ffffff' : themeSetter.dark.secondaryBackground};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 95%;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${({ theme, themeSetter }) => theme === 'light' ? '#1e293b' : themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
`;

const ModalInput = styled.input`
  width: 100%;
  margin: 0.5rem 0 1rem 0;
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: ${({ theme, themeSetter }) => theme === 'light' ? '#ffffff' : themeSetter.dark.secondaryBackground};
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.9rem;
    margin: 0.4rem 0 0.8rem 0;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    gap: 0.8rem;
    margin-top: 0.8rem;
  }
`;

const ModalButton = styled.button`
  background: ${({ cancel }) => (cancel ? '#e2e8f0' : '#3b82f6')};
  color: ${({ cancel }) => (cancel ? '#1e293b' : '#fff')};
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const FilterTitle = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const TotalStudentCount = styled.p`
  font-size: 1rem;
  color: ${({ theme, themeSetter }) => theme === 'light' ? themeSetter.light.primaryText : themeSetter.dark.primaryText};

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const StudentsOverview = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("adminToken");
  const navigate = useNavigate();

  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    handle: ''
  });

  const [updateFormData, setUpdateFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    handle: ''
  });

  const [addStudentModal, setAddStudentModal] = useState(false);
  const [updateStudentModal, setUpdateStudentModal] = useState(false);
  const [selectedHandleToUpdate, setSelectedHandleToUpdate] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [selectedHandleToDelete, setSelectedHandleToDelete] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState('');
  const dispatch = useAppDispatch();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/students/all?page=${page}&limit=${limit}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      setStudentsData(res.data.students);
      setFilteredData(res.data.students);
      setTotalPages(Math.ceil(res.data.total / limit));
      ShowToast({ title: 'Success', type: 'success', message: 'All Students Data is Synced!' });
    } catch (err) {
      console.error('Fetch error:', err);
      ShowToast({ title: 'Error', type: 'error', message: 'Failed to load students data!!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page]);

  const totalStudents = useMemo(() => {
    return filteredData.length;
  }, [filteredData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateInputChange = (e) => {
    setUpdateFormData({ ...updateFormData, [e.target.name]: e.target.value });
  };

  const handleAddStudent = async () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.handle) {
      ShowToast({ title: 'Error', type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/students/create`, formData, {
        headers: { authorization: `Bearer ${token}` }
      });
      fetchStudents();
      setAddStudentModal(false);
      setFormData({ fullName: '', email: '', phoneNumber: '', handle: '' });
      ShowToast({ title: 'Success', type: 'success', message: 'New Student Details is Added!' });
    } catch (error) {
      console.error('Error creating student:', error);
      ShowToast({ title: 'Error', type: 'error', message: 'Failed to create student!' });
    }
  };

  const handleDeleteClick = (handle) => {
    setSelectedHandleToDelete(handle);
    setDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/students/delete/${selectedHandleToDelete}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      ShowToast({ title: 'Deleted', type: 'success', message: 'Student successfully deleted!' });
      setDeleteConfirmModal(false);
      setSelectedHandleToDelete(null);
      fetchStudents();
    } catch (err) {
      ShowToast({ title: 'Error', type: 'error', message: 'Failed to delete student!' });
      setDeleteConfirmModal(false);
    }
  };

  const initializeUpdate = (initialData) => {
    setUpdateFormData({
      fullName: initialData.fullName,
      email: initialData.email,
      phoneNumber: initialData.phoneNumber,
      handle: initialData.handle,
    });
    setSelectedHandleToUpdate(initialData.handle);
    setUpdateStudentModal(true);
  };

  const handleUpdateStudent = async () => {
    if (!updateFormData.fullName || !updateFormData.email || !updateFormData.phoneNumber || !updateFormData.handle) {
      ShowToast({ title: 'Error', type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/students/update/${selectedHandleToUpdate}`,
        updateFormData,
        { headers: { authorization: `Bearer ${token}` } }
      );
      ShowToast({ title: 'Updated', type: 'success', message: 'Student details updated successfully!' });
      setUpdateStudentModal(false);
      fetchStudents();
    } catch (error) {
      console.error('Update error:', error);
      ShowToast({ title: 'Error', type: 'error', message: 'Failed to update student details!' });
    }
  };

  const handleStudentSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = studentsData.filter(data => data.fullName.toLowerCase().includes(value));
    setFilteredData(filtered);
  };

  const handleRatingFilterChange = (e) => {
    const selected = e.target.value;
    setRatingFilter(selected);
    let filtered = [...studentsData];

    if (selected === 'lt1400') filtered = filtered.filter(s => (s.rating || 0) < 1400);
    else if (selected === '1400to1700') filtered = filtered.filter(s => (s.rating || 0) >= 1400 && (s.rating || 0) < 1700);
    else if (selected === '1700to2000') filtered = filtered.filter(s => (s.rating || 0) >= 1700 && (s.rating || 0) < 2000);
    else if (selected === '2000to2400') filtered = filtered.filter(s => (s.rating || 0) >= 2000 && (s.rating || 0) < 2400);
    else if (selected === 'gt2400') filtered = filtered.filter(s => (s.rating || 0) >= 2400);

    setFilteredData(filtered);
  };

  const exportCsv = (data, filename = 'student.csv') => {
    const currTime = Math.floor(Date.now() / 1000);

    const currData = data.map(({
      fullName,
      email,
      phoneNumber,
      handle,
      rating,
      maxRating,
      lastSyncedAt,
      lastOnlineTimeSeconds,
      emailReminder
    }) => {
      const lastOnlineDate = new Date(lastOnlineTimeSeconds * 1000).toLocaleString();
      const diffInDays = Math.floor((currTime - lastOnlineTimeSeconds) / (24 * 60 * 60));

      return {
        fullName,
        email,
        phoneNumber,
        handle,
        rating,
        maxRating,
        lastSyncedAt,
        lastOnlineDate,
        lastActive: diffInDays === 0 ? "Today" : diffInDays === 1 ? "Yesterday" : `${diffInDays} Days`,
        emailReminder: emailReminder || 0
      };
    });

    const csv = unparse(currData);
    const blob = new Blob([csv], { type: 'text/csv; charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ShowToast({ title: "Success", type: "success", message: "Student Data Downloaded!" });
  };

  const handleProfileView = (data) => {
    ShowToast({
      title: "NOTE",
      type: "info",
      message: "Data is synced till last year only"
    })
    dispatch(setStudentData(data));
    navigate('/profile/sahil/1234');
  };

  const TableRowVirtualized = useCallback(({ index, style }) => {
    const student = filteredData[index];

    const calculateLastActive = (date) => {
      const currDate = Math.floor(Date.now() / 1000);
      const diff = currDate - date;
      const inDays = Math.floor(diff / (24 * 60 * 60));
      return inDays;
    }

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

    const handleToggleReminder = async (handle, newState) => {
      try {
        setFilteredData(prevData =>
          prevData.map(student =>
            student.handle === handle ? { ...student, enabled: newState } : student
          )
        );

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
          message: `Reminder ${
            newState ? "ON" : "OFF"
          } for ${handle}`
        })
        console.log(`state changed by ${handle}`);
      } catch (error) {
        console.error(`Failed to update reminder for ${handle}:`, error);
        setFilteredData(prevData =>
          prevData.map(student =>
            student.handle === handle ? { ...student, enabled: !newState } : student
          )
        );
      }
    };

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
  }, [filteredData, handleProfileView, initializeUpdate, handleDeleteClick]);

  return (
    <Container theme={theme} themeSetter={themeSetter}>
      <TitleBar>
        <Title theme={theme} themeSetter={themeSetter}>Students Overview</Title>
        <ButtonGroup>
          <Button onClick={() => setAddStudentModal(true)}>
            <Add fontSize="small" /> Add Student
          </Button>
          <Button onClick={() => {
            const filename = `student_codeforces_${new Date().toDateString().split(' ').join('_')}.csv`;
            exportCsv(studentsData, filename);
          }} type="export">
            <Download fontSize="small" /> Export CSV
          </Button>
        </ButtonGroup>
      </TitleBar>

      <FilterContainer>
        <Filters>
          <FilterTitle theme={theme} themeSetter={themeSetter}>Filter by Rating: </FilterTitle>
          <Select theme={theme} themeSetter={themeSetter} onChange={handleRatingFilterChange}>
            <option value="">All Rating</option>
            <option value="lt1400">Less than 1400</option>
            <option value="1400to1700">1400 to 1700</option>
            <option value="1700to2000">1700 to 2000</option>
            <option value="2000to2400">2000 to 2400</option>
            <option value="gt2400">2400 and more</option>
          </Select>
          <Input
            theme={theme} themeSetter={themeSetter}
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleStudentSearch}
          />
        </Filters>
        <TotalStudentCount theme={theme} themeSetter={themeSetter}><b>Total Students: </b>{totalStudents}</TotalStudentCount>
      </FilterContainer>
      <CronBuilder />
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
                // Determine the effective min-width for the table based on media queries
                let effectiveMinWidth = 1200; // Default large screen
                if (width <= 480) {
                  effectiveMinWidth = 700;
                } else if (width <= 768) {
                  effectiveMinWidth = 900;
                } else if (width <= 1024) {
                  effectiveMinWidth = 1000;
                }

                // Use the maximum of the AutoSizer's provided width and the effectiveMinWidth
                const listWidth = Math.max(width, effectiveMinWidth);

                return (
                  <List
                    height={580}
                    width={listWidth} // Pass the calculated fixed width
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

      <PaginationWrapper>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </PaginationWrapper>

      {addStudentModal && (
        <ModalContainer>
          <ModalContent theme={theme} themeSetter={themeSetter}>
            <ModalTitle theme={theme} themeSetter={themeSetter}>Add New Student</ModalTitle>
            <ModalInput theme={theme} themeSetter={themeSetter} name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} />
            <ModalInput theme={theme} themeSetter={themeSetter} name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} />
            <ModalInput theme={theme} themeSetter={themeSetter} name="phoneNumber" placeholder="Phone Number" type="tel" value={formData.phoneNumber} onChange={handleInputChange} />
            <ModalInput theme={theme} themeSetter={themeSetter} name="handle" placeholder="Codeforces Handle" value={formData.handle} onChange={handleInputChange} />
            <ModalActions>
              <ModalButton cancel onClick={() => setAddStudentModal(false)}>Cancel</ModalButton>
              <ModalButton onClick={handleAddStudent}>Submit</ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalContainer>
      )}

      {updateStudentModal && (
        <ModalContainer>
          <ModalContent theme={theme} themeSetter={themeSetter}>
            <ModalTitle theme={theme} themeSetter={themeSetter}>Update Student's Data</ModalTitle>
            <ModalInput theme={theme} themeSetter={themeSetter} name="fullName" placeholder="Full Name" value={updateFormData.fullName} onChange={handleUpdateInputChange} />
            <ModalInput theme={theme} themeSetter={themeSetter} name="email" placeholder="Email" type="email" value={updateFormData.email} onChange={handleUpdateInputChange} />
            <ModalInput theme={theme} themeSetter={themeSetter} name="phoneNumber" placeholder="Phone Number" type="tel" value={updateFormData.phoneNumber} onChange={handleUpdateInputChange} />
            <ModalInput theme={theme} themeSetter={themeSetter} name="handle" placeholder="Codeforces Handle" value={updateFormData.handle} onChange={handleUpdateInputChange} />
            <ModalActions>
              <ModalButton cancel onClick={() => setUpdateStudentModal(false)}>Cancel</ModalButton>
              <ModalButton onClick={handleUpdateStudent}>Update</ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalContainer>
      )}

      {deleteConfirmModal && (
        <ModalContainer>
          <ModalContent theme={theme} themeSetter={themeSetter}>
            <ModalTitle theme={theme} themeSetter={themeSetter}>Confirm Deletion</ModalTitle>
            <p>Are you sure you want to delete student with handle: <strong>{selectedHandleToDelete}</strong>?</p>
            <ModalActions>
              <ModalButton cancel onClick={() => setDeleteConfirmModal(false)}>Cancel</ModalButton>
              <ModalButton onClick={confirmDelete}>Delete</ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalContainer>
      )}
    </Container>
  );
};

export default StudentsOverview;