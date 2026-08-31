import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">RideHub</h3>
            <p className="text-gray-400">Your trusted partner for vehicle and driver rentals. Experience comfort and reliability on every journey.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/vehicles" className="text-gray-400 hover:text-white">Vehicles</a></li>
              <li><a href="/drivers" className="text-gray-400 hover:text-white">Drivers</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2">
              <p className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                +94 77 044 8176
              </p>
              <p className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                info@ridehub.com
              </p>
              <p className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                Koswatta, Sri Lanka
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} RideHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}