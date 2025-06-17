import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Copy, Check } from 'lucide-react';
import styled from 'styled-components';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShowToast } from '../utils/Toster';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 28rem;
`;

const CenterText = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #0f172a;

`;

const Subtitle = styled.p`
  color: #475569;
  margin-top: 0.25rem;
`;

const StyledCard = styled(Card)`
  border: none;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
`;

const StyledCardHeader = styled(CardHeader)`
  padding-bottom: 0.5rem;
`;

const StyledCardTitle = styled(CardTitle)`
  color: #0f172a;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ButtonWrapper = styled.div`
  padding-top: 0.5rem;
`;

const CredentialsContainer = styled.div`
  margin-top: 2rem;
  background-color: #f1f5f9;
  padding: 1rem;
  border-radius: 0.5rem;
`;

const Credential = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #e2e8f0;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #0f172a;
  font-family: monospace;
  cursor: pointer;

  svg {
    color: #475569;
    transition: color 0.2s;
    &:hover {
      color: #1e293b;
    }
  }
`;

const EmailCred = styled.span`
  font-weight: 500;
`;

const PasswordCred = styled.span`
  font-weight: 500;
`;

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const adminEmail = "tleassignment@gmail.com"
  const adminPassword = "submittedbysahil"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/login`, {
        user: data.email,
        secKey: data.password,
      });
      ShowToast({
        title: 'Success',
        type: 'success',
        message: 'You are logged In!'
      })
      sessionStorage.setItem('adminToken', res.data.token);
      navigate('/dashboard');
    } catch (error) {
      ShowToast({
        title: 'Error',
        type: 'error',
        message: 'You are not Authorized!'
      })
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);

      if(text === adminEmail) {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
        ShowToast({ title: 'Copied', message: 'Email Copied!', type: 'success' });
      }
      else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
        ShowToast({ title: 'Copied', message: 'Password Copied!', type: 'success' });
      }
    } catch (error) {
      ShowToast({ title: 'Error', message: 'Copy failed!', type: 'error' });
    }
  };

  return (
    <Container>
      <Wrapper>
        <CenterText>
          <Title>Student Progress Management</Title>
          <Subtitle>Powered by TLE Eliminators</Subtitle>
        </CenterText>

        <StyledCard>
          <StyledCardHeader>
            <StyledCardTitle>Sign In</StyledCardTitle>
          </StyledCardHeader>
          <CardContent>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                icon={<Mail size={20} />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                icon={<Lock size={20} />}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />

              <ButtonWrapper>
                <Button type="submit" isLoading={isLoading}>
                  Sign In
                </Button>
              </ButtonWrapper>
            </Form>
            <CredentialsContainer>
              <Subtitle>Login Credentials</Subtitle>
              <Subtitle style={{marginTop: "20px"}}>Email:</Subtitle>
              <Credential>
                <EmailCred>{adminEmail}</EmailCred>
                {copiedEmail ? <Check size={18} /> : <Copy size={18} onClick={() => handleCopy(adminEmail)} />}
              </Credential>
              <Subtitle style={{marginTop: "20px"}}>Password:</Subtitle>
              <Credential>
                <PasswordCred>{adminPassword}</PasswordCred>
                {copiedPassword ? <Check size={18} /> : <Copy size={18} onClick={() => handleCopy(adminPassword)} />}
              </Credential>
            </CredentialsContainer>
          </CardContent>
        </StyledCard>
      </Wrapper>
    </Container>
  );
}

export default Login;