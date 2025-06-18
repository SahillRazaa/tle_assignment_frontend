import React from 'react';
import styled from 'styled-components';

const SwitchWrapper = styled.div`
  display: inline-block;
  &:hover::after {
    content: "Reminder Toggler";
    position: absolute;
    top: -10%; 
    transform: translateX(-50%);
    background-color: black;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    white-space: nowrap;
    font-size: 0.75rem;
    z-index: 100;
    opacity: 1;
    pointer-events: none;
  }

  &::after {
    content: "";
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    position: absolute;
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const Checkbox = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #28a745;
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #dc3545;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 20px; width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

export default function ReminderToggler({ isOn, setIsOn, handle }) {
  const toggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    console.log(`state changed by ${handle}`);
  };

  return (
    <SwitchWrapper>
      <Switch>
        <Checkbox type="checkbox" checked={isOn} onChange={toggle} />
        <Slider />
      </Switch>
    </SwitchWrapper>
  );
}
