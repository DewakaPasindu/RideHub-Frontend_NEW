import React from 'react';
import { Award, Users, Globe, Heart, Target, Eye, Shield, Star } from 'lucide-react';
import dewimage from '../components/common/WhatsApp Image 2026-08-30 at 10.00.48 PM.jpeg';

export default function About() {
  const teamMembers = [
    {
      name: 'Founder & Director',
      role: 'RideHub Leader',
      image: dewimage,
      bio: 'Founder and lead architect of the RideHub platform, passionate about delivering seamless transportation solutions in Sri Lanka.',
      expertise: ['Operations Management', 'Business Strategy', 'Customer Relations']
    }
  ];

  const milestones = [
    { year: '2019', event: 'RideHub founded with a vision to transform vehicle rentals' },
    { year: '2020', event: 'Launched our first mobile app and reached 1,000 registered users' },
    { year: '2021', event: 'Expanded to 5 major cities and introduced professional driver services' },
    { year: '2022', event: 'Reached 50,000 users and launched our premium vehicle collection' },
    { year: '2023', event: 'Introduced AI-powered matching and achieved 99% customer satisfaction' },
    { year: '2024', event: 'Expanded internationally and launched our sustainability initiative' }
  ];

  const testimonials = [
    {
      name: 'Jennifer Walsh',
      role: 'Business Executive',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      quote: 'RideHub has completely transformed how I handle business travel. The professional drivers and premium vehicles make every trip comfortable and productive.',
      rating: 5
    },
    {
      name: 'Robert Kim',
      role: 'Event Planner',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      quote: 'For large events, RideHub is my go-to solution. Their fleet variety and reliable service have never let me down. Highly recommended!',
      rating: 5
    },
    {
      name: 'Maria Santos',
      role: 'Travel Blogger',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      quote: 'As someone who travels frequently, I appreciate RideHub\' attention to detail and commitment to safety. The booking process is seamless!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About RideHub</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We're passionate about connecting people with reliable transportation solutions, 
            making every journey comfortable, safe, and memorable.
          </p>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To provide accessible, reliable, and premium transportation solutions that empower 
                people to explore, connect, and achieve their goals with confidence and comfort.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become the world's most trusted transportation platform, setting new standards 
                for service excellence, innovation, and sustainable mobility solutions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-gray-600 leading-relaxed">
                Safety first, customer-centric service, transparency in all dealings, 
                continuous innovation, and building lasting relationships with our community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Story */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  RideHub was born from a simple observation: transportation should be stress-free, 
                  reliable, and tailored to individual needs. Founded in 2019 by a team of transportation 
                  industry veterans, we set out to create a platform that would revolutionize how people 
                  access vehicles and professional drivers.
                </p>
                <p>
                  What started as a small startup with a big vision has grown into a comprehensive 
                  transportation ecosystem. We've built strong relationships with vehicle owners, 
                  professional drivers, and customers who trust us with their mobility needs.
                </p>
                <p>
                  Today, RideHub serves thousands of customers across multiple cities, offering 
                  everything from economy cars for daily commutes to luxury vehicles for special 
                  occasions, all backed by our commitment to safety, quality, and exceptional service.
                </p>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="RideHub office"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-6">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm">
                  {milestone.year}
                </div>
                <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
                  <p className="text-gray-800">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team of experts is dedicated to making your transportation experience exceptional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <div className="text-blue-100">Vehicles Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Professional Drivers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Cities Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Experience RideHub?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who trust us with their transportation needs
          </p>
          <div className="space-x-4">
            <a 
              href="/vehicles" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors inline-block"
            >
              Browse Vehicles
            </a>
            <a 
              href="/contact" 
              className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-md font-medium transition-colors inline-block"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}