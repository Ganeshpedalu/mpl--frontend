import { useState, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader, User, Mail, Phone, FileText, Users, Calendar, Image as ImageIcon, Wallet } from 'lucide-react';

import { getApiUrl } from '../config/apiConfig';

interface OwnerFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  teamName: string;
  season: string;
  purseValue: string;
  imageFile: File | null;
}

export default function OwnerRegistrationForm() {
  const [formData, setFormData] = useState<OwnerFormData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    teamName: '',
    season: '',
    purseValue: '',
    imageFile: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = `Phone number must be exactly 10 digits (${formData.phone.length} digits entered)`;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must contain only digits';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.trim().length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters long';
    }

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }

    if (!formData.season.trim()) {
      newErrors.season = 'Season is required';
    }

    if (!formData.purseValue.trim()) {
      newErrors.purseValue = 'Purse value is required';
    } else {
      const purseValueNum = parseFloat(formData.purseValue);
      if (isNaN(purseValueNum) || purseValueNum < 0) {
        newErrors.purseValue = 'Purse value must be a valid positive number';
      }
    }

    if (!formData.imageFile) {
      newErrors.imageFile = 'Image file is required';
    } else {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(formData.imageFile.type)) {
        newErrors.imageFile = 'Please upload a valid image file (JPEG, PNG, or WebP)';
      }
      // Validate file size (max 5MB)
      if (formData.imageFile.size > 5 * 1024 * 1024) {
        newErrors.imageFile = 'Image file size must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback((field: keyof OwnerFormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('imageFile', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [handleInputChange]);

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
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('bio', formData.bio);
      form.append('teamName', formData.teamName);
      form.append('season', formData.season);
      form.append('purseValue', formData.purseValue);

      if (formData.imageFile) {
        form.append('imageFile', formData.imageFile);
      }

      const response = await fetch(getApiUrl('owner'), {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        let errorMsg = 'Failed to submit owner registration';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (parseError) {
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
        setSuccessData(result.data);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          bio: '',
          teamName: '',
          season: '',
          purseValue: '',
          imageFile: null,
        });
        setImagePreview(null);
        setErrors({});
      } else {
        setErrorMessage(result.message || 'Failed to submit owner registration');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting owner registration:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      bio: '',
      teamName: '',
      season: '',
      purseValue: '',
      imageFile: null,
    });
    setImagePreview(null);
    setErrors({});
    setSubmitStatus('idle');
    setErrorMessage(null);
    setSuccessData(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#041955] mb-2">
            Owner Registration
          </h1>
          <p className="text-lg text-gray-600">
            Register as a team owner for MPL Season 2
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && successData && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6 animate-fade-in">
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-green-700 mb-4">
                  Your owner registration has been submitted successfully.
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2"><strong>Owner ID:</strong></p>
                  <p className="text-lg font-mono text-[#041955]">{successData.id}</p>
                </div>
                <button
                  onClick={resetForm}
                  className="bg-[#041955] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#062972] transition-all"
                >
                  Register Another Owner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && errorMessage && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 animate-fade-in">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-800 mb-2">Registration Failed</h3>
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#041955] mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#E6B31E] focus:outline-none transition-colors`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#041955] mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#E6B31E] focus:outline-none transition-colors`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-[#041955] mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#E6B31E] focus:outline-none transition-colors`}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Team Name */}
          <div>
            <label htmlFor="teamName" className="block text-sm font-semibold text-[#041955] mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Team Name *
            </label>
            <input
              type="text"
              id="teamName"
              value={formData.teamName}
              onChange={(e) => handleInputChange('teamName', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.teamName ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#E6B31E] focus:outline-none transition-colors`}
              placeholder="Enter your team name"
            />
            {errors.teamName && (
              <p className="mt-1 text-sm text-red-500">{errors.teamName}</p>
            )}
          </div>

          {/* Season */}
          <div>
            <label htmlFor="season" className="block text-sm font-semibold text-[#041955] mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Season *
            </label>
            <input
              type="text"
              id="season"
              value={formData.season}
              onChange={(e) => handleInputChange('season', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.season ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#E6B31E] focus:outline-none transition-colors`}
              placeholder="e.g., Season 2"
            />
            {errors.season && (
              <p className="mt-1 text-sm text-red-500">{errors.season}</p>
            )}
          </div>

          {/* Purse Value */}
          <div>
            <label htmlFor="purseValue" className="block text-sm font-semibold text-[#041955] mb-2">
              <Wallet className="w-4 h-4 inline mr-2" />
              Purse Value (₹) *
            </label>
            <input
              type="number"
              id="purseValue"
              value={formData.purseValue}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only positive numbers
                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  handleInputChange('purseValue', value);
                }
              }}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.purseValue ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#E6B31E] focus:outline-none transition-colors`}
              placeholder="Enter purse value in rupees"
              min="0"
              step="1"
            />
            {errors.purseValue && (
              <p className="mt-1 text-sm text-red-500">{errors.purseValue}</p>
            )}
            {formData.purseValue && !errors.purseValue && (
              <p className="mt-1 text-xs text-gray-500">
                ₹{parseFloat(formData.purseValue).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-[#041955] mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Bio *
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border-2 ${
                errors.bio ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#E6B31E] focus:outline-none transition-colors resize-none`}
              placeholder="Tell us about yourself and your team..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.bio.length} characters (minimum 10)
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="imageFile" className="block text-sm font-semibold text-[#041955] mb-2">
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Profile Image *
            </label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      handleInputChange('imageFile', null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="imageFile"
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    errors.imageFile
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-[#E6B31E] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {errors.imageFile && (
              <p className="mt-1 text-sm text-red-500">{errors.imageFile}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#041955] to-[#062972] text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-[#062972] hover:to-[#041955] transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

