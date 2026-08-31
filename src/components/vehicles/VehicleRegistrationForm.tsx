import React from 'react';
import { Upload, Plus, X, Car, Camera } from 'lucide-react';

const vehicleFeatures = [
  'Air Conditioning',
  'GPS Navigation',
  'Bluetooth',
  'USB Charging',
  'WiFi Hotspot',
  'Backup Camera',
  'Heated Seats',
  'Leather Seats',
  'Sunroof',
  'Premium Sound System',
  'Cruise Control',
  'Parking Sensors',
  'Automatic Transmission',
  'Manual Transmission',
  'All-Wheel Drive',
  'Fuel Efficient',
  'Electric Vehicle',
  'Hybrid Engine'
];

interface PhotoCategory {
  id: string;
  label: string;
  description: string;
  required: number;
  maxPhotos: number;
}

const photoCategories: PhotoCategory[] = [
  {
    id: 'interior',
    label: 'Interior Photos',
    description: 'Upload photos showing the inside of your vehicle (dashboard, seats, etc.)',
    required: 2,
    maxPhotos: 4
  },
  {
    id: 'front',
    label: 'Front View',
    description: 'Upload photo of the front of your vehicle',
    required: 1,
    maxPhotos: 2
  },
  {
    id: 'back',
    label: 'Back View',
    description: 'Upload photo of the back of your vehicle',
    required: 1,
    maxPhotos: 2
  },
  {
    id: 'leftSide',
    label: 'Left Side View',
    description: 'Upload photo of the left side of your vehicle',
    required: 1,
    maxPhotos: 2
  },
  {
    id: 'rightSide',
    label: 'Right Side View',
    description: 'Upload photo of the right side of your vehicle',
    required: 1,
    maxPhotos: 2
  }
];

