import React from 'react';
import { Target, Star, Clock, MapPin, CheckCircle, ChevronRight, Award, User } from 'lucide-react';
import type { DriverMatch } from '../../services/api/AIService';

interface Props {
  matches: DriverMatch[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSkip: () => void;
  loading?: boolean;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';

function ScoreColumn({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="relative inline-flex">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={`${(value / 100) * 94.2} 94.2`}
            className={color} strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{value}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="flex space-x-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
          <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function DriverMatchPanel({ matches, selectedId, onSelect, onSkip, loading }: Props) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center space-x-2 mb-5">
          <Target className="h-5 w-5 text-indigo-600 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900">Finding Best Drivers...</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Driver Matching</h3>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No drivers available right now</p>
          <p className="text-gray-400 text-sm mt-1">You can proceed without a driver</p>
          <button onClick={onSkip} className="mt-4 px-5 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
            Continue without Driver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Best Driver Matches</h3>
        </div>
        <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">
          Skip — no driver
        </button>
      </div>

      <div className="space-y-4">
        {matches.map((m, idx) => {
          const d = m.driver;
          const name = d.user ? `${d.user.first_name} ${d.user.last_name}` : 'Driver';
          const isSelected = selectedId === d.id;
          const isTop = idx === 0;

          return (
            <div
              key={d.id}
              onClick={() => onSelect(d.id)}
              className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg'
                  : isTop
                  ? 'border-indigo-300 shadow-md hover:shadow-lg'
                  : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start space-x-4">
                  {/* Rank */}
                  <div className="text-center flex-shrink-0 w-7">
                    <span className={`text-xl font-black ${
                      idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : 'text-amber-700'
                    }`}>#{idx + 1}</span>
                  </div>

                  {/* Photo */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={d.profile_photo || PLACEHOLDER}
                      alt={name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                      onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                    />
                    {isTop && (
                      <div className="absolute -top-1 -right-1 bg-indigo-600 rounded-full p-0.5">
                        <Award className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                      d.availability_status === 'available' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base leading-tight">{name}</h4>
                        <div className="flex items-center space-x-3 mt-0.5">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-gray-700">{d.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-gray-400">{d.experience_years}y exp</span>
                          <span className={`text-xs font-medium ${d.availability_status === 'available' ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {d.availability_status === 'available' ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      </div>
                      {/* Final score */}
                      <div className="text-right ml-2 flex-shrink-0">
                        <div className={`text-3xl font-black ${isTop ? 'text-indigo-600' : 'text-gray-600'}`}>{m.final_score}</div>
                        <p className="text-xs text-gray-400 -mt-1">score</p>
                      </div>
                    </div>

                    {/* Distance & ETA */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{m.distance_km} km away</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>~{m.estimated_arrival_min} min arrival</span>
                      </div>
                    </div>

                    {/* Score wheels */}
                    <div className="flex items-center justify-between mb-3">
                      <ScoreColumn label="Distance" value={m.distance_score} color="text-blue-500" />
                      <ScoreColumn label="Experience" value={m.experience_score} color="text-green-500" />
                      <ScoreColumn label="Rating" value={m.rating_score} color="text-amber-500" />
                      <ScoreColumn label="Availability" value={m.availability_score} color="text-purple-500" />
                    </div>

                    {/* Reason */}
                    {m.reason && (
                      <div className="bg-indigo-50 rounded-xl px-3 py-2 mb-3">
                        <p className="text-xs text-indigo-700 leading-relaxed">{m.reason}</p>
                      </div>
                    )}

                    {/* Best match badge + select button */}
                    <div className="flex items-center space-x-2">
                      {isTop && (
                        <span className="flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                          <Target className="h-3 w-3" /><span>Best Match</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onSelect(d.id); }}
                        className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'border-2 border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                      >
                        {isSelected ? (
                          <><CheckCircle className="h-4 w-4" /><span>Selected</span></>
                        ) : (
                          <><span>Select Driver</span><ChevronRight className="h-4 w-4" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
