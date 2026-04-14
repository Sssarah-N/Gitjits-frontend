import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import './App.css';

import Navbar from './Components/Navbar';
import Login from './Components/Login';
import Register from './Components/Register';
import Profile from './Components/Profile';
import Countries from './Components/Countries';
import CountryDetail from './Components/CountryDetail';
import StateDetail from './Components/StateDetail';
import ParkDetail from './Components/ParkDetail';
import ParksSearch from './Components/ParksSearch';
import RandomPark from './Components/RandomPark';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route index element={<Countries />} />
        <Route path="countries" element={<Countries />} />
        <Route path="countries/:code" element={<CountryDetail />} />
        <Route path="countries/:countryCode/states/:stateCode" element={<StateDetail />} />
        <Route path="/countries/:countryCode/states/:stateCode/parks/:parkCode" element={<ParkDetail />} />
        <Route path="parks" element={<ParksSearch />} />
        <Route path="random" element={<RandomPark />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
