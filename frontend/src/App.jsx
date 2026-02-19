import { Routes, Route, Navigate } from "react-router-dom"
import Consent from "./pages/Consent"
import Apps from "./pages/Apps"
import Audit from "./pages/Audit"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/consent" />} />
      <Route path="/consent" element={<Consent />} />
      <Route path="/apps" element={<Apps />} />
      <Route path="/audit" element={<Audit />} />
    </Routes>
  )
}
