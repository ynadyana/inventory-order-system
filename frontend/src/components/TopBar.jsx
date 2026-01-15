import { X, Tag } from 'lucide-react';
import { useState } from 'react';

const TopBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-slate-900 text-white text-xs md:text-sm py-2.5 px-4 flex justify-between items-center relative z-50 shadow-md">
      <div className="flex-1 text-center font-medium flex justify-center items-center gap-2">
        <Tag className="w-3.5 h-3.5 text-blue-400" />
        <span>
          Spring Sale is Live! Get <span className="font-bold text-blue-300">RM50 OFF</span> min. spend RM500. *Auto Applied at Checkout
        </span>
      </div>
      <button onClick={() => setIsVisible(false)} className="absolute right-4 text-white/60 hover:text-white transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TopBar;