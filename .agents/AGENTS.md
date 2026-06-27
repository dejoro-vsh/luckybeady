# Project Context: LuckyBeady (Interactive Jewelry Customizer)

This project is an **Interactive Jewelry Customizer (2D Canvas Assembly Engine)** integrated into the **LINE Ecosystem**.

## Core Business & Features
- **LINE-First Onboarding:** Users enter via LINE OA (QR/Link), auto-follow, and bind their profile. No app installation needed.
- **Interactive Canvas (LIFF App):** A high-performance 2D/3D visual customizer where users can design bracelets (stones, sizes, spacers, charms).
- **Dynamic Pricing & Checkout:** Prices update in real-time. Checkout uses dynamic PromptPay/E-Wallet within the LIFF app.
- **Post-Purchase Updates:** Automated LINE push notifications for order status (Designing, Assembling, Shipped).
- **Upselling & Abandoned Cart:** Suggests premium add-ons in-canvas. Sends targeted push messages (with images of their design) for abandoned carts.
- **White-Label SaaS:** Can be licensed to other boutique brands.

## Technical Architecture (DevDD)
- **Client Front-End:** LINE OA (Chat) -> LINE LIFF (HTML5/WebGL Canvas for visual engine).
- **Cloud Backend:** API Gateway (Yo/Backend) communicating via Secure VPN Tunnel to the infrastructure. Handles pricing matrix, BOM (Bill of Materials) generation, and payment webhooks.
- **Infrastructure & Storage (Vishnu):** On-premise Proxmox High-Availability clusters for DB, hybrid failover with AWS CDN (Media). Zero-Trust security using Infisical and Tailscale.

## Automation
- **BOM & Inventory:** Converts visual designs directly into production work orders. Dynamically disables out-of-stock items.

This file serves as the "central brain" to ensure all agents understand the core business and technical architecture of the project.

## UI/UX Design References

### Step 1: Wrist Measurement (วัดข้อมือ)
- **Brand Header:** Shows brand name "LUCY SUMMER" with a logo and a Home icon on the top left.
- **Progress Indicator:** "CUSTOM BEADS BRACELET - STEP 1 / 4 - วัดข้อมือ" with a visual progress bar indicating step 1 of 4.
- **Main Card (วัดขนาดข้อมือ):**
  - **Instruction:** "วัดรอบข้อมือแบบพอดี (หน่วยเซนติเมตร)" (Measure exact wrist size in cm).
  - **Illustration:** An image showing how to measure a wrist with a measuring tape. Caption: "วัดรอบข้อมือบริเวณข้อมือ - สายวัดแนบพอดี ไม่หลวมไม่แน่น".
  - **Input Field:** A large input field for the measurement (default "0.0 cm").
  - **Preset Buttons:** Quick selection buttons for common sizes: 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20.
- **Optional Input (ชื่อเจ้าของกำไล):** A text input field to enter the bracelet owner's name (labeled as not required / ไม่บังคับ).
- **Footer Action:** A full-width fixed button at the bottom labeled "ถัดไป" (Next) with a dark navy/blue color.

### Step 2: Stone Size Selection (เลือกขนาดหิน)
- **Brand Header:** Shows brand name "LUCY SUMMER" with a logo and a Home icon on the top left.
- **Progress Indicator:** "CUSTOM BEADS BRACELET - STEP 2 / 4 - เลือกขนาดหิน" with a visual progress bar indicating step 2 of 4.
- **Main Card (ขนาดหิน):**
  - **Instruction:** "เลือกขนาดเม็ดที่ต้องการ (ขนาดเส้นผ่านศูนย์กลางของหิน)" (Select desired bead size in diameter).
  - **Size Options (Cards):** Three square cards side-by-side representing sizes. Each has an image of a pink bead scaled to represent the size:
    - 4 mm
    - 6 mm
    - 8 mm
  - **Mix Sizes Option:** A wide rectangular button below the size cards labeled "ผสมหลายขนาด" (Mix multiple sizes) showing three beads of different sizes.
- **Illustration Card (เปรียบเทียบขนาดบนข้อมือ):**
  - An illustration showing an arm with three bracelets worn side-by-side to visually compare the 4mm, 6mm, and 8mm sizes.
  - Caption below the illustration: "ตัวอย่างแบบข้อมือ 15 cm" (Example on a 15 cm wrist).
- **Footer Action:** Two buttons side-by-side at the bottom:
  - "ย้อนกลับ" (Back): White background with dark text/border (Secondary action).
  - "ถัดไป" (Next): Dark navy/blue color (Primary action).

### Step 3: Interactive Canvas & Stone Selection (ออกแบบกำไล)
- **Brand Header:** Shows brand name "LUCY SUMMER" with a logo and a Home icon on the top left.
- **Progress Indicator:** "CUSTOM BEADS BRACELET - STEP 3 / 4 - ออกแบบกำไล" with a visual progress bar indicating step 3 of 4.
- **Main Visual Canvas Card:**
  - **Top Info:** Left shows selected configuration (e.g., "เม็ด 8mm - ข้อมือ 17.5 cm"). Right shows dynamic price (e.g., "฿0") and bead count (e.g., "0 / 24 เม็ด").
  - **Canvas Area:** A circular arrangement of empty dashed circles (numbered 1 to 24 in this example) representing the bracelet layout. Faint brand watermark "LUCY SUMMER" in the center.
  - **Canvas Actions:** Two buttons at the bottom left of the canvas: "ย้อนกลับ" (Undo) and "รีเซ็ตกำไล" (Reset bracelet).
  - **Disclaimer:** Small text at the bottom right of the canvas ("*ภาพใช้เพื่อจำลองการออกแบบเท่านั้น สีและลักษณะอาจมีความแตกต่างเล็กน้อย").
