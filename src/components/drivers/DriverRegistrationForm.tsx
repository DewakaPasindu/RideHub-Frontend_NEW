import React from 'react';
import { Upload, X, User } from 'lucide-react';

const languages = [
  'English', 'Sinhala', 'Tamil', 'Hindi', 'Arabic', 'Chinese', 'French', 'German', 'Japanese', 'Korean'
];

const vehicleClasses = [
  { id: 'A1', name: 'Light Motor Cycles (≤100CC)', description: 'Class ID: A1' },
  { id: 'A', name: 'Motorcycles (>100CC)', description: 'Class ID: A' },
  { id: 'B1', name: 'Motor Tricycle or Van (Tare ≤500kg, GVW ≤1000kg)', description: 'Class ID: B1' },
  { id: 'B', name: 'Dual Purpose Motor Vehicle (GVW ≤3500kg, ≤9 seats)', description: 'Class ID: B' },
  { id: 'C1', name: 'Light Motor Lorry (GVW >3500kg and ≤17000kg)', description: 'Class ID: C1' },
  { id: 'C', name: 'Motor Lorry (GVW >17000kg)', description: 'Class ID: C' },
  { id: 'CE', name: 'Heavy Motor Lorry with Trailer (Trailer Tare >750kg)', description: 'Class ID: CE' },
  { id: 'D1', name: 'Light Motor Coach (9–33 seats)', description: 'Class ID: D1' },
  { id: 'D', name: 'Motor Coach (≤33 seats)', description: 'Class ID: D' },
  { id: 'DE', name: 'Heavy Motor Coach (Trailer Tare >750kg or 2 coaches)', description: 'Class ID: DE' },
  { id: 'G1', name: 'Hand Tractors (2-wheel tractor with trailer)', description: 'Class ID: G1' },
  { id: 'G', name: 'Land Vehicle (Agricultural)', description: 'Class ID: G' },
  { id: 'J', name: 'Special Purpose Vehicle (Construction, Loading/Unloading)', description: 'Class ID: J' }
];

export default function DriverRegistrationForm() {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    address: '',
    drivingLicenceNumber: '',
    userNIC: '',
    gender: '',
    languages: [] as string[],
    vehicleClasses: [] as string[],
    nearestTowns: ['', '']
  });

  const [images, setImages] = React.useState({
    frontLicence: '',
    backLicence: ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.drivingLicenceNumber.trim()) newErrors.drivingLicenceNumber = 'Driving licence number is required';
    if (!formData.userNIC.trim()) newErrors.userNIC = 'NIC is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (formData.languages.length === 0) newErrors.languages = 'At least one language is required';
    if (formData.vehicleClasses.length === 0) newErrors.vehicleClasses = 'At least one vehicle class is required';
    if (!formData.nearestTowns[0].trim()) newErrors.nearestTown1 = 'First nearest town is required';
    if (!formData.nearestTowns[1].trim()) newErrors.nearestTown2 = 'Second nearest town is required';
    if (!images.frontLicence) newErrors.frontLicence = 'Front side of licence is required';
    if (!images.backLicence) newErrors.backLicence = 'Back side of licence is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Driver registration data:', { ...formData, images });
      // TODO: Submit to backend
      alert('Driver registration submitted successfully!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTownChange = (index: number, value: string) => {
    const newTowns = [...formData.nearestTowns];
    newTowns[index] = value;
    setFormData(prev => ({
      ...prev,
      nearestTowns: newTowns
    }));
    
    const errorKey = `nearestTown${index + 1}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
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

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
    
    if (errors.languages) {
      setErrors(prev => ({ ...prev, languages: '' }));
    }
  };

  const handleVehicleClassToggle = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleClasses: prev.vehicleClasses.includes(classId)
        ? prev.vehicleClasses.filter(c => c !== classId)
        : [...prev.vehicleClasses, classId]
    }));
    
    if (errors.vehicleClasses) {
      setErrors(prev => ({ ...prev, vehicleClasses: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <User className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-3xl font-bold text-gray-900">Become a Driver</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter your first name"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter your last name"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.email ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.mobileNumber ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter your mobile number"
              />
              {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User NIC *
              </label>
              <input
                type="text"
                name="userNIC"
                value={formData.userNIC}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.userNIC ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter your NIC number"
              />
              {errors.userNIC && <p className="mt-1 text-sm text-red-600">{errors.userNIC}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driving Licence Number *
              </label>
              <input
                type="text"
                name="drivingLicenceNumber"
                value={formData.drivingLicenceNumber}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.drivingLicenceNumber ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter your licence number"
              />
              {errors.drivingLicenceNumber && <p className="mt-1 text-sm text-red-600">{errors.drivingLicenceNumber}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className={`w-full rounded-md border ${errors.address ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
              placeholder="Enter your full address"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* Gender Radio Buttons */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gender *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Male', 'Female', 'Other'].map((gender) => (
                <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={formData.gender === gender}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{gender}</span>
                </label>
              ))}
            </div>
            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Languages *</h3>
          <p className="text-sm text-gray-600 mb-4">Select all languages you can speak:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {languages.map((language) => (
              <label key={language} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(language)}
                  onChange={() => handleLanguageToggle(language)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">{language}</span>
              </label>
            ))}
          </div>
          {errors.languages && <p className="mt-1 text-sm text-red-600">{errors.languages}</p>}
        </div>

        {/* Vehicle Classes */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Drivable Vehicle Classes *</h3>
          <p className="text-sm text-gray-600 mb-4">Select all vehicle classes you are licensed to drive:</p>
          <div className="space-y-3">
            {vehicleClasses.map((vehicleClass) => (
              <label key={vehicleClass.id} className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={formData.vehicleClasses.includes(vehicleClass.id)}
                  onChange={() => handleVehicleClassToggle(vehicleClass.id)}
                  className="text-blue-600 focus:ring-blue-500 rounded mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">{vehicleClass.name}</span>
                  <p className="text-xs text-gray-600">{vehicleClass.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.vehicleClasses && <p className="mt-1 text-sm text-red-600">{errors.vehicleClasses}</p>}
        </div>

        {/* Nearest Towns */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Nearest Two Towns *</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Nearest Town *
              </label>
              <input
                type="text"
                value={formData.nearestTowns[0]}
                onChange={(e) => handleTownChange(0, e.target.value)}
                className={`w-full rounded-md border ${errors.nearestTown1 ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter first nearest town"
              />
              {errors.nearestTown1 && <p className="mt-1 text-sm text-red-600">{errors.nearestTown1}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Second Nearest Town *
              </label>
              <input
                type="text"
                value={formData.nearestTowns[1]}
                onChange={(e) => handleTownChange(1, e.target.value)}
                className={`w-full rounded-md border ${errors.nearestTown2 ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                placeholder="Enter second nearest town"
              />
              {errors.nearestTown2 && <p className="mt-1 text-sm text-red-600">{errors.nearestTown2}</p>}
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Driving Licence Photos *</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'frontLicence', label: 'Front Side Photo of Licence', error: 'frontLicence' },
              { key: 'backLicence', label: 'Back Side Photo of Licence', error: 'backLicence' }
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
                      className="w-full h-40 object-cover rounded-lg border"
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
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-lg transition-colors"
        >
          Submit Driver Application
        </button>
      </form>
    </div>
  );
}