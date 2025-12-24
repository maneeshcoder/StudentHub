import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../components/Home/Home";
import Notes from "../components/Notes/Notes";
import Colleges from "../components/Colleges/Colleges";
import Communities from "../components/Communities/Communities";
import TeamFinder from "../components/TeamFinder/TeamFinder";
import Anonymous from "../components/Anonymous/Anonymous";

export default function AppRoutes({ user }) {
  return (
    <Routes>
      <Route path="/" element={<Home user={user} />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/colleges" element={<Colleges />} />
      <Route path="/communities" element={<Communities />} />
      <Route path="/team-finder" element={<TeamFinder />} />
      <Route path="/anonymous" element={<Anonymous />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
