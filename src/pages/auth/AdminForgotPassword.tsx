import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, User } from 'lucide-react';

export default function AdminForgotPassword() {
  const [username, setUsername] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Admin username is required');
      return;
    }
    
    // TODO: Implement actual password reset for admin
    console.log('Admin password reset requested for:', username);
    setIsSubmitted(true);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Password Reset Initiated
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              A secure password reset link has been sent to the admin contact for username{' '}
              <span className="font-medium text-gray-900">{username}</span>
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              For security reasons, admin password resets require additional verification.{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Try again
              </button>
            </p>
            
            <div className="text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to admin login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-800">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Password Recovery
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your admin username to initiate secure password recovery
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Admin Username
            </label>
            <div className="mt-1 relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                  error ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your admin username"
                value={username}
                onChange={handleChange}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Password reset requires admin verification for security
            </p>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Send reset request
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/admin/login"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to admin login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}