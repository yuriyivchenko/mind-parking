// name project parking-for-mind-v1
//npm init -y
//npm install express nodemon
//     nodemon server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadIdeasFromFile() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]', 'utf8');
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8').trim();
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Помилка читання data.json:', err);
        return [];
    }
}

function saveIdeasToFile(ideas) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(ideas, null, 2), 'utf8');
    } catch (err) {
        console.error('Помилка запису data.json:', err);
    }
}

// ВАЖЛИВО:
// на GET читаємо файл заново, а не старий масив з пам'яті
app.get('/api/ideas', (req, res) => {
    const ideas = loadIdeasFromFile();
    res.json(ideas);
});

app.post('/api/ideas', (req, res) => {
    const ideas = loadIdeasFromFile();

    const text = (req.body.text || '').trim();
    if (!text) {
        return res.status(400).json({ error: 'Порожній текст думки' });
    }

    const idea = {
        id: Date.now(),
        text,
        status: 'parked',
        date: new Date().toISOString()
    };

    ideas.push(idea);
    saveIdeasToFile(ideas);

    res.status(201).json(idea);
});

app.put('/api/ideas/:id', (req, res) => {
    const ideas = loadIdeasFromFile();
    const id = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ['parked', 'processing', 'done'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Невірний статус' });
    }

    const idea = ideas.find(item => item.id === id);

    if (!idea) {
        return res.status(404).json({ error: 'Не знайдено' });
    }

    idea.status = status;
    saveIdeasToFile(ideas);

    res.json(idea);
});

app.delete('/api/ideas/:id', (req, res) => {
    const ideas = loadIdeasFromFile();
    const id = Number(req.params.id);

    const filtered = ideas.filter(item => item.id !== id);
    saveIdeasToFile(filtered);

    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});