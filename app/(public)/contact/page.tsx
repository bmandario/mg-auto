"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitInquiry } from "@/lib/inquiries";
import { Mail, MapPin, Send, CheckCircle, Phone } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number required"),
  message: z.string().min(10, "Please write a message"),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      await submitInquiry({
        carId: "",
        carTitle: "General Inquiry",
        carSlug: "",
        ...data,
      });
      setSubmitted(true);
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
            Get in Touch
          </p>
          <h1 className="font-display text-6xl sm:text-8xl text-gray-900 uppercase tracking-tight leading-none mb-6">
            Contact Us
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Have a question about a listing or just want to say hello?
            We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Info */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">Our Details</p>
              <h2 className="font-display text-4xl text-gray-900 uppercase leading-none mb-8">
                Reach Out
              </h2>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-[#cc1111]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Email</p>
                    <a href="mailto:gmsolutions888@gmail.com" className="text-gray-900 text-sm font-medium hover:text-[#cc1111] transition-colors">
                      gmsolutions888@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-[#cc1111]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Location</p>
                    <p className="text-gray-900 text-sm font-medium">Philippines</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-[#cc1111]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Response Time</p>
                    <p className="text-gray-900 text-sm font-medium">Within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Info cards */}
              <div className="space-y-3">
                {[
                  { title: "Unit Inquiries", desc: "Ask about any specific listing directly from the car's page." },
                  { title: "Financing Questions", desc: "We'll connect you with our financing partners." },
                  { title: "General Questions", desc: "Anything else — we're happy to help." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 border border-gray-100 bg-gray-50">
                    <div className="w-1 bg-[#cc1111] flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 font-bold text-sm mb-0.5">{item.title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">Send a Message</p>
              <h2 className="font-display text-4xl text-gray-900 uppercase leading-none mb-8">
                Message Us
              </h2>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-10 text-center">
                  <CheckCircle size={36} className="text-emerald-600 mx-auto mb-4" />
                  <p className="text-emerald-700 font-bold tracking-widest uppercase text-sm mb-2">Message Sent!</p>
                  <p className="text-gray-500 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 block mb-2">Your Name *</label>
                      <input
                        {...register("name")}
                        placeholder="Juan dela Cruz"
                        className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-3 text-sm outline-none transition-colors"
                      />
                      {errors.name && <p className="text-[#cc1111] text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 block mb-2">Email Address *</label>
                      <input
                        {...register("email")}
                        placeholder="juan@email.com"
                        className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-3 text-sm outline-none transition-colors"
                      />
                      {errors.email && <p className="text-[#cc1111] text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 block mb-2">Phone Number *</label>
                    <input
                      {...register("phone")}
                      placeholder="+63 9XX XXX XXXX"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-3 text-sm outline-none transition-colors"
                    />
                    {errors.phone && <p className="text-[#cc1111] text-xs mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 block mb-2">Message *</label>
                    <textarea
                      {...register("message")}
                      placeholder="Tell us what you're looking for or ask us anything..."
                      rows={5}
                      className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-3 text-sm outline-none transition-colors resize-none"
                    />
                    {errors.message && <p className="text-[#cc1111] text-xs mt-1">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-10 py-3.5 bg-[#cc1111] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-colors disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
