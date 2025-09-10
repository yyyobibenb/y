import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowUpCircle, ArrowDownCircle, Clock, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function BankingGuidePage() {
  const language = getLanguage();
  
  const supportedBanks = [
    { name: "กสิกรไทย", code: "KBANK", color: "text-green-600" },
    { name: "กรุงเทพ", code: "BBL", color: "text-blue-600" },
    { name: "ไทยพาณิชย์", code: "SCB", color: "text-purple-600" },
    { name: "กรุงไทย", code: "KTB", color: "text-red-600" },
    { name: "ธนชาต", code: "TBANK", color: "text-orange-600" },
    { name: "TMB Thanachart", code: "TMB", color: "text-yellow-600" },
    { name: "UOB", code: "UOB", color: "text-blue-800" },
    { name: "CIMB", code: "CIMB", color: "text-red-500" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground text-center">
            {language === 'th' ? 'คู่มือการฝาก-ถอนเงิน' : 'Banking Guide'}
          </h1>
          
          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <ArrowUpCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <h3 className="font-bold text-green-800 mb-2">
                  {language === 'th' ? 'ฝากเงิน' : 'Deposit'}
                </h3>
                <p className="text-green-700 text-sm">
                  {language === 'th' ? 'ขั้นต่ำ 100 บาท' : 'Minimum 100 THB'}
                </p>
                <p className="text-green-700 text-sm">
                  {language === 'th' ? 'เข้าทันที (5 นาที)' : 'Instant (5 minutes)'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <ArrowDownCircle className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                <h3 className="font-bold text-blue-800 mb-2">
                  {language === 'th' ? 'ถอนเงิน' : 'Withdrawal'}
                </h3>
                <p className="text-blue-700 text-sm">
                  {language === 'th' ? 'ขั้นต่ำ 500 บาท' : 'Minimum 500 THB'}
                </p>
                <p className="text-blue-700 text-sm">
                  {language === 'th' ? '30 นาท-4 ชั่วโมง' : '30min-4 hours'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                <h3 className="font-bold text-purple-800 mb-2">
                  {language === 'th' ? 'เวลาบริการ' : 'Service Hours'}
                </h3>
                <p className="text-purple-700 text-sm">
                  {language === 'th' ? 'ฝากเงิน: 24/7' : 'Deposit: 24/7'}
                </p>
                <p className="text-purple-700 text-sm">
                  {language === 'th' ? 'ถอนเงิน: 08:00-20:00' : 'Withdrawal: 08:00-20:00'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Supported Banks */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-primary" />
                <span>{language === 'th' ? 'ธนาคารที่รองรับ' : 'Supported Banks'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {supportedBanks.map((bank, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-muted rounded-lg hover:border-primary/50 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${bank.color.replace('text-', 'bg-')}`}></div>
                    <span className="font-medium text-sm">{bank.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {language === 'th' 
                  ? '✅ รองรับการโอนผ่าน Mobile Banking, Internet Banking, และ ATM'
                  : '✅ Supports Mobile Banking, Internet Banking, and ATM transfers'
                }
              </p>
            </CardContent>
          </Card>

          {/* Deposit Guide */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <ArrowUpCircle className="w-6 h-6" />
                <span>{language === 'th' ? 'วิธีการฝากเงิน' : 'How to Deposit'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-lg mb-4 text-primary">
                      {language === 'th' ? '📱 วิธีฝากผ่าน Mobile Banking' : '📱 Mobile Banking Deposit'}
                    </h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">1</span>
                        <span>{language === 'th' ? 'เข้าสู่ระบบ THAIBC และคลิค "ฝากเงิน"' : 'Login to THAIBC and click "Deposit"'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">2</span>
                        <span>{language === 'th' ? 'เลือกธนาคารและกรอกจำนวนเงิน' : 'Select bank and enter amount'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">3</span>
                        <span>{language === 'th' ? 'ระบบจะแสดงเลขบัญชีของเรา' : 'System will show our account number'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">4</span>
                        <span>{language === 'th' ? 'เปิด Mobile Banking และโอนเงิน' : 'Open Mobile Banking and transfer'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">5</span>
                        <span>{language === 'th' ? 'แจ้งการโอนในเว็บ เงินเข้าทันที!' : 'Notify transfer on website, money credited instantly!'}</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-4 text-primary">
                      {language === 'th' ? '🏧 วิธีฝากผ่าน ATM' : '🏧 ATM Deposit'}
                    </h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">1</span>
                        <span>{language === 'th' ? 'ใส่บัตร ATM และรหัส PIN' : 'Insert ATM card and enter PIN'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">2</span>
                        <span>{language === 'th' ? 'เลือก "โอนเงิน" หรือ "Transfer"' : 'Select "Transfer Money" or "Transfer"'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">3</span>
                        <span>{language === 'th' ? 'กรอกเลขบัญชีที่ระบบแจ้ง' : 'Enter the account number provided by system'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">4</span>
                        <span>{language === 'th' ? 'กรอกจำนวนเงินและยืนยัน' : 'Enter amount and confirm'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">5</span>
                        <span>{language === 'th' ? 'เก็บใบเสร็จและแจ้งการโอนในเว็บ' : 'Keep receipt and notify transfer on website'}</span>
                      </li>
                    </ol>
                  </div>
                </div>
                
                {/* Deposit Limits */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-2">
                    {language === 'th' ? '💰 ขีดจำกัดการฝากเงิน' : '💰 Deposit Limits'}
                  </h5>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">{language === 'th' ? 'ขั้นต่ำ:' : 'Minimum:'}</span>
                      <span className="ml-2 text-green-600">100 บาท</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">{language === 'th' ? 'ขั้นสูงสุด:' : 'Maximum:'}</span>
                      <span className="ml-2 text-green-600">500,000 บาท/ครั้ง</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">{language === 'th' ? 'ต่อเดือน:' : 'Per Month:'}</span>
                      <span className="ml-2 text-green-600">2,000,000 บาท</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Guide */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-600">
                <ArrowDownCircle className="w-6 h-6" />
                <span>{language === 'th' ? 'วิธีการถอนเงิน' : 'How to Withdraw'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-primary">
                    {language === 'th' ? '💳 ขั้นตอนการถอนเงิน' : '💳 Withdrawal Steps'}
                  </h4>
                  <ol className="space-y-3">
                    {[
                      { th: 'เข้าสู่ระบบและคลิค "ถอนเงิน"', en: 'Login and click "Withdraw"' },
                      { th: 'เลือกบัญชีธนาคารที่ต้องการรับเงิน', en: 'Select bank account to receive money' },
                      { th: 'กรอกจำนวนเงินที่ต้องการถอน', en: 'Enter withdrawal amount' },
                      { th: 'ยืนยันการถอนด้วยรหัสผ่าน', en: 'Confirm withdrawal with password' },
                      { th: 'รอระบบประมวลผล (30 นาที - 4 ชั่วโมง)', en: 'Wait for processing (30 minutes - 4 hours)' },
                      { th: 'เงินเข้าบัญชีและได้รับการแจ้งเตือน', en: 'Money credited to account with notification' }
                    ].map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span>{language === 'th' ? step.th : step.en}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                {/* Withdrawal Limits */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">
                    {language === 'th' ? '💸 ขีดจำกัดการถอนเงิน' : '💸 Withdrawal Limits'}
                  </h5>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">{language === 'th' ? 'ขั้นต่ำ:' : 'Minimum:'}</span>
                      <span className="ml-2 text-blue-600">500 บาท</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">{language === 'th' ? 'ขั้นสูงสุด:' : 'Maximum:'}</span>
                      <span className="ml-2 text-blue-600">200,000 บาท/ครั้ง</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">{language === 'th' ? 'ค่าธรรมเนียม:' : 'Fee:'}</span>
                      <span className="ml-2 text-blue-600">25 บาท/ครั้ง</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-700">
                <AlertTriangle className="w-6 h-6" />
                <span>{language === 'th' ? 'ข้อควรระวัง' : 'Important Notes'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                  <span className="text-sm text-orange-700">
                    {language === 'th' 
                      ? 'ใช้บัญชีธนาคารที่ชื่อตรงกับการสมัครสมาชิกเท่านั้น ไม่สามารถใช้บัญชีคนอื่นได้'
                      : 'Use only bank accounts with names matching your registration. Third-party accounts not allowed.'
                    }
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <span className="text-sm text-orange-700">
                    {language === 'th'
                      ? 'ตรวจสอบเลขบัญชีให้ถูกต้องก่อนโอน หากโอนผิดบัญชีเราไม่สามารถรับผิดชอบได้'
                      : 'Verify account number before transfer. We are not responsible for transfers to wrong accounts.'
                    }
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                  <span className="text-sm text-orange-700">
                    {language === 'th'
                      ? 'การถอนเงินในวันหยุดหรือนอกเวลาทำการอาจใช้เวลานานขึ้น'
                      : 'Withdrawals on holidays or outside business hours may take longer.'
                    }
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <span className="text-sm text-orange-700">
                    {language === 'th'
                      ? 'หากพบธุรกรรมผิดปกติ เราสงวนสิทธิ์ระงับการทำธุรกรรมและตรวจสอบ'
                      : 'We reserve the right to suspend transactions for suspicious activities and investigate.'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-lg mb-2">
                {language === 'th' ? 'ต้องการความช่วยเหลือ?' : 'Need Help?'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'th'
                  ? 'ทีมงานพร้อมช่วยเหลือปัญหาการเงินตลอด 24 ชั่วโมง'
                  : 'Our team is ready to help with financial issues 24/7'
                }
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="bg-primary/10 rounded-lg px-3 py-1 text-sm font-medium">
                  📞 02-123-4567 ({language === 'th' ? 'กด 1' : 'Press 1'})
                </span>
                <span className="bg-primary/10 rounded-lg px-3 py-1 text-sm font-medium">
                  💬 @thaibc_finance
                </span>
                <span className="bg-primary/10 rounded-lg px-3 py-1 text-sm font-medium">
                  ✉️ finance@thaibc.com
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}