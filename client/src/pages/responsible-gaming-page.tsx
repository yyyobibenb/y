import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, AlertTriangle, Phone, Heart, Users } from "lucide-react";

export default function ResponsibleGamingPage() {
  const language = getLanguage();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground text-center">
            {language === 'th' ? 'ความรับผิดชอบในการเดิมพัน' : 'Responsible Gaming'}
          </h1>
          
          {/* Warning Banner */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <h2 className="text-xl font-bold text-orange-700">
                  {language === 'th' ? '⚠️ คำเตือนสำคัญ' : '⚠️ Important Warning'}
                </h2>
              </div>
              <p className="text-orange-700 leading-relaxed">
                {language === 'th'
                  ? 'การเดิมพันควรเป็นเพียงความบันเทิง ไม่ใช่วิธีหาเงินหรือแก้ปัญหาทางการเงิน หากคุณรู้สึกว่าการเดิمพันส่งผลกระทบต่อชีวิตประจำวัน กรุณาหยุดและขอความช่วยเหลือทันที'
                  : 'Betting should only be entertainment, not a way to make money or solve financial problems. If you feel that betting is affecting your daily life, please stop and seek help immediately.'
                }
              </p>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Self-Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  <span>{language === 'th' ? 'ประเมินตนเอง: คุณมีปัญหาการเดิมพันหรือไม่?' : 'Self-Assessment: Do You Have a Gambling Problem?'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  {language === 'th'
                    ? 'ตอบคำถามต่อไปนี้อย่างซื่อสัตย์ หากคุณตอบ "ใช่" มากกว่า 3 ข้อ แสดงว่าคุณอาจมีปัญหาและควรขอความช่วยเหลือ:'
                    : 'Answer the following questions honestly. If you answer "yes" to more than 3 questions, you may have a problem and should seek help:'
                  }
                </p>
                <div className="space-y-3">
                  {[
                    { th: "คุณเดิมพันมากกว่าที่ตั้งใจไว้บ่อยครั้งหรือไม่?", en: "Do you often bet more than you intended?" },
                    { th: "คุณต้องเดิมพันด้วยจำนวนเงินที่เพิ่มขึ้นเพื่อความตื่นเต้นหรือไม่?", en: "Do you need to bet with increasing amounts for excitement?" },
                    { th: "คุณโกหกครอบครัวหรือเพื่อนเกี่ยวกับการเดิมพันหรือไม่?", en: "Do you lie to family or friends about your gambling?" },
                    { th: "คุณรู้สึกกระวนกระวายหรือโมโหเมื่อลดการเดิมพันหรือไม่?", en: "Do you feel restless or angry when reducing gambling?" },
                    { th: "คุณใช้การเดิมพันเพื่อหลีกเลี่ยงปัญหาหรือความรู้สึกแย่หรือไม่?", en: "Do you use gambling to escape problems or bad feelings?" },
                    { th: "คุณเดิมพันเพื่อ 'คืนทุน' หลังจากเสียเงินหรือไม่?", en: "Do you gamble to 'win back' money after losses?" },
                    { th: "การเดิมพันส่งผลกระทบต่อความสัมพันธ์หรือการทำงานหรือไม่?", en: "Has gambling affected your relationships or work?" },
                  ].map((question, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-muted">
                      <div className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="text-sm flex-1">
                        {language === 'th' ? question.th : question.en}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tools for Responsible Gaming */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-primary" />
                  <span>{language === 'th' ? 'เครื่องมือการเดิมพันอย่างมีความรับผิดชอบ' : 'Responsible Gaming Tools'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-primary">
                      {language === 'th' ? '1. กำหนดขีดจำกัด' : '1. Set Limits'}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{language === 'th' ? 'ขีดจำกัดการฝากเงิน (รายวัน/รายสัปดาห์/รายเดือน)' : 'Deposit limits (daily/weekly/monthly)'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{language === 'th' ? 'ขีดจำกัดการเดิมพัน (จำนวนเงินต่อการเดิมพัน)' : 'Bet limits (amount per bet)'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{language === 'th' ? 'ขีดจำกัดการสูญเสีย (จำนวนเงินที่ยอมเสียได้)' : 'Loss limits (maximum acceptable loss)'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{language === 'th' ? 'ขีดจำกัดเวลา (จำกัดเวลาการเล่นต่อวัน)' : 'Time limits (daily playing time limit)'}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-primary">
                      {language === 'th' ? '2. การพักจากการเดิมพัน' : '2. Take a Break'}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{language === 'th' ? 'พักระยะสั้น (24 ชั่วโมง - 7 วัน)' : 'Short break (24 hours - 7 days)'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{language === 'th' ? 'พักระยะยาว (1 เดือน - 6 เดือน)' : 'Long break (1 month - 6 months)'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>{language === 'th' ? 'ปิดบัญชีถาวร (ไม่สามารถกู้คืนได้)' : 'Permanent account closure (irreversible)'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>{language === 'th' ? 'ระบบแจ้งเตือนเวลา (ทุก 30 นาที)' : 'Time reminder system (every 30 minutes)'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help and Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-primary" />
                  <span>{language === 'th' ? 'ที่ขอความช่วยเหลือ' : 'Where to Get Help'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-lg mb-4 text-primary">
                      {language === 'th' ? 'หน่วยงานช่วยเหลือในประเทศไทย' : 'Support Organizations in Thailand'}
                    </h4>
                    <div className="space-y-4">
                      <div className="border border-muted rounded-lg p-4">
                        <h5 className="font-semibold">
                          {language === 'th' ? 'มูลนิธิเพื่อการป้องกันโรคจากการเล่นการพนัน' : 'Foundation for Prevention of Gambling Addiction'}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          📞 {language === 'th' ? 'สายด่วน:' : 'Hotline:'} 1323
                        </p>
                        <p className="text-sm text-muted-foreground">
                          🌐 {language === 'th' ? 'เว็บไซต์:' : 'Website:'} www.tgpf.or.th
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ⏰ {language === 'th' ? 'เวลา:' : 'Hours:'} 24/7
                        </p>
                      </div>
                      
                      <div className="border border-muted rounded-lg p-4">
                        <h5 className="font-semibold">
                          {language === 'th' ? 'กรมสุขภาพจิต กระทรวงสาธารณสุข' : 'Department of Mental Health, Ministry of Public Health'}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          📞 {language === 'th' ? 'สายด่วน:' : 'Hotline:'} 1667
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ⏰ {language === 'th' ? 'เวลา:' : 'Hours:'} {language === 'th' ? '24 ชั่วโมง' : '24 hours'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-4 text-primary">
                      {language === 'th' ? 'THAIBC - ความช่วยเหลือทันที' : 'THAIBC - Immediate Help'}
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone className="w-5 h-5 text-primary" />
                          <h5 className="font-semibold text-primary">
                            {language === 'th' ? 'ติดต่อทีมงานของเรา' : 'Contact Our Team'}
                          </h5>
                        </div>
                        <p className="text-sm mb-2">📞 02-123-4567 ({language === 'th' ? 'กด 5' : 'Press 5'})</p>
                        <p className="text-sm mb-2">✉️ help@thaibc.com</p>
                        <p className="text-sm mb-2">💬 Line: @thaibc_help</p>
                        <p className="text-sm text-primary font-medium">
                          {language === 'th' 
                            ? '✅ บริการฟรี ไม่มีการตัดสิน ความลับเป็นไปตามกฎหมาย'
                            : '✅ Free service, non-judgmental, legally confidential'
                          }
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-700 mb-2">
                          {language === 'th' ? 'การดำเนินการทันที' : 'Immediate Actions'}
                        </h5>
                        <ul className="space-y-1 text-sm text-orange-600">
                          <li>• {language === 'th' ? 'ระงับบัญชีชั่วคราวได้ทันที' : 'Temporary account suspension available immediately'}</li>
                          <li>• {language === 'th' ? 'ตั้งค่าขีดจำกัดในทันที' : 'Set limits immediately'}</li>
                          <li>• {language === 'th' ? 'ปิดใช้งานการตลาดเมื่อออนไลน์' : 'Disable marketing communications'}</li>
                          <li>• {language === 'th' ? 'เชื่อมต่อกับผู้เชี่ยวชาญ' : 'Connect with specialists'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips for Safe Gaming */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-primary" />
                  <span>{language === 'th' ? 'เคล็ดลับการเดิมพันอย่างปลอดภัย' : 'Safe Gaming Tips'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">✅ {language === 'th' ? 'ควรทำ' : 'DO'}</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• {language === 'th' ? 'กำหนดงบประมาณล่วงหน้าและยึดติด' : 'Set a budget in advance and stick to it'}</li>
                      <li>• {language === 'th' ? 'เดิมพันเพื่อความบันเทิงเท่านั้น' : 'Bet only for entertainment'}</li>
                      <li>• {language === 'th' ? 'ใช้เงินส่วนเกินที่เสียแล้วไม่เป็นไร' : 'Use only spare money you can afford to lose'}</li>
                      <li>• {language === 'th' ? 'พักบ่อยๆ และมีกิจกรรมอื่น' : 'Take frequent breaks and have other activities'}</li>
                      <li>• {language === 'th' ? 'เฉลิมฉลองเมื่อชนะ แล้วหยุด' : 'Celebrate when you win, then stop'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">❌ {language === 'th' ? 'ไม่ควรทำ' : "DON'T"}</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• {language === 'th' ? 'เดิมพันเมื่อโมโห หงุดหงิด หรือเศร้า' : "Don't bet when angry, frustrated, or sad"}</li>
                      <li>• {language === 'th' ? 'กู้เงินหรือใช้เครดิตเพื่อเดิมพัน' : "Don't borrow money or use credit to bet"}</li>
                      <li>• {language === 'th' ? 'พยายาม "คืนทุน" หลังจากเสียเงิน' : "Don't try to 'chase losses'"}</li>
                      <li>• {language === 'th' ? 'เดิมพันในขณะดื่มแอลกอฮอล์' : "Don't bet while drinking alcohol"}</li>
                      <li>• {language === 'th' ? 'ใช้การเดิมพันเป็นทางออกจากปัญหา' : "Don't use betting as an escape from problems"}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}