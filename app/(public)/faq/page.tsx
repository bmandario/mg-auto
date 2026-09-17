"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "Reservations",
    items: [
      {
        q: "How do I reserve a car?",
        a: "You can reserve a unit by filling out the inquiry form on the car's detail page, or by messaging us directly on WhatsApp. Once we confirm your intent, we'll walk you through the reservation process and hold the unit for you.",
      },
      {
        q: "Is there a reservation fee?",
        a: "Yes, a reservation fee is required to hold a unit. This is deducted from the final selling price upon purchase. The amount varies per unit — please contact us for specifics.",
      },
      {
        q: "How long can a unit be held for me?",
        a: "Reserved units are typically held for 3–7 days depending on the arrangement. Extensions may be granted on a case-by-case basis. Please coordinate with us as early as possible.",
      },
      {
        q: "Is the reservation fee refundable?",
        a: "Reservation fees are generally non-refundable once the unit has been held and pulled from active listings. However, we evaluate each situation individually — please reach out if you have concerns.",
      },
    ],
  },
  {
    category: "Buying Process",
    items: [
      {
        q: "What are the steps to buying a car from Auto Exchange?",
        a: "1. Browse our listings and find a car you like. 2. Send an inquiry or message us on WhatsApp. 3. Schedule a viewing or ocular inspection. 4. Pay the reservation fee to hold the unit. 5. Settle the full payment. 6. We process the deed of sale and facilitate LTO transfer.",
      },
      {
        q: "Can I negotiate the price?",
        a: "Our prices are set fairly based on market value, condition, and mileage. Minor negotiations may be considered depending on the unit. Feel free to reach out and we'll do our best to find a mutually agreeable price.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept cash, bank transfer (BDO, BPI, Metrobank), and manager's check. For financed purchases, payment is coursed through the approved lending institution.",
      },
      {
        q: "Can I buy a car if I'm based outside Metro Manila?",
        a: "Yes. We can arrange for viewings at a mutually convenient location or coordinate shipping/delivery. Additional charges may apply for out-of-region transactions. Contact us to discuss your situation.",
      },
    ],
  },
  {
    category: "Vehicle Condition",
    items: [
      {
        q: "Are all cars inspected before being listed?",
        a: "Yes. Every unit listed on Auto Exchange undergoes a multi-point inspection covering the engine, transmission, brakes, suspension, electrical system, body, and interior. Roadworthiness status is displayed on each car's page.",
      },
      {
        q: "What does 'Roadworthy Certified' mean?",
        a: "'Roadworthy Certified' means the vehicle has passed our inspection and is safe and fit for daily use on public roads. The certificate has an expiry date visible on the listing.",
      },
      {
        q: "Can I have the car independently inspected before buying?",
        a: "Absolutely. We encourage buyers to bring their own mechanic for a pre-purchase inspection. We want you to be fully confident in your purchase.",
      },
      {
        q: "What if a defect is found after purchase?",
        a: "We are transparent about the condition of every unit. All known issues are disclosed prior to sale. Post-sale defects that were not disclosed should be reported to us immediately and we will address them in good faith.",
      },
    ],
  },
  {
    category: "Financing",
    items: [
      {
        q: "Do you offer in-house financing?",
        a: "We do not offer in-house financing directly, but we can assist you in applying through accredited banks and lending partners. Approval is subject to the lender's credit evaluation.",
      },
      {
        q: "What is the typical down payment for financing?",
        a: "Most bank financing requires a minimum of 20% down payment. The financing estimates shown on each listing are based on this 20% assumption. Actual terms depend on the lender and your credit standing.",
      },
      {
        q: "How long does financing approval take?",
        a: "Bank approval typically takes 3–7 business days after submission of complete requirements. We can guide you on what documents to prepare.",
      },
      {
        q: "What documents do I need to apply for a car loan?",
        a: "Generally: valid government-issued ID, proof of income (COE or payslips for employed; ITR or financial statements for self-employed), proof of billing, and TIN. Requirements may vary per lender.",
      },
    ],
  },
  {
    category: "Documents & Transfer",
    items: [
      {
        q: "What documents will I receive upon purchase?",
        a: "You will receive: the Official Receipt (OR), Certificate of Registration (CR), Deed of Sale, and any other supporting documents. We ensure all paperwork is clean and in order.",
      },
      {
        q: "Who handles the LTO transfer?",
        a: "We facilitate the transfer of ownership at the LTO. Processing time typically takes 2–4 weeks. The associated fees are discussed during the transaction.",
      },
      {
        q: "Are the cars free from encumbrances or liens?",
        a: "Yes. We verify that all units are free from any outstanding loans, liens, or encumbrances before they are listed for sale.",
      },
    ],
  },
  {
    category: "General",
    items: [
      {
        q: "Where are you located?",
        a: "We are based in the Philippines. Please contact us directly for our exact location and to schedule a viewing appointment.",
      },
      {
        q: "How do I contact you?",
        a: "You can reach us via the inquiry form on any car listing, by email at gmsolutions888@gmail.com, or via WhatsApp. We typically respond within a few hours during business hours.",
      },
      {
        q: "Do you buy or accept trade-in vehicles?",
        a: "We evaluate trade-ins on a case-by-case basis. Contact us with details of your vehicle (year, make, model, mileage, condition) and we'll get back to you with an assessment.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-gray-900 font-semibold text-sm leading-snug">{q}</span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-[#cc1111] mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="text-gray-500 text-sm leading-relaxed pb-5 pr-6">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="pt-16 bg-white min-h-screen">

      {/* Header */}
      <section className="border-b border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">Help Center</p>
          <h1 className="font-display text-5xl sm:text-6xl text-gray-900 uppercase tracking-tight leading-none mb-4">
            Frequently<br />Asked Questions
          </h1>
          <p className="text-gray-400 text-sm max-w-md">
            Everything you need to know about buying a pre-owned vehicle from Auto Exchange.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {faqs.map((section) => (
          <div key={section.category}>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-5">
              {section.category}
            </p>
            <div className="border-t border-gray-100">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions */}
        <div className="border border-gray-200 p-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">Still have questions?</p>
          <p className="text-gray-900 font-semibold mb-1">We're happy to help.</p>
          <p className="text-gray-400 text-sm mb-6">Reach out and we'll get back to you as soon as possible.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/contact"
              className="px-8 py-3 bg-[#cc1111] text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:gmsolutions888@gmail.com"
              className="px-8 py-3 border border-gray-200 text-gray-600 text-[10px] font-bold tracking-widest uppercase hover:border-gray-400 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
