"use client";

import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, Plus, Clock, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { createClient } from "@/src/utils/supabase/client";
import { getClientBillingData, createDeposit, payFreelancerAction } from '@/src/actions/financeActions';

export default function ClientBillingPage() {
  const [data, setData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{show: boolean, contract: any}>({ show: false, contract: null });
  const [loadingPay, setLoadingPay] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const res = await getClientBillingData(); 
        setData(res);
      }
    };
    init();
  }, []);

  const handleExecutePayment = async () => {
    if (!confirmModal.contract) return;
    setLoadingPay(true);
    try {
      await payFreelancerAction(confirmModal.contract.id);
      window.location.reload(); 
    } catch (e: any) {
      alert(e.message);
      setLoadingPay(false);
      setConfirmModal({ show: false, contract: null });
    }
  };

  if (!data) return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="animate-spin text-violet-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen relative">
      
      {/* MODAL XÁC NHẬN TÙY CHỈNH */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bold backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <AlertCircle size={32} />
              </div>
              <button onClick={() => setConfirmModal({show: false, contract: null})} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Xác nhận giải ngân</h3>
            <p className="text-slate-500 mb-6">
              Bạn có chắc chắn muốn thanh toán <span className="font-bold text-slate-900">${confirmModal.contract?.total_amount}</span> cho dự án:
              <br />
              <span className="font-bold text-violet-600">"{confirmModal.contract?.job?.title || 'Đang tải...'}"</span>?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({show: false, contract: null})}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleExecutePayment}
                disabled={loadingPay}
                className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
              >
                {loadingPay ? "Đang xử lý..." : "Xác nhận ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Số dư */}
        <div className="md:col-span-1 bg-linear-to-br from-violet-600 to-cyan-500 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-blue-100 text-sm opacity-80 font-bold uppercase tracking-widest">Số dư hiện tại</p>
              <h1 className="text-4xl font-bold mt-2">${data.balance.toLocaleString()}</h1>
            </div>
            <Wallet size={28} />
          </div>
          <form action={createDeposit} className="space-y-3">
            <input type="hidden" name="userId" value={userId || ''} />
            <input name="amount" type="number" placeholder="Số tiền..." className="w-full p-4 rounded-2xl bg-white/10 text-white outline-none border border-white/20 placeholder:text-white/40 font-bold" required min="1" />
            <button type="submit" className="w-full bg-white text-violet-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg">
              <Plus size={20} /> Nạp tiền vào ví
            </button>
          </form>
        </div>

        {/* Danh sách hợp đồng chờ giải ngân */}
        <div className="md:col-span-2 bg-white p-8 rounded-4xl border border-slate-100 shadow-sm overflow-y-auto max-h-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase text-sm tracking-widest">
            <Clock size={18} className="text-amber-500" /> Hợp đồng chờ thanh toán
          </h3>
          <div className="space-y-4">
            {data.pendingContracts.length > 0 ? data.pendingContracts.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-4xl border border-slate-100 hover:border-violet-200 transition-all group">
                <div>
                  <p className="text-[10px] font-bold text-violet-600 uppercase mb-1 tracking-widest">
                    {c.job?.title || `Hợp đồng #${c.id?.slice(0, 8)}`}
                  </p>
                  <p className="font-bold text-slate-800 text-lg">Số tiền: ${c.total_amount}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">ID: {c.id?.slice(0, 8)}</p>
                </div>
                <button 
                  onClick={() => setConfirmModal({ show: true, contract: c })}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100"
                >
                  Giải ngân ngay
                </button>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 font-bold italic text-center">Không có hợp đồng nào chờ thanh toán.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bảng giao dịch */}
      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Lịch sử giao dịch</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="px-10 py-5">Chi tiết</th>
              <th className="px-10 py-5">Ngày</th>
              <th className="px-10 py-5">Số tiền</th>
              <th className="px-10 py-5">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.transactions.map((tx: any) => (
              <tr key={tx.id} className="text-sm hover:bg-slate-50/30 transition-colors">
                <td className="px-10 py-5 font-bold text-slate-700">{tx.description}</td>
                <td className="px-10 py-5 text-slate-500 font-medium">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className={`px-10 py-5 font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}$
                </td>
                <td className="px-10 py-5">
                  <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-bold uppercase">Thành công</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}