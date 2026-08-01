import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Problems from "./pages/Problems";
import Contests from "./pages/Contests";

function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-6 p-5 bg-slate-900 text-white">
        <Link to="/problems">
          Problems
        </Link>

        <Link to="/contests">
          Contests
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Problems />} />

        <Route path="/problems" element={<Problems />} />

        <Route path="/contests" element={<Contests />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
