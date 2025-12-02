import { Phone, Mail, Facebook, Instagram, Twitter, MapPin } from 'lucide-react';
import { socialConfig, getWhatsAppContactLink } from '../config/socialConfig';

export default function Footer() {
  return (
    <footer className="bg-[#041955] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#E6B31E]">MPL Season 2</h3>
            <p className="text-gray-300 mb-4">
              Milind Nagar Premier League - Where cricket dreams come alive. Join us for the most exciting cricket tournament in the region.
            </p>
            <div className="flex items-start space-x-2 text-gray-300">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">Milind Nagar, Garden</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-[#E6B31E]">Contact Us</h3>
            <div className="space-y-3">
              <a
                href={`tel:${socialConfig.contact.phone}`}
                className="flex items-center space-x-3 text-gray-300 hover:text-[#E6B31E] transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{socialConfig.contact.phone}</span>
              </a>
              <a
                href={`mailto:${socialConfig.contact.email}`}
                className="flex items-center space-x-3 text-gray-300 hover:text-[#E6B31E] transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>{socialConfig.contact.email}</span>
              </a>
              <a
                href={getWhatsAppContactLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-[#E6B31E]">Follow Us</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Stay updated with latest news, match schedules, and highlights
            </p>
            <div className="flex space-x-4">
              <a
                href={socialConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-full hover:bg-[#E6B31E] transition-all duration-300 transform hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={socialConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-full hover:bg-[#E6B31E] transition-all duration-300 transform hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={socialConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-full hover:bg-[#E6B31E] transition-all duration-300 transform hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-[#E6B31E]">Tech Partner</h3>
            <p className="text-gray-300 mb-4 font-semibold text-lg">
              DevBrigade
            </p>
            <div className="space-y-3">
              <a
                href="tel:9619644091"
                className="flex items-center space-x-3 text-gray-300 hover:text-[#E6B31E] transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>9619644091</span>
              </a>
              <a
                href="mailto:kailashdesiti@gmail.com"
                className="flex items-center space-x-3 text-gray-300 hover:text-[#E6B31E] transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm break-all">kailash.desiti@devbrigade.co.in</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E6B31E]/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left space-y-2">
              <p className="text-sm text-gray-300">
                Event Organised by: <span className="font-semibold text-[#E6B31E]">MPL Organizing Committee</span>
              </p>
              <p className="text-sm text-gray-300">
                Application Managed by: <span className="font-semibold text-[#E6B31E]">DevBrigade</span>
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-300">
                &copy; {new Date().getFullYear()} Milind Nagar Premier League. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
