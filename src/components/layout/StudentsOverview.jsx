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

const Container = styled.div`
  padding: 2rem;
  background: #f8fafc;
  margin-top: 64px;
  font-family: 'Segoe UI', sans-serif;
`;

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  margin: 0;
  color: #0f172a;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
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
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  min-width: 200px;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr 1fr 1fr 1.2fr 2fr 1.5fr 1.5fr 1.5fr;
  padding: 1rem;
  background: #1e293b;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
  min-width: 1200px;
`;

const TableHeaderCell = styled.div`
  padding-right: 0.5rem;
`;

const TableBodyWrapper = styled.div`
  height: 580px;
  overflow: auto;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr 1fr 1fr 1.2fr 2fr 1.5fr 1.5fr 1.5fr;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  min-width: 1200px;
  &:hover {
    background: #f1f5f9;
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
`;

const Loader = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #334155;
`;

const NoData = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-weight: 500;
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
`;

const ModalContainer = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #1e293b;
`;

const ModalInput = styled.input`
  width: 100%;
  margin: 0.5rem 0 1rem 0;
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const ModalButton = styled.button`
  background: ${({ cancel }) => (cancel ? '#e2e8f0' : '#3b82f6')};
  color: ${({ cancel }) => (cancel ? '#1e293b' : '#fff')};
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
`;

const FilterTitle = styled.p`
  font-size: 1rem;
  font-weight: bold;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
`

const TotalStudentCount = styled.p`
  font-size: 1rem;
`

const StudentsOverview = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("adminToken");
  const navigate = useNavigate();
  
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
          return diffDays > 7;
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
    
    return (
      <TableRow style={style}>
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
        <TableCell>{(student.emailReminder)/4}</TableCell>
        <TableCell>
          <ActionIcons>
            <ViewProfileButton onClick={() => handleProfileView(student)}>
              View Profile
            </ViewProfileButton>
            <Edit onClick={() => initializeUpdate(student)} color="warning" fontSize="small" />
            <Delete onClick={() => handleDeleteClick(student.handle)} color="error" fontSize="small" />
          </ActionIcons>
        </TableCell>
      </TableRow>
    );
  }, [filteredData, handleProfileView, initializeUpdate, handleDeleteClick]);

  return (
    <Container>
      <TitleBar>
        <Title>Students Overview</Title>
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
            <FilterTitle>Filter by Rating: </FilterTitle>
            <Select onChange={handleRatingFilterChange}>
              <option value="">All Rating</option>
              <option value="lt1400">Less than 1400</option>
              <option value="1400to1700">1400 to 1700</option>
              <option value="1700to2000">1700 to 2000</option>
              <option value="2000to2400">2000 to 2400</option>
              <option value="gt2400">2400 and more</option>
            </Select>
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleStudentSearch}
              />
          </Filters>
          <TotalStudentCount><b>Total Students: </b>{totalStudents}</TotalStudentCount>
        </FilterContainer>

      <TableContainer>
        <TableHeader>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Phone No.</TableHeaderCell>
          <TableHeaderCell>CF Handle</TableHeaderCell>
          <TableHeaderCell>Rating</TableHeaderCell>
          <TableHeaderCell>Rating(Max)</TableHeaderCell>
          <TableHeaderCell>Last Synced</TableHeaderCell>
          <TableHeaderCell>Last Active</TableHeaderCell>
          <TableHeaderCell>Total Reminder</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBodyWrapper>
          {loading ? (
            <Loader>Loading students...</Loader>
          ) : filteredData.length === 0 ? (
            <NoData>No student found.</NoData>
          ) : (
            <AutoSizer>
              {({ width }) => (
                <List
                  height={580}
                  width={width}
                  itemCount={filteredData.length}
                  itemSize={60}
                >
                  {TableRowVirtualized}
                </List>
              )}
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
          <ModalContent>
            <ModalTitle>Add New Student</ModalTitle>
            <ModalInput name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} />
            <ModalInput name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} />
            <ModalInput name="phoneNumber" placeholder="Phone Number" type="tel" value={formData.phoneNumber} onChange={handleInputChange} />
            <ModalInput name="handle" placeholder="Codeforces Handle" value={formData.handle} onChange={handleInputChange} />
            <ModalActions>
              <ModalButton cancel onClick={() => setAddStudentModal(false)}>Cancel</ModalButton>
              <ModalButton onClick={handleAddStudent}>Submit</ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalContainer>
      )}

      {updateStudentModal && (
        <ModalContainer>
          <ModalContent>
            <ModalTitle>Update Student's Data</ModalTitle>
            <ModalInput name="fullName" placeholder="Full Name" value={updateFormData.fullName} onChange={handleUpdateInputChange} />
            <ModalInput name="email" placeholder="Email" type="email" value={updateFormData.email} onChange={handleUpdateInputChange} />
            <ModalInput name="phoneNumber" placeholder="Phone Number" type="tel" value={updateFormData.phoneNumber} onChange={handleUpdateInputChange} />
            <ModalInput name="handle" placeholder="Codeforces Handle" value={updateFormData.handle} onChange={handleUpdateInputChange} />
            <ModalActions>
              <ModalButton cancel onClick={() => setUpdateStudentModal(false)}>Cancel</ModalButton>
              <ModalButton onClick={handleUpdateStudent}>Update</ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalContainer>
      )}

      {deleteConfirmModal && (
        <ModalContainer>
          <ModalContent>
            <ModalTitle>Confirm Deletion</ModalTitle>
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