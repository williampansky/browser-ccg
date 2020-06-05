import React from 'react';
import { Image } from 'cloudinary-react';
import { Button, Input } from '@ccg/components';
import { MECHANICS } from '@ccg/data';

const App = () => {
  console.log(MECHANICS);
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

export default App;
