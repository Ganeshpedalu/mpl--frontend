import { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone } from 'lucide-react';

const DetailsSearch = memo(() => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to exactly 10 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(value);
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate mobile number
    if (!mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }

    if (mobileNumber.length !== 10) {
      setError(`Mobile number must be exactly 10 digits (${mobileNumber.length} digits entered)`);
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Mobile number must contain only digits');
      return;
    }

    // Navigate to details page with mobile number as query parameter
    navigate(`/details?mobile=${mobileNumber.trim()}`);
  }, [mobileNumber, navigate]);

  return (
    <section id="details-search" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#041955] mb-4">
            Check Registration Details
          </h2>
          <p className="text-lg text-gray-600">
            Enter your mobile number to view your registration details
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={handleChange}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B31E] transition-all ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#041955] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#062972] transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>View Details</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
});

DetailsSearch.displayName = 'DetailsSearch';

export default DetailsSearch;

