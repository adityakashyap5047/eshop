'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store, Globe, Clock, MapPin, Instagram, Twitter, Facebook, Youtube, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { useQueryClient } from '@tanstack/react-query';

interface SocialLinkType {
  value: string;
  label: string;
}

interface FormData {
  shopName: string;
  shopBio: string;
  openingHours: string;
  address: string;
  website: string;
  socialLinks: Array<{
    type: string;
    username: string;
  }>;
}

const EditSellerProfile = () => {
  const { seller, isLoading: sellerLoading } = useSeller();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLinkTypes, setSocialLinkTypes] = useState<SocialLinkType[]>([]);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>({
    shopName: '',
    shopBio: '',
    openingHours: '09:00 - 18:00',
    address: '',
    website: '',
    socialLinks: []
  });

  if (!sellerLoading && !seller) {
    router.push('/login');
    return null;
  }

  if (sellerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchSocialLinkTypes = async () => {
      try {
        const response = await axiosInstance.get(`/api/social-link-types`);
        setSocialLinkTypes(response.data.socialTypes);
      } catch (error) {
        console.error('Error fetching social link types:', error);
        toast.error('Failed to load social media options');
      }
    };

    fetchSocialLinkTypes();
  }, []);

  useEffect(() => {
    if (seller?.shop) {
      setFormData({
        shopName: seller.shop.name || '',
        shopBio: seller.shop.bio || '',
        openingHours: seller.shop.opening_hours || '09:00 - 18:00',
        address: seller.shop.address || '',
        website: seller.shop.website || '',
        socialLinks: seller.shop.socialLinks?.map((link: any) => ({
          type: link.type,
          username: link.username
        })) || []
      });
    }
  }, [seller]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (index: number, field: 'type' | 'username', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { type: '', username: '' }]
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const getSocialIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      instagram: <Instagram className="w-4 h-4" />,
      x: <Twitter className="w-4 h-4" />,
      facebook: <Facebook className="w-4 h-4" />,
      youtube: <Youtube className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />,
      website: <Globe className="w-4 h-4" />
    };
    return iconMap[type.toLowerCase()] || <Globe className="w-4 h-4" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seller?.id) {
      toast.error('Seller information not available');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axiosInstance.put(
        `/api/update-seller-profile/${seller.id}`,
        formData
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        await queryClient.invalidateQueries({ queryKey: ["seller"] });
        await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
        await queryClient.invalidateQueries({ queryKey: ["seller-events"] });
        
        router.push('/');
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-600 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center font-semibold text-gray-300 hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl flex items-center font-bold text-gray-100">
                <Store className="w-8 h-8 text-blue-500 mr-3" />
                <span>Edit Shop Profile</span>
              </h1>
              <p className="text-white ml-12 text-sm font-semibold">Update your shop information and settings</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-500 rounded-lg shadow-sm border border-gray-500">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    id="shopName"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter your shop name"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline w-4 h-4 mr-1" />
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="shopBio" className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Description
                </label>
                <textarea
                  id="shopBio"
                  name="shopBio"
                  value={formData.shopBio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Tell customers about your shop..."
                />
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <Clock className="inline w-5 h-5 mr-2" />
                Business Hours
              </h2>
              <div>
                <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Hours
                </label>
                <input
                  type="text"
                  id="openingHours"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="e.g., Mon - Fri: 9:00 AM - 6:00 PM"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <MapPin className="inline w-5 h-5 mr-2" />
                Location
              </h2>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter your complete business address"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media Links</h2>
              <div className="space-y-4">
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform
                      </label>
                      <select
                        value={link.type}
                        onChange={(e) => handleSocialLinkChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      >
                        <option value="">Select Platform</option>
                        {socialLinkTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username/Handle
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 py-2 border border-r-0 text-white bg-slate-400 border-slate-400 rounded-l-md">
                          {link.type && getSocialIcon(link.type) || <Globe />}
                        </span>
                        <input
                          type="text"
                          value={link.username}
                          onChange={(e) => handleSocialLinkChange(index, 'username', e.target.value)}
                          className="w-full px-3 py-2 border-r border-gray-600 rounded-r-md bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          placeholder="username"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="px-3 py-2 bg-red-600 text-white hover:text-red-800 border border-red-900 rounded-md hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="text-blue-900 hover:text-blue-800 font-medium"
                >
                  + Add Social Media Link
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="mr-4 px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSellerProfile;