import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 'md', readonly = false }: Props) {
  const [hover, setHover] = React.useState(0);
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
