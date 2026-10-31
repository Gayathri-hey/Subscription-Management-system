import http from 'http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from './src/app';
import { User } from './src/models/user.model';
import { Customer } from './src/models/customer.model';
import { config } from './src/config/env';
import { emailService } from './src/services/email.service';

// Dynamically attempt in-memory MongoDB or local connection
async function setupDatabase(): Promise<{ stop: () => Promise<void> }> {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 120000,
      },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to in-memory MongoDB test instance:', uri);
    return {
      stop: async () => {
        await mongoose.disconnect();
        await mongod.stop();
      },
    };
  } catch (err: any) {
    console.log('MongoMemoryServer error:', err.message);
    console.log('Falling back to configured MONGO_URI...');
    await mongoose.connect(config.MONGO_URI);
    return {
      stop: async () => {
        await mongoose.disconnect();
      },
    };
  }
}

async function runAuthTestSuite() {
  console.log('\n======================================================');
  console.log('🚀 STARTING PHASE 1 AUTHENTICATION & RBAC TEST SUITE');
  console.log('======================================================\n');

  const db = await setupDatabase();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5088, resolve));
  const baseUrl = 'http://localhost:5088/api';

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string, detail?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      if (detail) console.error('     Detail:', detail);
      failed++;
    }
  }

  try {
    // Clean collections before test
    await User.deleteMany({});
    await Customer.deleteMany({});

    // ─── TEST 1: CUSTOMER REGISTRATION ──────────────────────────────────────────
    console.log('\n[FEATURE 1] Customer Registration:');

    const regPayload = {
      name: 'David Miller',
      email: 'David.Miller@AcmeCorp.com', // Test email normalization
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      companyName: 'Acme Technologies Inc.',
      phone: '+1-555-0199',
    };

    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regData = (await regRes.json()) as any;

    assert(regRes.status === 201, 'Registration returns HTTP 201 Created', regData);
    assert(regData.success === true, 'Response payload contains success: true');
    assert(regData.data?.user?.email === 'david.miller@acmecorp.com', 'Email is normalized to lowercase');
    assert(regData.data?.user?.role === 'customer', 'User role defaults to customer');
    assert(regData.data?.customer?.companyName === 'Acme Technologies Inc.', 'Linked customer profile created');
    assert(regData.data?.customer?.customerNumber.startsWith('CUST-'), 'Customer number generated with CUST- prefix');

    const regCookie = regRes.headers.get('set-cookie');
    assert(
      regCookie !== null && regCookie.includes('HttpOnly'),
      'HTTP-only session cookie set upon registration'
    );

    // ─── TEST 2: DUPLICATE EMAIL REJECTION ──────────────────────────────────────
    console.log('\n[FEATURE 1] Duplicate Email Rejection:');

    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another David',
        email: 'david.miller@acmecorp.com', // Duplicate
        password: 'AnotherPassword123!',
        confirmPassword: 'AnotherPassword123!',
      }),
    });
    const dupData = (await dupRes.json()) as any;

    assert(dupRes.status === 409, 'Duplicate email returns HTTP 409 Conflict', dupData);
    assert(dupData.success === false, 'Duplicate response has success: false');
    assert(
      dupData.message.includes('already exists') || dupData.message.includes('Duplicate'),
      'Descriptive conflict message returned'
    );

    // ─── TEST 3: PASSWORD VALIDATION RULES ──────────────────────────────────────
    console.log('\n[FEATURE 1] Password Validation Rules:');

    // Too short (<= 8 characters)
    const shortRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass',
        email: 'short@acme.com',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
      }),
    });
    assert(shortRes.status === 400, 'Password <= 8 chars rejected with HTTP 400');

    // Missing uppercase
    const noUpperRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'No Upper',
        email: 'noupper@acme.com',
        password: 'password123!',
        confirmPassword: 'password123!',
      }),
    });
    assert(noUpperRes.status === 400, 'Password missing uppercase rejected with HTTP 400');

    // Missing lowercase
    const noLowerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'No Lower',
        email: 'nolower@acme.com',
        password: 'PASSWORD123!',
        confirmPassword: 'PASSWORD123!',
      }),
    });
    assert(noLowerRes.status === 400, 'Password missing lowercase rejected with HTTP 400');

    // Missing special character
    const noSpecialRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'No Special',
        email: 'nospecial@acme.com',
        password: 'Password1234',
        confirmPassword: 'Password1234',
      }),
    });
    assert(noSpecialRes.status === 400, 'Password missing special char rejected with HTTP 400');

    // Mismatched confirm password
    const mismatchRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mismatch Pass',
        email: 'mismatch@acme.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      }),
    });
    assert(mismatchRes.status === 400, 'Mismatched confirm password rejected with HTTP 400');

    // ─── TEST 4: LOGIN & SESSIONS ───────────────────────────────────────────────
    console.log('\n[FEATURE 2] Login & Secure Session Handling:');

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'david.miller@acmecorp.com',
        password: 'SecurePassword123!',
      }),
    });
    const loginData = (await loginRes.json()) as any;

    assert(loginRes.status === 200, 'Login with valid credentials returns HTTP 200 OK');
    assert(loginData.data?.accessToken !== undefined, 'Access token issued');
    assert(loginData.data?.user?.email === 'david.miller@acmecorp.com', 'User record returned');

    const loginCookie = loginRes.headers.get('set-cookie');
    assert(
      loginCookie !== null && loginCookie.includes('HttpOnly'),
      'HTTP-only cookies set for session tokens'
    );

    const customerToken = loginData.data?.accessToken;

    // ─── TEST 5: INVALID CREDENTIALS ───────────────────────────────────────────
    console.log('\n[FEATURE 2] Invalid Credentials Handling:');

    const wrongPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'david.miller@acmecorp.com',
        password: 'WrongPassword999!',
      }),
    });
    assert(wrongPassRes.status === 401, 'Incorrect password returns HTTP 401 Unauthorized');

    const wrongEmailRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@acmecorp.com',
        password: 'SecurePassword123!',
      }),
    });
    const wrongEmailData = (await wrongEmailRes.json()) as any;
    assert(wrongEmailRes.status === 401, 'Non-existent email returns generic HTTP 401');
    assert(
      wrongEmailData.message === 'Invalid email or password',
      'Does not leak whether email exists'
    );

    // ─── TEST 6: LOGOUT ────────────────────────────────────────────────────────
    console.log('\n[FEATURE 2] User Logout:');

    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });
    const logoutData = (await logoutRes.json()) as any;

    assert(logoutRes.status === 200, 'Logout returns HTTP 200 OK');
    assert(logoutData.success === true, 'Logout success confirmed');

    // ─── TEST 7: PASSWORD RESET FLOW ───────────────────────────────────────────
    console.log('\n[FEATURE 3] Password Reset Flow:');

    // 1. Forgot password request (existing email)
    const forgotRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'david.miller@acmecorp.com' }),
    });
    const forgotData = (await forgotRes.json()) as any;

    assert(forgotRes.status === 200, 'Forgot password returns HTTP 200 OK');
    assert(
      forgotData.message.includes('If the account exists'),
      'Neutral message returned without exposing user existence'
    );

    // 2. Forgot password request (non-existent email)
    const forgotFakeRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost@nowhere.com' }),
    });
    const forgotFakeData = (await forgotFakeRes.json()) as any;
    assert(forgotFakeRes.status === 200, 'Non-existent email returns HTTP 200 OK');
    assert(
      forgotFakeData.message === forgotData.message,
      'Same message returned for non-existent email (no enumeration)'
    );

    // Verify reset token was captured by simulated email service
    const resetToken = emailService.lastSentEmail?.token || forgotData.data?.simulatedToken;
    assert(!!resetToken, 'Secure reset token generated and sent to email service');

    // 3. Reset password using valid token
    const resetRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: 'NewSecurePassword456!',
        confirmPassword: 'NewSecurePassword456!',
      }),
    });
    const resetData = (await resetRes.json()) as any;

    assert(resetRes.status === 200, 'Password reset returns HTTP 200 OK', resetData);

    // 4. Token invalidation after use
    const reUseTokenRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: 'AnotherPassword789!',
        confirmPassword: 'AnotherPassword789!',
      }),
    });
    assert(reUseTokenRes.status === 400, 'Re-using reset token rejected with HTTP 400 Bad Request');

    // 5. Verify login with new password works
    const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'david.miller@acmecorp.com',
        password: 'NewSecurePassword456!',
      }),
    });
    assert(newLoginRes.status === 200, 'Login with newly reset password succeeds');

    // ─── TEST 8: ADMIN-ONLY STAFF MANAGEMENT ────────────────────────────────────
    console.log('\n[FEATURE 4 & 5] Role-Based Access & Staff Management:');

    // Create an Admin user directly in DB
    const adminPassHash = await bcrypt.hash('AdminSecret123!', 12);
    const adminUser = await User.create({
      name: 'Alexander Wright',
      email: 'admin@subscriptions.io',
      passwordHash: adminPassHash,
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
    });

    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@subscriptions.io',
        password: 'AdminSecret123!',
      }),
    });
    const adminLoginData = (await adminLoginRes.json()) as any;
    const adminToken = adminLoginData.data?.accessToken;

    // Customer re-login for token
    const customerLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'david.miller@acmecorp.com',
        password: 'NewSecurePassword456!',
      }),
    });
    const customerLoginData = (await customerLoginRes.json()) as any;
    const activeCustomerToken = customerLoginData.data?.accessToken;

    // 1. Unauthenticated staff creation -> 401
    const unauthStaffRes = await fetch(`${baseUrl}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Staff',
        email: 'sarah@subscriptions.io',
        password: 'StaffPassword123!',
        confirmPassword: 'StaffPassword123!',
      }),
    });
    assert(unauthStaffRes.status === 401, 'Unauthenticated staff creation blocked with 401');

    // 2. Customer staff creation -> 403 Forbidden
    const customerStaffRes = await fetch(`${baseUrl}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeCustomerToken}`,
      },
      body: JSON.stringify({
        name: 'Sarah Staff',
        email: 'sarah@subscriptions.io',
        password: 'StaffPassword123!',
        confirmPassword: 'StaffPassword123!',
      }),
    });
    assert(customerStaffRes.status === 403, 'Customer staff creation blocked with 403 Forbidden');

    // 3. Admin staff creation -> 201 Created
    const adminStaffRes = await fetch(`${baseUrl}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@subscriptions.io',
        phone: '+1-555-0144',
        password: 'StaffPassword123!',
        confirmPassword: 'StaffPassword123!',
      }),
    });
    const adminStaffData = (await adminStaffRes.json()) as any;

    assert(adminStaffRes.status === 201, 'Admin staff creation succeeds with HTTP 201 Created');
    assert(adminStaffData.data?.role === 'staff', 'Created user has staff role');
    const createdStaffId = adminStaffData.data?._id || adminStaffData.data?.id;

    // 4. Staff cannot create another staff -> 403
    const staffLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.jenkins@subscriptions.io',
        password: 'StaffPassword123!',
      }),
    });
    const staffLoginData = (await staffLoginRes.json()) as any;
    const staffToken = staffLoginData.data?.accessToken;

    const staffCreateStaffRes = await fetch(`${baseUrl}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        name: 'Another Staff',
        email: 'another@subscriptions.io',
        password: 'StaffPassword123!',
      }),
    });
    assert(staffCreateStaffRes.status === 403, 'Staff cannot create staff accounts (403 Forbidden)');

    // 5. Admin updates staff details
    const updateStaffRes = await fetch(`${baseUrl}/staff/${createdStaffId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Sarah Jenkins-Smith',
        phone: '+1-555-9999',
      }),
    });
    const updateStaffData = (await updateStaffRes.json()) as any;
    assert(updateStaffRes.status === 200, 'Admin updates staff details');
    assert(updateStaffData.data?.name === 'Sarah Jenkins-Smith', 'Staff name successfully updated');

    // 6. Admin deactivates / suspends staff account
    const suspendStaffRes = await fetch(`${baseUrl}/staff/${createdStaffId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'suspended' }),
    });
    assert(suspendStaffRes.status === 200, 'Admin suspends staff account');

    // 7. Suspended staff login attempt
    const suspendedLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.jenkins@subscriptions.io',
        password: 'StaffPassword123!',
      }),
    });
    assert(
      suspendedLoginRes.status === 403,
      'Suspended staff login blocked with HTTP 403 Forbidden'
    );

    // ─── TEST 9: UNAUTHORIZED ACCESS ───────────────────────────────────────────
    console.log('\n[FEATURE 7] Unauthorized Access Protection:');

    const noAuthMeRes = await fetch(`${baseUrl}/auth/me`);
    assert(noAuthMeRes.status === 401, 'Protected route /api/auth/me without token returns 401');

    const fakeTokenMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer totally.fake.jwt.token' },
    });
    assert(fakeTokenMeRes.status === 401, 'Protected route with forged token returns 401');

    // ─── TEST 10: CUSTOMER DATA ISOLATION ──────────────────────────────────────
    console.log('\n[FEATURE 7] Customer Data Isolation:');

    // Create a second customer B
    const custBPassHash = await bcrypt.hash('CustomerBPass123!', 12);
    const userB = await User.create({
      name: 'Customer Bob',
      email: 'bob@partner.org',
      passwordHash: custBPassHash,
      role: 'customer',
      status: 'active',
      isEmailVerified: true,
    });
    const customerB = await Customer.create({
      user: userB._id,
      customerNumber: 'CUST-2026-9999',
      companyName: 'Bob Partner Org',
      billingAddress: {
        street: '200 Other St',
        city: 'Austin',
        state: 'TX',
        country: 'US',
        postalCode: '78701',
      },
      currency: 'USD',
      status: 'active',
    });

    // Customer A calls /customer/profile with their own token -> gets their own profile
    const custAProfileRes = await fetch(`${baseUrl}/customer/profile`, {
      headers: { Authorization: `Bearer ${activeCustomerToken}` },
    });
    const custAProfileData = (await custAProfileRes.json()) as any;

    assert(custAProfileRes.status === 200, 'Customer A accesses own profile');
    assert(
      custAProfileData.data?.user?.email === 'david.miller@acmecorp.com',
      'Returned profile belongs to authenticated Customer A'
    );
    assert(
      custAProfileData.data?.user?.email !== userB.email,
      'Customer A cannot view Customer B profile (isolated)'
    );

    console.log('\n======================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db.stop();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTestSuite();

