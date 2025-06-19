import React, { useState, useEffect, useMemo } from 'react';
import { Add, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShowToast } from '../../utils/Toster';
import { unparse } from 'papaparse';
import { useAppDispatch } from '../../redux/hook';
import { setStudentData } from '../../redux/slice/studentSlice';
import CronBuilder from './CronBuilder';
import { useTheme } from '../../context/ThemeProvider';
import { themeSetter } from '../../utils/ThemeSetter';
import StudentTable from './StudentProblemLayout/StudentTable';
import StudentModals from './StudentProblemLayout/StudentModal';
import styled from 'styled-components';

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
    else filtered = [...studentsData];

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
        emailReminder: (emailReminder / 4) || 0
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
    });
    dispatch(setStudentData(data));
    navigate(`/profile/${data.handle}/${data._id}`);
  };

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
          <Select theme={theme} themeSetter={themeSetter} onChange={handleRatingFilterChange} value={ratingFilter}>
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

      <StudentTable
        filteredData={filteredData}
        loading={loading}
        handleProfileView={handleProfileView}
        initializeUpdate={initializeUpdate}
        handleDeleteClick={handleDeleteClick}
        fetchStudents={fetchStudents} 
      />

      <PaginationWrapper>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </PaginationWrapper>

      <StudentModals
        addStudentModal={addStudentModal}
        setAddStudentModal={setAddStudentModal}
        formData={formData}
        handleInputChange={handleInputChange}
        handleAddStudent={handleAddStudent}
        updateStudentModal={updateStudentModal}
        setUpdateStudentModal={setUpdateStudentModal}
        updateFormData={updateFormData}
        handleUpdateInputChange={handleUpdateInputChange}
        handleUpdateStudent={handleUpdateStudent}
        deleteConfirmModal={deleteConfirmModal}
        setDeleteConfirmModal={setDeleteConfirmModal}
        selectedHandleToDelete={selectedHandleToDelete}
        confirmDelete={confirmDelete}
      />
    </Container>
  );
};

export default StudentsOverview;