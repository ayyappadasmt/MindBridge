import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { JournalProvider } from "./context/JournalContext";
import { OfflineProvider } from "./context/OfflineContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import MoodHistory from "./pages/MoodHistory";
import AIAssistant from "./pages/AIAssistant";
import SafetyPlan from "./pages/SafetyPlan";
import Pathway from "./pages/Pathway";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

function AppWithLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <OfflineProvider>
        <AuthProvider>
          <JournalProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"    element={<AppWithLayout><Dashboard /></AppWithLayout>} />
              <Route path="/journal"      element={<AppWithLayout><Journal /></AppWithLayout>} />
              <Route path="/mood"         element={<AppWithLayout><MoodHistory /></AppWithLayout>} />
              <Route path="/assistant"    element={<AppWithLayout><AIAssistant /></AppWithLayout>} />
              <Route path="/safety"       element={<AppWithLayout><SafetyPlan /></AppWithLayout>} />
              <Route path="/pathway"      element={<AppWithLayout><Pathway /></AppWithLayout>} />
              <Route path="/notifications"element={<AppWithLayout><Notifications /></AppWithLayout>} />
              <Route path="/settings"     element={<AppWithLayout><Settings /></AppWithLayout>} />
              <Route path="*"             element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </JournalProvider>
        </AuthProvider>
      </OfflineProvider>
    </BrowserRouter>
  );
}
