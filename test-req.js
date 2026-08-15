const http = require('http');

async function run() {
    const res = await fetch('http://localhost:8180/realms/recruitment-erp/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'client_id=erp-frontend&grant_type=password&username=tenantadmin@acme.dev&password=admin123'
    });
    const data = await res.json();
    const token = data.access_token;
    
    const reqRes = await fetch('http://localhost:8082/api/v1/requisitions', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log("Req Status:", reqRes.status);
    console.log("Req Body:", await reqRes.text());
}
run().catch(console.error);
