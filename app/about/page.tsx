export const metadata = {
  title: "About Us — Auto Exchange",
  description: "Learn more about Auto Exchange, powered by Master Garage.",
};

export default function AboutPage() {
  return (
    <div className="pt-16 bg-[#0a0a0a] min-h-screen">
      <section className="relative py-24 border-b border-[#1f1f1f] overflow-hidden bg-[#080808]">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#cc1111 1px, transparent 1px), linear-gradient(90deg, #cc1111 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">
            Coming Soon
          </p>
          <h1 className="font-display text-6xl sm:text-8xl text-white uppercase tracking-tight leading-none mb-6">
            About Us
          </h1>
          <p className="font-heading text-[#555] text-lg max-w-xl mx-auto leading-relaxed">
            This page is under construction. Check back soon to learn more about
            Auto Exchange and Master Garage.
          </p>
        </div>
      </section>
    </div>
  );
}
