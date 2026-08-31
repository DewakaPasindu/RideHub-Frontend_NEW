import React from 'react';
import { Zap, Star, Users, Tag, CheckCircle, ChevronRight, Fuel, Settings, Thermometer } from 'lucide-react';
import type { VehicleRecommendation } from '../../services/api/AIService';

interface Props {
  recommendations: VehicleRecommendation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-2 bg-gray-100 rounded-full w-full" />
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-gray-500 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%`, transition: 'width 0.8s ease' }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

function ConfidenceBadge({ confidence, rank }: { confidence: number; rank: number }) {
  const cls =
    confidence >= 85 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
    confidence >= 70 ? 'bg-blue-100 text-blue-800 border-blue-200' :
    'bg-amber-100 text-amber-800 border-amber-200';
  return (
    <div className="flex items-center space-x-1.5">
      {rank === 1 && (
        <div className="flex items-center space-x-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          <Zap className="h-3 w-3" /><span>Best Match</span>
        </div>
      )}
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>{confidence}% match</span>
    </div>
  );
}

export default function VehicleRecommendationPanel({ recommendations, selectedId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center space-x-2 mb-5">
          <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900">Finding Best Vehicles...</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
          <Tag className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600">No vehicles match your criteria</h3>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your budget, passenger count, or luggage size</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Recommended For You</h3>
        </div>
        <span className="text-sm text-gray-500">{recommendations.length} vehicles found</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec, idx) => {
          const v = rec.vehicle;
          const isSelected = selectedId === v.id;
          const isTop = rec.rank === 1;

          return (
            <div
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-[1.01]'
                  : isTop
                  ? 'border-blue-300 shadow-md hover:shadow-lg hover:border-blue-400'
                  : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
              }`}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={v.images?.[0] || PLACEHOLDER}
                  alt={`${v.brand} ${v.model}`}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                />
                {/* Rank badge */}
                <div className={`absolute top-3 left-3 h-8 w-8 rounded-full flex items-center justify-center text-sm font-black shadow ${
                  idx === 0 ? 'bg-amber-400 text-white' :
                  idx === 1 ? 'bg-gray-300 text-gray-700' :
                  idx === 2 ? 'bg-amber-700 text-white' :
                  'bg-white/80 text-gray-600'
                }`}>
                  #{rec.rank}
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-blue-600 rounded-full p-1 shadow">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
                {/* Price overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-6">
                  <p className="text-white font-black text-xl">
                    LKR {v.price_per_day.toLocaleString()}
                    <span className="text-sm font-normal text-white/70">/day</span>
                  </p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                {/* Title + badges */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base leading-tight">{v.brand} {v.model}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{v.year} · {v.vehicle_number}</p>
                  </div>
                  <ConfidenceBadge confidence={rec.confidence} rank={rec.rank} />
                </div>

                {/* Vehicle specs */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                    <Users className="h-3 w-3" /><span>{v.seat_count} seats</span>
                  </span>
                  <span className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg capitalize">
                    <Tag className="h-3 w-3" /><span>{v.vehicle_type}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg capitalize">
                    <Fuel className="h-3 w-3" /><span>{v.fuel_type}</span>
                  </span>
                  {v.has_ac && (
                    <span className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      <Thermometer className="h-3 w-3" /><span>AC</span>
                    </span>
                  )}
                </div>

                {/* AI Score bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">AI Match Score</span>
                    <span className="font-bold text-blue-600">{rec.score}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rec.score >= 80 ? 'bg-emerald-500' : rec.score >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                      style={{ width: `${rec.score}%`, transition: 'width 1s ease' }}
                    />
                  </div>
                </div>

                {/* Why this vehicle */}
                {rec.reasons.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    <p className="text-xs font-semibold text-blue-800 mb-1.5">Why this vehicle?</p>
                    <ul className="space-y-1">
                      {rec.reasons.slice(0, 3).map((r, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-blue-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Rating if available */}
                {v.avg_rating !== undefined && v.avg_rating > 0 && (
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-gray-700">{v.avg_rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({v.review_count ?? 0} reviews)</span>
                  </div>
                )}

                {/* Select button */}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onSelect(v.id); }}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {isSelected ? (
                    <><CheckCircle className="h-4 w-4" /><span>Selected</span></>
                  ) : (
                    <><span>Select Vehicle</span><ChevronRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
