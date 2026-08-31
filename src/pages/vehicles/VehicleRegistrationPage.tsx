import React from 'react';
import VehicleRegistrationForm from '../../components/vehicles/VehicleRegistrationForm';

export default function VehicleRegistrationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Register Your Vehicle</h1>
      <VehicleRegistrationForm />
    </div>
  );
}