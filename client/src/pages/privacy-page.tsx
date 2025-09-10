import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLanguage } from "@/lib/i18n";

export default function PrivacyPage() {
  const language = getLanguage();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground">
            {language === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
          </h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                {language === 'th' ? '1. การเก็บรวบรวมข้อมูลส่วนบุคคล' : '1. Personal Data Collection'}
              </h2>
              <p>
                {language === 'th' 
                  ? 'THAIBC THAILAND เก็บรวบรวมข้อมูลส่วนบุคคลของท่านเมื่อท่านลงทะเบียนใช้บริการ ฝาก-ถอนเงิน และใช้บริการต่างๆ บนแพลตฟอร์มของเรา ข้อมูลที่เก็บรวบรวมประกอบด้วย:'
                  : 'THAIBC THAILAND collects your personal data when you register, deposit-withdraw funds, and use various services on our platform. The collected data includes:'
                }
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                <li>{language === 'th' ? 'ชื่อ-นามสกุล, วันเกิด, และข้อมูลประจำตัว' : 'Full name, date of birth, and identification information'}</li>
                <li>{language === 'th' ? 'ที่อยู่, หมายเลขโทรศัพท์, และอีเมล' : 'Address, phone number, and email'}</li>
                <li>{language === 'th' ? 'ข้อมูลบัญชีธนาคารและการทำธุรกรรมทางการเงิน' : 'Bank account information and financial transactions'}</li>
                <li>{language === 'th' ? 'ประวัติการเดิมพันและพฤติกรรมการใช้งาน' : 'Betting history and usage behavior'}</li>
                <li>{language === 'th' ? 'ข้อมูลอุปกรณ์และ IP Address' : 'Device information and IP Address'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                {language === 'th' ? '2. วัตถุประสงค์ในการใช้ข้อมูล' : '2. Purpose of Data Usage'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{language === 'th' ? 'ให้บริการแทงบอลและกีฬาออนไลน์' : 'Provide online sports betting services'}</li>
                <li>{language === 'th' ? 'ยืนยันตัวตนและป้องกันการฟอกเงิน (AML/KYC)' : 'Identity verification and anti-money laundering (AML/KYC)'}</li>
                <li>{language === 'th' ? 'ประมวลผลการฝาก-ถอนเงินและธุรกรรมทางการเงิน' : 'Process deposits, withdrawals, and financial transactions'}</li>
                <li>{language === 'th' ? 'ติดต่อสื่อสารและแจ้งข้อมูลโปรโมชั่น' : 'Communication and promotional notifications'}</li>
                <li>{language === 'th' ? 'ปรับปรุงคุณภาพการบริการและความปลอดภัย' : 'Improve service quality and security'}</li>
                <li>{language === 'th' ? 'ปฏิบัติตามข้อกำหนดทางกฎหมายและการกำกับดูแล' : 'Comply with legal requirements and regulations'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                {language === 'th' ? '3. การแบ่งปันข้อมูลกับบุคคลที่สาม' : '3. Data Sharing with Third Parties'}
              </h2>
              <p>
                {language === 'th'
                  ? 'เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้กับบุคคลที่สาม ยกเว้นในกรณีดังต่อไปนี้:'
                  : 'We do not disclose your personal data to third parties, except in the following cases:'
                }
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                <li>{language === 'th' ? 'เมื่อได้รับความยินยอมจากท่าน' : 'When we have your consent'}</li>
                <li>{language === 'th' ? 'ผู้ให้บริการระบบการเงินและธนาคาร' : 'Financial service providers and banks'}</li>
                <li>{language === 'th' ? 'หน่วยงานราชการตามที่กฎหมายกำหนด' : 'Government agencies as required by law'}</li>
                <li>{language === 'th' ? 'บริษัทพันธมิตรในการให้บริการ (ภายใต้สัญญาคุ้มครองข้อมูล)' : 'Partner companies providing services (under data protection agreements)'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                {language === 'th' ? '4. ความปลอดภัยของข้อมูล' : '4. Data Security'}
              </h2>
              <p>
                {language === 'th'
                  ? 'เรามีมาตรการรักษาความปลอดภัยข้อมูลระดับสูงเพื่อปกป้องข้อมูลส่วนบุคคลของท่าน:'
                  : 'We have high-level data security measures to protect your personal information:'
                }
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                <li>{language === 'th' ? 'การเข้ารหัส SSL/TLS 256-bit ในการส่งข้อมูล' : 'SSL/TLS 256-bit encryption for data transmission'}</li>
                <li>{language === 'th' ? 'ระบบ Firewall และการป้องกันการบุกรุกขั้นสูง' : 'Advanced firewall systems and intrusion protection'}</li>
                <li>{language === 'th' ? 'การควบคุมการเข้าถึงข้อมูลอย่างเข้มงวด' : 'Strict data access controls'}</li>
                <li>{language === 'th' ? 'การสำรองข้อมูลและระบบกู้คืนข้อมูล' : 'Data backup and recovery systems'}</li>
                <li>{language === 'th' ? 'การตรวจสอบและทดสอบความปลอดภัยอย่างสม่ำเสมอ' : 'Regular security audits and testing'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                {language === 'th' ? '5. สิทธิของเจ้าของข้อมูล' : '5. Data Owner Rights'}
              </h2>
              <p>
                {language === 'th'
                  ? 'ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ท่านมีสิทธิ์ในการ:'
                  : 'Under the Personal Data Protection Act B.E. 2562, you have the right to:'
                }
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                <li>{language === 'th' ? 'ขอเข้าถึงและขอสำเนาข้อมูลส่วนบุคคลของท่าน' : 'Access and request copies of your personal data'}</li>
                <li>{language === 'th' ? 'ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์' : 'Correct inaccurate or incomplete data'}</li>
                <li>{language === 'th' ? 'ขอลบหรือทำลายข้อมูลส่วนบุคคลของท่าน' : 'Delete or destroy your personal data'}</li>
                <li>{language === 'th' ? 'ขอระงับการใช้ข้อมูลส่วนบุคคลของท่าน' : 'Suspend the use of your personal data'}</li>
                <li>{language === 'th' ? 'ขอโอนข้อมูลส่วนบุคคลในรูปแบบที่อ่านได้ด้วยเครื่อง' : 'Request data portability in machine-readable format'}</li>
                <li>{language === 'th' ? 'คัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูล' : 'Object to data collection, use, or disclosure'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                {language === 'th' ? '6. การติดต่อ' : '6. Contact Information'}
              </h2>
              <div className="bg-muted/50 rounded-lg p-4">
                <p><strong>{language === 'th' ? 'เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO):' : 'Data Protection Officer (DPO):'}</strong></p>
                <p>{language === 'th' ? 'คุณสมชาย ใจดี' : 'Mr. Somchai Jaidee'}</p>
                <p><strong>Email:</strong> privacy@thaibc.com</p>
                <p><strong>{language === 'th' ? 'โทรศัพท์:' : 'Phone:'}</strong> 02-123-4567 {language === 'th' ? 'กด 3' : 'ext. 3'}</p>
                <p><strong>{language === 'th' ? 'ที่อยู่:' : 'Address:'}</strong> {language === 'th' ? '169/257 อาคารเจ้าพระยาทาวเวอร์ ชั้น 25 กรุงเทพฯ 10140' : '169/257 Chaophaya Tower, 25th Floor, Bangkok 10140'}</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}