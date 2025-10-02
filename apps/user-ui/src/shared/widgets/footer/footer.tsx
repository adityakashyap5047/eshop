"use client";

import { Mail, MapPin, Phone, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-300 pt-16 pb-8">
      <div className="w-[90%] lg:w-[80%] m-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Business Description Section */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Perfect ecommerce platform to start your business from scratch
            </h3>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-4 mt-6">
              <Link 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:bg-blue-50"
              >
                {/* Facebook Icon */}
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:bg-blue-50"
              >
                {/* Twitter/X Icon */}
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:bg-blue-50"
              >
                {/* LinkedIn Icon */}
                <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* My Account Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-6">My Account</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/order-history" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-6">Information</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/our-story" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Latest News
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Talk To Us Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-6">Talk To Us</h4>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Got Questions? Call us
              </p>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <a 
                  href="tel:+6704139762" 
                  className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200"
                >
                  +91 9341543488
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <a 
                  href="mailto:support@eshop.com" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  support@eshop.com
                </a>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                <div className="text-gray-600 text-sm">
                  <div>79 Sleepy Hollow St,</div>
                  <div>Jamaica, New York 1432</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 All Rights Reserved | Eshop Private Ltd
            </p>
            
            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer