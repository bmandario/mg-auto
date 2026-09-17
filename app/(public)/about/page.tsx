export const metadata = {
  title: "About Us — Auto Exchange",
  description: "Learn more about Auto Exchange, powered by Master Garage.",
};

export default function AboutPage() {
  return (
    <div className="pt-16 bg-white min-h-screen">
      {/* Hero */}
      <section className="relative py-24 border-b border-gray-100 overflow-hidden bg-white">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">
            Who We Are
          </p>
          <h1 className="font-display text-6xl sm:text-8xl text-gray-900 uppercase tracking-tight leading-none mb-6">
            About Us
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Auto Exchange is powered by Master Garage — your trusted source for
            fully inspected, roadworthy certified pre-owned vehicles in the Philippines.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">Our Mission</p>
              <h2 className="font-display text-4xl sm:text-5xl text-gray-900 uppercase leading-none mb-6">
                Quality Cars.<br />
                <span className="text-[#cc1111]">Zero Guesswork.</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                We believe buying a used car shouldn't be a gamble. Every vehicle on Auto Exchange
                goes through a rigorous multi-point inspection by Master Garage technicians before
                it's listed — so you know exactly what you're getting.
              </p>
              <p className="text-gray-500 leading-relaxed">
                From full service history to parts transparency and roadworthiness certification,
                we give you the complete picture.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { title: "Multi-Point Inspection", desc: "Every unit is inspected by certified Master Garage technicians before listing." },
                { title: "Full Service History", desc: "Complete maintenance records and parts replaced — no hidden surprises." },
                { title: "Roadworthy Certified", desc: "Each car is assessed and certified roadworthy before it hits our listings." },
                { title: "Easy Financing", desc: "We connect you with financing options to make ownership accessible." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-5 border border-gray-200 bg-white">
                  <div className="w-1 bg-[#cc1111] flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-bold text-sm mb-1">{item.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2 text-center">Our Locations</p>
          <h2 className="font-display text-3xl text-gray-900 uppercase tracking-[0.15em] text-center mb-10">MG Branches</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {["MG Cavite", "MG Pampanga", "MG Batangas", "MG Palawan", "MG Quezon City"].map((branch) => (
              <div key={branch} className="flex flex-col items-center gap-3 border border-gray-200 bg-white px-4 py-6 text-center">
                <div className="w-2 h-2 bg-[#cc1111] rounded-full" />
                <p className="text-gray-900 font-bold text-sm leading-tight">{branch}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">Ready to Find Your Car?</p>
          <h2 className="font-display text-4xl sm:text-5xl text-gray-900 uppercase leading-none mb-6">
            Browse Our Listings
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Explore our fully inspected inventory and find the right car for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/cars"
              className="px-8 py-3.5 bg-[#cc1111] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-colors"
            >
              Browse Cars →
            </a>
            <a
              href="/contact"
              className="px-8 py-3.5 border border-gray-300 text-gray-600 text-xs font-bold tracking-widest uppercase hover:border-gray-800 hover:text-gray-900 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
