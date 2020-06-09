/* eslint-disable react/prop-types */
import React from 'react';

export default function EndTurnButton({
  G,
  events,
  moves,
  isActive,
  yourID,
  theirID
}) {
  function handleClick(event) {
    event.preventDefault();
    moves.hoverCard(null);
    moves.selectCard(null, null);
    moves.logMessage('endTurn');
    return events.endTurn();
  }

  return (
    <div data-file="end-turn/EndTurn" className={'end__turn'}>
      <button
        className={'end__turn__button'}
        disabled={!isActive}
        onClick={event => handleClick(event)}
      >
        <div className="end__turn__button__text --default">
          {isActive ? 'End Turn' : 'Their Turn'}
        </div>
        <div className="end__turn__button__text --hover">
          {isActive ? 'End Turn' : 'Their Turn'}
        </div>
      </button>
    </div>
  );
}
