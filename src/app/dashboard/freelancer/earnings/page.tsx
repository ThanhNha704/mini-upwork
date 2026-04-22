"use client";

import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight, Wallet, History, Info, Loader2, ArrowDownRight,
  X, Send, DollarSign, CreditCard,
  CheckCircle2, AlertTriangle
} from "lucide-react";
import { getFreelancerBillingData } from '@/src/actions/financeActions';
import { getStripeConnectLink, withdrawToStripeAction } from "@/src/actions/stripeActions";

/**
 * COMPONENT THÔNG BÁO (MESSAGE)
 */
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-300 ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
      }`}>
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
      <p className="font-bold text-sm tracking-wide">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity"><X size={16} /></button>
    </div>
  );
};

/**
 * MODAL XÁC NHẬN RÚT TIỀN
 */
function WithdrawStripeModal({ isOpen, onClose, balance, onRefresh, showMsg }: any) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > balance) return showMsg("Số dư không đủ!", "error");
    // if (amount < 10) return showMsg("Số tiền rút tối thiểu là $10", "error");

    setLoading(true);
    const res = await withdrawToStripeAction(amount);

    if (res.success) {
      showMsg("Tiền đã được chuyển vào tài khoản Stripe!", "success");
      await onRefresh();
      onClose();
    } else {
      showMsg(res.error || "Giao dịch thất bại", "error");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 italic uppercase">Rút về Stripe</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Số tiền muốn rút (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
              <input
                type="number" required min={0} max={balance} value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 ring-indigo-500 transition-all"
                placeholder="0.00"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Số dư khả dụng: ${balance.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl flex gap-3 border border-indigo-100">
            <CreditCard className="text-indigo-600 shrink-0" size={20} />
            <p className="text-[11px] text-indigo-800 leading-relaxed font-semibold">
              Tiền sẽ được chuyển ngay lập tức vào ví Stripe Connect của bạn.
            </p>
          </div>
          <button
            disabled={loading || amount <= 0} type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : <><Send size={18} /> XÁC NHẬN RÚT</>}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * TRANG CHÍNH
 */
export default function FreelancerEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // State quản lý thông báo
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
  };

  const init = async () => {
    try {
      const res = await getFreelancerBillingData();
      if (res) setData(res);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { init(); }, []);

  const handleStripeAction = async () => {
    setActionLoading(true);
    try {
      if (!data?.stripe_connect_id) {
        const res = await getStripeConnectLink();
        window.location.href = res.url;
      } else {
        setIsWithdrawOpen(true);
      }
    } catch (err) {
      showMsg("Không thể thực hiện thao tác Stripe.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Đang tải ví...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 duration-500">
      {/* Hiển thị Toast nếu có message */}
      {msg && <Toast message={msg.text} type={msg.type} onClose={() => setMsg(null)} />}

      <WithdrawStripeModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        balance={data?.balance || 0}
        onRefresh={init}
        showMsg={showMsg}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-linear-to-br from-violet-600 to-cyan-500 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <Wallet className="mb-4 opacity-70 group-hover:scale-110 transition-transform" size={32} />
            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Số dư khả dụng</p>
            <h3 className="text-5xl font-bold mt-2 tracking-tighter">${Number(data.balance || 0).toLocaleString()}</h3>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        </div>

        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
            <ArrowUpRight size={28} />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Đang đợi thanh toán</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">${Number(data.pendingAmount || 0).toLocaleString()}</h3>
        </div>

        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Phương thức rút tiền</p>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="px-2 py-1 bg-linear-to-r from-violet-600 to-cyan-500 rounded text-[8px] text-white font-bold uppercase italic">Stripe</div>
              <span className="text-sm font-bold text-slate-700">
                {data.stripe_connect_id ? "Đã liên kết tài khoản" : "Chưa kết nối Stripe"}
              </span>
            </div>
          </div>
          <button
            onClick={handleStripeAction}
            disabled={actionLoading}
            className="mt-8 w-full py-4 bg-linear-to-r from-violet-600 to-cyan-500 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {actionLoading ? "Đang xử lý..." : data.stripe_connect_id ? "Rút về Stripe" : "Kết nối Stripe Connect"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-slate-50 rounded-lg"><History className="text-slate-400" size={20} /></div>
          <h3 className="font-bold text-slate-900 text-xl tracking-tight uppercase">Lịch sử thu nhập</h3>
        </div>
        {/* Lịch sử giao dịch */}
        <div className="space-y-4">
          {data.transactions?.length > 0 ? (
            data.transactions.map((tx: any) => {
              // KIỂM TRA LOẠI GIAO DỊCH
              const isWithdrawal = tx.type === 'withdrawal';

              return (
                <div key={tx.id} className="flex justify-between items-center p-5 hover:bg-indigo-50/50 rounded-3xl transition-all border border-transparent hover:border-indigo-100 group">
                  <div className="flex gap-5 items-center">
                    {/* ĐỔI ICON VÀ MÀU NỀN THEO LOẠI */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all ${isWithdrawal ? 'bg-rose-500' : 'bg-green-600'
                      }`}>
                      {isWithdrawal ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 text-sm">{tx.description}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* ĐỔI DẤU VÀ MÀU CHỮ THEO LOẠI */}
                    <span className={`font-bold text-lg ${isWithdrawal ? 'text-rose-500' : 'text-green-600'
                      }`}>
                      {isWithdrawal ? `-$${tx.amount}` : `+$${tx.amount}`}
                    </span>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                      {isWithdrawal ? 'Đã rút' : 'Hoàn thành'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center">...</div>
          )}
        </div>
      </div>
    </div>
  );
}