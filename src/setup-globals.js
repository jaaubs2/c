// Rend React et ReactDOM disponibles globalement (window.React / window.ReactDOM),
// comme le faisait le prototype qui les chargeait depuis un CDN.
// Ce fichier doit être importé avant les écrans.
import React from "react";
import * as ReactDOMClient from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOMClient;
