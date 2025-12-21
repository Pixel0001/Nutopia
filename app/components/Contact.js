"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Instagram, Facebook, MessageCircle } from "lucide-react";

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulare trimitere formular
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormState({ name: "", email: "", phone: "", subject: "", message: "" });
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresa",
      details: ["Str. Columna 42", "Chișinău, Moldova"],
    },
    {
      icon: Phone,
      title: "Telefon",
      details: ["+373 60 123 456", "+373 22 123 456"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["contact@nutopia.md", "comenzi@nutopia.md"],
    },
    {
      icon: Clock,
      title: "Program",
      details: ["Luni - Vineri: 9:00 - 19:00", "Sâmbătă: 10:00 - 16:00"],
    }
  ];

  const socialLinks = [
    { icon: Instagram, label: "Instagram", href: "#", color: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500" },
    { icon: Facebook, label: "Facebook", href: "#", color: "hover:bg-blue-600" },
    { icon: MessageCircle, label: "WhatsApp", href: "#", color: "hover:bg-green-500" },
  ];

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative py-24 overflow-hidden bg-gradient-to-b from-amber-50/30 via-white to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-100/40 dark:bg-orange-900/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" />
            Contactează-ne
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Suntem Aici <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Pentru Tine</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-stone-600 dark:text-stone-400">
            Ai întrebări sau vrei să plasezi o comandă? Echipa noastră îți stă la dispoziție pentru orice nelămurire.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div 
            className={`lg:col-span-3 transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-100 dark:border-stone-700">
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                Trimite-ne un mesaj
              </h3>
              <p className="text-stone-500 dark:text-stone-400 mb-8">
                Completează formularul și te vom contacta în cel mai scurt timp
              </p>

              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                    Mesaj trimis cu succes!
                  </h4>
                  <p className="text-stone-500 dark:text-stone-400">
                    Îți mulțumim! Te vom contacta în curând.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="relative">
                      <label 
                        htmlFor="name"
                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                          focusedField === 'name' || formState.name 
                            ? "-top-2.5 text-xs bg-white dark:bg-stone-800 px-2 text-amber-600 dark:text-amber-400" 
                            : "top-3.5 text-stone-400"
                        }`}
                      >
                        Nume complet *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-stone-600 bg-transparent text-stone-800 dark:text-stone-100 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-0 outline-none transition-colors duration-300"
                      />
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                      <label 
                        htmlFor="email"
                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                          focusedField === 'email' || formState.email 
                            ? "-top-2.5 text-xs bg-white dark:bg-stone-800 px-2 text-amber-600 dark:text-amber-400" 
                            : "top-3.5 text-stone-400"
                        }`}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-stone-600 bg-transparent text-stone-800 dark:text-stone-100 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-0 outline-none transition-colors duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Phone Field */}
                    <div className="relative">
                      <label 
                        htmlFor="phone"
                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                          focusedField === 'phone' || formState.phone 
                            ? "-top-2.5 text-xs bg-white dark:bg-stone-800 px-2 text-amber-600 dark:text-amber-400" 
                            : "top-3.5 text-stone-400"
                        }`}
                      >
                        Telefon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-stone-600 bg-transparent text-stone-800 dark:text-stone-100 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-0 outline-none transition-colors duration-300"
                      />
                    </div>

                    {/* Subject Field */}
                    <div className="relative">
                      <label 
                        htmlFor="subject"
                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                          focusedField === 'subject' || formState.subject 
                            ? "-top-2.5 text-xs bg-white dark:bg-stone-800 px-2 text-amber-600 dark:text-amber-400" 
                            : "top-3.5 text-stone-400"
                        }`}
                      >
                        Subiect *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-stone-600 bg-transparent text-stone-800 dark:text-stone-100 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-0 outline-none transition-colors duration-300"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="relative">
                    <label 
                      htmlFor="message"
                      className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                        focusedField === 'message' || formState.message 
                          ? "-top-2.5 text-xs bg-white dark:bg-stone-800 px-2 text-amber-600 dark:text-amber-400" 
                          : "top-3.5 text-stone-400"
                      }`}
                    >
                      Mesajul tău *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      required
                      rows={5}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-stone-600 bg-transparent text-stone-800 dark:text-stone-100 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-0 outline-none transition-colors duration-300 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Se trimite...
                      </>
                    ) : (
                      <>
                        Trimite mesajul
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div 
            className={`lg:col-span-2 transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={index}
                    className="group flex gap-4 p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">
                        {info.title}
                      </h4>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-sm text-stone-500 dark:text-stone-400">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Social Links */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <h4 className="font-semibold mb-4">Urmărește-ne</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        aria-label={social.label}
                        className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color} hover:text-white`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
                <p className="mt-4 text-amber-100 text-sm">
                  Răspundem la mesaje în maxim 2 ore!
                </p>
              </div>

              {/* Map */}
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=Strada+Columna+42,+Chisinau,+Moldova&t=&z=17&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
