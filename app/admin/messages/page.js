"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Search,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  Mail,
  ChevronLeft,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // Edit/Delete state
  const [contextMenu, setContextMenu] = useState(null); // { messageId, x, y }
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Long press for mobile
  const longPressTimer = useRef(null);
  const longPressMessageId = useRef(null);
  
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Polling pentru mesaje noi la fiecare 5 secunde
  useEffect(() => {
    if (selectedConversation && !loadingMessages) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/admin/messages/${selectedConversation.id}`);
          if (res.ok) {
            const data = await res.json();
            const newMessages = data.conversation?.messages || [];
            if (newMessages.length > messages.length) {
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

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/admin/messages?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setLoadingMessages(true);
    setContextMenu(null);
    setEditingMessage(null);
    
    try {
      const res = await fetch(`/api/admin/messages/${conversation.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.conversation.messages);
        
        if (conversation.unreadAdmin) {
          setConversations(prev =>
            prev.map(c => c.id === conversation.id ? { ...c, unreadAdmin: false } : c)
          );
          setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        }
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    
    try {
      const res = await fetch(`/api/admin/messages/${selectedConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage("");
        
        setConversations(prev =>
          prev.map(c => c.id === selectedConversation.id 
            ? { ...c, updatedAt: new Date().toISOString(), messages: [data.message] }
            : c
          )
        );
      }
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async (conversationId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    
    try {
      const res = await fetch(`/api/admin/messages/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setConversations(prev =>
          prev.map(c => c.id === conversationId ? { ...c, status: newStatus } : c)
        );
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => ({ ...prev, status: newStatus }));
        }
        
        if (newStatus === "closed") {
          setStats(prev => ({ ...prev, open: prev.open - 1, closed: prev.closed + 1 }));
        } else {
          setStats(prev => ({ ...prev, open: prev.open + 1, closed: prev.closed - 1 }));
        }
      }
    } catch (error) {
      console.error("Toggle status error:", error);
    }
  };

  // Long press handlers for mobile
  const handleTouchStart = (e, msg) => {
    if (!msg.isFromAdmin) return;
    longPressMessageId.current = msg.id;
    longPressTimer.current = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenu({
        messageId: msg.id,
        x: touch.clientX,
        y: touch.clientY
      });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleContextMenu = (e, msg) => {
    if (!msg.isFromAdmin) return;
    e.preventDefault();
    setContextMenu({
      messageId: msg.id,
      x: e.clientX,
      y: e.clientY
    });
  };

  const startEdit = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.content);
    setContextMenu(null);
  };

  const saveEdit = async () => {
    if (!newMessage.trim() || !editingMessage) return;
    
    try {
      const res = await fetch(`/api/admin/messages/${selectedConversation.id}/${editingMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => 
          m.id === editingMessage.id ? { ...m, content: newMessage.trim(), editedAt: new Date().toISOString() } : m
        ));
        setEditingMessage(null);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Edit message error:", error);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const confirmDelete = (msgId) => {
    setDeleteConfirm(msgId);
    setContextMenu(null);
  };

  const deleteMessage = async () => {
    if (!deleteConfirm) return;
    
    try {
      const res = await fetch(`/api/admin/messages/${selectedConversation.id}/${deleteConfirm}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== deleteConfirm));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Delete message error:", error);
    }
  };

  const deleteConversation = async () => {
    if (!selectedConversation) return;
    
    if (!confirm("Sigur vrei să ștergi această conversație complet? Această acțiune nu poate fi anulată.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/messages/${selectedConversation.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
        setSelectedConversation(null);
        setMessages([]);
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          open: selectedConversation.status === "open" ? prev.open - 1 : prev.open,
          closed: selectedConversation.status === "closed" ? prev.closed - 1 : prev.closed,
          unread: selectedConversation.unreadAdmin ? prev.unread - 1 : prev.unread
        }));
      }
    } catch (error) {
      console.error("Delete conversation error:", error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Mesaje</h1>
          <p className="text-sm text-gray-500">Gestionează conversațiile cu clienții</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.open}</p>
              <p className="text-xs sm:text-sm text-gray-500">Deschise</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.closed}</p>
              <p className="text-xs sm:text-sm text-gray-500">Închise</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.unread}</p>
              <p className="text-xs sm:text-sm text-gray-500">Necitite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Search & Filter */}
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Caută conversații..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {["all", "open", "closed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all" ? "Toate" : status === "open" ? "Deschise" : "Închise"}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nu există conversații
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`p-3 sm:p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                      selectedConversation?.id === conv.id
                        ? "bg-amber-50"
                        : conv.unreadAdmin
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {conv.user?.image ? (
                        <img
                          src={conv.user.image}
                          alt={conv.user.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
                          {conv.user?.name?.[0]?.toUpperCase() || conv.user?.email?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 sm:gap-2">
                          <p className={`font-medium truncate text-sm sm:text-base ${conv.unreadAdmin ? "text-gray-900" : "text-gray-700"}`}>
                            {conv.user?.name || conv.user?.email || "Utilizator"}
                          </p>
                          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
                            conv.status === "open"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {conv.status === "open" ? "Deschis" : "Închis"}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${conv.unreadAdmin ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                          {conv.subject}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conv.updatedAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      {conv.unreadAdmin && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat View */}
        <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
          {!selectedConversation ? (
            <div className="bg-white rounded-xl border border-gray-100 h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Selectează o conversație pentru a vedea mesajele</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 h-[450px] sm:h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-2 sm:p-4 border-b border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-900 flex-shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {selectedConversation.user?.image ? (
                    <img
                      src={selectedConversation.user.image}
                      alt={selectedConversation.user.name}
                      className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold text-xs sm:text-lg flex-shrink-0">
                      {selectedConversation.user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs sm:text-base text-gray-800 truncate">
                      {selectedConversation.user?.name || "Utilizator"}
                    </p>
                    <p className="text-[10px] sm:text-sm text-gray-500 truncate">{selectedConversation.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(selectedConversation.id, selectedConversation.status)}
                    className={`px-1.5 sm:px-4 py-1 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedConversation.status === "open"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    <span className="hidden sm:inline">{selectedConversation.status === "open" ? "Marchează ca închis" : "Redeschide"}</span>
                    <span className="sm:hidden">{selectedConversation.status === "open" ? "Închide" : "Deschide"}</span>
                  </button>
                  <button
                    onClick={deleteConversation}
                    className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Șterge conversația"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50 relative">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
                      onContextMenu={(e) => handleContextMenu(e, msg)}
                      onTouchStart={(e) => handleTouchStart(e, msg)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                    >
                      <div className={`flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%] ${msg.isFromAdmin ? "flex-row-reverse" : ""}`}>
                        {!msg.isFromAdmin && (
                          selectedConversation.user?.image ? (
                            <img
                              src={selectedConversation.user.image}
                              alt=""
                              className="w-5 h-5 sm:w-7 sm:h-7 rounded-full object-cover flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-[8px] sm:text-xs font-bold flex-shrink-0">
                              {selectedConversation.user?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )
                        )}
                        {msg.isFromAdmin && (
                          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-[1.5px] flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                              <img src="/Nutopia4.png" alt="Nutopia" className="w-3 h-3 sm:w-4 sm:h-4 object-contain" />
                            </div>
                          </div>
                        )}
                        
                        <div
                          className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 relative group ${
                            msg.isFromAdmin
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl rounded-br-sm"
                              : "bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm"
                          }`}
                        >
                            <p className="text-[13px] sm:text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-0.5 ${msg.isFromAdmin ? "justify-end" : ""}`}>
                              {msg.editedAt && (
                                <span className={`text-[9px] sm:text-[10px] ${msg.isFromAdmin ? "text-white/60" : "text-gray-400"}`}>
                                  (editat)
                                </span>
                              )}
                              <span className={`text-[9px] sm:text-[10px] ${msg.isFromAdmin ? "text-white/70" : "text-gray-400"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString("ro-RO", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                            
                            {/* Quick action button for desktop */}
                            {msg.isFromAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContextMenu({
                                    messageId: msg.id,
                                    x: e.clientX,
                                    y: e.clientY
                                  });
                                }}
                                className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
                
                {/* Context Menu */}
                {contextMenu && (
                  <div
                    className="fixed bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[140px]"
                    style={{
                      left: Math.min(contextMenu.x, window.innerWidth - 160),
                      top: Math.min(contextMenu.y, window.innerHeight - 100)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => startEdit(messages.find(m => m.id === contextMenu.messageId))}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <Pencil className="w-4 h-4" />
                      Editează
                    </button>
                    <button
                      onClick={() => confirmDelete(contextMenu.messageId)}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      Șterge
                    </button>
                  </div>
                )}
              </div>

              {/* Delete Confirmation Modal */}
              {deleteConfirm && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-xl">
                  <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Șterge mesajul?</h3>
                    <p className="text-gray-500 text-sm mb-4">Această acțiune nu poate fi anulată.</p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Anulează
                      </button>
                      <button
                        onClick={deleteMessage}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input */}
              {selectedConversation.status === "open" && (
                <form onSubmit={editingMessage ? (e) => { e.preventDefault(); saveEdit(); } : sendMessage} className="p-2 sm:p-4 border-t border-gray-100">
                  {editingMessage && (
                    <div className="mb-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-50 rounded-lg text-xs sm:text-sm text-amber-800 flex items-center justify-between">
                      <span className="flex items-center gap-1 sm:gap-2">
                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        Editezi mesaj
                      </span>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-1.5 sm:gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={editingMessage ? "Editează..." : "Scrie răspuns..."}
                      className="flex-1 px-2.5 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-full text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm"
                      autoFocus={editingMessage}
                    />
                    {editingMessage && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : editingMessage ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              )}

              {selectedConversation.status === "closed" && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-gray-500">
                  Această conversație este închisă. Redeschide-o pentru a răspunde.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
