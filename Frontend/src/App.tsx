// src/App.tsx

import "./styles/PageStyle/App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/routs";
import ScrollToTop from "./components/ScrollToTop";
import TermsPopup from "./components/TermsPopup";

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <TermsPopup />

      <Navbar />
      <AppRoutes />
      <Footer />
    </div>
  );
}

export default App;