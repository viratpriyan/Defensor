const axios = require('axios');
const main = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: "Test User",
            email: "test@test.com",
            phone: "0000000000",
            password: "password123"
        });
        console.log("SUCCESS:", response.data);
    } catch (e) {
        console.log("ERROR:", e.response ? e.response.data : e.message);
    }
};
main();
