import React from 'react'
import styled from 'styled-components'
import { Sun, Moon, LogOut, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { ShowToast } from '../../utils/Toster';

const Container = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 64px;
  background:black ;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3rem;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const LeftWrapper = styled.div`
  color: #e2e8f0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 1px;
`;

const RightWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const DarkModeToggle = styled.button`
  background: transparent;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #facc15;
  }
`;

const LogoutButton = styled.button`
  background-color: #ef4444; 
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

  &:hover {
    background-color:rgb(159, 34, 34);
  }
`;

const HomeButton = styled.button`
  background-color: #3b82f6; 
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

  &:hover {
    background-color:rgb(20, 79, 174);
  }
`;

const Navbar = () => {
  const [dark, setDark] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    ShowToast({
      title: 'Success',
      type: 'success',
      message: 'Admin Logged Out!'
    })
    navigate('/');
  }

  return (
    <Container>
      <LeftWrapper>
        TLE Eliminators
      </LeftWrapper>
      <RightWrapper>
        <DarkModeToggle onClick={() => setDark(!dark)}>
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </DarkModeToggle>
        <HomeButton onClick={() => navigate('/dashboard')}>
          <Home size={16} style={{ marginRight: 6 }} />
          Home
        </HomeButton>
        <LogoutButton onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: 6 }} />
          Logout
        </LogoutButton>
      </RightWrapper>
    </Container>
  );
};

export default Navbar;
