export default function Hero() {
  const scrollToRegister = () => {
    const element = document.getElementById('register');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-[#041955] via-[#062972] to-[#041955] text-white py-20 md:py-32">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#E6B31E] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E6B31E] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-block bg-[#E6B31E] text-[#041955] px-6 py-2 rounded-full font-bold mb-6 animate-pulse">
            Registration Open Now!
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            MPL Season 2
            <br />
            <span className="text-[#E6B31E]">Player Registration</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl mb-4 text-gray-300 max-w-3xl mx-auto">
            Join the most exciting cricket tournament in Milind Nagar
          </p>

          <p className="text-base sm:text-lg mb-10 text-[#E6B31E] font-semibold">
            Register before 1st December to participate in the auction
          </p>

          <button
            onClick={scrollToRegister}
            className="bg-[#E6B31E] text-[#041955] px-10 py-4 rounded-full text-xl font-bold hover:bg-white transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-[#E6B31E]/50"
          >
            Register Now
          </button>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-[#E6B31E]/30">
              <div className="text-4xl font-bold text-[#E6B31E] mb-2">₹300</div>
              <div className="text-sm text-gray-300">Registration Fee</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-[#E6B31E]/30">
              <div className="text-4xl font-bold text-[#E6B31E] mb-2">Dec 1</div>
              <div className="text-sm text-gray-300">Last Date</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-[#E6B31E]/30">
              <div className="text-4xl font-bold text-[#E6B31E] mb-2">2026</div>
              <div className="text-sm text-gray-300">Season 2</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
