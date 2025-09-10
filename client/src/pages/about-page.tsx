import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground">เกี่ยวกับ THAIBC THAILAND</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">ประวัติความเป็นมา</h2>
              <p>
                THAIBC THAILAND ได้ก่อตั้งขึ้นในปี 2020 ด้วยวิสัยทัศน์ในการเป็นเว็บไซต์แทงบอลออนไลน์ที่ดีที่สุดในประเทศไทย 
                เราให้บริการแทงบอลและกีฬาออนไลน์ครบวงจร พร้อมระบบการเงินที่มั่นคงและปลอดภัย
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">วิสัยทัศน์และพันธกิจ</h2>
              <p>
                เราตั้งใจที่จะเป็นแพลตฟอร์มการเดิมพันกีฬาที่น่าเชื่อถือที่สุดในเอเชียตะวันออกเฉียงใต้ 
                ด้วยการให้บริการที่โปร่งใส ยุติธรรม และใส่ใจในทุกรายละเอียดเพื่อความพึงพอใจของลูกค้า
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1">
                <li>ให้บริการแทงบอลออนไลน์ที่ปลอดภัยและเป็นธรรม</li>
                <li>พัฒนาระบบเทคโนโลยีที่ทันสมัยและใช้งานง่าย</li>
                <li>มุ่งมั่นในการให้บริการลูกค้าระดับพรีเมี่ยม 24/7</li>
                <li>ส่งเสริมการเล่นอย่างมีความรับผิดชอบ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">ใบอนุญาตและความปลอดภัย</h2>
              <p>
                THAIBC THAILAND ได้รับใบอนุญาตจากหน่วยงานกำกับดูแลระหว่างประเทศที่เป็นที่ยอมรับ 
                พร้อมระบบรักษาความปลอดภัยระดับธนาคารเพื่อปกป้องข้อมูลและเงินทุนของสมาชิกทุกท่าน
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">บริการของเรา</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-foreground">กีฬา</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>ฟุตบอลไทยและต่างประเทศ</li>
                    <li>บาสเกตบอล NBA</li>
                    <li>เทนนิส ATP/WTA</li>
                    <li>วอลเลย์บอลและกีฬาอื่นๆ</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">การเงิน</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>ฝาก-ถอนอัตโนมัติตลอด 24 ชั่วโมง</li>
                    <li>รองรับธนาคารไทยทุกธนาคาร</li>
                    <li>รองรับ Cryptocurrency</li>
                    <li>ไม่มีค่าธรรมเนียม</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">ติดต่อเรา</h2>
              <div className="bg-muted/50 rounded-lg p-4">
                <p><strong>สำนักงานใหญ่:</strong> กรุงเทพมหานคร ประเทศไทย</p>
                <p><strong>โทรศัพท์:</strong> 02-123-4567</p>
                <p><strong>อีเมล:</strong> support@thaibc.com</p>
                <p><strong>Line ID:</strong> @thaibc</p>
                <p><strong>เวลาทำการ:</strong> ให้บริการตลอด 24 ชั่วโมง ทุกวัน</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}