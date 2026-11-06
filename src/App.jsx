import { Route, Routes } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import HomePage from "@/pages/HomePage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
