import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function MatchStats({ G, theirID, yourID }) {
  const { counts } = G;

  return (
    <Component data-file="player-sidebar/MatchStats">
      <div className={`column`}>
        <div className={`row`}>
          <span className={`item__label`}>Your Stats</span>
        </div>
        <hr />
        <div className={`row`}>
          <div className={`item`}>
            <span className={`item__label`}>Deck</span>
            <span className={`text__value`}>{counts[yourID].deck}</span>
          </div>
          <div className={`item`}>
            <span className={`item__label`}>Hand</span>
            <span className={`text__value`}>{counts[yourID].hand}</span>
          </div>
        </div>
      </div>
      <div className={`column`}>
        <div className={`row`}>
          <span className={`item__label`}>Their Stats</span>
        </div>
        <hr />
        <div className={`row`}>
          <div className={`item`}>
            <span className={`item__label`}>Deck</span>
            <span className={`text__value`}>{counts[theirID].deck}</span>
          </div>
          <div className={`item`}>
            <span className={`item__label`}>Hand</span>
            <span className={`text__value`}>{counts[theirID].hand}</span>
          </div>
        </div>
      </div>
    </Component>
  );
}

MatchStats.propTypes = {
  G: PropTypes.object,
  theirID: PropTypes.string,
  yourID: PropTypes.string
};

const Component = styled.div`
  font-size: 18px;
  padding: 40px 10px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: default;

  span {
    display: block;
  }

  hr {
    border: 1px solid #5b5b5b;
    width: 75%;
  }

  .column {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .row {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .row + .row {
    /* margin-top: 20px; */
  }

  .item {
    text-align: center;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
  }

  .item__label {
    font-family: 'Verdana', monospace;
    font-size: 0.675em;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .text__value {
    font-size: 1.5em;
    margin: 4px 0 0;
  }
`;
