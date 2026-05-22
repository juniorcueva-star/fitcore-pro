import { Navigate, Route, Routes } from "react-router-dom"
import { TopNavigation } from "./components/layout/TopNavigation"
import { LoginPage } from "./features/auth/LoginPage"
import { AdminDashboard } from "./features/admin/AdminDashboard"
import { TrainerDashboard } from "./features/trainer/TrainerDashboard"
import { StudentApp } from "./features/student/StudentApp"
import { ProtectedRoute } from "./features/auth/ProtectedRoute"

function App() {
  return (
    <>
      <TopNavigation />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entrenador"
          element={
            <ProtectedRoute allowedRoles={["TRAINER"]}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentApp />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App