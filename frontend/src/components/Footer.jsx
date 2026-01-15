import { Facebook, Instagram, Youtube, Twitter, Mail } from 'lucide-react';

// --- IMPORT ASSETS ---
import visaIcon from '../assets/Visa.png';
import masterIcon from '../assets/master.png';
import maybankIcon from '../assets/maybank.png';
import cimbIcon from '../assets/cimb.png';
import tngIcon from '../assets/tng.jpg';
import bsnIcon from '../assets/bsn.png';
import bankIslamIcon from '../assets/bankislam.png';

const Footer = () => {
  
  // Array to manage payment logos
  const paymentIcons = [
    { src: visaIcon, alt: "Visa" },
    { src: masterIcon, alt: "Mastercard" },
    { src: maybankIcon, alt: "Maybank" },
    { src: cimbIcon, alt: "CIMB" },
    { src: tngIcon, alt: "Touch n Go" },
    { src: bsnIcon, alt: "BSN" },
    { src: bankIslamIcon, alt: "Bank Islam" },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
              <h3 className="text-xl font-bold text-white tracking-tight">TechVault</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Your trusted destination for high-performance computing, gaming gear, and tech accessories. Empowering your digital life since 2026.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition"><Youtube className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold mb-6">Customer Service</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Track Your Order</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Warranty Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition">About TechVault</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Sitemap</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <p className="text-sm text-slate-400 mb-4">Subscribe for exclusive deals and new arrivals.</p>
            <form className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" placeholder="Email address" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-900/20">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* --- BOTTOM SECTION --- */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">&copy; 2026 TechVault Sdn Bhd. All rights reserved.</p>
          
          <div className="flex gap-2 flex-wrap justify-center">
             {paymentIcons.map((icon, index) => (
                <div key={index} className="h-8 w-12 bg-white rounded flex items-center justify-center p-1 overflow-hidden shadow-sm">
                    <img 
                        src={icon.src} 
                        alt={icon.alt} 
                        className="h-full w-full object-contain" 
                    />
                </div>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;