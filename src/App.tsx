import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormBuilder } from './pages/FormBuilder';
import { UserManagement } from './pages/UserManagement';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/form-builder" element={<FormBuilder />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;