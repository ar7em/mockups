'use strict';

import Paths from '../constants/Paths';

// Core
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Redirect = Router.Redirect;
var NotFoundRoute = Router.NotFoundRoute;

// CSS
require('normalize.css');
require('../styles/common.scss');

// Views
var MockupsApp = require('./App/App');
var DropboxLogin = require('./DropboxLogin/DropboxLogin');
var OauthReciever = require('./OauthReciever/OauthReciever');
var InitialSetup = require('./InitialSetup/InitialSetup');

var Routes = (
  <Route handler={MockupsApp} path="/">
    <Route name="dropbox-auth" path={Paths.LOGIN} handler={DropboxLogin} />
    <Route name="oauth-reciever" path={Paths.OAUTH_RECIEVER} handler={OauthReciever} />
    <Route name="initial-setup" path={Paths.INITIAL_SETUP} handler={InitialSetup} />
    <NotFoundRoute handler={MockupsApp} />
  </Route>
);

Router.run(Routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.getElementById("content"));
});
