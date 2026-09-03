import React from 'react';
import { Car, Users, Shield, Star, ChevronRight, Navigation, Zap, Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GPSStatusIndicator from '../components/location/GPSStatusIndicator';

const SERVICE_CARDS = [
  {
    id: 'vehicle',
    icon: Car,
    title: 'Rent a Vehicle',
    subtitle: 'Drive it yourself',
    desc: 'Browse our fleet of verified, well-maintained vehicles. Pick up and drive at your own pace.',
    color: 'from-blue-600 to-blue-700',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    cta: 'Browse Vehicles',
    href: '/vehicles',
    features: ['No driver required', 'Flexible schedules', 'Wide vehicle range'],
  },
  {
    id: 'vehicle-driver',
    icon: Shield,
    title: 'Vehicle + Driver',
    subtitle: 'Full service package',
    desc: 'Rent a vehicle and get a professional driver included. Perfect for group travel and long trips.',
    color: 'from-emerald-600 to-emerald-700',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    cta: 'Book Package',
    href: '/vehicles',
    badge: 'Most Popular',
    features: ['Professional driver', 'Stress-free travel', 'Best for groups'],
  },
  {
    id: 'driver',
    icon: Users,
    title: 'Hire a Driver',
    subtitle: 'Use your own vehicle',
    desc: 'Have a vehicle but need a driver? Hire verified, experienced drivers for your personal vehicle.',
    color: 'from-violet-600 to-violet-700',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    cta: 'Find Drivers',
    href: '/drivers',
    features: ['Verified drivers', 'Flexible hours', 'Background checked'],
  },
];

const STATS = [
  { value: '500+', label: 'Verified Vehicles' },
  { value: '200+', label: 'Professional Drivers' },
  { value: '10,000+', label: 'Happy Customers' },
  { value: '4.9★', label: 'Average Rating' },
];

const FEATURES = [
  { icon: Shield, title: 'Verified & Insured', desc: 'Every vehicle and driver is background-checked and fully verified before listing.' },
  { icon: Star, title: 'Top Rated', desc: 'Real reviews from real customers. Only the best make it to our platform.' },
  { icon: Navigation, title: 'GPS Tracked', desc: 'All trips are GPS monitored for your safety and peace of mind.' },
  { icon: Zap, title: 'AI Matching', desc: 'Smart recommendations match you with the best vehicle and driver for your trip.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          minHeight: '600px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/65 to-slate-800/55" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center justify-center text-center">
          <div className="max-w-3xl mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              Sri Lanka's Premier<br />
              <span className="text-blue-400">Vehicles & Drivers Rental</span> Platform
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Rent verified vehicles, hire professional drivers, or plan your entire journey with AI recommendations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mb-8">
            <Link
              to="/vehicles"
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/20"
            >
              <Car className="h-5 w-5" />
              <span>Rent a Vehicle</span>
            </Link>
            <Link
              to="/drivers"
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-md"
            >
              <Users className="h-5 w-5 text-gray-500" />
              <span>Hire a Driver</span>
            </Link>
            <Link
              to="/trip"
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-md"
            >
              <Zap className="h-5 w-5 text-yellow-200 fill-yellow-200" />
              <span>AI Trip Planner</span>
            </Link>
          </div>

          <div className="flex justify-center">
            <GPSStatusIndicator />
          </div>
        </div>
      </section>

      {/* ── 3 Core Services ───────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Three flexible ways to get moving — choose the option that fits your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICE_CARDS.map(svc => (
              <div
                key={svc.id}
                className={`relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group`}
              >
                {svc.badge && (
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {svc.badge}
                  </div>
                )}
                {/* Top gradient accent */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${svc.color}`} />

                <div className="p-7">
                  <div className={`${svc.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center mb-5`}>
                    <svc.icon className={`h-7 w-7 ${svc.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{svc.title}</h3>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${svc.iconColor}`}>{svc.subtitle}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{svc.desc}</p>

                  <ul className="space-y-2 mb-6">
                    {svc.features.map(f => (
                      <li key={f} className="flex items-center space-x-2 text-sm text-gray-700">
                        <Check className={`h-4 w-4 ${svc.iconColor} flex-shrink-0`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={svc.href}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r ${svc.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    <span>{svc.cta}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-4xl font-black text-blue-600 mb-1">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Features ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Why RideHub?</h2>
            <p className="text-gray-500 text-lg">Built for trust, convenience, and reliability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="text-center">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                  <f.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Ready to get moving?</h2>
          <p className="text-blue-200 text-lg mb-8">
            Browse available vehicles and drivers across Sri Lanka right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/vehicles"
              className="flex items-center space-x-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-md"
            >
              <Car className="h-5 w-5" />
              <span>Browse Vehicles</span>
            </Link>
            <Link
              to="/drivers"
              className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-500 border border-blue-500 px-8 py-3.5 rounded-xl font-bold text-sm transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>Find Drivers</span>
            </Link>
          </div>
          {/* Subtle trip planner mention */}
          <p className="text-blue-300 text-xs mt-6">
            Need help planning? Try the{' '}
            <Link to="/trip" className="underline hover:text-white transition-colors">
              AI Trip Planner
            </Link>
            {' '}under Tools.
          </p>
        </div>
      </section>
    </div>
  );
}
