import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Star, Trophy, Percent, Users, Calendar, Crown, Sparkles } from "lucide-react";

export default function PromotionsPage() {
  const language = getLanguage();
  
  const currentPromotions = [
    {
      id: 'welcome',
      icon: Gift,
      titleTh: '🎁 โบนัสต้อนรับ 100%',
      titleEn: '🎁 100% Welcome Bonus',
      descTh: 'สมาชิกใหม่ รับโบนัสเงินฝากแรก 100% สูงสุด 10,000 บาท',
      descEn: 'New members get 100% first deposit bonus up to 10,000 THB',
      termsDetailsTh: [
        'ฝากขั้นต่ำ 500 บาท รับโบนัส 100%',
        'โบนัสสูงสุด 10,000 บาท',
        'ต้องทำยอดเทิร์น 10 เท่าของยอดโบนัส',
        'ใช้ได้กับการเดิมพันกีฬาเท่านั้น',
        'มีผลภายใน 30 วันหลังรับโบนัส'
      ],
      termsDetailsEn: [
        'Minimum deposit 500 THB, get 100% bonus',
        'Maximum bonus 10,000 THB',
        'Must complete 10x turnover of bonus amount',
        'Valid for sports betting only',
        'Valid for 30 days after receiving bonus'
      ],
      bgColor: 'from-green-400 to-blue-500',
      valid: '1 ม.ค. - 31 ม.ค. 2568'
    },
    {
      id: 'reload',
      icon: Percent,
      titleTh: '🔄 โบนัสเติมเงิน 50%',
      titleEn: '🔄 50% Reload Bonus',
      descTh: 'ฝากเงินเติมรับโบนัส 50% ทุกวันจันทร์ สูงสุด 5,000 บาท',
      descEn: 'Get 50% reload bonus every Monday, up to 5,000 THB',
      termsDetailsTh: [
        'โปรโมชั่นพิเศษทุกวันจันทร์',
        'ฝากขั้นต่ำ 1,000 บาท',
        'รับโบนัส 50% สูงสุด 5,000 บาท',
        'ต้องทำยอดเทิร์น 8 เท่า',
        'ใช้ได้กับกีฬาทุกประเภท'
      ],
      termsDetailsEn: [
        'Special Monday promotion',
        'Minimum deposit 1,000 THB',
        'Get 50% bonus up to 5,000 THB',
        'Must complete 8x turnover',
        'Valid for all sports'
      ],
      bgColor: 'from-purple-400 to-pink-500',
      valid: 'ทุกวันจันทร์'
    },
    {
      id: 'cashback',
      icon: Trophy,
      titleTh: '💰 คืนเงิน 10% ทุกสัปดาห์',
      titleEn: '💰 10% Weekly Cashback',
      descTh: 'เสียเงินแล้วไม่เศร้า! รับคืนเงิน 10% จากยอดเสียรายสัปดาห์',
      descEn: 'Lost money? No worries! Get 10% cashback on weekly losses',
      termsDetailsTh: [
        'คำนวณจากยอดเสียสุทธิรายสัปดาห์',
        'คืนเงิน 10% สูงสุด 20,000 บาท',
        'เครดิตเข้าบัญชีทุกวันจันทร์',
        'ไม่มีเงื่อนไขเทิร์นโอเวอร์',
        'สมาชิกทุกระดับใช้ได้'
      ],
      termsDetailsEn: [
        'Calculated from weekly net losses',
        '10% cashback up to 20,000 THB',
        'Credited every Monday',
        'No turnover requirements',
        'Available for all member levels'
      ],
      bgColor: 'from-orange-400 to-red-500',
      valid: 'ทุกสัปดาห์'
    },
    {
      id: 'vip',
      icon: Crown,
      titleTh: '👑 สิทธิพิเศษสมาชิก VIP',
      titleEn: '👑 VIP Member Privileges',
      descTh: 'อัพเกรดเป็น VIP รับสิทธิพิเศษมากมาย บริการระดับพรีเมียม',
      descEn: 'Upgrade to VIP for exclusive privileges and premium service',
      termsDetailsTh: [
        'ถอนเงินไม่มีค่าธรรมเนียม',
        'โบนัสเพิ่ม 20% ทุกการฝาก',
        'เจ้าหน้าที่ส่วนตัว 24/7',
        'ขีดจำกัดการเดิมพันสูงขึ้น',
        'ของขวัญวันเกิดพิเศษ'
      ],
      termsDetailsEn: [
        'Free withdrawal fees',
        '20% extra bonus on all deposits',
        'Personal account manager 24/7',
        'Higher betting limits',
        'Special birthday gifts'
      ],
      bgColor: 'from-yellow-400 to-orange-500',
      valid: 'สมาชิกตลอดชีพ'
    }
  ];

  const upcomingPromotions = [
    {
      titleTh: '⚽ โปรพิเศษยูโร 2024',
      titleEn: '⚽ Euro 2024 Special',
      descTh: 'รอลุ้นโปรโมชั่นพิเศษในช่วงยูโรคัพ',
      descEn: 'Wait for special Euro Cup promotions',
      date: 'มิ.ย. 2568'
    },
    {
      titleTh: '🏆 แจ็คพอตฟุตบอลโลก',
      titleEn: '🏆 World Cup Jackpot',
      descTh: 'แจ็คพอตใหญ่ในช่วงฟุตบอลโลก',
      descEn: 'Huge jackpot during World Cup',
      date: 'พ.ย. 2568'
    },
    {
      titleTh: '🎊 โปรปีใหม่ 2569',
      titleEn: '🎊 New Year 2569 Promo',
      descTh: 'โปรโมชั่นส่งท้ายปีเก่า ต้อนรับปีใหม่',
      descEn: 'Year-end and New Year promotions',
      date: 'ธ.ค. 2568 - ม.ค. 2569'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {language === 'th' ? '🎉 โปรโมชั่นและโบนัส' : '🎉 Promotions & Bonuses'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {language === 'th' 
                ? 'รับโบนัสและสิทธิพิเศษมากมายที่ THAIBC'
                : 'Get amazing bonuses and exclusive privileges at THAIBC'
              }
            </p>
          </div>

          {/* Current Promotions */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              {language === 'th' ? '🔥 โปรโมชั่นปัจจุบัน' : '🔥 Current Promotions'}
            </h2>
            
            <div className="grid gap-8">
              {currentPromotions.map((promo) => (
                <Card key={promo.id} className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                  <div className={`h-2 bg-gradient-to-r ${promo.bgColor}`}></div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <promo.icon className="w-8 h-8 text-primary" />
                        <span className="text-xl">
                          {language === 'th' ? promo.titleTh : promo.titleEn}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground bg-muted rounded-full px-3 py-1">
                        {promo.valid}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-lg text-muted-foreground mb-4">
                          {language === 'th' ? promo.descTh : promo.descEn}
                        </p>
                        <div className="bg-primary/5 rounded-lg p-4">
                          <h4 className="font-semibold text-primary mb-2">
                            ✨ {language === 'th' ? 'ไฮไลท์' : 'Highlights'}
                          </h4>
                          <p className="text-sm text-primary">
                            {language === 'th' ? promo.descTh : promo.descEn}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">
                          📋 {language === 'th' ? 'ข้อกำหนดและเงื่อนไข' : 'Terms and Conditions'}
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {(language === 'th' ? promo.termsDetailsTh : promo.termsDetailsEn).map((term, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-primary">•</span>
                              <span>{term}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* VIP Program Details */}
          <Card className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-700">
                <Crown className="w-8 h-8" />
                <span className="text-2xl">
                  {language === 'th' ? 'โปรแกรม VIP THAIBC' : 'THAIBC VIP Program'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-2 border-gray-300">
                  <CardHeader className="text-center bg-gray-100">
                    <Users className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                    <CardTitle className="text-gray-700">
                      {language === 'th' ? 'เงิน (Silver)' : 'Silver'}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {language === 'th' ? 'ยอดเดิมพัน 100,000+ บาท' : '100,000+ THB turnover'}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="text-sm space-y-1">
                      <li>• {language === 'th' ? 'โบนัสเพิ่ม 5%' : '5% bonus increase'}</li>
                      <li>• {language === 'th' ? 'คืนเงิน 5%' : '5% cashback'}</li>
                      <li>• {language === 'th' ? 'ถอนเร็วขึ้น' : 'Faster withdrawals'}</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-yellow-400">
                  <CardHeader className="text-center bg-yellow-100">
                    <Star className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
                    <CardTitle className="text-yellow-700">
                      {language === 'th' ? 'ทอง (Gold)' : 'Gold'}
                    </CardTitle>
                    <p className="text-sm text-yellow-600">
                      {language === 'th' ? 'ยอดเดิมพัน 500,000+ บาท' : '500,000+ THB turnover'}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="text-sm space-y-1">
                      <li>• {language === 'th' ? 'โบนัสเพิ่ม 10%' : '10% bonus increase'}</li>
                      <li>• {language === 'th' ? 'คืนเงิน 8%' : '8% cashback'}</li>
                      <li>• {language === 'th' ? 'ถอนฟรีค่าธรรมเนียม' : 'Free withdrawal fees'}</li>
                      <li>• {language === 'th' ? 'เจ้าหน้าที่ส่วนตัว' : 'Personal manager'}</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-purple-400">
                  <CardHeader className="text-center bg-purple-100">
                    <Crown className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                    <CardTitle className="text-purple-700">
                      {language === 'th' ? 'เพชร (Diamond)' : 'Diamond'}
                    </CardTitle>
                    <p className="text-sm text-purple-600">
                      {language === 'th' ? 'ยอดเดิมพัน 2,000,000+ บาท' : '2,000,000+ THB turnover'}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="text-sm space-y-1">
                      <li>• {language === 'th' ? 'โบนัสเพิ่ม 20%' : '20% bonus increase'}</li>
                      <li>• {language === 'th' ? 'คืนเงิน 12%' : '12% cashback'}</li>
                      <li>• {language === 'th' ? 'ถอนฟรี + ไม่จำกัด' : 'Unlimited free withdrawals'}</li>
                      <li>• {language === 'th' ? 'ขีดจำกัดสูงพิเศษ' : 'Higher limits'}</li>
                      <li>• {language === 'th' ? 'ของขวัญพิเศษ' : 'Exclusive gifts'}</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Promotions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-primary" />
                <span>{language === 'th' ? 'โปรโมชั่นที่จะมาถึง' : 'Upcoming Promotions'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {upcomingPromotions.map((promo, index) => (
                  <div key={index} className="border border-dashed border-muted rounded-lg p-4 text-center">
                    <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <h4 className="font-semibold mb-2">
                      {language === 'th' ? promo.titleTh : promo.titleEn}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {language === 'th' ? promo.descTh : promo.descEn}
                    </p>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {promo.date}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact for Custom Promotions */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-4">
                {language === 'th' ? '🎯 โปรโมชั่นพิเศษสำหรับคุณ' : '🎯 Custom Promotions for You'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'th'
                  ? 'สมาชิกพิเศษสามารถขอโปรโมชั่นเฉพาะบุคคลได้ ติดต่อทีม VIP'
                  : 'VIP members can request personalized promotions. Contact our VIP team'
                }
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="bg-primary/10 rounded-lg px-4 py-2 font-medium">
                  📞 02-123-4567 ({language === 'th' ? 'กด 8' : 'Press 8'})
                </span>
                <span className="bg-primary/10 rounded-lg px-4 py-2 font-medium">
                  💬 @thaibc_vip
                </span>
                <span className="bg-primary/10 rounded-lg px-4 py-2 font-medium">
                  ✉️ vip@thaibc.com
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