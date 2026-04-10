import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Theory from './pages/Theory';
import CaseStudies from './pages/CaseStudies';
import Labs from './pages/Labs';
import Demos from './pages/Demos';
import Defense from './pages/Defense';
import LiveDemo from './pages/LiveDemo';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theory" element={<Theory />} />
          <Route path="/cases" element={<CaseStudies />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/demos" element={<Demos />} />
          <Route path="/live-demo" element={<LiveDemo />} />
          <Route path="/defense" element={<Defense />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
