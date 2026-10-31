import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ─── Placeholder Pages (replace as implemented) ───────────────────────────────
const LoginPage = () => (
  <div style={{ padding: '2rem', color: '#f1f5f9', textAlign: 'center' }}>
    <h1>🔐 Login — Coming in Task 2</h1>
  </div>
);

const NotFoundPage = () => (
  <div style={{ padding: '2rem', color: '#f1f5f9', textAlign: 'center' }}>
    <h1>404 — Page Not Found</h1>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin, Staff, Customer routes — added per task */}
        {/* <Route path="/admin/*" element={<AdminRoutes />} /> */}
        {/* <Route path="/staff/*" element={<StaffRoutes />} /> */}
        {/* <Route path="/customer/*" element={<CustomerRoutes />} /> */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
