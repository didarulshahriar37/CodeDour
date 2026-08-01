import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import ProblemSet from "./pages/ProblemSet";
import Contests from "./pages/Contests";

function App() {
  return (
    <BrowserRouter>

      <nav className="flex gap-6 p-5 bg-slate-900 text-white">
        <Link to="/problems">
          Problem Set
        </Link>

        <Link to="/contests">
          Contests
        </Link>
      </nav>

      <Routes>

        <Route
          path="/"
          element={<ProblemSet />}
        />

        <Route
          path="/problems"
          element={<ProblemSet />}
        />

        <Route
          path="/contests"
          element={<Contests />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;