"use client";
import NewsletterForm from "./NewsletterForm";
import Link from "next/link";
import { Instagram, Facebook } from "@mui/icons-material";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About and Contact */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <h2 className="font-special-gothic font-bold text-red-700 text-2xl">
              THE STUDIO 26
            </h2>
          </Link>
          <p className="text-gray-300 mb-4">
            Handcrafted jewelry and metalworking classes in a welcoming studio
            environment.
          </p>
          <div className="flex space-x-3">
            <a
              href="https://www.facebook.com/thestudio26"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-amber-300 transition-colors"
              aria-label="Facebook"
            >
              <Facebook />
            </a>
            <a
              href="https://www.instagram.com/thestudio26/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-amber-300 transition-colors"
              aria-label="Instagram"
            >
              <Instagram />
            </a>
          </div>
          <div className="space-y-1">
            <p className="font-light text-sm text-gray-300">Business Hours:</p>
            <p className="font-light text-sm text-gray-300">Mon - Fri: 9:30am - 2:30pm</p>
            <p className="font-light text-sm text-gray-300">Sat - Sun: 9:30am - 2:30pm</p>
          </div>
        </div>

        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 text-amber-300">
            Contact Us
          </h3>

          <div className="flex items-start space-x-2">
            <MapPin size={20} className="mt-1 text-amber-300 flex-shrink-0" />
            <Link
              href="https://maps.app.goo.gl/LPYfNwpRU52rdkwj6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-amber-300 transition-colors"
            >
              4100 Cameron Park Drive,
              <br />
              Suite 118 Cameron Park, <br />
              CA 95682
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Mail size={20} className="text-amber-300 flex-shrink-0" />
            <a
              href="mailto:thestudio26llcwebsite@gmail.com"
              className="text-gray-300 hover:text-amber-300 transition-colors"
            >
              thestudio26llcwebsite@gmail.com
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <Phone size={20} className="text-amber-300 flex-shrink-0" />
            <a
              href="tel:9163500546"
              className="text-gray-300 hover:text-amber-300 transition-colors"
            >
              (916) 350-0546
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 text-amber-300">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/StoreSearch"
                className="text-gray-300 hover:text-amber-300 transition-colors"
              >
                Online Store
              </Link>
            </li>
            <li>
              <Link
                href="/class-catalog"
                className="text-gray-300 hover:text-amber-300 transition-colors"
              >
                Class Catalog
              </Link>
            </li>
            <li>
              <Link
                href="/calendar"
                className="text-gray-300 hover:text-amber-300 transition-colors"
              >
                Calendar
              </Link>
            </li>
            <li>
              <Link
                href="/OpenLab"
                className="text-gray-300 hover:text-amber-300 transition-colors"
              >
                Open Lab
              </Link>
            </li>
            <li>
              <Link
                href="/GiftCards"
                className="text-gray-300 hover:text-amber-300 transition-colors"
              >
                Gift Cards
              </Link>
            </li>
            <li>
              <Link
                href="/Contact"
                className="text-gray-300 hover:text-amber-300 transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/policies/cancellation-policy"
                className="text-gray-300 hover:text-amber-300 transition-colors"
              >
                Cancellation Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 text-amber-300">
            Newsletter
          </h3>
          <p className="text-gray-300 mb-2">
            Subscribe to receive updates on new classes and special offers.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Footer bottom - copyright and extra links */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; 2017-{currentYear} The Studio 26.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/Login"
              className="text-gray-400 hover:text-amber-300 text-sm transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
