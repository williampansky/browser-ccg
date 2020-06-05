import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import store from '../store';

// import '@/node_modules/magic.css/dist/magic.min.css';
// import '@/components/board.css';
// import '@/components/lobby.css';
// import '@/styles/root.site.css';
// import '@/styles/root.css';
// import '@/styles/app.scss';

function App({ Component, pageProps }) {
  return (
    <React.Fragment>
      <Provider store={store}>
        <Helmet
          htmlAttributes={{ lang: 'en' }}
          title="Hello next.js!"
          meta={[
            {
              name: 'viewport',
              content: 'width=device-width, initial-scale=1'
            },
            { property: 'og:title', content: 'Hello next.js!' }
          ]}
        />
        <Component {...pageProps} />
      </Provider>
    </React.Fragment>
  );
}

App.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object
};

export default App;
