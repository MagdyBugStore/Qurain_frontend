

import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-background-dark text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-primary">
                <svg
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">القرآن أونلاين</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              منصتك الأولى لتعليم القرآن الكريم واللغة العربية للأطفال عن بعد،
              بأيدي معلمين متخصصين ومنهجية مبتكرة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">روابط سريعة</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  عن المنصة
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:text-primary transition-colors">
                  البرامج الدراسية
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-primary transition-colors">
                  المعلمون
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary transition-colors">
                  الأسعار والباقات
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-6">المساعدة</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">تواصل معنا</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">
                  mail
                </span>
                info@quranonline.com
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">
                  call
                </span>
                +966 50 123 4567
              </li>
              <li className="flex gap-4 mt-4">
                <a
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  href="#"
                >
                  <span className="text-xs">fb</span>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  href="#"
                >
                  <span className="text-xs">tw</span>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  href="#"
                >
                  <span className="text-xs">in</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          <p>© 2023 القرآن أونلاين. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
