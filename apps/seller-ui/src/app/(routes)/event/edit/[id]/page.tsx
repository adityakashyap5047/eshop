'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, Upload, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';

// Helper function to handle array input changes
const handleArrayInputChange = (value: string, setter: (arr: string[]) => void) => {
  const items = value.split(',').map(item => item.trim()).filter(item => item);
  setter(items);
};

// Helper function to add custom specification
const addCustomSpec = (specs: Array<{ name: string; value: string }>, setter: (specs: Array<{ name: string; value: string }>) => void) => {
  setter([...specs, { name: '', value: '' }]);
};

// Helper function to remove custom specification
const removeCustomSpec = (index: number, specs: Array<{ name: string; value: string }>, setter: (specs: Array<{ name: string; value: string }>) => void) => {
  setter(specs.filter((_, i) => i !== index));
};

interface EventFormData {
  title: string;
  description: string;
  detailed_description: string;
  category: string;
  subCategory: string;
  tags: string[];
  brand: string;
  colors: string[];
  sizes: string[];
  regular_price: number;
  sale_price: number;
  stock: number;
  warranty: string;
  cashOnDelivery: string;
  video_url: string;
  images: Array<{ url: string; fileId: string; file_url: string }>;
  custom_specifications: Array<{ name: string; value: string }>;
  custom_properties: Array<{ label: string; values: string[] }>;
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
    title: '',
    description: '',
    detailed_description: '',
    category: '',
    subCategory: '',
    tags: [],
    brand: '',
    colors: [],
    sizes: [],
    regular_price: 0,
    sale_price: 0,
    stock: 0,
    warranty: '',
    cashOnDelivery: 'yes',
    video_url: '',
    images: [],
    custom_specifications: [],
    custom_properties: [],
    starting_date: '',
    ending_date: ''
  });
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');

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
        title: event.title || '',
        description: event.description || '',
        detailed_description: event.detailed_description || '',
        category: event.category || '',
        subCategory: event.subCategory || '',
        tags: event.tags || [],
        brand: event.brand || '',
        colors: event.colors || [],
        sizes: event.sizes || [],
        regular_price: event.regular_price || 0,
        sale_price: event.sale_price || 0,
        stock: event.stock || 0,
        warranty: event.warranty || '',
        cashOnDelivery: event.cashOnDelivery || 'yes',
        video_url: event.video_url || '',
        images: event.images?.map((img: any) => ({
          url: img.url,
          fileId: img.file_id,
          file_url: img.url
        })) || [],
        custom_specifications: event.custom_specifications || [],
        custom_properties: event.custom_properties || [],
        starting_date: event.starting_date ? new Date(event.starting_date).toISOString().slice(0, 16) : '',
        ending_date: event.ending_date ? new Date(event.ending_date).toISOString().slice(0, 16) : ''
      });
      setPreviewImages(event.images?.map((img: any) => img.url) || []);
      
      // Initialize array input fields
      setTagsInput(Array.isArray(event.tags) ? event.tags.join(', ') : '');
      setColorsInput(Array.isArray(event.colors) ? event.colors.join(', ') : '');
      setSizesInput(Array.isArray(event.sizes) ? event.sizes.join(', ') : '');
      
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
    const newImages: any[] = [];
    const newPreviews: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }
        
        // Convert to base64 for upload
        const base64 = await convertToBase64(file);
        
        // Upload to ImageKit
        const response = await axiosInstance.post('/product/api/upload-product-image', {
          fileName: base64
        });
        
        if (response.data.file_url && response.data.fileId) {
          newImages.push({
            url: response.data.file_url,
            fileId: response.data.fileId,
            file_url: response.data.file_url
          });
          newPreviews.push(response.data.file_url);
        }
      }
      
      const updatedImages = [...formData.images, ...newImages];
      const updatedPreviews = [...previewImages, ...newPreviews];
      
      setFormData(prev => ({ ...prev, images: updatedImages }));
      setPreviewImages(updatedPreviews);
      
      if (newImages.length > 0) {
        toast.success(`${newImages.length} image(s) uploaded successfully!`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    try {
      const imageToRemove = formData.images[index];
      
      // If the image has a fileId, delete it from ImageKit
      if (imageToRemove && typeof imageToRemove === 'object' && imageToRemove.fileId) {
        await axiosInstance.delete('/product/api/delete-product-image', {
          data: { fileId: imageToRemove.fileId }
        });
      }
      
      const newImages = formData.images.filter((_, i) => i !== index);
      const newPreviews = previewImages.filter((_, i) => i !== index);
      
      setFormData(prev => ({ ...prev, images: newImages }));
      setPreviewImages(newPreviews);
    } catch (error) {
      console.error('Error removing image:', error);
      // Still remove from UI even if deletion fails
      const newImages = formData.images.filter((_, i) => i !== index);
      const newPreviews = previewImages.filter((_, i) => i !== index);
      
      setFormData(prev => ({ ...prev, images: newImages }));
      setPreviewImages(newPreviews);
    }
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
     
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.images.length === 0) {
      toast.error('Please add at least one event image');
      return;
    }
    
    if (formData.sale_price > formData.regular_price) {
      toast.error('Sale price cannot be higher than regular price');
      return;
    }
    
    if (!formData.starting_date || !formData.ending_date) {
      toast.error('Please set both starting and ending dates');
      return;
    }
    
    if (new Date(formData.ending_date) <= new Date(formData.starting_date)) {
      toast.error('Ending date must be after starting date');
      return;
    }
    
    updateEventMutation.mutate(formData);
  };

  if (sellerLoading || eventLoading || !event || !isDataInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load event details</p>
          <button 
            onClick={() => router.push('/dashboard/all-events')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/all-events')}
            className="flex items-center text-gray-400 hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Event</h1>
          <p className="text-gray-400">Update your event information</p>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Event Images */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Images (Max 5) *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Event ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border border-gray-600"
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
                  <label className="w-full h-24 border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
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
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">Event Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-2">
                    Organizer/Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organizer name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Event Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Networking">Networking</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Festival">Festival</option>
                    <option value="Sports">Sports</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subCategory" className="block text-sm font-medium text-gray-300 mb-2">
                    Sub Category
                  </label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Sub Category</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Arts">Arts</option>
                    <option value="Music">Music</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a short description of your event"
                />
              </div>

              <div>
                <label htmlFor="detailed_description" className="block text-sm font-medium text-gray-300 mb-2">
                  Detailed Description
                </label>
                <textarea
                  id="detailed_description"
                  name="detailed_description"
                  value={formData.detailed_description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter detailed description with agenda, speakers, etc."
                />
              </div>

              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Promo Video URL (Optional)
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Event Schedule */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">Event Schedule</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="starting_date" className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Starting Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="starting_date"
                    name="starting_date"
                    value={formData.starting_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="ending_date" className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Ending Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="ending_date"
                    name="ending_date"
                    value={formData.ending_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Event Tags */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">Event Tags</h2>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => {
                    setTagsInput(e.target.value);
                    handleArrayInputChange(e.target.value, (arr) => setFormData(prev => ({ ...prev, tags: arr })));
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="conference, workshop, networking"
                />
                <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
              </div>
            </div>

            {/* Pricing and Tickets */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">Pricing & Tickets</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="regular_price" className="block text-sm font-medium text-gray-300 mb-2">
                    Regular Price ($) *
                  </label>
                  <input
                    type="number"
                    id="regular_price"
                    name="regular_price"
                    value={formData.regular_price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="sale_price" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Custom Specifications */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">Event Specifications</h2>
              
              {formData.custom_specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Specification Name
                    </label>
                    <input
                      type="text"
                      value={spec.name}
                      onChange={(e) => {
                        const newSpecs = [...formData.custom_specifications];
                        newSpecs[index].name = e.target.value;
                        setFormData(prev => ({ ...prev, custom_specifications: newSpecs }));
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Venue, Duration, Language"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Specification Value
                      </label>
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const newSpecs = [...formData.custom_specifications];
                          newSpecs[index].value = e.target.value;
                          setFormData(prev => ({ ...prev, custom_specifications: newSpecs }));
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Convention Center, 2 hours, English"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeCustomSpec(index, formData.custom_specifications, (specs) => setFormData(prev => ({ ...prev, custom_specifications: specs })))}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addCustomSpec(formData.custom_specifications, (specs) => setFormData(prev => ({ ...prev, custom_specifications: specs })))}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                + Add Specification
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-600">
              <button
                type="button"
                onClick={() => router.push('/dashboard/all-events')}
                className="mr-4 px-6 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md font-medium border border-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateEventMutation.isPending || isUploading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
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