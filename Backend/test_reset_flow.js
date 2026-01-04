const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api/users';
const email = `test_${Date.now()}@example.com`;
const password = 'password123';
const newPassword = 'newpassword456';

async function testFlow() {
    console.log(`\n🔹 Testing Forget Password Flow for: ${email}`);

    // 1. Register User
    console.log('\n1️⃣ Registering User...');
    const registerRes = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email, password })
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) {
        console.error('❌ Register failed:', registerData);
        return;
    }
    console.log('✅ Registered:', registerData.user.email);

    // 2. Request Password Reset
    console.log('\n2️⃣ Requesting Password Reset...');
    const forgotRes = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const forgotData = await forgotRes.json();
    if (!forgotRes.ok) {
        console.error('❌ Forgot Password failed:', forgotData);
        return;
    }
    console.log('✅ Request successful');
    console.log('🔑 Dev Token:', forgotData.dev_token);

    if (!forgotData.dev_token) {
        console.error('❌ No dev token received. Development mode might be off or not implemented in controller.');
        return;
    }

    // 3. Reset Password
    console.log('\n3️⃣ Resetting Password...');
    const resetRes = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: forgotData.dev_token, newPassword })
    });
    const resetData = await resetRes.json();
    if (!resetRes.ok) {
        console.error('❌ Reset Password failed:', resetData);
        return;
    }
    console.log('✅ Password Reset successful:', resetData.message);

    // 4. Login with OLD Password (Should Fail)
    console.log('\n4️⃣ Attempting Login with OLD Password (Should Fail)...');
    const failLoginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (failLoginRes.status === 401 || failLoginRes.status === 400) {
        console.log('✅ Old password rejected as expected.');
    } else {
        console.error('❌ Login with old password succeeded unexpectedly!', await failLoginRes.json());
    }

    // 5. Login with NEW Password (Should Success)
    console.log('\n5️⃣ Attempting Login with NEW Password...');
    const successLoginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword })
    });
    const successLoginData = await successLoginRes.json();
    if (successLoginRes.ok) {
        console.log('✅ Login with new password successful!');
        console.log('👤 User:', successLoginData.user.name);
    } else {
        console.error('❌ Login with new password failed:', successLoginData);
    }
}

testFlow().catch(console.error);
