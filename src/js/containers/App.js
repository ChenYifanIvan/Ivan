import React from 'react';
import { connect } from 'react-redux';
import DefaultLayout from '../components/layout/Default';
import ErrorLayout from '../components/layout/Error';

const App = (props) => {
  const { fbStatus: { status, name, email }, adAccounts: { current } } = props;
  let layout;
  if (status === 'connected') {
    layout = <DefaultLayout name={name} email={email} currentAdAccountId={current} />;
  } else {
    layout = <ErrorLayout />;
  }

  return layout;
};

function mapStateToProps(state) {
  return {
    fbStatus: state.fbStatus,
    adAccounts: state.adAccounts,
  };
}

export default connect(mapStateToProps)(App);
