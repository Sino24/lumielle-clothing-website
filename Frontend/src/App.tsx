// src/App.tsx

import "./styles/PageStyle/App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/routs";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="app">
      <ScrollToTop />

      <Navbar />
      <AppRoutes />
      <Footer />
    </div>
  );
}

export default App;