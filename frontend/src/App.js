import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Profile from "./pages/Profile"
import Information from "./pages/Information"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Car from "./pages/Car"
import RouteComputer from "./pages/RouteComputer"
import OnboardControl from "./pages/OnboardControl"
import MeasuringDeviceSystem from "./pages/MeasuringSystem"
import Antivirus from "./pages/Antivirus"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/car/:id" element={<Car />} />
        <Route path="/rc/:id" element={<RouteComputer />} />
        <Route path="/bsc/:id" element={<OnboardControl />} />
        <Route path="/mds/:id" element={<MeasuringDeviceSystem />} />
        <Route path="/antivirus/:id" element={<Antivirus />} />
        <Route path="/information" element={<Information />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;