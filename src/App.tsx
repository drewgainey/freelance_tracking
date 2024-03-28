import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalLayout from "./components/layout/globalLayout";
import ProtectedRoute from "./components/auth/protectedRoute";
import Clients from "./pages/clients/clients";
import Home from "./pages/home";
import Hours from "./pages/hours";
import Invoicing from "./pages/invoicing";
import LoginSignup from "./pages/loginSignup";
import TimeEntry from "./pages/timeEntry";
import ClientDetails from "./pages/clients/clientDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<GlobalLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/time-entry" element={<TimeEntry />} />
            <Route path="/hours" element={<Hours />} />
            <Route path="/invoices" element={<Invoicing />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:clientId" element={<ClientDetails />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
