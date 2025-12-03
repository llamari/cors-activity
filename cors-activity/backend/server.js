const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 8080;

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.get('/api/mensagem', (req, res) => {
    res.json({ data: 'Mensagem secreta da api em 8080! - COM PERMISSÃO CORS' });
});

app.listen(PORT, () => {
    console.log(`API backend rodando em http://localhost:${PORT}`);
    console.log('Agora permitindo requisições CORS de http://localhost:3000');
});