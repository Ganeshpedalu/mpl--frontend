import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, User, Phone, Shirt, Target, Calendar, ArrowLeft, Download } from 'lucide-react';
import { getApiUrlWithParams } from '../config/apiConfig';
import LazyImage from './LazyImage';

interface RegistrationData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  tshirtSize: string;
  tshirtName: string;
  tshirtNumber: string;
  role: string;
  profileImage: string;
  aadhaarImage: string;
  paymentImage: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: RegistrationData;
  message?: string;
}

export default function RegistrationDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mobileNumber = searchParams.get('mobile');
  
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!mobileNumber) {
        setError('Mobile number is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(getApiUrlWithParams('details', { mobileNumber }));
        
        if (!response.ok) {
          // Try to parse the error response from the API
          let errorMsg = 'Failed to fetch registration details';
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch (parseError) {
            // If JSON parsing fails, use the status text or default message
            errorMsg = response.statusText || errorMsg;
          }
          setError(errorMsg);
          setLoading(false);
          return;
        }

        const result: ApiResponse = await response.json();

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch registration details');
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        const errorMsg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [mobileNumber]);

  const downloadImage = useCallback((imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const formattedDate = useMemo(() => {
    return data ? formatDate(data.createdAt) : '';
  }, [data, formatDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#041955] mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#041955] mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#041955] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#062972] transition-all"
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-[#041955] hover:text-[#E6B31E] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-semibold">Back to Home</span>
          </button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#041955] mb-2">
            Registration Details
          </h1>
          <p className="text-lg text-gray-600">View your registration information</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Profile Section */}
          <div className="bg-gradient-to-r from-[#041955] to-[#062972] p-8 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <LazyImage
                  src={data.profileImage}
                  alt={`${data.firstName} ${data.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-[#E6B31E] object-cover shadow-lg"
                />
                <button
                  onClick={() => downloadImage(data.profileImage, `profile-${data.mobileNumber}.jpg`)}
                  className="absolute bottom-0 right-0 bg-[#E6B31E] text-[#041955] p-2 rounded-full hover:bg-white transition-all shadow-lg"
                  title="Download Profile Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">
                  {data.firstName} {data.lastName}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{data.mobileNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#041955] mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Phone className="w-5 h-5 text-[#E6B31E]" />
                    <div>
                      <p className="text-xs text-gray-500">Mobile Number</p>
                      <p className="font-semibold text-[#041955]">{data.mobileNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shirt className="w-5 h-5 text-[#E6B31E]" />
                    <div>
                      <p className="text-xs text-gray-500">T-Shirt Size</p>
                      <p className="font-semibold text-[#041955]">{data.tshirtSize}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shirt className="w-5 h-5 text-[#E6B31E]" />
                    <div>
                      <p className="text-xs text-gray-500">Name on T-Shirt</p>
                      <p className="font-semibold text-[#041955]">{data.tshirtName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shirt className="w-5 h-5 text-[#E6B31E]" />
                    <div>
                      <p className="text-xs text-gray-500">Number on T-Shirt</p>
                      <p className="font-semibold text-[#041955]">{data.tshirtNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Target className="w-5 h-5 text-[#E6B31E]" />
                    <div>
                      <p className="text-xs text-gray-500">Playing Role</p>
                      <p className="font-semibold text-[#041955]">{data.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#041955] mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Registration Information
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-5 h-5 text-[#E6B31E]" />
                    <div>
                      <p className="text-xs text-gray-500">Registration Date</p>
                      <p className="font-semibold text-[#041955]">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#041955] mb-4">Uploaded Documents</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Aadhaar Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-[#041955] mb-3">Aadhaar Card</h4>
                  <div className="relative group">
                    <LazyImage
                      src={data.aadhaarImage}
                      alt="Aadhaar Card"
                      className="w-full rounded-lg border-2 border-gray-200 object-contain max-h-64 bg-white"
                    />
                    <button
                      onClick={() => downloadImage(data.aadhaarImage, `aadhaar-${data.mobileNumber}.png`)}
                      className="absolute top-2 right-2 bg-[#041955] text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#062972]"
                      title="Download Aadhaar Card"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Payment Screenshot */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-[#041955] mb-3">Payment Screenshot</h4>
                  <div className="relative group">
                    <LazyImage
                      src={data.paymentImage}
                      alt="Payment Screenshot"
                      className="w-full rounded-lg border-2 border-gray-200 object-contain max-h-64 bg-white"
                    />
                    <button
                      onClick={() => downloadImage(data.paymentImage, `payment-${data.mobileNumber}.jpg`)}
                      className="absolute top-2 right-2 bg-[#041955] text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#062972]"
                      title="Download Payment Screenshot"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

