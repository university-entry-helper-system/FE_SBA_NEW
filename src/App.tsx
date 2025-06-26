import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login"; // Fix the import path
import Register from "./components/register"; // Fix the import path
import Home from "./components/home"; // Fix the import path

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
