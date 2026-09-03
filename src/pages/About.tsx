import React from 'react';
import { Award, Users, Globe, Heart, Target, Eye, Shield, Star, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import dewimage from '../components/common/WhatsApp Image 2026-08-30 at 10.00.48 PM.jpeg';
import PlatformService, { PlatformStats, PlatformTestimonial } from '../services/api/platform.service';

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

  const [stats, setStats] = React.useState<PlatformStats>({
    happy_customers: 0,
    vehicles_available: 0,
    professional_drivers: 0,
    cities_served: 0,
    average_rating: 5.0,
    total_reviews: 0,
  });
  const [testimonials, setTestimonials] = React.useState<PlatformTestimonial[]>([]);
  const [isLiveSyncing, setIsLiveSyncing] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const loadPlatformData = React.useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsLiveSyncing(true);
    try {
      const data = await PlatformService.getOverview();
      if (data?.stats) {
        setStats(data.stats);
      }
      if (data?.testimonials && data.testimonials.length > 0) {
        setTestimonials(data.testimonials);
      }
      setLoaded(true);
    } catch (err) {
      console.error('Failed to load real-time platform data:', err);
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsLiveSyncing(false), 600);
      }
    }
  }, []);

  React.useEffect(() => {
    loadPlatformData(false);

    // Auto-refresh real-time data every 10 seconds
    const interval = setInterval(() => {
      loadPlatformData(true);
    }, 10000);

    // Refresh immediately on window focus
    const handleFocus = () => loadPlatformData(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadPlatformData]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatStatNumber = (val: number | undefined) => {
    const n = val ?? 0;
    if (n >= 10000) return `${(n / 1000).toFixed(0)}K+`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
    if (n > 0) return `${n}+`;
    return `${n}`;
  };

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
      <div className="py-20 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="inline-flex items-center space-x-2 bg-blue-700/90 backdrop-blur-sm border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-100 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="tracking-wider">LIVE PLATFORM STATS</span>
              {isLiveSyncing && (
                <RefreshCw className="h-3 w-3 text-blue-200 animate-spin ml-1" />
              )}
            </div>
            <p className="text-xs text-blue-200 mt-2">
              Updated automatically from the RideHub platform
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
              <div className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-white">
                {formatStatNumber(stats.happy_customers)}
              </div>
              <div className="text-blue-100 font-medium text-sm md:text-base">Happy Customers</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
              <div className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-white">
                {formatStatNumber(stats.vehicles_available)}
              </div>
              <div className="text-blue-100 font-medium text-sm md:text-base">Vehicles Available</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
              <div className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-white">
                {formatStatNumber(stats.professional_drivers)}
              </div>
              <div className="text-blue-100 font-medium text-sm md:text-base">Professional Drivers</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
              <div className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-white">
                {formatStatNumber(stats.cities_served)}
              </div>
              <div className="text-blue-100 font-medium text-sm md:text-base">Cities Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Real-Time Customer Feedback</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real reviews submitted by satisfied customers across vehicle rentals and driver bookings
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-8 flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {testimonial.is_real ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Verified Trip</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Featured</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed text-sm">
                    "{testimonial.quote}"
                  </p>
                </div>

                <div className="flex items-center pt-4 border-t border-gray-100">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-200 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center mr-4 text-sm shadow-sm flex-shrink-0">
                      {getInitials(testimonial.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900 truncate">{testimonial.name}</div>
                    <div className="text-blue-600 font-medium text-xs truncate">{testimonial.role}</div>
                    <div className="text-gray-400 text-[11px] mt-0.5">{testimonial.created_at}</div>
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