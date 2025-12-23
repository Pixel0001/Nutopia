"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Instagram, Facebook, MessageCircle, LogIn, ChevronLeft, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const sectionRef = useRef(null);
  
  // Chat state
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // New conversation
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newFirstMessage, setNewFirstMessage] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollingRef = useRef(null);

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

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Fetch user error:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch conversations when user is loaded
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Polling pentru mesaje noi la fiecare 5 secunde
  useEffect(() => {
    if (selectedConversation && !loadingMessages) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/messages/${selectedConversation.id}`);
          if (res.ok) {
            const data = await res.json();
            const newMessages = data.conversation?.messages || [];
            if (newMessages.length > messages.filter(m => !m.sending).length) {
              setMessages(newMessages);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [selectedConversation, loadingMessages, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const openConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setLoadingMessages(true);
    setShowNewConversation(false);
    
    try {
      const res = await fetch(`/api/messages/${conversation.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.conversation?.messages || []);
        
        // Mark as read
        if (conversation.unreadUser) {
          await fetch(`/api/messages/${conversation.id}`, { method: "PATCH" });
          setConversations(prev =>
            prev.map(c => c.id === conversation.id ? { ...c, unreadUser: false } : c)
          );
        }
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setLoadingMessages(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic update
    const tempMessage = {
      id: "temp-" + Date.now(),
      content: messageText,
      isFromAdmin: false,
      createdAt: new Date().toISOString(),
      sending: true
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => 
          m.id === tempMessage.id ? data.message : m
        ));
        
        // Update conversation in list
        setConversations(prev =>
          prev.map(c => c.id === selectedConversation.id 
            ? { ...c, updatedAt: new Date().toISOString() }
            : c
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      } else {
        // Remove failed message
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      }
    } catch (err) {
      console.error("Send message error:", err);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  const createConversation = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newFirstMessage.trim() || creatingConversation) return;

    setCreatingConversation(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject.trim(),
          message: newFirstMessage.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setConversations(prev => [data.conversation, ...prev]);
        setNewSubject("");
        setNewFirstMessage("");
        setShowNewConversation(false);
        openConversation(data.conversation);
      }
    } catch (err) {
      console.error("Create conversation error:", err);
    } finally {
      setCreatingConversation(false);
    }
  };

  const closeConversation = async () => {
    if (!selectedConversation || selectedConversation.status === "closed") return;
    
    if (!confirm("Sigur vrei să închizi această conversație? Nu vei mai putea trimite mesaje.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedConversation(data.conversation);
        setConversations(prev =>
          prev.map(c => c.id === selectedConversation.id ? data.conversation : c)
        );
      }
    } catch (err) {
      console.error("Close conversation error:", err);
    }
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
      details: ["+373 79 677 652"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["nutopia.md@gmail.com"],
    },
    {
      icon: Clock,
      title: "Program",
      details: ["Site: 24/24", "Magazin: L-V 09:00-19:00", "S-D 10:00-18:00"],
    }
  ];

  const socialLinks = [
    { icon: Instagram, label: "Instagram", href: "#", color: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500" },
    { icon: Facebook, label: "Facebook", href: "#", color: "hover:bg-blue-600" },
    { icon: MessageCircle, label: "WhatsApp", href: "#", color: "hover:bg-green-500" },
  ];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Azi";
    if (days === 1) return "Ieri";
    if (days < 7) return d.toLocaleDateString("ro-RO", { weekday: "long" });
    return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
  };

  const getUserInitial = () => {
    return user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative py-24 overflow-hidden bg-gradient-to-b from-amber-50/30 via-white to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-100/40 dark:bg-orange-900/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <div 
            className={`lg:col-span-3 transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-700 overflow-hidden">
              {loadingUser ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !user ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
                    <LogIn className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                    Autentificare necesară
                  </h4>
                  <p className="text-stone-500 dark:text-stone-400 mb-6">
                    Pentru a ne trimite un mesaj, te rugăm să te autentifici sau să îți creezi un cont.
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href="/login"
                      className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Autentificare
                    </Link>
                    <Link
                      href="/register"
                      className="px-6 py-3 border-2 border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-semibold rounded-xl hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
                    >
                      Înregistrare
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex h-[500px]">
                  {/* Conversations List */}
                  <div className={`w-full sm:w-80 border-r border-stone-100 dark:border-stone-700 flex flex-col ${selectedConversation ? 'hidden sm:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-stone-100 dark:border-stone-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                          {user.image ? (
                            <img 
                              src={user.image} 
                              alt={user.name || "User"} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            getUserInitial()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800 dark:text-stone-100 text-sm">
                            {user.name || "Utilizator"}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">Mesaje</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowNewConversation(true); setSelectedConversation(null); }}
                        className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                        title="Conversație nouă"
                      >
                        <Plus className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                      </button>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                      {loadingConversations ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <MessageCircle className="w-12 h-12 text-stone-300 dark:text-stone-600 mb-3" />
                          <p className="text-sm text-stone-500 dark:text-stone-400">
                            Nu ai conversații încă
                          </p>
                          <button
                            onClick={() => setShowNewConversation(true)}
                            className="mt-3 text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline"
                          >
                            Începe o conversație
                          </button>
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => openConversation(conv)}
                            className={`p-4 border-b border-stone-50 dark:border-stone-700/50 cursor-pointer transition-colors ${
                              selectedConversation?.id === conv.id
                                ? "bg-amber-50 dark:bg-amber-900/20"
                                : conv.unreadUser
                                ? "bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                : "hover:bg-stone-50 dark:hover:bg-stone-700/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-[3px] flex-shrink-0">
                                <div className="w-full h-full rounded-full bg-white dark:bg-stone-800 flex items-center justify-center overflow-hidden">
                                  <img src="/Nutopia4.png" alt="Nutopia" className="w-10 h-10 object-contain" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`font-semibold truncate text-sm ${conv.unreadUser ? "text-stone-900 dark:text-stone-100" : "text-stone-700 dark:text-stone-300"}`}>
                                    Nutopia
                                  </p>
                                  <span className="text-xs text-stone-400 flex-shrink-0">
                                    {formatDate(conv.updatedAt)}
                                  </span>
                                </div>
                                <p className={`text-sm truncate ${conv.unreadUser ? "font-semibold text-stone-800 dark:text-stone-200" : "text-stone-500 dark:text-stone-400"}`}>
                                  {conv.subject}
                                </p>
                              </div>
                              {conv.unreadUser && (
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Chat View */}
                  <div className={`flex-1 flex flex-col ${!selectedConversation && !showNewConversation ? 'hidden sm:flex' : 'flex'}`}>
                    {showNewConversation ? (
                      // New Conversation Form
                      <>
                        <div className="p-4 border-b border-stone-100 dark:border-stone-700 flex items-center gap-3">
                          <button
                            onClick={() => setShowNewConversation(false)}
                            className="sm:hidden p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <h3 className="font-semibold text-stone-800 dark:text-stone-100">
                            Conversație nouă
                          </h3>
                        </div>
                        <form onSubmit={createConversation} className="flex-1 p-6 flex flex-col gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                              Subiect
                            </label>
                            <input
                              type="text"
                              value={newSubject}
                              onChange={(e) => setNewSubject(e.target.value)}
                              placeholder="ex: Întrebare despre produse"
                              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                              Mesaj
                            </label>
                            <textarea
                              value={newFirstMessage}
                              onChange={(e) => setNewFirstMessage(e.target.value)}
                              placeholder="Scrie mesajul tău aici..."
                              className="w-full h-32 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={creatingConversation || !newSubject.trim() || !newFirstMessage.trim()}
                            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {creatingConversation ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Se trimite...
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                Trimite mesajul
                              </>
                            )}
                          </button>
                        </form>
                      </>
                    ) : selectedConversation ? (
                      // Chat Messages
                      <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-stone-100 dark:border-stone-700 flex items-center gap-3">
                          <button
                            onClick={() => setSelectedConversation(null)}
                            className="sm:hidden p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white dark:bg-stone-800 flex items-center justify-center overflow-hidden">
                              <img src="/Nutopia4.png" alt="Nutopia" className="w-8 h-8 object-contain" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-800 dark:text-stone-100">Nutopia</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                              {selectedConversation.subject}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedConversation.status === "closed" ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400">
                                Închis
                              </span>
                            ) : (
                              <button
                                onClick={closeConversation}
                                className="px-3 py-1.5 text-xs rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                              >
                                Închide
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50 dark:bg-stone-900/50">
                          {loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                            </div>
                          ) : (
                            <>
                              {messages.map((msg, index) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.isFromAdmin ? "justify-start" : "justify-end"}`}
                                >
                                  <div className={`flex items-end gap-2 max-w-[75%] ${msg.isFromAdmin ? "" : "flex-row-reverse"}`}>
                                    {msg.isFromAdmin && (
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-[2px] flex-shrink-0">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-stone-800 flex items-center justify-center overflow-hidden">
                                          <img src="/Nutopia4.png" alt="Nutopia" className="w-5 h-5 object-contain" />
                                        </div>
                                      </div>
                                    )}
                                    <div
                                      className={`px-4 py-2.5 ${
                                        msg.isFromAdmin
                                          ? "bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-2xl rounded-bl-sm"
                                          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl rounded-br-sm"
                                      } ${msg.sending ? "opacity-70" : ""}`}
                                    >
                                      <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                      <p className={`text-[10px] mt-1 text-right ${msg.isFromAdmin ? "text-stone-400" : "text-white/70"}`}>
                                        {msg.sending ? "Se trimite..." : formatTime(msg.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </>
                          )}
                        </div>

                        {/* Input */}
                        {selectedConversation.status === "open" ? (
                          <form onSubmit={sendMessage} className="p-4 border-t border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800">
                            <div className="flex items-center gap-3">
                              <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Scrie un mesaj..."
                                className="flex-1 px-4 py-3 rounded-full border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                              />
                              <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="p-3 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="p-4 border-t border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 text-center text-sm text-stone-500">
                            Această conversație este închisă
                          </div>
                        )}
                      </>
                    ) : (
                      // Empty State
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center mb-4">
                          <MessageCircle className="w-10 h-10 text-stone-400 dark:text-stone-500" />
                        </div>
                        <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">
                          Mesajele tale
                        </h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                          Selectează o conversație sau începe una nouă
                        </p>
                        <button
                          onClick={() => setShowNewConversation(true)}
                          className="px-6 py-2.5 bg-amber-500 text-white font-medium rounded-full hover:bg-amber-600 transition-colors text-sm"
                        >
                          Mesaj nou
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

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
