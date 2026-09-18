# Deployment & Production Operations Guide
## GUE Staff Management & ID Verification System

**Organization:** GUE EDUCATIONAL LIMITED  
**Corporate Affairs Commission (CAC):** RC: 9451933  
**Federal Tax Identification Number (TIN):** 2620760246226  
**Training Centre:** GUE Educational Limited Skills Training Centre  
**Location:** Wannune, Tarka LGA, Benue State, Nigeria  

---

### 1. Architecture Overview

The system is architected as an institutional-grade, full-stack application:
- **Backend API & Verification Service:** Node.js + Express with JWT session auth and Role-Based Access Control (RBAC).
- **Frontend Admin Portal & Verification UI:** React 19 + TypeScript + Tailwind CSS with responsive mobile-optimized card rendering.
- **Physical ID Card Print Engine:** Standard ISO/IEC 7810 ID-1 (CR80: 85.60 mm × 53.98 mm) dual-sided generation with 300+ DPI vector sharpness and High Error Correction (`Level H`) cryptographic QR codes.
- **Data Persistence:** JSON document datastore (`data/gue_system.json`) with auto-persistence, atomic file writes, automated snapshot backups, and admin restore facility.

---

### 2. Environment Variables (.env)

Ensure the following environment variables are configured in your production environment:

```env
# Port on which the production server listens (must be 3000 in container environments)
PORT=3000

# Node Environment
NODE_ENV=production

# Secret key used for signing institutional administrator JWT authentication tokens
JWT_SECRET=your_long_cryptographically_random_jwt_secret_key_here

# Public Verification Domain printed on physical ID cards
# Scanners reading the QR code are routed to this domain
VERIFICATION_BASE_URL=https://verify.gue.edu.ng
```

---

### 3. Production Deployment Options

#### Option A: Docker / Container Deployment (Cloud Run, AWS ECS, DigitalOcean, VPS)

1. Build the production application bundle:
   ```bash
   npm run build
   ```
2. Start the compiled self-contained server:
   ```bash
   npm run start
   # This runs: node dist/server.cjs
   ```
3. A standard `Dockerfile` for containerized hosting:
   ```dockerfile
   FROM node:22-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   ENV PORT=3000

   COPY package*.json ./
   RUN npm ci --omit=dev

   COPY dist ./dist
   COPY data ./data

   EXPOSE 3000
   CMD ["node", "dist/server.cjs"]
   ```

#### Option B: Platform as a Service (Render / Railway)

1. Connect your Git repository to **Render** or **Railway**.
2. Set **Build Command**: `npm run build`
3. Set **Start Command**: `node dist/server.cjs`
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_secure_secret_here`
   - `VERIFICATION_BASE_URL=https://your-domain.com`

---

### 4. Custom Domain & HTTPS / SSL Setup

1. **Domain Pointing:** Point `verify.gue.edu.ng` (or your chosen institutional domain) via CNAME or A Record to your server's IP address.
2. **Mandatory HTTPS:** Mobile cameras and browser QR code scanners require valid SSL/TLS certificates (Let's Encrypt or Cloudflare SSL) for secure verification.
3. Update the Verification Base URL in **Admin Portal -> System Configuration** to match your live production URL.

---

### 5. Physical ID Card Printing Specifications

- **Card Standard:** ISO/IEC 7810 ID-1 (CR80) standard credit card size (85.60 mm × 53.98 mm / 3.370 in × 2.125 in).
- **Card Material:** 30 mil (0.76 mm) PVC or Composite PVC/PET plastic cards.
- **Recommended Card Printers:**
  - Zebra ZC300 / ZXP Series 7
  - Fargo HDP5000 (High Definition Reverse Transfer Printing)
  - Evolis Primacy 2 / Zenius
  - Magicard 300 / 600
- **Printing Quality:** Set printer resolution to **300 DPI or higher**. Ensure edge-to-edge printing is enabled.
- **Lamination:** Optional clear 1.0 mil holographic overlay for physical security and weather durability in training workshops.

---

### 6. Institutional Security & Data Privacy Compliance

- **QR Code Content:** QR codes contain only a unique verification URL with a high-entropy cryptographically unique token (e.g. `https://verify.gue.edu.ng/v/GUE-8F42K9X7`).
- **Data Minimization:** No sensitive personal records (NIN, BVN, bank details, home address, private phone, next of kin, salary) are ever encoded in the QR code or returned to public verification queries.
- **Live Database Validation:** The verification portal always queries the live server database to confirm that the staff record is currently active before displaying the institutional seal.
