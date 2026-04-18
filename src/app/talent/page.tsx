// src/app/guide/page.tsx
"use client";

import { useState } from "react";
import {
  User,
  Briefcase,
  MessageSquare,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  FileText,
  Search,
  PlusCircle,
  TrendingUp,
  Shield,
  Clock,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState("client");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const bgGradient = "bg-linear-to-r from-violet-600 to-cyan-500";
  const textGradient = "bg-linear-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent";

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const clientSteps = [
    {
      id: "register",
      icon: <User className="w-8 h-8" />,
      title: "Đăng ký tài khoản Client",
      description: "Tạo tài khoản để đăng dự án và thuê freelancer",
      steps: [
        "Truy cập trang đăng ký và chọn vai trò 'Client'",
        "Điền thông tin cá nhân và xác nhận email",
        "Hoàn tất đăng ký và đăng nhập vào hệ thống"
      ]
    },
    {
      id: "post-job",
      icon: <PlusCircle className="w-8 h-8" />,
      title: "Đăng dự án",
      description: "Tạo và đăng tải dự án của bạn",
      steps: [
        "Nhấn 'Đăng dự án mới' từ menu chính",
        "Điền thông tin chi tiết: tiêu đề, mô tả, ngân sách",
        "Xem lại và đăng tải dự án lên nền tảng"
      ]
    },
    {
      id: "review-apps",
      icon: <FileText className="w-8 h-8" />,
      title: "Xem hồ sơ ứng tuyển",
      description: "Đánh giá và chọn freelancer phù hợp",
      steps: [
        "Truy cập 'Quản lý dự án' để xem danh sách ứng viên",
        "Xem hồ sơ, kinh nghiệm và đề xuất giá của freelancer",
        "Liên hệ qua chat để trao đổi chi tiết"
      ]
    },
    {
      id: "hire",
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Thuê freelancer",
      description: "Chọn và thuê freelancer cho dự án",
      steps: [
        "Chọn freelancer phù hợp từ danh sách ứng viên",
        "Thanh toán qua Stripe để bắt đầu dự án",
        "Theo dõi tiến độ và giao tiếp qua chat"
      ]
    }
  ];

  const freelancerSteps = [
    {
      id: "register-freelancer",
      icon: <User className="w-8 h-8" />,
      title: "Đăng ký tài khoản Freelancer",
      description: "Tạo tài khoản để nhận việc freelance",
      steps: [
        "Truy cập trang đăng ký và chọn vai trò 'Freelancer'",
        "Điền thông tin cá nhân và kỹ năng chuyên môn",
        "Hoàn tất đăng ký và cập nhật hồ sơ cá nhân"
      ]
    },
    {
      id: "find-jobs",
      icon: <Search className="w-8 h-8" />,
      title: "Tìm việc làm",
      description: "Khám phá các dự án phù hợp với kỹ năng",
      steps: [
        "Truy cập trang 'Tìm việc làm' để xem danh sách dự án",
        "Sử dụng bộ lọc để tìm dự án phù hợp với kỹ năng",
        "Đọc kỹ mô tả dự án và yêu cầu của client"
      ]
    },
    {
      id: "apply",
      icon: <Briefcase className="w-8 h-8" />,
      title: "Ứng tuyển dự án",
      description: "Gửi hồ sơ ứng tuyển cho dự án",
      steps: [
        "Nhấn 'Xem chi tiết' để đọc thông tin dự án",
        "Điền đề xuất giá và lời nhắn gửi client",
        "Gửi hồ sơ và theo dõi trạng thái ứng tuyển"
      ]
    },
    {
      id: "work",
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Thực hiện dự án",
      description: "Hoàn thành công việc và nhận thanh toán",
      steps: [
        "Giao tiếp với client qua hệ thống chat",
        "Hoàn thành công việc theo yêu cầu và deadline",
        "Nhận thanh toán tự động sau khi hoàn thành"
      ]
    }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bảo mật & An toàn",
      description: "Hệ thống thanh toán an toàn với Stripe, bảo vệ thông tin cá nhân"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Chat thời gian thực",
      description: "Giao tiếp trực tiếp với client/freelancer qua hệ thống chat tích hợp"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Quản lý thời gian",
      description: "Theo dõi deadline, tiến độ dự án và lịch sử làm việc"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Đánh giá & Uy tín",
      description: "Hệ thống đánh giá giúp xây dựng uy tín và tìm đối tác phù hợp"
    }
  ];

  const faqs = [
    {
      question: "Phí dịch vụ của FreelanceHub là bao nhiêu?",
      answer: "FreelanceHub hoàn toàn miễn phí cho freelancer. Client chỉ trả phí khi thuê freelancer thành công."
    },
    {
      question: "Thanh toán được thực hiện như thế nào?",
      answer: "Chúng tôi sử dụng Stripe để xử lý thanh toán an toàn. Tiền được giữ trong tài khoản escrow cho đến khi dự án hoàn thành."
    },
    {
      question: "Tôi có thể hủy dự án sau khi đã thuê freelancer không?",
      answer: "Có thể hủy dự án theo chính sách của chúng tôi. Vui lòng liên hệ hỗ trợ để được giải quyết."
    },
    {
      question: "Làm thế nào để liên hệ hỗ trợ?",
      answer: "Bạn có thể liên hệ chúng tôi qua email support@freelancehub.com hoặc chat trực tiếp trên nền tảng."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className={`w-full h-64 ${bgGradient} flex flex-col items-center justify-center text-white px-4 text-center`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight uppercase">
          Hướng dẫn sử dụng
        </h1>
        <p className="text-lg opacity-90 font-medium max-w-2xl">
          Hướng dẫn chi tiết cách sử dụng FreelanceHub cho cả Client và Freelancer
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("client")}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "client"
                  ? `${bgGradient} text-white shadow-md`
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Cho Client
            </button>
            <button
              onClick={() => setActiveTab("freelancer")}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "freelancer"
                  ? `${bgGradient} text-white shadow-md`
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Briefcase className="w-5 h-5 inline mr-2" />
              Cho Freelancer
            </button>
          </div>
        </div>

        {/* Steps Section */}
        <div className="space-y-6 mb-16">
          {(activeTab === "client" ? clientSteps : freelancerSteps).map((step, index) => (
            <div key={step.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 ${bgGradient} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold">
                      Bước {index + 1}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-6 text-lg">{step.description}</p>

                  <div className="space-y-3">
                    {step.steps.map((stepText, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-3">
                        <div className={`w-6 h-6 ${bgGradient} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5`}>
                          {stepIndex + 1}
                        </div>
                        <p className="text-slate-700">{stepText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tính năng nổi bật</h2>
            <p className="text-slate-600 text-lg">Những tính năng giúp bạn làm việc hiệu quả hơn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${bgGradient} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Câu hỏi thường gặp</h2>
            <p className="text-slate-600 text-lg">Giải đáp những thắc mắc phổ biến</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection(`faq-${index}`)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  {expandedSection === `faq-${index}` ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>
                {expandedSection === `faq-${index}` && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`rounded-3xl p-12 text-center text-white shadow-xl ${bgGradient}`}>
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Tham gia cộng đồng FreelanceHub ngay hôm nay và bắt đầu hành trình làm việc freelance thành công!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={activeTab === "client" ? "/auth/register" : "/auth/register"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-2xl hover:bg-gray-50 transition shadow-lg"
            >
              Đăng ký ngay
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition"
            >
              <HelpCircle className="w-5 h-5" />
              Khám phá thêm
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}