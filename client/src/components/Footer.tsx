import { Link, useLocation } from "wouter";
import { getLanguage } from "@/lib/i18n";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const language = getLanguage();
  const [, navigate] = useLocation();

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Footer link clicked:', href);
    navigate(href);
  };
  
  const footerLinks = [
    { 
      labelTh: "เกี่ยวกับเรา", 
      labelEn: "About Us",
      href: "/about", 
      testId: "footer-about" 
    },
    { 
      labelTh: "ข้อกำหนดและเงื่อนไข", 
      labelEn: "Terms & Conditions",
      href: "/terms", 
      testId: "footer-terms" 
    },
    { 
      labelTh: "นโยบายความเป็นส่วนตัว", 
      labelEn: "Privacy Policy",
      href: "/privacy", 
      testId: "footer-privacy" 
    },
    { 
      labelTh: "ความรับผิดชอบในการเล่น", 
      labelEn: "Responsible Gaming",
      href: "/responsible-gaming", 
      testId: "footer-responsible" 
    },
    { 
      labelTh: "ศูนย์ช่วยเหลือ", 
      labelEn: "Help Center",
      href: "/support", 
      testId: "footer-help" 
    },
    { 
      labelTh: "ติดต่อเรา", 
      labelEn: "Contact Us",
      href: "/contact", 
      testId: "footer-contact" 
    },
    { 
      labelTh: "คำถามที่พบบ่อย", 
      labelEn: "FAQ",
      href: "/faq", 
      testId: "footer-faq" 
    },
    { 
      labelTh: "วิธีการฝาก-ถอน", 
      labelEn: "Banking Guide",
      href: "/banking-guide", 
      testId: "footer-banking" 
    },
    { 
      labelTh: "โปรโมชั่นและโบนัส", 
      labelEn: "Promotions",
      href: "/promotions", 
      testId: "footer-promotions" 
    },
  ];

  return (
    <footer className="bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-primary/20 backdrop-blur-sm mt-auto relative z-50">
      <div className="container mx-auto px-4 py-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
          {footerLinks.map((link, index) => (
            <Link 
              key={index} 
              href={link.href} 
              className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200 cursor-pointer py-3 px-4 rounded-lg block text-center border border-muted hover:border-primary/50 hover:shadow-sm font-medium w-full min-h-[44px] flex items-center justify-center relative z-[60] pointer-events-auto"
              data-testid={link.testId}
              onClick={(e) => handleLinkClick(link.href, e)}
            >
              {language === 'th' ? link.labelTh : link.labelEn}
            </Link>
          ))}
        </div>
        
        {/* Company Info & Copyright */}
        <div className="border-t border-primary/10 pt-4 pb-28 md:pb-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground select-none">
                © {currentYear} THAIBC THAILAND - {language === 'th' ? 'เว็บแทงบอลออนไลน์ อันดับ 1 ของไทย | สงวนลิขสิทธิ์' : 'Thailand\'s #1 Online Sports Betting Platform | All Rights Reserved'}
              </p>
            </div>
            <div className="text-center md:text-right flex items-center space-x-4">
              <span className="text-xs text-orange-600 font-medium select-none">
                ⚠️ {language === 'th' ? 'ผู้เล่นต้องมีอายุ 18 ปีขึ้นไป' : 'Players must be 18+ years old'}
              </span>
              <span className="text-xs text-muted-foreground select-none">
                📞 02-123-4567 | ✉️ support@thaibc.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}