export default function VehicleRegistrationForm() {
  const [formData, setFormData] = React.useState({
    fullName: '',
    vehicleNumber: '',
    vehicleType: '',
    seatingCapacity: '',
    yearOfManufacture: '',
    contactNumber: '',
    driverAvailability: '',
    vehicleColor: '',
    features: [] as string[]
  });

  const [images, setImages] = React.useState({
    revenueLicense: '',
    insuranceCard: ''
  });

  const [vehiclePhotos, setVehiclePhotos] = React.useState<Record<string, string[]>>({
    interior: [],
    front: [],
    back: [],
    leftSide: [],
    rightSide: []
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.seatingCapacity) newErrors.seatingCapacity = 'Seating capacity is required';
    if (!formData.yearOfManufacture) newErrors.yearOfManufacture = 'Year of manufacture is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.driverAvailability) newErrors.driverAvailability = 'Driver availability is required';
    if (!formData.vehicleColor.trim()) newErrors.vehicleColor = 'Vehicle color is required';
    if (!images.revenueLicense) newErrors.revenueLicense = 'Revenue license is required';
    if (!images.insuranceCard) newErrors.insuranceCard = 'Insurance card is required';
    
    // Validate vehicle photos
    photoCategories.forEach(category => {
      const photos = vehiclePhotos[category.id];
      if (photos.length < category.required) {
        newErrors[`photos_${category.id}`] = `At least ${category.required} ${category.label.toLowerCase()} ${category.required === 1 ? 'is' : 'are'} required`;
      }
    });

    // Check total photo count
    const totalPhotos = Object.values(vehiclePhotos).reduce((sum, photos) => sum + photos.length, 0);
    if (totalPhotos < 6) {
      newErrors.totalPhotos = 'Minimum 6 vehicle photos are required (2 interior + 4 exterior views)';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Vehicle registration data:', { ...formData, images, vehiclePhotos });
      // TODO: Submit to backend
      alert('Vehicle registration submitted successfully!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({
          ...prev,
          [type]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVehiclePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const category = photoCategories.find(c => c.id === categoryId);
      
      if (!category) return;
      
      const currentPhotos = vehiclePhotos[categoryId];
      const remainingSlots = category.maxPhotos - currentPhotos.length;
      
      if (files.length > remainingSlots) {
        setErrors(prev => ({
          ...prev,
          [`photos_${categoryId}`]: `You can only upload ${remainingSlots} more photo(s) for ${category.label.toLowerCase()}`
        }));
        return;
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVehiclePhotos(prev => ({
            ...prev,
            [categoryId]: [...prev[categoryId], reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });

      // Clear errors for this category
      if (errors[`photos_${categoryId}`]) {
        setErrors(prev => ({ ...prev, [`photos_${categoryId}`]: '' }));
      }
      if (errors.totalPhotos) {
        setErrors(prev => ({ ...prev, totalPhotos: '' }));
      }
    }
  };

  const removeVehiclePhoto = (categoryId: string, photoIndex: number) => {
    setVehiclePhotos(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((_, index) => index !== photoIndex)
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const getTotalPhotosCount = () => {
    return Object.values(vehiclePhotos).reduce((sum, photos) => sum + photos.length, 0);
  };

  const getPhotoProgress = () => {
    const total = getTotalPhotosCount();
    return {
      current: total,
      required: 6,
      percentage: Math.min((total / 6) * 100, 100)
    };
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Car className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-3xl font-bold text-gray-900">Add Your Vehicle</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Owner Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.fullName ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.contactNumber ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter your contact number"
              />
              {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>}
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Vehicle Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number *
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.vehicleNumber ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter vehicle number"
              />
              {errors.vehicleNumber && <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Color *
              </label>
              <input
                type="text"
                name="vehicleColor"
                value={formData.vehicleColor}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.vehicleColor ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter vehicle color"
              />
              {errors.vehicleColor && <p className="mt-1 text-sm text-red-600">{errors.vehicleColor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seating Capacity *
              </label>
              <input
                type="number"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                min="1"
                max="50"
                className={`w-full rounded-md border ${errors.seatingCapacity ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Number of seats"
              />
              {errors.seatingCapacity && <p className="mt-1 text-sm text-red-600">{errors.seatingCapacity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Manufacture *
              </label>
              <input
                type="number"
                name="yearOfManufacture"
                value={formData.yearOfManufacture}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear()}
                className={`w-full rounded-md border ${errors.yearOfManufacture ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Year"
              />
              {errors.yearOfManufacture && <p className="mt-1 text-sm text-red-600">{errors.yearOfManufacture}</p>}
            </div>
          </div>

          {/* Vehicle Type Radio Buttons */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Vehicle Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Car', 'Van', 'Bus', 'SUV'].map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vehicleType"
                    value={type}
                    checked={formData.vehicleType === type}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                </label>
              ))}
            </div>
            {errors.vehicleType && <p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>}
          </div>

          {/* Driver Availability Radio Buttons */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Driver Availability *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['With Driver', 'Without Driver'].map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="driverAvailability"
                    value={option}
                    checked={formData.driverAvailability === option}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.driverAvailability && <p className="mt-1 text-sm text-red-600">{errors.driverAvailability}</p>}
          </div>
        </div>

        {/* Vehicle Photos Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Vehicle Photos *</h3>
            <div className="text-sm text-gray-600">
              {getPhotoProgress().current} / {getPhotoProgress().required} photos uploaded
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPhotoProgress().percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Upload minimum 6 photos: 2 interior + 4 exterior views (front, back, left side, right side)
            </p>
          </div>

          {errors.totalPhotos && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.totalPhotos}</p>
            </div>
          )}

          <div className="space-y-6">
            {photoCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{category.label}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {vehiclePhotos[category.id].length} / {category.maxPhotos} photos
                    {category.required > 0 && (
                      <span className="text-red-500 ml-1">
                        (min {category.required} required)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {vehiclePhotos[category.id].map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`${category.label} ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeVehiclePhoto(category.id, index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {vehiclePhotos[category.id].length < category.maxPhotos && (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <Camera className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleVehiclePhotoUpload(e, category.id)}
                      />
                    </label>
                  )}
                </div>

                {errors[`photos_${category.id}`] && (
                  <p className="text-sm text-red-600">{errors[`photos_${category.id}`]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Document Uploads */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Required Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'revenueLicense', label: 'Vehicle Revenue License', error: 'revenueLicense' },
              { key: 'insuranceCard', label: 'Insurance Card', error: 'insuranceCard' }
            ].map(({ key, label, error }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label} *
                </label>
                {images[key as keyof typeof images] ? (
                  <div className="relative">
                    <img
                      src={images[key as keyof typeof images]}
                      alt={label}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(prev => ({ ...prev, [key]: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload {label}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, key)}
                    />
                  </label>
                )}
                {errors[error] && <p className="mt-1 text-sm text-red-600">{errors[error]}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Features */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Vehicle Features</h3>
          <p className="text-sm text-gray-600 mb-4">Select all features that apply to your vehicle:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {vehicleFeatures.map((feature) => (
              <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-lg transition-colors"
        >
          Submit Vehicle Registration
        </button>
      </form>
    </div>
  );
}