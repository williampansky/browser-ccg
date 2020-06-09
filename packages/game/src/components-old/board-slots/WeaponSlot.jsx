import React from 'react';
import styled from 'styled-components';

export default function WeaponSlot({ index, onClick, render, gameWidth }) {
  return (
    <Component
      data-file="board-slots/WeaponSlot"
      data-slot={index}
      gameWidth={gameWidth}
      onClick={onClick}
    />
  );
}

const Component = styled.div`
  bottom: 0;
  box-sizing: border-box;
  box-shadow: 0px 0px 20px 0px rgba(183, 197, 53, 0.45) inset;
  height: 100%;
  left: 306px;
  margin: auto auto 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 306px;
  top: 0;
  user-select: none;
  width: auto;
  transition: 100ms ease-in-out;
  transition-property: box-shadow, opacity;

  cursor: pointer;
  opacity: 1;
  pointer-events: auto;
  z-index: 250;

  &:before {
    content: '';
    background: rgba(255, 255, 255, 0.125);
    width: 100%;
    height: 100%;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 100ms ease-in-out;
  }

  &:hover {
    box-shadow: 0px 0px 60px 0px rgba(183, 197, 53, 0.85) inset;
  }

  &:hover:before {
    opacity: 1;
  }
`;
