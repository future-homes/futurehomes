'use client'

export default function ContactPage() {
  const phoneNumber = '+918921324592';
  const whatsappNumber = '918921324592';
  const email = 'info@futurehomes.com';
  const address = 'Marine Drive, Kochi, Kerala, India';

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi, I am interested in Future Homes properties. Can you help me?');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-radial from-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Premium Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative text-7xl sm:text-8xl">✨</div>
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-6 leading-tight">
            Let's Connect
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Experience luxury living with personalized service. Our team is ready to help you find your dream home.
          </p>
        </div>

        {/* Main Premium Contact Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 mb-10">
          {/* Company Info with Premium Design */}
          <div className="text-center mb-14">
            <div className="inline-block mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-xl opacity-50"></div>
              <h2 className="relative text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-white to-indigo-400 bg-clip-text text-transparent">
                Future Homes
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Location */}
              <div className="group backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 hover:border-blue-400/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white/90 font-semibold text-sm sm:text-base leading-relaxed">{address}</p>
              </div>

              {/* Phone */}
              <div className="group backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 hover:border-green-400/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p className="text-white/90 font-semibold text-sm sm:text-base">{phoneNumber}</p>
              </div>

              {/* Email */}
              <div className="group backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 hover:border-indigo-400/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white/90 font-semibold text-sm sm:text-base">{email}</p>
              </div>
            </div>
          </div>

          {/* Premium Action Buttons */}
          <div className="space-y-5 max-w-2xl mx-auto">
            <button
              onClick={handleWhatsApp}
              className="group relative w-full py-5 sm:py-6 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white text-lg sm:text-xl font-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-green-500/50 transition-all active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="tracking-wide">Chat on WhatsApp</span>
              </div>
            </button>

            <button
              onClick={handleCall}
              className="group relative w-full py-5 sm:py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-lg sm:text-xl font-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-blue-500/50 transition-all active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="tracking-wide">Call Us Now</span>
              </div>
            </button>

            <a
              href={`mailto:${email}`}
              className="group relative w-full py-5 sm:py-6 bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 text-white text-lg sm:text-xl font-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-slate-500/50 transition-all active:scale-95 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="tracking-wide">Send Email</span>
              </div>
            </a>
          </div>

          {/* Working Hours - Premium Style */}
          <div className="mt-12 pt-10 border-t border-white/10">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-5 backdrop-blur-sm bg-white/5 px-6 py-3 rounded-full border border-white/10">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-black text-xl text-white">Working Hours</span>
              </div>
              <div className="space-y-2 text-blue-100">
                <p className="font-bold text-lg">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="font-bold text-lg">Saturday: 10:00 AM - 4:00 PM</p>
                <p className="text-sm text-blue-200/70 mt-3">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <a
            href="/properties"
            className="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h4 className="font-black text-2xl text-white mb-1">Browse Properties</h4>
                <p className="text-blue-200">Discover luxury homes</p>
              </div>
            </div>
          </a>

          <a
            href="/properties/upload"
            className="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h4 className="font-black text-2xl text-white mb-1">List Your Property</h4>
                <p className="text-green-200">Get premium exposure</p>
              </div>
            </div>
          </a>
        </div>

        {/* Premium Footer Note */}
        <div className="text-center">
          <div className="inline-block backdrop-blur-sm bg-white/5 border border-white/10 px-8 py-4 rounded-full">
            <p className="text-blue-100 font-medium">
              🌟 Premium service guaranteed • Response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
