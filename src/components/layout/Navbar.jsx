import React, { useState } from 'react';
import styled from 'styled-components';
import { Sun, Moon, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShowToast } from '../../utils/Toster';
import { useTheme } from '../../context/ThemeProvider';
import { themeSetter } from '../../utils/ThemeSetter';
import { clearStudentData } from '../../redux/slice/studentSlice';
import { useAppDispatch } from '../../redux/hook';

const Container = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 64px;
  background: ${props => props.theme === 'light' ? props.themeSetter.light.background : props.themeSetter.dark.background};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3rem;
  z-index: 1000;
  box-shadow: 0 2px 10px ${props => props.theme === 'light' ? props.themeSetter.light.primaryText : props.themeSetter.dark.primaryText};

  @media (max-width: 1024px) {
    padding: 0 2rem;
    height: 60px;
  }

  @media (max-width: 768px) {
    padding: 0 1rem; 
    height: 56px; 
  }
`;

const LeftWrapper = styled.div`
  color: ${props => props.theme === 'light' ? props.themeSetter.light.primaryText : props.themeSetter.dark.primaryText};
  font-size: 1.25rem; 
  font-weight: 600;
  letter-spacing: 1px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const RightWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem; 

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const DarkModeToggle = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme === 'light' ? props.themeSetter.light.primaryText : props.themeSetter.dark.primaryText};
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;

  &:hover {
    color: #facc15;
  }

  @media (max-width: 768px) {
    svg {
      width: 18px; 
      height: 18px;
    }
    padding: 0.2rem;
  }
`;

const BaseButton = styled.button`
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap; 

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem; 

    svg {
      width: 14px; 
      height: 14px;
      margin-right: 4px !important; 
    }
  }

  @media (max-width: 480px) {
    padding: 0.4rem; 
    span { 
      display: none;
    }
    svg { 
      margin-right: 0 !important;
    }
  }
`;

const LogoutButton = styled(BaseButton)`
  background-color: #ef4444; 

  &:hover {
    background-color: rgb(159, 34, 34);
  }
`;

const HomeButton = styled(BaseButton)`
  background-color: #3b82f6; 

  &:hover {
    background-color: rgb(20, 79, 174);
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    ShowToast({
      title: 'Success',
      type: 'success',
      message: 'Admin Logged Out!'
    });
    dispatch(clearStudentData());
    navigate('/');
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <Container themeSetter={themeSetter} theme={theme}>
      <LeftWrapper themeSetter={themeSetter} theme={theme}>
        TLE Eliminators
      </LeftWrapper>
      <RightWrapper>
        <DarkModeToggle themeSetter={themeSetter} theme={theme} onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </DarkModeToggle>
        <HomeButton onClick={() => navigate('/dashboard')}>
          <Home size={16} style={{ marginRight: 6 }} />
          <span>Home</span>
        </HomeButton>
        <LogoutButton onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: 6 }} />
          <span>Logout</span> 
        </LogoutButton>
      </RightWrapper>
    </Container>
  );
};

export default Navbar;