import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManageBooks from "./features/library-book/pages/ManageBooks";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManageBooks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;