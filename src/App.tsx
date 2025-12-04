import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { FrontendDetailsProvider } from './context/FrontendDetailsContext';
import { OwnersProvider } from './context/OwnersContext';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const DetailsPage = lazy(() => import('./pages/DetailsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const OwnersPage = lazy(() => import('./pages/OwnersPage'));
const PlayersPage = lazy(() => import('./pages/PlayersPage'));
const OwnerRegistrationPage = lazy(() => import('./pages/OwnerRegistrationPage'));
const CheckBalancePage = lazy(() => import('./pages/CheckBalancePage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-12 h-12 animate-spin text-[#041955] mx-auto mb-4" />
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <FrontendDetailsProvider>
      <OwnersProvider>
        <div className="min-h-screen">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/details" element={<DetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/owners" element={<OwnersPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/owner/register" element={<OwnerRegistrationPage />} />
              <Route path="/check-balance" element={<CheckBalancePage />} />
            </Routes>
          </Suspense>
        </div>
      </OwnersProvider>
    </FrontendDetailsProvider>
  );
}

export default App;
