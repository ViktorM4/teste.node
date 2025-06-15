const express = require ('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');


const app = express();
const PORT = 3000;
const JWT_SECRET = 'hoQxyk-jurgoz-5fefre';

app.use(bodyParser.json());

const dbPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'auth_api_db',
    waitForConnections: true,
});

app.get('/', (req, res) =>{
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Autenticação com Node.js</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; }
                .form-container {
                    background-color: white;
                    border-radius: 0.75rem;
                    padding: 2rem;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    margin-bottom: 2rem;
                }
            </style>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="w-full max-w-lg mx-auto p-4">
                <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Teste da API de Autenticação</h1>

                <!-- Formulário de Registro -->
                <div class="form-container">
                    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Registrar Novo Usuário</h2>
                    <form id="registerForm">
                        <div class="mb-4">
                            <label for="regUsername" class="block text-gray-700 text-sm font-bold mb-2">Usuário:</label>
                            <input type="text" id="regUsername" name="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        <div class="mb-6">
                            <label for="regPassword" class="block text-gray-700 text-sm font-bold mb-2">Senha:</label>
                            <input type="password" id="regPassword" name="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">Registrar</button>
                    </form>
                </div>

                <!-- Formulário de Login -->
                <div class="form-container">
                    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Fazer Login</h2>
                    <form id="loginForm">
                        <div class="mb-4">
                            <label for="loginUsername" class="block text-gray-700 text-sm font-bold mb-2">Usuário:</label>
                            <input type="text" id="loginUsername" name="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500" required>
                        </div>
                        <div class="mb-6">
                            <label for="loginPassword" class="block text-gray-700 text-sm font-bold mb-2">Senha:</label>
                            <input type="password" id="loginPassword" name="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500" required>
                        </div>
                        <button type="submit" class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">Login</button>
                    </form>
                </div>

                <!-- Teste da Rota Protegida -->
                 <div class="form-container">
                    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Testar Rota Protegida</h2>
                    <form id="profileForm">
                         <div class="mb-4">
                            <label for="jwtToken" class="block text-gray-700 text-sm font-bold mb-2">Seu Token JWT (obtido no login):</label>
                            <textarea id="jwtToken" name="token" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">Ver Perfil</button>
                    </form>
                </div>

                <!-- Área de Resultados -->
                <div id="result" class="mt-6 p-4 bg-gray-200 rounded-lg text-gray-800 whitespace-pre-wrap break-words">
                    Aguardando ação...
                </div>
            </div>

            <script>
                const registerForm = document.getElementById('registerForm');
                const loginForm = document.getElementById('loginForm');
                const profileForm = document.getElementById('profileForm');
                const resultDiv = document.getElementById('result');

                // Função genérica para requisições
                async function apiRequest(url, method, body, headers = {}) {
                    try {
                        const response = await fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json', ...headers },
                            body: JSON.stringify(body)
                        });
                        const data = await response.json();
                        resultDiv.textContent = JSON.stringify(data, null, 2);
                       
                        if(url.includes('/login') && response.ok && data.token) {
                            document.getElementById('jwtToken').value = data.token;
                        }
                    } catch (error) {
                        resultDiv.textContent = 'Erro na requisição: ' + error.message;
                    }
                }

                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const username = e.target.username.value;
                    const password = e.target.password.value;
                    apiRequest('/register', 'POST', { username, password });
                });

                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const username = e.target.username.value;
                    const password = e.target.password.value;
                    apiRequest('/login', 'POST', { username, password });
                });

                profileForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const token = e.target.token.value;
                    if (!token) {
                        resultDiv.textContent = 'Por favor, insira um token JWT.';
                        return;
                    }
    
                    try {
                        const response = await fetch('/profile', {
                            method: 'GET',
                            headers: {
                                'Authorization': \`Bearer \${token}\`
                            }
                        });
                        const data = await response.json();
                        resultDiv.textContent = JSON.stringify(data, null, 2);
                    } catch (error) {
                        resultDiv.textContent = 'Erro na requisição: ' + error.message;
                    }
                });
            </script>
        </body>
        </html>
    `);
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
        }
        const [existingUsers] = await dbPool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Este nome de usuário já está em uso.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await dbPool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: result.insertId });
    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ message: 'Ocorreu um erro no servidor.', error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await dbPool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }
        const tokenPayload = { id: user.id, username: user.username };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login bem-sucedido!', token: token });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Ocorreu um erro no servidor.', error: error.message });
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        req.user = user;
        next();
    });
}

app.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Bem-vindo ao seu perfil!',
        user: req.user
    });
});

app.listen(PORT, () => {});

