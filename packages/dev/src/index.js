import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.scss';

// if (process.env.NODE_ENV === 'development' && module.hot) {
//   module.hot.accept('./App', () => {
//     const App = require('./App').default;
//     ReactDOM.render(<App />, document.getElementById('root'));
//   });
// }

ReactDOM.render(<App />, document.getElementById('root'));
