const http = require('http');

async function run() {
    const res = await fetch('http://localhost:8180/realms/recruitment-erp/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'client_id=erp-frontend&grant_type=password&username=tenantadmin@acme.dev&password=admin123'
    });
    const data = await res.json();
    const token = data.access_token;
    console.log("Token length:", token ? token.length : 0);
    
    if (!token) {
        console.log("Failed to get token:", data);
        return;
    }

    const sumRes = await fetch('http://localhost:8085/api/v1/dashboard/summary?tenantId=tenant-acme', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log("Summary Status:", sumRes.status);
    console.log("Summary Body:", await sumRes.text());
    
    const actRes = await fetch('http://localhost:8085/api/v1/dashboard/activity', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log("Activity Status:", actRes.status);
    console.log("Activity Body:", await actRes.text());
}
run().catch(console.error);
