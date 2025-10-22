'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, Upload, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';

interface EventFormData {
  name: string;
  description: string;
  category: string;
  tags: string;
  original_price: number;
  sale_price: number;
  stock: number;
  images: string[];
  starting_date: string;
  ending_date: string;
}

const EditEventPage = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { seller, isLoading: sellerLoading } = useSeller();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    category: '',
    tags: '',
    original_price: 0,
    sale_price: 0,
    stock: 0,
    images: [],
    starting_date: '',
    ending_date: ''
  });
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // Fetch event details
  const { data: event, isLoading: eventLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/product/api/get-product/${eventId}`);
      return response.data.product;
    },
    enabled: !!eventId
  });

  // Redirect if not authenticated
  if (!sellerLoading && !seller) {
    router.push('/login');
    return null;
  }

  // Check if seller owns this event
  useEffect(() => {
    if (event && seller) {
      if (event.shopId !== seller.shop?.id) {
        toast.error('You are not authorized to edit this event');
        router.push('/dashboard/all-events');
        return;
      }
      
      // Check if this is actually an event (has starting_date and ending_date)
      if (!event.starting_date || !event.ending_date) {
        toast.error('This is not an event');
        router.push('/dashboard/all-events');
        return;
      }
      
      // Initialize form with event data
      setFormData({
        name: event.name || '',
        description: event.description || '',
        category: event.category || '',
        tags: event.tags || '',
        original_price: event.original_price || 0,
        sale_price: event.sale_price || 0,
        stock: event.stock || 0,
        images: event.images || [],
        starting_date: event.starting_date ? new Date(event.starting_date).toISOString().slice(0, 16) : '',
        ending_date: event.ending_date ? new Date(event.ending_date).toISOString().slice(0, 16) : ''
      });
      setPreviewImages(event.images || []);
      setIsDataInitialized(true);
    }
  }, [event, seller, router]);

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await axiosInstance.put(`/product/api/update-product/${eventId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Event updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['shop-events'] });
      router.push('/dashboard/all-events');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update event');
    }
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (files: FileList) => {
    if (previewImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }
        
        const base64 = await convertToBase64(file);
        newImages.push(base64);
      }
      
      const updatedImages = [...formData.images, ...newImages];
      const updatedPreviews = [...previewImages, ...newImages];
      
      setFormData(prev => ({ ...prev, images: updatedImages }));
      setPreviewImages(updatedPreviews);
    } catch (error) {
      toast.error('Failed to process images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newPreviews);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.images.length === 0) {
      toast.error('Please add at least one event image');
      return;
    }
    
    if (formData.sale_price > formData.original_price) {
      toast.error('Sale price cannot be higher than original price');
      return;
    }
    
    if (!formData.starting_date || !formData.ending_date) {
      toast.error('Please set both starting and ending dates');
      return;
    }
    
    if (new Date(formData.starting_date) >= new Date(formData.ending_date)) {
      toast.error('Ending date must be after starting date');
      return;
    }
    
    if (new Date(formData.starting_date) < new Date()) {
      toast.error('Starting date cannot be in the past');
      return;
    }
    
    updateEventMutation.mutate(formData);
  };

  if (sellerLoading || eventLoading || !event || !isDataInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load event details</p>
          <button 
            onClick={() => router.push('/dashboard/all-events')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/all-events')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600">Update your event information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Event Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Images (Max 5) *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Event ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {previewImages.length < 5 && (
                  <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="webinar">Webinar</option>
                  <option value="networking">Networking</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="festival">Festival</option>
                  <option value="sports">Sports</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your event in detail..."
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            {/* Event Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="starting_date" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Starting Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="starting_date"
                  name="starting_date"
                  value={formData.starting_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="ending_date" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Ending Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="ending_date"
                  name="ending_date"
                  value={formData.ending_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price ($) *
                </label>
                <input
                  type="number"
                  id="original_price"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price ($) *
                </label>
                <input
                  type="number"
                  id="sale_price"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Available Tickets *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/dashboard/all-events')}
                className="mr-4 px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateEventMutation.isPending || isUploading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {updateEventMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;