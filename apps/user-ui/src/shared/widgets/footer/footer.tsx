"use client";

import { Facebook, Twitter, Linkedin, Mail, MapPin, Phone, ChevronUp } from 'lucide-react';
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
                <Facebook className="w-5 h-5 text-blue-600" />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:bg-blue-50"
              >
                <Twitter className="w-5 h-5 text-blue-500" />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:bg-blue-50"
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
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