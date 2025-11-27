import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader } from 'lucide-react';

// Lazy load components for better performance
const Header = lazy(() => import('./components/Header'));
const Hero = lazy(() => import('./components/Hero'));
const WinnerSection = lazy(() => import('./components/WinnerSection'));
const Gallery = lazy(() => import('./components/Gallery'));
const RegistrationForm = lazy(() => import('./components/RegistrationForm'));
const RegistrationDetails = lazy(() => import('./components/RegistrationDetails'));
const DetailsSearch = lazy(() => import('./components/DetailsSearch'));
const Footer = lazy(() => import('./components/Footer'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-12 h-12 animate-spin text-[#041955] mx-auto mb-4" />
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Header />
      <Hero />
      <WinnerSection />
      <Gallery />
      <RegistrationForm />
      <DetailsSearch />
      <Footer />
    </Suspense>
  );
}

function App() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/details" element={<RegistrationDetails />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
