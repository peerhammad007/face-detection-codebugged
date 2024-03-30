import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import { UserContextProvider } from "./context/UserContext";
import Navbar from "./components/Navbar";

function App() {
  
  return (
    <div className="App">
      <UserContextProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </Router>
      </UserContextProvider>
  
    </div>
  );
}

export default App;
