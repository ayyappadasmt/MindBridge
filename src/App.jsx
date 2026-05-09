import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { JournalProvider } from "./context/JournalContext";
import ProtectedRoute      from "./routes/ProtectedRoute";
import OfflineBanner       from "./components/OfflineBanner";
import Navbar              from "./components/Navbar";
import Login               from "./pages/Login";
import Dashboard           from "./pages/Dashboard";
import Journal             from "./pages/Journal";
import MoodHistory         from "./pages/MoodHistory";
import SafetyPlan          from "./pages/SafetyPlan";
import Settings            from "./pages/Settings";

function Layout({ children }) {
  return (
    <>
      <OfflineBanner />
      <Navbar />
      <main className="pt-16 min-h-screen">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JournalProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/journal"     element={<ProtectedRoute><Layout><Journal /></Layout></ProtectedRoute>} />
            <Route path="/mood"        element={<ProtectedRoute><Layout><MoodHistory /></Layout></ProtectedRoute>} />
            <Route path="/safety"      element={<ProtectedRoute><Layout><SafetyPlan /></Layout></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          </Routes>
        </JournalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}