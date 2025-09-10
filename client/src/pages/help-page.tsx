import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Phone, Mail, MessageCircle, Clock, CreditCard, Shield, Users } from "lucide-react";

export default function HelpPage() {
  const language = getLanguage();
  
  const helpCategories = [
    {
      icon: CreditCard,
      titleTh: "การฝาก-ถอนเงิน",
      titleEn: "Deposits & Withdrawals",
      descTh: "วิธีการฝาก-ถอนเงิน ระยะเวลา และการแก้ไขปัญหา",
      descEn: "How to deposit-withdraw, timeframes, and troubleshooting",
      items: [
        { th: "วิธีการฝากเงินเข้าระบบ", en: "How to deposit money" },
        { th: "วิธีการถอนเงินออกจากระบบ", en: "How to withdraw money" },
        { th: "ธนาคารที่รองรับและช่องทาง", en: "Supported banks and channels" },
        { th: "ค่าธรรมเนียมและขั้นต่ำ-สูงสุด", en: "Fees and minimum-maximum limits" },
        { th: "การตรวจสอบสถานะธุรกรรม", en: "Transaction status checking" },
      ]
    },
    {
      icon: Users,
      titleTh: "การสมัครสมาชิกและบัญชี",
      titleEn: "Registration & Account",
      descTh: "การสมัครสมาชิก การยืนยันตัวตน และการจัดการบัญชี",
      descEn: "Registration, identity verification, and account management",
      items: [
        { th: "วิธีการสมัครสมาชิกใหม่", en: "How to register new account" },
        { th: "การยืนยันตัวตน (KYC)", en: "Identity verification (KYC)" },
        { th: "การเปลี่ยนรหัสผ่าน", en: "Password change" },
        { th: "การลืมรหัสผ่าน", en: "Forgot password" },
        { th: "การอัพเดทข้อมูลส่วนตัว", en: "Update personal information" },
      ]
    },
    {
      icon: HelpCircle,
      titleTh: "การเดิมพัน",
      titleEn: "Betting",
      descTh: "วิธีการเดิมพัน ประเภทการเดิมพัน และกฎการเล่น",
      descEn: "How to bet, bet types, and game rules",
      items: [
        { th: "วิธีการวางเดิมพัน", en: "How to place bets" },
        { th: "ประเภทการเดิมพันต่างๆ", en: "Different types of bets" },
        { th: "การอ่านอัตราต่อรอง", en: "Understanding odds" },
        { th: "การยกเลิกและแก้ไขการเดิมพัน", en: "Canceling and editing bets" },
        { th: "การดูประวัติการเดิมพัน", en: "Viewing betting history" },
      ]
    },
    {
      icon: Shield,
      titleTh: "ความปลอดภัย",
      titleEn: "Security",
      descTh: "ความปลอดภัยของบัญชีและการป้องกันการโจรกรรม",
      descEn: "Account security and theft prevention",
      items: [
        { th: "การตั้งรหัสผ่านที่แข็งแกร่ง", en: "Setting strong passwords" },
        { th: "การเปิดใช้งาน 2FA", en: "Enabling 2FA" },
        { th: "การตรวจสอบการเข้าสู่ระบบ", en: "Login activity monitoring" },
        { th: "การรายงานบัญชีถูกขโมย", en: "Reporting stolen accounts" },
        { th: "การป้องกันการฟิชชิ่ง", en: "Phishing protection" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground text-center">
            {language === 'th' ? 'ศูนย์ช่วยเหลือ THAIBC' : 'THAIBC Help Center'}
          </h1>
          
          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <Phone className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">
                  {language === 'th' ? 'โทรศัพท์' : 'Phone'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-primary">02-123-4567</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'th' ? 'บริการตลอด 24 ชั่วโมง' : '24/7 Service'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">
                  {language === 'th' ? 'ไลน์แชท' : 'Line Chat'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl font-bold text-primary">@thaibc_support</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'th' ? 'ตอบกลับเร็วทันใจ' : 'Quick Response'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <Mail className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">
                  {language === 'th' ? 'อีเมล' : 'Email'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg font-bold text-primary">support@thaibc.com</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'th' ? 'ตอบกลับภายใน 2 ชั่วโมง' : 'Reply within 2 hours'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Help Categories */}
          <div className="grid md:grid-cols-2 gap-8">
            {helpCategories.map((category, index) => (
              <Card key={index} className="border-muted hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <category.icon className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-xl">
                        {language === 'th' ? category.titleTh : category.titleEn}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {language === 'th' ? category.descTh : category.descEn}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm hover:text-primary cursor-pointer transition-colors">
                          {language === 'th' ? item.th : item.en}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {language === 'th' ? 'คำถามที่พบบ่อย (FAQ)' : 'Frequently Asked Questions (FAQ)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    {language === 'th' ? 'Q: ฝากเงินขั้นต่ำเท่าไร?' : 'Q: What is the minimum deposit amount?'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'th' 
                      ? 'A: ฝากเงินขั้นต่ำ 100 บาท สำหรับสมาชิกใหม่ มีโบนัสต้อนรับ 100% ไม่จำกัดจำนวน'
                      : 'A: Minimum deposit is 100 THB. New members receive 100% welcome bonus with no limit.'
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    {language === 'th' ? 'Q: ถอนเงินใช้เวลานานไหม?' : 'Q: How long does withdrawal take?'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'th'
                      ? 'A: การถอนเงินใช้เวลา 30 นาที - 4 ชั่วโมงในวันทำการ (จันทร์-ศุกร์ 08:00-20:00 น.)'
                      : 'A: Withdrawal takes 30 minutes - 4 hours on working days (Mon-Fri 08:00-20:00).'
                    }
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    {language === 'th' ? 'Q: มีค่าธรรมเนียมไหม?' : 'Q: Are there any fees?'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'th'
                      ? 'A: การฝากเงินไม่มีค่าธรรมเนียม การถอนเงินคิดค่าธรรมเนียม 25 บาทต่อครั้ง (สมาชิก VIP ฟรี)'
                      : 'A: No deposit fees. Withdrawal fee is 25 THB per transaction (VIP members are free).'
                    }
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    {language === 'th' ? 'Q: ลืมรหัสผ่านทำอย่างไร?' : 'Q: What to do if I forgot my password?'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'th'
                      ? 'A: คลิก "ลืมรหัสผ่าน" ในหน้าเข้าสู่ระบบ หรือติดต่อ Call Center 02-123-4567 ตลอด 24 ชั่วโมง'
                      : 'A: Click "Forgot Password" on login page or contact Call Center 02-123-4567 24/7.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <Clock className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg">
                    {language === 'th' ? 'เวลาให้บริการ' : 'Service Hours'}
                  </h3>
                  <p className="text-primary font-bold">
                    {language === 'th' ? 'ตลอด 24 ชั่วโมง ทุกวัน' : '24 Hours, 7 Days a Week'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}