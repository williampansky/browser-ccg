import React from 'react';
import { hot } from 'react-hot-loader';
import { Button, Input } from '@ccg/components';
// import { MECHANICS } from '@ccg/data';

const App = () => {
  return (
    <React.Fragment>
      <div className="App">
        <Button />
        <img src="/images/PLACEHOLDER.jpg" />
        <Input />
      </div>
    </React.Fragment>
  );
};

export default hot(module)(App);
