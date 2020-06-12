import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function ForfeitGameButton({ moves, isActive, yourID }) {
  const { forfeitGame } = moves;

  function handleClick(event) {
    event.target.blur();
    return forfeitGame(yourID);
  }

  return (
    <Component data-file="game-menu/ForfeitGame">
      <Button disabled={!isActive} onClick={event => handleClick(event)}>
        <ButtonText>Forfeit game</ButtonText>
      </Button>
      {!isActive && <Hint>Can only forfeit on your turn.</Hint>}
    </Component>
  );
}

ForfeitGameButton.propTypes = {
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  yourID: PropTypes.string,
  toggleMenuFn: PropTypes.func
};

const Component = styled.div``;
const Button = styled.button`
  appearance: none;
  background: transparent;
  border-radius: 0;
  border: 1px solid rgb(101, 237, 255);
  box-sizing: border-box;
  box-shadow: -1px 1px 10px rgba(0, 0, 0, 0.925),
    0 1px 2px rgba(75, 210, 255, 0.425), 0 -1px 2px rgba(75, 210, 255, 0.425),
    1px 0 2px rgba(75, 210, 255, 0.425), -1px 0 2px rgba(75, 210, 255, 0.425),
    inset 0 1px 10px rgba(1, 98, 155, 0.425);
  color: inherit;
  cursor: pointer;
  font: inherit;
  height: 38px;
  font-size: 1em;
  letter-spacing: 0.05em;
  margin: 0;
  min-width: 175px;
  overflow: visible;
  padding: 0;
  position: relative;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  transition-property: background-color, border-color, box-shadow, color;
  transition: 100ms ease-in-out;
  vertical-align: middle;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  &:before {
    background: linear-gradient(
      -90deg,
      #3cf,
      rgb(75, 210, 255),
      #00bbff,
      rgb(75, 210, 255),
      #3cf
    );
    background-size: 400% 100%;
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: -1;
  }

  /* prettier-ignore */
  &:hover {
    background-color: rgb(53, 248, 255);
    box-shadow: 
      -1px 1px 10px rgba(0, 0, 0, 0),
      0 1px 2px rgba(75, 210, 255, 0.425),
      0 -1px 2px rgba(75, 210, 255, 0.425),
      1px 0 2px rgba(75, 210, 255, 0.425),
      -1px 0 2px rgba(75, 210, 255, 0.425),
      inset 0 1px 10px rgba(1, 98, 155, 0.425);
    border-color: rgb(135, 255, 245);
  }

  &[disabled] {
    cursor: not-allowed;
    background-color: rgb(53, 53, 53);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.425);
    color: #e5e5e5;
    border-color: #555050;
  }
`;

const ButtonText = styled.span`
  font-family: 'Carter One', sans-serif;
  color: white;
  width: 100%;
  letter-spacing: inherit;
  line-height: 0;
  margin: 0 auto;
  pointer-events: none;
  position: absolute;
  transition: 100ms ease;
  user-select: none;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black;

  &.--default {
    opacity: 1;
    mix-blend-mode: overlay;
  }

  &.--hover {
    opacity: 0;
    mix-blend-mode: normal;
  }

  .end__turn__button[disabled] & {
    &.--default {
      color: rgb(129, 111, 111);
      mix-blend-mode: normal;
    }
  }

  /* prettier-ignore */
  .end__turn__button:not([disabled]):hover & {
    &.--default { opacity: 0; }
    &.--hover   { opacity: 0.875; }
  }
`;

const Hint = styled.div`
  font-size: 0.675em;
  letter-spacing: 0.05em;
  margin: 1em auto 0;
  text-shadow: 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black;
`;
