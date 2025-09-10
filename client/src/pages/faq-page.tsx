import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, CreditCard, Users, Shield, Trophy, Clock } from "lucide-react";
import { useState } from "react";

export default function FAQPage() {
  const language = getLanguage();
  const [openCategory, setOpenCategory] = useState<string>('general');
  
  const faqCategories = [
    {
      id: 'general',
      icon: HelpCircle,
      titleTh: 'คำถามทั่วไป',
      titleEn: 'General Questions',
      questions: [
        {
          th: 'THAIBC คืออะไร?',
          en: 'What is THAIBC?',
          answerTh: 'THAIBC THAILAND เป็นแพลตฟอร์มเดิมพันกีฬาออนไลน์อันดับ 1 ของไทย ให้บริการแทงบอล บาสเกตบอล เทนนิส และกีฬาอื่นๆ มากมาย พร้อมระบบรักษาความปลอดภัยระดับธนาคาร',
          answerEn: 'THAIBC THAILAND is Thailand\'s #1 online sports betting platform, offering football, basketball, tennis, and many other sports with bank-level security.'
        },
        {
          th: 'สมัครสมาชิกยังไง?',
          en: 'How to register?',
          answerTh: 'คลิก "สมัครสมาชิก" แล้วกรอกข้อมูล: ชื่อ-นามสกุล, เบอร์โทร, อีเมล, และเลขบัญชีธนาคาร ใช้เวลาแค่ 2 นาที',
          answerEn: 'Click "Register" and fill in your details: full name, phone number, email, and bank account number. Takes only 2 minutes.'
        },
        {
          th: 'ต้องมีอายุเท่าไร?',
          en: 'What is the age requirement?',
          answerTh: 'ต้องมีอายุ 18 ปีบริบูรณ์ขึ้นไป และมีบัตรประจำตัวประชาชนไทยที่ใช้การได้',
          answerEn: 'Must be 18 years or older with a valid Thai national ID card.'
        },
        {
          th: 'มีบริการภาษาอะไรบ้าง?',
          en: 'What languages are supported?',
          answerTh: 'รองรับภาษาไทยและภาษาอังกฤษ พร้อมทีมงานที่พูดได้ทั้ง 2 ภาษา',
          answerEn: 'Supports Thai and English with bilingual customer service team.'
        }
      ]
    },
    {
      id: 'deposit',
      icon: CreditCard,
      titleTh: 'การฝาก-ถอนเงิน',
      titleEn: 'Deposits & Withdrawals',
      questions: [
        {
          th: 'ฝากเงินขั้นต่ำเท่าไร?',
          en: 'What is the minimum deposit?',
          answerTh: 'ฝากขั้นต่ำ 100 บาท ฝากสูงสุด 500,000 บาทต่อครั้ง สมาชิกใหม่รับโบนัส 100%',
          answerEn: 'Minimum deposit 100 THB, maximum 500,000 THB per transaction. New members get 100% bonus.'
        },
        {
          th: 'ธนาคารไหนที่รองรับ?',
          en: 'Which banks are supported?',
          answerTh: 'รองรับธนาคารไทยทุกแห่ง: กสิกรไทย, กรุงเทพ, ไทยพาณิชย์, กรุงไทย, ธนชาต, TMB, UOB, CIMB',
          answerEn: 'All Thai banks supported: Kasikorn, Bangkok Bank, SCB, Krung Thai, Thanachart, TMB, UOB, CIMB.'
        },
        {
          th: 'ถอนเงินใช้เวลานานไหม?',
          en: 'How long does withdrawal take?',
          answerTh: 'ถอนเงินใช้เวลา 30 นาที - 4 ชั่วโมง ในเวลาทำการ (จันทร์-ศุกร์ 8:00-20:00 น.)',
          answerEn: 'Withdrawal takes 30 minutes - 4 hours during business hours (Mon-Fri 8:00-20:00).'
        },
        {
          th: 'มีค่าธรรมเนียมไหม?',
          en: 'Are there any fees?',
          answerTh: 'ฝากเงินฟรี! ถอนเงินคิด 25 บาทต่อครั้ง (สมาชิก VIP ถอนฟรี)',
          answerEn: 'Deposits are free! Withdrawals charge 25 THB per transaction (VIP members withdraw free).'
        }
      ]
    },
    {
      id: 'betting',
      icon: Trophy,
      titleTh: 'การเดิมพัน',
      titleEn: 'Betting',
      questions: [
        {
          th: 'มีกีฬาอะไรให้แทงบ้าง?',
          en: 'What sports are available?',
          answerTh: 'ฟุตบอลทุกลีก, บาสเกตบอล NBA, เทนนิส ATP/WTA, วอลเลย์บอล, อีสปอร์ต และอีกมากมาย',
          answerEn: 'Football all leagues, NBA basketball, ATP/WTA tennis, volleyball, esports, and many more.'
        },
        {
          th: 'เดิมพันขั้นต่ำเท่าไร?',
          en: 'What is the minimum bet?',
          answerTh: 'เดิมพันขั้นต่ำ 20 บาท ไม่มีขั้นสูงสุด (ขึ้นอยู่กับแต่ละตลาดเดิมพัน)',
          answerEn: 'Minimum bet 20 THB, no maximum limit (depends on individual betting markets).'
        },
        {
          th: 'อัตราต่อรองดีไหม?',
          en: 'Are the odds competitive?',
          answerTh: 'อัตราต่อรองดีที่สุดในไทย! เราให้อัตราสูงกว่าเว็บอื่น 5-10% และอัปเดตแบบ Real-time',
          answerEn: 'Best odds in Thailand! We offer 5-10% higher rates than other sites with real-time updates.'
        },
        {
          th: 'ดูสถิติและผลบอลได้ไหม?',
          en: 'Can I view statistics and match results?',
          answerTh: 'ได้! มีสถิติครบถ้วน, ผลการแข่งขันแบบ Live, และข้อมูลทีมย้อนหลัง 5 ปี',
          answerEn: 'Yes! Complete statistics, live match results, and team data going back 5 years.'
        }
      ]
    },
    {
      id: 'account',
      icon: Users,
      titleTh: 'บัญชีและความปลอดภัย',
      titleEn: 'Account & Security',
      questions: [
        {
          th: 'ลืมรหัสผ่านทำยังไง?',
          en: 'What if I forget my password?',
          answerTh: 'คลิก "ลืมรหัสผ่าน" ในหน้าเข้าสู่ระบบ แล้วใส่เบอร์โทรหรืออีเมล ระบบจะส่งรหัสใหม่ให้ทันที',
          answerEn: 'Click "Forgot Password" on login page, enter your phone or email. The system will send a new password immediately.'
        },
        {
          th: 'ข้อมูลส่วนตัวปลอดภัยไหม?',
          en: 'Is my personal information safe?',
          answerTh: 'ปลอดภัย 100%! เราใช้เทคโนโลยี SSL 256-bit เหมือนธนาคาร และปฏิบัติตาม PDPA',
          answerEn: '100% safe! We use 256-bit SSL technology like banks and comply with PDPA regulations.'
        },
        {
          th: 'แก้ไขข้อมูลส่วนตัวได้ไหม?',
          en: 'Can I edit my personal information?',
          answerTh: 'แก้ไขได้ที่หน้า "บัญชีของฉัน" แต่ชื่อ-นามสกุลและเลขบัญชีต้องติดต่อเจ้าหน้าที่',
          answerEn: 'Edit at "My Account" page, but name and bank account changes require contacting customer service.'
        },
        {
          th: 'มีสมาชิก VIP ไหม?',
          en: 'Is there VIP membership?',
          answerTh: 'มี! VIP รับสิทธิพิเศษ: ถอนฟรี, โบนัสเพิ่ม, เจ้าหน้าที่ส่วนตัว และของขวัญวันเกิด',
          answerEn: 'Yes! VIP gets special privileges: free withdrawals, bonus increases, personal account manager, and birthday gifts.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground text-center">
            {language === 'th' ? 'คำถามที่พบบ่อย (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h1>
          
          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setOpenCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  openCategory === category.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-muted hover:border-primary/50'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language === 'th' ? category.titleTh : category.titleEn}
                </span>
              </button>
            ))}
          </div>

          {/* FAQ Content */}
          {faqCategories.map((category) => (
            <div key={category.id} className={openCategory === category.id ? 'block' : 'hidden'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <category.icon className="w-6 h-6 text-primary" />
                    <span>{language === 'th' ? category.titleTh : category.titleEn}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.questions.map((q, index) => (
                      <div key={index} className="border-b border-muted pb-6 last:border-b-0 last:pb-0">
                        <h3 className="text-lg font-semibold text-primary mb-3">
                          Q: {language === 'th' ? q.th : q.en}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          A: {language === 'th' ? q.answerTh : q.answerEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Contact Support */}
          <Card className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-4">
                {language === 'th' ? 'ไม่เจอคำตอบที่ต้องการ?' : "Can't find what you're looking for?"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'th' 
                  ? 'ทีมงานผู้เชี่ยวชาญพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง'
                  : 'Our expert team is ready to help you 24/7'
                }
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-primary/10 rounded-lg px-4 py-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">📞 02-123-4567</span>
                </div>
                <div className="flex items-center space-x-2 bg-primary/10 rounded-lg px-4 py-2">
                  <span className="font-semibold text-primary">💬 @thaibc_support</span>
                </div>
                <div className="flex items-center space-x-2 bg-primary/10 rounded-lg px-4 py-2">
                  <span className="font-semibold text-primary">✉️ support@thaibc.com</span>
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