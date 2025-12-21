"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  FileText,
  Users,
  UserCog,
  Shield,
  Bell,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Clock,
  ChevronDown
} from "lucide-react";

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState("send");
  const [templates, setTemplates] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, subscribers: 0, users: 0, admins: 0, moderators: 0 });
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Send email state
  const [recipientType, setRecipientType] = useState("subscribers");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: "", subject: "", content: "", category: "general" });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const res = await fetch("/api/admin/emails/send");
      if (res.ok) {
        setIsSuperAdmin(true);
        fetchData();
      } else {
        setIsSuperAdmin(false);
        setLoading(false);
      }
    } catch (error) {
      setIsSuperAdmin(false);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesRes, logsRes, subscribersRes] = await Promise.all([
        fetch("/api/admin/emails/templates"),
        fetch("/api/admin/emails/send"),
        fetch("/api/admin/emails/subscribers")
      ]);

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
        setStats(data.stats || {});
      }

      if (subscribersRes.ok) {
        const data = await subscribersRes.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmails = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      alert("Completează subiectul și conținutul email-ului");
      return;
    }

    if (!confirm(`Sigur vrei să trimiți email către ${getRecipientLabel(recipientType)}?`)) {
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType,
          subject: emailSubject,
          content: emailContent,
          templateId: selectedTemplate?.id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSendResult({ success: true, ...data });
        setEmailSubject("");
        setEmailContent("");
        setSelectedTemplate(null);
        fetchData(); // Refresh logs
      } else {
        setSendResult({ success: false, error: data.error });
      }
    } catch (error) {
      setSendResult({ success: false, error: "A apărut o eroare" });
    } finally {
      setSending(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.content.trim()) {
      alert("Completează toate câmpurile");
      return;
    }

    setSavingTemplate(true);

    try {
      const url = editingTemplate 
        ? `/api/admin/emails/templates/${editingTemplate.id}`
        : "/api/admin/emails/templates";
      
      const res = await fetch(url, {
        method: editingTemplate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm)
      });

      if (res.ok) {
        setShowTemplateModal(false);
        setEditingTemplate(null);
        setTemplateForm({ name: "", subject: "", content: "", category: "general" });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "A apărut o eroare");
      }
    } catch (error) {
      alert("A apărut o eroare");
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm("Sigur vrei să ștergi acest șablon?")) return;

    try {
      const res = await fetch(`/api/admin/emails/templates/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Delete template error:", error);
    }
  };

  const deleteSubscriber = async (id) => {
    if (!confirm("Sigur vrei să ștergi acest abonat?")) return;

    try {
      const res = await fetch(`/api/admin/emails/subscribers?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error("Delete subscriber error:", error);
    }
  };

  const useTemplate = (template) => {
    setSelectedTemplate(template);
    setEmailSubject(template.subject);
    setEmailContent(template.content);
  };

  const openEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
    setShowTemplateModal(true);
  };

  const getRecipientLabel = (type) => {
    switch (type) {
      case "admins": return "Admini";
      case "moderators": return "Moderatori";
      case "users": return "Utilizatori";
      case "subscribers": return "Abonați Newsletter";
      case "all": return "Toți";
      default: return type;
    }
  };

  const getRecipientCount = (type) => {
    switch (type) {
      case "admins": return stats.admins;
      case "moderators": return stats.moderators;
      case "users": return stats.users;
      case "subscribers": return stats.subscribers;
      case "all": return stats.users + stats.subscribers;
      default: return 0;
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Acces Interzis</h2>
          <p className="text-red-600">Doar Super Admin poate accesa această pagină.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Email Marketing</h1>
          <p className="text-sm text-gray-500">Trimite email-uri și gestionează șabloanele</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.totalSent}</p>
              <p className="text-xs text-gray-500">Trimise</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.subscribers}</p>
              <p className="text-xs text-gray-500">Abonați</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.users}</p>
              <p className="text-xs text-gray-500">Utilizatori</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <UserCog className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.moderators}</p>
              <p className="text-xs text-gray-500">Moderatori</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.admins}</p>
              <p className="text-xs text-gray-500">Admini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { id: "send", label: "Trimite Email", icon: Send },
            { id: "templates", label: "Șabloane", icon: FileText },
            { id: "subscribers", label: "Abonați", icon: Bell },
            { id: "history", label: "Istoric", icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50/50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* Send Email Tab */}
          {activeTab === "send" && (
            <div className="space-y-4 sm:space-y-6">
              {sendResult && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                  sendResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}>
                  {sendResult.success ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    {sendResult.success ? (
                      <>
                        <p className="font-medium">{sendResult.message}</p>
                        <p className="text-sm mt-1">
                          Trimise: {sendResult.sentCount} | Eșuate: {sendResult.failedCount}
                        </p>
                      </>
                    ) : (
                      <p>{sendResult.error}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Recipient Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinatari
                  </label>
                  <div className="relative">
                    <select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="subscribers">Abonați Newsletter ({stats.subscribers})</option>
                      <option value="users">Utilizatori ({stats.users})</option>
                      <option value="moderators">Moderatori ({stats.moderators})</option>
                      <option value="admins">Admini ({stats.admins})</option>
                      <option value="all">Toți ({stats.users + stats.subscribers})</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Șablon (opțional)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTemplate?.id || ""}
                      onChange={(e) => {
                        const template = templates.find(t => t.id === e.target.value);
                        if (template) useTemplate(template);
                        else {
                          setSelectedTemplate(null);
                          setEmailSubject("");
                          setEmailContent("");
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Scrie manual</option>
                      {templates.filter(t => t.isActive).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subiect
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subiectul email-ului"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Conținut (HTML)
                  </label>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? "Editează" : "Previzualizează"}
                  </button>
                </div>
                {showPreview ? (
                  <div 
                    className="w-full min-h-[300px] px-4 py-3 border border-gray-200 rounded-lg bg-white overflow-auto"
                    dangerouslySetInnerHTML={{ __html: emailContent }}
                  />
                ) : (
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="<h1>Titlu</h1><p>Conținutul email-ului...</p>"
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                )}
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <button
                  onClick={sendEmails}
                  disabled={sending || !emailSubject.trim() || !emailContent.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {sending ? "Se trimite..." : `Trimite către ${getRecipientLabel(recipientType)}`}
                </button>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Șabloane Email</h3>
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateForm({ name: "", subject: "", content: "", category: "general" });
                    setShowTemplateModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Șablon nou
                </button>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nu există șabloane încă</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">{template.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            template.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {template.isActive ? "Activ" : "Inactiv"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{template.subject}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => useTemplate(template)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                          title="Folosește"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditTemplate(template)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editează"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === "subscribers" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">
                Abonați Newsletter ({subscribers.length})
              </h3>

              {subscribers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nu există abonați încă</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nume</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-800">{sub.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{sub.name || "-"}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(sub.createdAt).toLocaleDateString("ro-RO")}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              sub.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              {sub.isActive ? "Activ" : "Inactiv"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => deleteSubscriber(sub.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Istoric Email-uri</h3>

              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nu există email-uri trimise încă</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{log.subject}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>{getRecipientLabel(log.recipientType)}</span>
                            <span>•</span>
                            <span>{log.sentCount} trimise</span>
                            <span>•</span>
                            <span>{new Date(log.createdAt).toLocaleString("ro-RO")}</span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          log.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {log.status === "sent" ? "Trimis" : "Parțial"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingTemplate ? "Editează șablonul" : "Șablon nou"}
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume șablon
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="ex: Bun venit"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categorie
                  </label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="promo">Promoții</option>
                    <option value="news">Noutăți</option>
                    <option value="welcome">Bun venit</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subiect
                </label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="Subiectul email-ului"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conținut (HTML)
                </label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="<h1>Titlu</h1><p>Conținut...</p>"
                  rows={10}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={saveTemplate}
                disabled={savingTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {savingTemplate && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingTemplate ? "Salvează" : "Creează"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
