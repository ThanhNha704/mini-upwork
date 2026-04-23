import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Mail } from "lucide-react";

const footerLinks = [
  {
    title: "Cho Khách hàng",
    links: ["Tìm Freelancer", "Đăng tin tuyển dụng", "Cách thức hoạt động", "Bảng giá"],
  },
  {
    title: "Cho Freelancer",
    links: ["Tìm việc làm", "Tạo hồ sơ năng lực", "Câu chuyện thành công", "Tài nguyên"],
  },
  {
    title: "Về chúng tôi",
    links: ["Giới thiệu", "Liên hệ", "Chính sách bảo mật", "Điều khoản dịch vụ"],
  },
];

export const Footer = () => {
  return (
    <footer className="bg-[#1E1B4B] text-gray-200 pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Phần Thương hiệu */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-violet-600 to-cyan-500 rounded flex items-center justify-center font-bold text-white shadow-lg">F</div>
              <span className="text-xl font-bold text-white tracking-tight">FreelanceHub</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kết nối với các chuyên gia hàng đầu và tìm kiếm cơ hội dự án tiếp theo của bạn ngay hôm nay.
            </p>
            {/* Các Icon mạng xã hội */}
            <div className="flex gap-4">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <div
                  key={i}
                  className="group w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:-translate-y-1 hover:bg-linear-to-br hover:from-violet-600 hover:to-cyan-500"
                >
                  <Icon size={18} className="text-gray-400 group-hover:text-white" />
                </div>
              ))}
            </div>
          </div>

          {/* Các cột Liên kết */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold mb-6 text-white">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 hover:text-[#4F46E5] transition text-sm">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Phần bản quyền */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 FreelanceHub. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-2 hover:text-white transition cursor-pointer">
            <Mail size={14} />
            <span>hotro@freelancehub.vn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};