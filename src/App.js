import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import './App.css';

import Navbar from './Components/Navbar';
import Countries from './Components/Countries';
import CountryDetail from './Components/CountryDetail';
import StateDetail from './Components/StateDetail';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route index element={<Countries />} />
        <Route path="countries" element={<Countries />} />
        <Route path="countries/:code" element={<CountryDetail />} />
        <Route path="countries/:countryCode/states/:stateCode" element={<StateDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
