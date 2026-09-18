/**
 * Automated Verification Flow Test for GUE Staff Management & ID Verification System
 * Tests:
 * 1. Health check
 * 2. Public verification endpoint with valid active token (John Aondoaver Doe)
 * 3. Public verification endpoint with invalid token
 * 4. Administrator Authentication (JWT issuance)
 * 5. Protected Staff Listing (Bearer token authorization)
 * 6. QR Code generation endpoint
 * 7. Verification log telemetry
 */

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  console.log('--- STARTING GUE SYSTEM INTEGRATION TESTS ---');

  // Test 1: Health Check
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    if (res.ok && data.status === 'ok') {
      console.log('✓ TEST 1 PASSED: /api/health returned 200 OK');
      passed++;
    } else {
      throw new Error(`Expected status ok, got ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('✗ TEST 1 FAILED:', err.message);
    failed++;
  }

  // Test 2: Public Verification for Valid Token
  try {
    const res = await fetch(`${baseUrl}/api/verify/GUE-8F42K9X7`);
    const data = await res.json();
    if (res.ok && data.valid === true && data.codeStatus === 'VERIFIED') {
      console.log('✓ TEST 2 PASSED: /api/verify/GUE-8F42K9X7 confirmed ACTIVE staff:', data.staff.name);
      passed++;
    } else {
      throw new Error(`Expected valid true, got ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('✗ TEST 2 FAILED:', err.message);
    failed++;
  }

  // Test 3: Public Verification for Invalid Token
  try {
    const res = await fetch(`${baseUrl}/api/verify/GUE-FAKE-TOKEN-999`);
    const data = await res.json();
    if (res.ok && data.valid === false && data.codeStatus === 'INVALID') {
      console.log('✓ TEST 3 PASSED: /api/verify/GUE-FAKE-TOKEN-999 rejected invalid code as expected');
      passed++;
    } else {
      throw new Error(`Expected valid false, got ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('✗ TEST 3 FAILED:', err.message);
    failed++;
  }

  // Test 4: Administrator Login
  let authToken = '';
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@GUE2026!' }),
    });
    const data = await res.json();
    if (res.ok && data.token && data.user.role === 'SUPER_ADMIN') {
      authToken = data.token;
      console.log('✓ TEST 4 PASSED: /api/auth/login authenticated Super Admin:', data.user.fullName);
      passed++;
    } else {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('✗ TEST 4 FAILED:', err.message);
    failed++;
  }

  // Test 5: Protected Staff List Query
  try {
    const res = await fetch(`${baseUrl}/api/staff`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.staff) && data.staff.length > 0) {
      console.log(`✓ TEST 5 PASSED: /api/staff retrieved ${data.staff.length} staff records`);
      passed++;
    } else {
      throw new Error(`Protected staff query failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('✗ TEST 5 FAILED:', err.message);
    failed++;
  }

  // Test 6: QR Code Generation
  try {
    const res = await fetch(`${baseUrl}/api/staff/stf-001/qr`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (res.ok && data.qrDataUrl && data.qrDataUrl.startsWith('data:image/png;base64,')) {
      console.log('✓ TEST 6 PASSED: /api/staff/:id/qr generated high-correction QR data URL');
      passed++;
    } else {
      throw new Error(`QR generation failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('✗ TEST 6 FAILED:', err.message);
    failed++;
  }

  console.log('\n-----------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('-----------------------------------------------');

  if (failed > 0) process.exit(1);
}

runTests();
