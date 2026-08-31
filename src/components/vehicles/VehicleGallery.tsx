import React from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface Props {
  images: string[];
  alt?: string;
}

export default function VehicleGallery({ images, alt = 'Vehicle' }: Props) {
  const [current, setCurrent] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);

  const validImages = images.filter(Boolean);
  const placeholder = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80';
  const displayed = validImages.length > 0 ? validImages : [placeholder];

  const prev = () => setCurrent(c => (c - 1 + displayed.length) % displayed.length);
  const next = () => setCurrent(c => (c + 1) % displayed.length);

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-gray-100 group">
        <img
          src={displayed[current]}
          alt={`${alt} ${current + 1}`}
          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={e => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        {displayed.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
              {displayed.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setLightbox(true)}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {displayed.length}
        </div>
      </div>

      {displayed.length > 1 && (
        <div className="flex space-x-2 mt-2 overflow-x-auto pb-1">
          {displayed.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === current ? 'border-blue-500' : 'border-transparent'}`}>
              <img src={img} alt={`${alt} thumb ${i + 1}`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = placeholder; }} />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X className="h-8 w-8" />
          </button>
          {displayed.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}
          <img src={displayed[current]} alt={`${alt} ${current + 1}`} className="max-h-[85vh] max-w-full rounded-lg object-contain" />
        </div>
      )}
    </>
  );
}
