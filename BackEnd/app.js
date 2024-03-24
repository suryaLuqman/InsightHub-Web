require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const artikelRoutes = require('./routes/artikel.routes');
const kategoriRoutes = require('./routes/kategori.routes');
const { serverError, notFound } = require('./middleware/error.handling');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1', require('./routes/index.routes'));
// Gunakan artikel routes
app.use(artikelRoutes);
app.use(kategoriRoutes);
app.use(notFound);
app.use(serverError);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
