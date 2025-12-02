import { useState, useCallback, useMemo, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader, Copy, Check } from 'lucide-react';
import { getApiUrl, getApiUrlWithParams } from '../config/apiConfig';
import { getWhatsAppGroupLink } from '../config/socialConfig';
import { useFrontendDetails } from '../context/FrontendDetailsContext';

interface FormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  tshirtSize: string;
  tshirtName: string;
  tshirtNumber: string;
  role: string;
  profileFile: File | null;
  aadhaarFile: File | null;
  paymentFile: File | null;
}

export default function RegistrationForm() {
  const { details } = useFrontendDetails();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    tshirtSize: '',
    tshirtName: '',
    tshirtNumber: '',
    role: '',
    profileFile: null,
    aadhaarFile: null,
    paymentFile: null,
  });

  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mobileNumberStatus, setMobileNumberStatus] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle');

  const paymentDetails = useMemo(() => {
    const sanitize = (value?: string | null) => value?.trim() || '';
    const remotePayment = details?.payment;
    const registrationFee = details?.dashboard?.registrationFee || 0;
    const remoteUpi = sanitize(remotePayment?.upiId);

    return {
      amount: registrationFee,
      upiId: remoteUpi || '',
      qrCode: sanitize(remotePayment?.qrImageBase64),
      paytm: {
        number: sanitize(remotePayment?.paytmNumber),
        upiId: remoteUpi,
      },
      phonepe: {
        number: sanitize(remotePayment?.phonePeNumber),
        upiId: remoteUpi,
      },
      gpay: {
        number: sanitize(remotePayment?.gpayNumber),
        upiId: remoteUpi,
      },
    };
  }, [details]);

  const whatsappGroupLink = details?.whatsapp?.groupLink ?? getWhatsAppGroupLink();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = `Mobile number must be exactly 10 digits (${formData.mobileNumber.length} digits entered)`;
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must contain only digits';
    } else if (mobileNumberStatus === 'exists') {
      newErrors.mobileNumber = 'This mobile number is already registered';
    }

    if (!formData.tshirtSize) {
      newErrors.tshirtSize = 'Please select a T-shirt size';
    }

    if (!formData.tshirtName.trim()) {
      newErrors.tshirtName = 'Name on T-shirt is required';
    } else if (formData.tshirtName.trim().length > 15) {
      newErrors.tshirtName = 'Name on T-shirt should be maximum 15 characters';
    }

    if (!formData.tshirtNumber.trim()) {
      newErrors.tshirtNumber = 'Number on T-shirt is required';
    } else if (!/^\d{1,3}$/.test(formData.tshirtNumber.trim())) {
      newErrors.tshirtNumber = 'Please enter a valid number (1-999)';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!formData.aadhaarFile) {
      newErrors.aadhaarFile = 'Aadhaar card upload is required';
    }

    if (!formData.profileFile) {
      newErrors.profileFile = 'Profile picture is required';
    }

    if (!formData.paymentFile) {
      newErrors.paymentFile = 'Payment screenshot is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormComplete = useMemo((): boolean => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.mobileNumber.trim() !== '' &&
      /^\d{10}$/.test(formData.mobileNumber) &&
      formData.tshirtSize !== '' &&
      formData.tshirtName.trim() !== '' &&
      formData.tshirtNumber.trim() !== '' &&
      /^\d{1,3}$/.test(formData.tshirtNumber.trim()) &&
      formData.role !== '' &&
      formData.profileFile !== null &&
      formData.aadhaarFile !== null &&
      formData.paymentFile !== null
    );
  }, [formData]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'aadhaar' | 'payment' | 'profile') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [type === 'aadhaar' ? 'aadhaarFile' : type === 'payment' ? 'paymentFile' : 'profileFile']: 'File size should be less than 5MB',
        }));
        return;
      }

      if (type === 'aadhaar') {
        setFormData((prev) => ({ ...prev, aadhaarFile: file }));
        const reader = new FileReader();
        reader.onloadend = () => setAadhaarPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else if (type === 'payment') {
        setFormData((prev) => ({ ...prev, paymentFile: file }));
        const reader = new FileReader();
        reader.onloadend = () => setPaymentPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else if (type === 'profile') {
        setFormData((prev) => ({ ...prev, profileFile: file }));
        const reader = new FileReader();
        reader.onloadend = () => setProfilePreview(reader.result as string);
        reader.readAsDataURL(file);
      }

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[type === 'aadhaar' ? 'aadhaarFile' : type === 'payment' ? 'paymentFile' : 'profileFile'];
        return newErrors;
      });
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleResetForm = useCallback(() => {
    setShowConfirmation(false);
    setSubmitStatus('idle');
    setErrorMessage(null);
    setMobileNumberStatus('idle');
    setFormData({
      firstName: '',
      lastName: '',
      mobileNumber: '',
      tshirtSize: '',
      tshirtName: '',
      tshirtNumber: '',
      role: '',
      aadhaarFile: null,
      profileFile: null,
      paymentFile: null,
    });
    setAadhaarPreview(null);
    setPaymentPreview(null);
    setProfilePreview(null);
    setErrors({});
  }, []);

  // Validate mobile number in real-time while typing
  useEffect(() => {
    const mobileNumber = formData.mobileNumber.trim();
    
    // Real-time validation - show errors while typing
    if (!mobileNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        // Don't show error if field is empty (user hasn't started typing)
        if (newErrors.mobileNumber && newErrors.mobileNumber !== 'Mobile number is required') {
          delete newErrors.mobileNumber;
        }
        return newErrors;
      });
      setMobileNumberStatus('idle');
      return;
    }

    // Check length validation
    if (mobileNumber.length !== 10) {
      setErrors((prev) => ({
        ...prev,
        mobileNumber: `Mobile number must be exactly 10 digits (${mobileNumber.length} digits entered)`,
      }));
      setMobileNumberStatus('idle');
      return;
    }

    // Check if contains only digits
    if (!/^\d{10}$/.test(mobileNumber)) {
      setErrors((prev) => ({
        ...prev,
        mobileNumber: 'Mobile number must contain only digits',
      }));
      setMobileNumberStatus('idle');
      return;
    }

    // If valid format, clear format errors and proceed to check existence
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors.mobileNumber && 
          newErrors.mobileNumber !== 'This mobile number is already registered') {
        delete newErrors.mobileNumber;
      }
      return newErrors;
    });

    // Set checking status immediately
    setMobileNumberStatus('checking');

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(getApiUrlWithParams('checkMobile', { mobileNumber }));
        
        if (response.ok) {
          const result = await response.json();
          if (result.exists) {
            // Mobile number exists
            setMobileNumberStatus('exists');
            setErrors((prev) => ({
              ...prev,
              mobileNumber: 'This mobile number is already registered',
            }));
          } else {
            // Mobile number doesn't exist
            setMobileNumberStatus('available');
            setErrors((prev) => {
              const newErrors = { ...prev };
              if (newErrors.mobileNumber === 'This mobile number is already registered') {
                delete newErrors.mobileNumber;
              }
              return newErrors;
            });
          }
        } else {
          // Try to parse error response
          try {
            const errorData = await response.json();
            if (errorData.exists === false || response.status === 404) {
              // Mobile number doesn't exist
              setMobileNumberStatus('available');
              setErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors.mobileNumber === 'This mobile number is already registered') {
                  delete newErrors.mobileNumber;
                }
                return newErrors;
              });
            } else {
              // On other errors, reset to idle (don't block user)
              setMobileNumberStatus('idle');
            }
          } catch {
            // If error parsing fails, assume mobile doesn't exist (404)
            if (response.status === 404) {
              setMobileNumberStatus('available');
            } else {
              setMobileNumberStatus('idle');
            }
          }
        }
      } catch (error) {
        console.error('Error checking mobile number:', error);
        // On error, reset to idle (don't block user)
        setMobileNumberStatus('idle');
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.mobileNumber]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);

    try {
      const form = new FormData();
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('mobileNumber', formData.mobileNumber);
      form.append('tshirtSize', formData.tshirtSize);
      form.append('tshirtName', formData.tshirtName);
      form.append('tshirtNumber', formData.tshirtNumber);
      form.append('role', formData.role);

      if (formData.profileFile) {
        form.append('profileFile', formData.profileFile);
      }
      if (formData.aadhaarFile) {
        form.append('aadhaarFile', formData.aadhaarFile);
      }
      if (formData.paymentFile) {
        form.append('paymentFile', formData.paymentFile);
      }

      const response = await fetch(getApiUrl('register'), {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        // Try to parse the error response from the API
        let errorMsg = 'Failed to submit registration';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (parseError) {
          // If JSON parsing fails, use the status text or default message
          errorMsg = response.statusText || errorMsg;
        }
        setErrorMessage(errorMsg);
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
      setSubmitStatus('success');
      setShowConfirmation(true);

      setFormData({
        firstName: '',
        lastName: '',
        mobileNumber: '',
        tshirtSize: '',
        tshirtName: '',
        tshirtNumber: '',
        role: '',
        aadhaarFile: null,
        profileFile: null,
        paymentFile: null,
      });
      setAadhaarPreview(null);
      setPaymentPreview(null);
      setProfilePreview(null);
      setErrors({});
      } else {
        setErrorMessage(result.message || 'Registration failed. Please try again.');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setErrorMessage(errorMsg);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  // Confirmation Page Component
  if (showConfirmation) {
    return (
      <section id="register" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden">
            {/* Boom Effect Animation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="boom-effect">
                {[...Array(20)].map((_, i) => {
                  const angle = (i * 360) / 20;
                  const radians = (angle * Math.PI) / 180;
                  const distance = 180 + Math.random() * 40;
                  const x = Math.cos(radians) * distance;
                  const y = Math.sin(radians) * distance;
                  return (
                    <div
                      key={i}
                      className="particle"
                      style={{
                        '--delay': `${i * 0.05}s`,
                        '--x': `${x}px`,
                        '--y': `${y}px`,
                      } as React.CSSProperties}
                    />
                  );
                })}
              </div>
            </div>

            {/* Success Icon with Animation */}
            <div className="relative z-10 mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-100 mb-6 animate-bounce">
                <CheckCircle className="w-20 h-20 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#041955] mb-4 animate-pulse">
                🎉 Registration Successful! 🎉
              </h2>
              <p className="text-xl sm:text-2xl text-gray-700 mb-2 font-semibold">
                Thank you for registering!
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Your registration has been submitted successfully. We'll contact you soon with further details.
              </p>

              {/* WhatsApp Group Link */}
              {whatsappGroupLink && (
                <div className="mb-8 bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <p className="text-lg font-semibold text-[#041955] mb-3">
                    Join Our WhatsApp Group
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Stay updated with all tournament information, match schedules, and announcements
                  </p>
                  <a
                    href={whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Join WhatsApp Group
                  </a>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={handleResetForm}
                className="mt-4 bg-[#041955] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#062972] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Register Another Player
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .boom-effect {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            pointer-events: none;
          }

          .particle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, #FFD700, #E6B31E, #FFA500);
            border-radius: 50%;
            box-shadow: 0 0 10px #FFD700, 0 0 20px #E6B31E;
            opacity: 0;
            animation: boom 1.2s ease-out forwards;
            animation-delay: var(--delay);
          }

          @keyframes boom {
            0% {
              transform: translate(-50%, -50%) scale(0) rotate(0deg);
              opacity: 1;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translate(
                calc(-50% + var(--x)),
                calc(-50% + var(--y))
              ) scale(1.8) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </section>
    );
  }

  return (
    <section id="register" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#041955] mb-4">
            Player Registration
          </h2>
          <p className="text-lg text-gray-600">
            Fill in your details to register for MPL Season 2
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Registration Failed</p>
                <p className="text-sm text-red-700">{errorMessage || 'Something went wrong. Please try again.'}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B31E] transition-all ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B31E] transition-all ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
              <input
                type="tel"
                value={formData.mobileNumber}
                  onChange={(e) => {
                    // Only allow digits and limit to exactly 10 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobileNumber: value });
                    // Validation will happen automatically in useEffect
                  }}
                maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B31E] transition-all ${
                    errors.mobileNumber || mobileNumberStatus === 'exists'
                      ? 'border-red-500'
                      : mobileNumberStatus === 'available'
                      ? 'border-green-500'
                      : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit mobile number"
              />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {mobileNumberStatus === 'checking' && formData.mobileNumber.length === 10 && (
                    <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {mobileNumberStatus === 'exists' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {mobileNumberStatus === 'available' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              {errors.mobileNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>
              )}
              {mobileNumberStatus === 'available' && !errors.mobileNumber && formData.mobileNumber.length === 10 && (
                <p className="mt-1 text-sm text-green-600">Mobile number is available</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  T-Shirt Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tshirtSize}
                  onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B31E] transition-all ${
                    errors.tshirtSize ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select size</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
                {errors.tshirtSize && (
                  <p className="mt-1 text-sm text-red-500">{errors.tshirtSize}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Playing Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B31E] transition-all ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select role</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket Keeper">Wicket Keeper</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name on T-Shirt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tshirtName}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 15);
                    setFormData({ ...formData, tshirtName: value });
                  }}
                  maxLength={15}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B31E] transition-all ${
                    errors.tshirtName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter name (max 15 chars)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.tshirtName.length}/15 characters
                </p>
                {errors.tshirtName && (
                  <p className="mt-1 text-sm text-red-500">{errors.tshirtName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number on T-Shirt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tshirtNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setFormData({ ...formData, tshirtNumber: value });
                  }}
                  maxLength={3}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B31E] transition-all ${
                    errors.tshirtNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter number (1-999)"
                />
                {errors.tshirtNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.tshirtNumber}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profile Picture <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                errors.profileFile ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-[#E6B31E] bg-gray-50'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                  className="hidden"
                  id="profile-upload"
                />
                <label htmlFor="profile-upload" className="cursor-pointer">
                  {profilePreview ? (
                    <div>
                      <img src={profilePreview} alt="Profile preview" className="max-h-40 mx-auto rounded mb-2" />
                      <p className="text-sm text-green-600 font-semibold">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload profile picture</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.profileFile && (
                <p className="mt-1 text-sm text-red-500">{errors.profileFile}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aadhaar Card Upload <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                errors.aadhaarFile ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-[#E6B31E] bg-gray-50'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'aadhaar')}
                  className="hidden"
                  id="aadhaar-upload"
                />
                <label htmlFor="aadhaar-upload" className="cursor-pointer">
                  {aadhaarPreview ? (
                    <div>
                      <img src={aadhaarPreview} alt="Aadhaar preview" className="max-h-40 mx-auto rounded mb-2" />
                      <p className="text-sm text-green-600 font-semibold">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload Aadhaar card</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.aadhaarFile && (
                <p className="mt-1 text-sm text-red-500">{errors.aadhaarFile}</p>
              )}
            </div>

            <div className="bg-[#E6B31E]/10 border-2 border-[#E6B31E] rounded-lg p-4">
              <p className="text-center text-lg font-bold text-[#041955]">
                Registration Fee: ₹{paymentDetails.amount}
              </p>
            </div>

            {/* Payment Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#041955] mb-2">Make Payment</h3>
                <p className="text-gray-600">Scan the QR code or use any of the payment methods below</p>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  {paymentDetails.qrCode ? (
                    <img 
                      src={paymentDetails.qrCode} 
                      alt="Payment QR Code" 
                      className="w-64 h-64 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<p class="text-gray-500 text-center p-8">QR Code image unavailable. Please use the UPI ID below.</p>';
                        }
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center p-8">
                      QR code will be shared via WhatsApp after registration. Please use the UPI ID below to pay.
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Or pay directly using UPI ID:</p>
                  <div className="flex items-center justify-center space-x-2 bg-white px-4 py-2 rounded-lg border-2 border-[#E6B31E]">
                    <span className="font-bold text-lg text-[#041955]">{paymentDetails.upiId || 'N/A'}</span>
                    {paymentDetails.upiId && (
                      <button
                        onClick={() => copyToClipboard(paymentDetails.upiId || '', 'upi')}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedField === 'upi' ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Paytm */}
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200 hover:border-[#E6B31E] transition-all">
                  <div className="text-center space-y-3">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-blue-600">P</span>
                    </div>
                    <h4 className="font-bold text-[#041955]">Paytm</h4>
                    {paymentDetails.paytm.upiId && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">UPI ID:</p>
                        <div className="flex items-center justify-center space-x-1 bg-gray-50 px-2 py-1 rounded">
                          <span className="text-sm font-mono text-gray-800">{paymentDetails.paytm.upiId}</span>
                          <button
                            onClick={() => copyToClipboard(paymentDetails.paytm.upiId!, 'paytm-upi')}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy Paytm UPI"
                          >
                            {copiedField === 'paytm-upi' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Phone:</p>
                      <div className="flex items-center justify-center space-x-1 bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm font-mono text-gray-800">{paymentDetails.paytm.number}</span>
                        <button
                          onClick={() => copyToClipboard(paymentDetails.paytm.number || '', 'paytm-phone')}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy Paytm Number"
                        >
                          {copiedField === 'paytm-phone' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PhonePe */}
                <div className="bg-white rounded-lg p-4 border-2 border-purple-200 hover:border-[#E6B31E] transition-all">
                  <div className="text-center space-y-3">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-purple-600">P</span>
                    </div>
                    <h4 className="font-bold text-[#041955]">PhonePe</h4>
                    {paymentDetails.phonepe.upiId && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">UPI ID:</p>
                        <div className="flex items-center justify-center space-x-1 bg-gray-50 px-2 py-1 rounded">
                          <span className="text-sm font-mono text-gray-800">{paymentDetails.phonepe.upiId}</span>
                          <button
                            onClick={() => copyToClipboard(paymentDetails.phonepe.upiId!, 'phonepe-upi')}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy PhonePe UPI"
                          >
                            {copiedField === 'phonepe-upi' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Phone:</p>
                      <div className="flex items-center justify-center space-x-1 bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm font-mono text-gray-800">{paymentDetails.phonepe.number}</span>
                        <button
                          onClick={() => copyToClipboard(paymentDetails.phonepe.number || '', 'phonepe-phone')}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy PhonePe Number"
                        >
                          {copiedField === 'phonepe-phone' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GPay */}
                <div className="bg-white rounded-lg p-4 border-2 border-green-200 hover:border-[#E6B31E] transition-all">
                  <div className="text-center space-y-3">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-green-600">G</span>
                    </div>
                    <h4 className="font-bold text-[#041955]">GPay</h4>
                    {paymentDetails.gpay.upiId && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">UPI ID:</p>
                        <div className="flex items-center justify-center space-x-1 bg-gray-50 px-2 py-1 rounded">
                          <span className="text-sm font-mono text-gray-800">{paymentDetails.gpay.upiId}</span>
                          <button
                            onClick={() => copyToClipboard(paymentDetails.gpay.upiId!, 'gpay-upi')}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy GPay UPI"
                          >
                            {copiedField === 'gpay-upi' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Phone:</p>
                      <div className="flex items-center justify-center space-x-1 bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm font-mono text-gray-800">{paymentDetails.gpay.number}</span>
                        <button
                          onClick={() => copyToClipboard(paymentDetails.gpay.number || '', 'gpay-phone')}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy GPay Number"
                        >
                          {copiedField === 'gpay-phone' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> After making the payment, please upload the payment screenshot below.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                errors.paymentFile ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-[#E6B31E] bg-gray-50'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'payment')}
                  className="hidden"
                  id="payment-upload"
                />
                <label htmlFor="payment-upload" className="cursor-pointer">
                  {paymentPreview ? (
                    <div>
                      <img src={paymentPreview} alt="Payment preview" className="max-h-40 mx-auto rounded mb-2" />
                      <p className="text-sm text-green-600 font-semibold">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload payment screenshot</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.paymentFile && (
                <p className="mt-1 text-sm text-red-500">{errors.paymentFile}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormComplete}
              className="w-full bg-[#041955] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#062972] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Registration</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
