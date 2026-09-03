import React from 'react';
import { Menu, X, Car, User, UserPlus, Calendar, ChevronDown, Zap, Target, MessageSquare, Shield, TrendingUp, Navigation, Users, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GPSStatusIndicator from '../location/GPSStatusIndicator';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const { user, isLoggedIn, logout, isAdmin } = useAuth();
  const location = useLocation();
  const toolsRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = () => { logout(); setIsOpen(false); };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  React.useEffect(() => { setToolsOpen(false); setIsOpen(false); }, [location.pathname]);

  const toolItems = [
    { to: '/trip', icon: Navigation, label: 'AI Trip Planner', desc: 'Smart route planning' },
    { to: '/ai/vehicle-recommendation', icon: Zap, label: 'Vehicle Recommender', desc: 'AI-powered matching' },
    { to: '/ai/driver-matching', icon: Target, label: 'Driver Matcher', desc: 'Find best driver' },
    { to: '/ai/chatbot', icon: MessageSquare, label: 'Trip Assistant', desc: 'Chat with AI' },
    { to: '/ai/safety', icon: Shield, label: 'Safety Monitor', desc: 'Live safety alerts' },
    { to: '/ai/demand', icon: TrendingUp, label: 'Demand Insights', desc: 'Market analytics' },
  ];

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/vehicles', label: 'Vehicles' },
    { to: '/drivers', label: 'Drivers' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="bg-blue-600 rounded-xl p-1.5">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Ride<span className="text-blue-600">Hub</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-0.5">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Tools Dropdown (contains AI Trip Planner + AI tools) */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  toolsOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Tools</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI-Powered Tools</p>
                  </div>
                  {toolItems.map(t => (
                    <Link
                      key={t.to}
                      to={t.to}
                      className={`flex items-start space-x-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                        location.pathname === t.to ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0 mt-0.5">
                        <t.icon className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                        <p className="text-xs text-gray-400">{t.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* GPS Status */}
            <div className="px-2 hidden lg:block">
              <GPSStatusIndicator />
            </div>

            {/* Auth / User area */}
            <div className="flex items-center space-x-1.5 border-l border-gray-200 pl-3 ml-1">
              {isLoggedIn ? (
                <>
                  {isAdmin() && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-950 text-emerald-400 border border-emerald-500/40 shadow-sm hover:bg-slate-900 hover:border-emerald-400 transition-all mr-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Operations Center</span>
                    </Link>
                  )}
                  {user?.isDriver && (
                    <Link to="/availability" className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/availability' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
                      <Calendar className="h-4 w-4" /><span>Availability</span>
                    </Link>
                  )}
                  <Link to="/customer/rentals" className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/customer/rentals') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'}`}>
                    <Shield className="h-4 w-4 text-emerald-600" /><span>My Rentals</span>
                  </Link>
                  <Link to="/owner/rental-requests" className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/owner/rental-requests') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
                    <Car className="h-4 w-4" /><span>Owner Requests</span>
                  </Link>
                  <Link to="/professional" className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/professional' || location.pathname === '/earnings' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'}`}>
                    <Wallet className="h-4 w-4 text-emerald-600" /><span>Earnings</span>
                  </Link>
                  <Link to="/bookings" className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/bookings' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
                    <Calendar className="h-4 w-4" /><span>Bookings</span>
                  </Link>
                  <Link to="/profile" className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
                    <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() ?? <User className="h-3.5 w-3.5" />}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/admin/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1.5 transition-colors">
                    Admin Portal
                  </Link>
                  <Link to="/register" className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                    <UserPlus className="h-4 w-4" /><span>Register</span>
                  </Link>
                  <Link to="/login" className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    <User className="h-4 w-4" /><span>Login</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <GPSStatusIndicator />
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2 rounded-lg hover:bg-gray-100">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {/* Core services first */}
            <div className="mb-2">
              <p className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Services</p>
              <Link to="/vehicles" className="flex items-center space-x-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <Car className="h-4 w-4 text-blue-500" /><span>Rent a Vehicle</span>
              </Link>
              <Link to="/drivers" className="flex items-center space-x-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <Users className="h-4 w-4 text-violet-500" /><span>Hire a Driver</span>
              </Link>
            </div>

            {navLinks.slice(2).map(link => (
              <Link key={link.to} to={link.to} className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-lg">{link.label}</Link>
            ))}

            <div className="border-t border-gray-100 pt-2">
              <p className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">AI Tools</p>
              {toolItems.map(t => (
                <Link key={t.to} to={t.to} className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-lg">
                  <t.icon className="h-4 w-4 text-blue-500" /><span>{t.label}</span>
                </Link>
              ))}
            </div>

            {isLoggedIn ? (
              <div className="border-t border-gray-100 pt-2">
                {user?.isDriver && <Link to="/availability" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-lg">Availability</Link>}
                <Link to="/customer/rentals" className="block px-3 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 rounded-lg">🛡️ My Self-Drive Rentals</Link>
                <Link to="/owner/rental-requests" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-lg">Owner Requests</Link>
                <Link to="/professional" className="block px-3 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 rounded-lg">💰 Professional Earnings</Link>
                <Link to="/bookings" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-lg">My Bookings</Link>
                <Link to="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-lg">Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1">Logout</button>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-2 flex space-x-2">
                <Link to="/register" className="flex-1 text-center px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">Register</Link>
                <Link to="/login" className="flex-1 text-center px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold">Login</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
