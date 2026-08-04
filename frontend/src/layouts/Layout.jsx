import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
 
// Wraps every route except ones that want a focused, nav-free view
// (ProblemDetail keeps its own minimal top bar instead of the main Navbar,
// the same way LeetCode/Codeforces hide global nav during solving).
export default function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}