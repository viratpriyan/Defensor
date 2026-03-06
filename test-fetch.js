fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: "Bob", email: "bob@bob.com", phone: "1234567890", password: "password" })
}).then(res => res.json()).then(console.log).catch(console.error);
