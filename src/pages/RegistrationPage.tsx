import { Suspense, lazy } from 'react';
import { Loader } from 'lucide-react';

const Header = lazy(() => import('../components/Header'));
const RegistrationForm = lazy(() => import('../components/RegistrationForm'));
const Footer = lazy(() => import('../components/Footer'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-12 h-12 animate-spin text-[#041955] mx-auto mb-4" />
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

export default function RegistrationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Header />
      <RegistrationForm />
      <Footer />
    </Suspense>
  );
}

