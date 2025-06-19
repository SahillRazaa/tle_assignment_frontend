import React from 'react';
import { useTheme } from '../../../context/ThemeProvider';
import { themeSetter } from '../../../utils/ThemeSetter';
import styled from 'styled-components';

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

const StudentModals = ({
  addStudentModal,
  setAddStudentModal,
  formData,
  handleInputChange,
  handleAddStudent,
  updateStudentModal,
  setUpdateStudentModal,
  updateFormData,
  handleUpdateInputChange,
  handleUpdateStudent,
  deleteConfirmModal,
  setDeleteConfirmModal,
  selectedHandleToDelete,
  confirmDelete
}) => {
  const { theme } = useTheme();

  return (
    <>
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
    </>
  );
};

export default StudentModals;