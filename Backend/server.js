const app = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
