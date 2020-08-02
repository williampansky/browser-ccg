import React from 'react';
import PropTypes from 'prop-types';
import ScrollToBottom from 'react-scroll-to-bottom';
import { createMarkup } from '@ccg/utils';

const MatchHistory = ({ G, ctx }) => {
  const { matchHistory } = G;

  return (
    <div className="match__history" data-component="MatchHistory">
      <section>
        <ScrollToBottom
          checkInterval={100}
          scrollViewClassName="_scrollable little"
          mode="bottom"
        >
          {matchHistory.map((log, i) => {
            return (
              <div
                className="log-item uk-animation-slide-top-small"
                key={i}
                dangerouslySetInnerHTML={createMarkup(log)}
              />
            );
          })}
        </ScrollToBottom>
      </section>
    </div>
  );
};

export default MatchHistory;
