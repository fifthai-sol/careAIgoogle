
import React from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
  count?: number;
  value: number;
  onChange: (value: number) => void;
  size?: number;
  inactiveColor?: string;
  activeColor?: string;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  count = 5,
  value,
  onChange,
  size = 24, 
  inactiveColor = "text-gray-300",
  activeColor = "text-yellow-400",
  disabled = false,
}) => {
  const stars = Array.from({ length: count }, (_, i) => i + 1);

  const handleClick = (starValue: number) => {
    if (!disabled) {
      onChange(starValue);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {stars.map((starValue) => (
        <StarIcon
          key={starValue}
          className={`w-${size/4} h-${size/4} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
            starValue <= value ? activeColor : inactiveColor
          }`}
          fill={starValue <= value ? 'currentColor' : 'none'}
          onClick={() => handleClick(starValue)}
        />
      ))}
    </div>
  );
};

export default StarRating;