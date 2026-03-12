/**
 * SupportSection Component
 * Displays support tickets and allows creating new tickets
 */

import React from 'react';
import { useSupport } from '../hooks/useSupport';
import { SUPPORT_TICKET_STATUS } from '../../../constants/status';

interface SupportSectionProps {
  userId: string | null;
  userName: string;
  onSave: (message: { type: 'success' | 'error'; text: string }) => void;
}

export function SupportSection({ userId, userName, onSave }: SupportSectionProps) {
  const {
    tickets,
    selectedTicket,
    setSelectedTicket,
    loading,
    saving,
    showNewTicketForm,
    setShowNewTicketForm,
    newTicket,
    setNewTicket,
    replyMessage,
    setReplyMessage,
    createTicket,
    addReply,
  } = useSupport(userId, userName);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTicket();
    if (result.success) {
      onSave({ type: 'success', text: 'تم إنشاء التذكرة بنجاح' });
    } else {
      onSave({ type: 'error', text: result.error || 'حدث خطأ أثناء إنشاء التذكرة' });
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket) return;
    const result = await addReply(selectedTicket.id);
    if (result.success) {
      onSave({ type: 'success', text: 'تم إرسال الرد بنجاح' });
    } else {
      onSave({ type: 'error', text: result.error || 'حدث خطأ أثناء إرسال الرد' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="support" className="space-y-8">
      {/* Search Section */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-primary/10 p-6 sm:p-8 md:p-12 text-center border border-primary/10">
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-slate-100">كيف يمكننا مساعدتك اليوم؟</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">ابحث في مقالات المساعدة أو تصفح المواضيع الشائعة</p>
          <div className="relative group">
            <span className="material-symbols-outlined absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:text-primary text-lg sm:text-xl">search</span>
            <input
              className="w-full h-12 sm:h-14 pr-10 sm:pr-12 pl-3 sm:pl-4 rounded-xl sm:rounded-2xl border-none ring-1 ring-primary/20 focus:ring-2 focus:ring-primary bg-background-light dark:bg-background-dark shadow-sm text-sm sm:text-base"
              placeholder="ابحث عن دروس، فواتير، أو مشاكل تقنية..."
              type="text"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* New Ticket Form */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-lg sm:text-xl">confirmation_number</span>
            <h2 className="text-lg sm:text-xl font-bold">فتح تذكرة دعم جديدة</h2>
          </div>
          {showNewTicketForm ? (
            <form onSubmit={handleCreateTicket} className="space-y-4 bg-background-light dark:bg-background-dark p-6 rounded-2xl border border-primary/10 shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">موضوع المشكلة</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-primary/5 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="مثال: مشكلة في تسجيل الدخول"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">القسم</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-primary/5 focus:ring-2 focus:ring-primary"
                >
                  <option value="technical">مشاكل تقنية</option>
                  <option value="billing">الاشتراكات والمدفوعات</option>
                  <option value="account">محتوى الدروس</option>
                  <option value="other">اقتراحات وتطوير</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">الأولوية</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-primary/5 focus:ring-2 focus:ring-primary"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">تفاصيل المشكلة</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-primary/5 focus:ring-2 focus:ring-primary resize-none"
                  placeholder="يرجى وصف المشكلة بالتفصيل..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? 'جاري الإرسال...' : 'إرسال التذكرة'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              فتح تذكرة جديدة
            </button>
          )}
        </section>

        {/* Recent Tickets */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg sm:text-xl">history</span>
              <h2 className="text-lg sm:text-xl font-bold">التذاكر الأخيرة</h2>
            </div>
            <a className="text-xs sm:text-sm text-primary font-medium hover:underline whitespace-nowrap" href="#">عرض الكل</a>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="p-3 sm:p-4 bg-background-light dark:bg-background-dark border border-primary/10 rounded-xl sm:rounded-2xl flex items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`size-8 sm:size-10 rounded-full flex items-center justify-center shrink-0 ${
                                  ticket.status === SUPPORT_TICKET_STATUS.OPEN ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                                  ticket.status === SUPPORT_TICKET_STATUS.RESOLVED ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                }`}>
                                  <span className="material-symbols-outlined text-sm sm:text-base">
                                    {ticket.status === SUPPORT_TICKET_STATUS.OPEN ? 'hourglass_empty' : ticket.status === SUPPORT_TICKET_STATUS.RESOLVED ? 'check_circle' : 'schedule'}
                                  </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-0 mb-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-words">{ticket.subject}</h3>
                      <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold whitespace-nowrap shrink-0 ${
                                      ticket.status === SUPPORT_TICKET_STATUS.OPEN ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                      ticket.status === SUPPORT_TICKET_STATUS.RESOLVED ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    }`}>
                                      {ticket.status === SUPPORT_TICKET_STATUS.OPEN ? 'قيد الانتظار' : ticket.status === SUPPORT_TICKET_STATUS.RESOLVED ? 'تم الحل' : 'قيد المعالجة'}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-1 sm:mb-2">رقم التذكرة: #{ticket.id.slice(0, 8)}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 sm:line-clamp-1">{ticket.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 sm:p-8 border-2 border-dotted border-primary/10 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center opacity-60">
                <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary/40 mb-2">contact_support</span>
                <p className="text-xs sm:text-sm">لا توجد تذاكر للعرض</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 max-h-[90vh]">
            <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-3 sm:pb-4 flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1 break-words">{selectedTicket.subject}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{selectedTicket.category}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-slate-500 text-lg sm:text-xl">close</span>
              </button>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold">الردود</h3>
                  {selectedTicket.replies.map((reply: any) => (
                    <div
                      key={reply.id}
                      className={`p-3 sm:p-4 rounded-lg ${
                        reply.sender === 'user' ? 'bg-primary/10 ml-4 sm:ml-8' : 'bg-slate-100 dark:bg-slate-700 mr-4 sm:mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm">{reply.senderName}</p>
                        <p className="text-xs text-slate-500">{new Date(reply.createdAt?.toDate?.() || reply.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}
                            {selectedTicket.status !== SUPPORT_TICKET_STATUS.CLOSED && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-3"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || saving}
                    className="w-full sm:w-auto bg-primary text-slate-900 font-bold py-2 px-4 sm:px-6 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 text-sm sm:text-base"
                  >
                    {saving ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