- **Filter Bar:** A horizontal scrollable row of pill-shaped buttons for filtering stone colors: "ทั้งหมด" (All, default active), "น้ำเงิน" (Blue), "ชมพู" (Pink), "ดำ" (Black), "เทา" (Gray), "เหลือง" (Yellow).
- **Item Inventory Grid (Stones & Premium Add-ons):** A grid of design elements (3 columns):
  - **Regular Stones:** Various gemstone beads with standard pricing (e.g., "Strawberry Quartz" at ฿65).
  - **Premium Spacers:** Decorative metal spacers in Silver, Pinkgold, or Black (e.g., "LUNA Spacer Silver" at ฿790). These act as premium upselling items.
  - **Premium Charms:** High-value decorative pendants like Heart or Round shapes in various finishes (e.g., "LUNA Heart Silver" at ฿1690). These significantly increase the Average Order Value (AOV).
  - Each item card displays: Product image, Name, Price, and a small 'i' (info) icon button on the bottom left.
- **Footer Action:** Two buttons side-by-side at the bottom:
  - "ย้อนกลับ" (Back): White background with dark text/border (Secondary action).
  - "ยืนยัน ->" (Confirm): Dark navy/blue color (Primary action).

  **Step 3 Interaction States (Partial vs Full Fill):**
  - **Adding Beads:** As the user selects stones from the grid, the dashed circles fill up sequentially with the selected stones.
  - **Replacing & Removing Elements:** Users can click directly on any filled position on the canvas (e.g., a specific stone) to remove it. They can then select a new item (like a premium spacer or charm) to replace it, allowing for precise custom arrangements.
  - **Premium Element Indicators:** When special items like charms or spacers are added, a visual indicator (e.g., a yellow "+ 1 Charm" badge) appears under the total bead count.
  - **Dynamic Price & Count:** The price at the top right recalculates instantly (e.g., up to ฿2,897 when premium items are added). The bead count updates accordingly.
  - **Deletion Instruction:** When beads are placed on the canvas, a small hint appears under the top left info: "💡 แตะที่หินเพื่อลบ" (Tap on stone to delete).
  - **Recent Filter:** The filter bar includes a "ล่าสุด ⏱️" (Recent) filter, allowing users to quickly access previously selected stones.

### Step 4: Order Summary & Checkout (สรุปการสั่งซื้อ)
- **Brand Header:** Shows brand name "LUCY SUMMER", personalized subtitle "for [Customer Name]", and the current date (e.g., "27 มิถุนายน 2569").
- **Final Design Image:** A large static render of the completed custom bracelet.
- **Specification Summary Box:** Displays Wrist Size (e.g., "17.5 cm"), Bracelet Length (e.g., "19.5 cm"), Stone Size (e.g., "8 mm"), and Total Elements (e.g., "24 เม็ด + 1 Charm").
- **Bill of Materials (BOM) List:** A detailed itemized receipt showing every stone/element selected, its quantity, and subtotal (e.g., "Aquamarine 5A (Blue Sky) x 2 ... ฿270").
- **Pricing & Discount Section:**
  - Original Total Price (crossed out, e.g., 2,897 ฿).
  - A prominent green promotional banner: "ลดทันที 20% เมื่อสั่งซื้อผ่าน LINE @LUCYSUMMER" (Instant 20% discount when ordering via LINE).
  - Final Special Price in large green text (e.g., 2,318 ฿).
- **Stone Meanings (ความหมายของหิน):** An educational section listing all selected stones with their images, names, and a descriptive paragraph explaining their astrological or emotional benefits (e.g., Aquamarine for calmness, Rose Quartz for love).
- **Footer Notes:** Disclaimer about natural stone color variations and a note that a real photo will be sent before shipping. Includes a LINE contact button for inquiries.
- **Footer Action:** Two buttons side-by-side at the bottom:
  - "ย้อนกลับ" (Back): White background with dark text/border (Secondary action).
  - "สั่งซื้อผ่าน LINE 20%" (Order via LINE 20%): Bright green color with LINE icon (Primary checkout action).

### Step 5: LINE OA Confirmation (Flex Message)
- **Desktop/External Link Fallback:** If the user opens the checkout link outside the LINE app (e.g., PC browser), a popup displays a LINE QR Code with the instruction "สแกนคิวอาร์โค้ดเพื่อเพิ่มเพื่อน LINE" (Scan QR code to add LINE friend) to force the user into the LINE ecosystem.
- **LINE Chat Flex Message:** Upon clicking "Order via LINE" in the LIFF app (Step 4), the system sends an automated Flex Message to the user in the brand's LINE OA chat.
- **Flex Message Content:**
  - Mirrors the BOM list from Step 4 (Itemized list of stones/elements with quantities and subtotals).
  - Displays Total Price (ราคารวม) and Discounted Price (หลังลด 20%).
  - Contains two action buttons: "คอนเฟิร์ม" (Confirm, Green) and "ยกเลิก" (Cancel, Grey).
- **LINE Rich Menu:** Below the chat area, a customized Rich Menu provides quick navigation options: "Custom Beads ออกแบบกำไลหินฟรี" (Design Free Bracelet), "Member ship" (Membership), and "Personal stone ค้นหาหินประจำตัว" (Find Personal Stone).
