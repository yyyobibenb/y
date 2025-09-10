import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, MessageCircle, Globe, Shield, Award } from "lucide-react";

export default function ContactPage() {
  const language = getLanguage();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground text-center">
            {language === 'th' ? 'ติดต่อเรา - THAIBC THAILAND' : 'Contact Us - THAIBC THAILAND'}
          </h1>
          
          {/* Main Contact Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-6 h-6 text-primary" />
                  <span>{language === 'th' ? 'บริการลูกค้า 24/7' : '24/7 Customer Service'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">02-123-4567</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'th' ? 'สายด่วนบริการลูกค้า (ฟรี)' : 'Customer Service Hotline (Free)'}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">{language === 'th' ? 'กด 1:' : 'Press 1:'} {language === 'th' ? 'ฝาก-ถอนเงิน' : 'Deposits & Withdrawals'}</p>
                    <p className="font-semibold">{language === 'th' ? 'กด 2:' : 'Press 2:'} {language === 'th' ? 'การเดิมพัน' : 'Betting Support'}</p>
                    <p className="font-semibold">{language === 'th' ? 'กด 3:' : 'Press 3:'} {language === 'th' ? 'ปัญหาบัญชี' : 'Account Issues'}</p>
                    <p className="font-semibold">{language === 'th' ? 'กด 9:' : 'Press 9:'} {language === 'th' ? 'พูดคุยกับเจ้าหน้าที่' : 'Speak to Agent'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  <span>{language === 'th' ? 'แชทออนไลน์' : 'Online Chat'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-bold text-primary">@thaibc_support</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'th' ? 'ไลน์ออฟฟิเชียล - เพิ่มเพื่อนเลย!' : 'Official Line - Add us now!'}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-primary">
                      {language === 'th' ? '✅ ตอบกลับทันที (เฉลี่ย 30 วินาที)' : '✅ Instant Reply (Average 30 seconds)'}
                    </p>
                    <p className="text-sm">
                      {language === 'th' ? '📱 รองรับทั้ง iOS และ Android' : '📱 Support both iOS and Android'}
                    </p>
                    <p className="text-sm">
                      {language === 'th' ? '🎯 บริการภาษาไทยและอังกฤษ' : '🎯 Thai and English Service'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Office Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-primary" />
                <span>{language === 'th' ? 'สำนักงานใหญ่' : 'Head Office'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    {language === 'th' ? 'บริษัท ไทยบีซี จำกัด' : 'ThaiBC Company Limited'}
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <strong>{language === 'th' ? 'ที่อยู่:' : 'Address:'}</strong><br/>
                      {language === 'th' 
                        ? '169/257 อาคารเจ้าพระยาทาวเวอร์ ชั้น 25 ถนนเจ้าพระยา แขวงรัษฎร์บูรณะ เขตรัษฎร์บูรณะ กรุงเทพมหานคร 10140'
                        : '169/257 Chaophaya Tower, 25th Floor Chaophaya Road, Rat Burana District, Bangkok 10140, Thailand'
                      }
                    </p>
                    <p>
                      <strong>{language === 'th' ? 'เลขประจำตัวผู้เสียภาษี:' : 'Tax ID:'}</strong> 0192551204786
                    </p>
                    <p>
                      <strong>{language === 'th' ? 'ใบอนุญาต:' : 'License:'}</strong> TH-2024-BC-001
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    {language === 'th' ? 'ช่องทางติดต่ออื่นๆ' : 'Other Contact Channels'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">support@thaibc.com</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'th' ? 'สอบถามทั่วไป' : 'General Inquiries'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">vip@thaibc.com</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'th' ? 'บริการสมาชิก VIP' : 'VIP Member Service'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">security@thaibc.com</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'th' ? 'รายงานปัญหาความปลอดภัย' : 'Security Issues'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">www.thaibc.com</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'th' ? 'เว็บไซต์หลัก' : 'Official Website'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours & Service Quality */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-primary" />
                  <span>{language === 'th' ? 'เวลาทำการ' : 'Business Hours'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                    <span className="font-medium">
                      {language === 'th' ? 'บริการลูกค้า (โทรศัพท์)' : 'Customer Service (Phone)'}
                    </span>
                    <span className="text-primary font-bold">24/7</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>{language === 'th' ? 'ไลน์แชท / อีเมล' : 'Line Chat / Email'}</span>
                    <span className="font-medium">24/7</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>{language === 'th' ? 'ระบบฝาก-ถอนเงิน' : 'Deposit-Withdrawal System'}</span>
                    <span className="font-medium">24/7</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>{language === 'th' ? 'สำนักงานใหญ่' : 'Head Office'}</span>
                    <span className="font-medium">
                      {language === 'th' ? 'จ.-ศ. 9:00-18:00' : 'Mon-Fri 9:00-18:00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-primary" />
                  <span>{language === 'th' ? 'มาตรฐานการบริการ' : 'Service Standards'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      {language === 'th' 
                        ? 'ตอบสนองทันทีภายใน 30 วินาที (ไลน์แชท)'
                        : 'Instant response within 30 seconds (Line Chat)'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      {language === 'th'
                        ? 'ตอบสนองภายใน 2 ชั่วโมง (อีเมล)'
                        : 'Response within 2 hours (Email)'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      {language === 'th'
                        ? 'แก้ไขปัญหาภายใน 24 ชั่วโมง'
                        : 'Problem resolution within 24 hours'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      {language === 'th'
                        ? 'บริการภาษาไทยและอังกฤษ'
                        : 'Thai and English language support'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center space-x-2">
                <Shield className="w-6 h-6" />
                <span>
                  {language === 'th' ? 'การติดต่อฉุกเฉิน' : 'Emergency Contact'}
                </span>
              </h3>
              <p className="text-sm text-red-700 mb-3">
                {language === 'th'
                  ? 'หากพบปัญหาเร่งด่วน เช่น บัญชีถูกแฮก เงินหายไป หรือธุรกรรมผิดปกติ กรุณาติดต่อทันที:'
                  : 'For urgent issues such as hacked accounts, missing funds, or suspicious transactions, contact immediately:'
                }
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-red-100 rounded-lg p-3">
                  <p className="font-bold text-red-800">📞 02-123-4567 ({language === 'th' ? 'กด 0' : 'Press 0'})</p>
                </div>
                <div className="bg-red-100 rounded-lg p-3">
                  <p className="font-bold text-red-800">✉️ urgent@thaibc.com</p>
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