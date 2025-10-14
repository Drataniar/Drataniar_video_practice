
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./mariaDb');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(cors({
	origin: true,
	credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false } // 개발환경에서는 false, 배포시 https면 true
}));

app.post('/login', async (req, res) => {
	const { id, password } = req.body;
	try {
		const rows = await db.query('SELECT id, master, name FROM user_info WHERE id = ? AND password = ?', [id, password]);
		if (rows.length > 0) {
			req.session.userId = rows[0].id; // 세션에 아이디 저장
			req.session.userName = rows[0].name; // 세션에 이름 저장
            req.session.isMaster = rows[0].master; // 마스터 여부 저장
            console.log(req.session);
			res.json({ success: true });
		} else {
			res.json({ success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
		}
	} catch (err) {
		res.status(500).json({ success: false, message: '서버 오류', error: err.message });
	}
});

// 로그아웃 라우트
app.post('/logout', (req, res) => {
	req.session.destroy(err => {
		if (err) {
			return res.status(500).json({ success: false, message: '로그아웃 실패' });
		}
		res.clearCookie('connect.sid');
		res.json({ success: true });
        res.sendFile(path.join(__dirname, 'index.html'));
	});
});

app.get('/video/list', async (req, res) => {
        try {
        const sql = 'SELECT title, id, miniid, date, info FROM video';
        const results = await db.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'DB 오류', err });
    }
});

app.get('/video2/list', async (req, res) => {
        try {
        const sql = 'SELECT title, id, miniid, date FROM video2';
        const results = await db.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'DB 오류', err });
    }
});


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/home.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/main.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/qaPage/qaPage.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'qaPage/qaPage.html'));
});

//master인지 확인
app.get('/getSessionInfo', (req, res) => {
    res.json({ isMaster: req.session.isMaster, userId: req.session.userId, userName: req.session.userName });
});

app.get('/chatUser', async(req, res) => {
	try {
        let targetMaster = req.session.isMaster === 1 ? 0 : 1;
        const names = await db.query('SELECT name, id FROM user_info WHERE master = ?', [targetMaster]);
        res.json({ names });

    } catch (err) {
        res.status(500).json({ error: 'DB 오류', err });
    }
});

app.post('/startChat',async(req,res)=>{
	const { fromId, toId } = req.body;
    try {
        const sql = `
            SELECT * 
            FROM qaTable
            WHERE (fromId = ? AND toId = ?)
            OR (fromId = ? AND toId = ?)
			ORDER BY time ASC, id ASC
        `;
        const results = await db.query(sql, [fromId, toId, toId, fromId]);
        res.json({ chats: results });
    } catch (err) {
        res.status(500).json({ error: 'DB 오류', err });
    }
});


app.post('/sendMessage', async (req, res) => {
	const {toId, content} = req.body;	
    if (!toId || !content) {
        return res.status(400).json({ success: false, message: '필수 정보 누락' });
    }
    try {
        const sql = `
            INSERT INTO qaTable (fromId, toId, content, time)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `;
        await db.query(sql, [req.session.userId, toId, content]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
    }

});

app.get('/signVideo/list', async (req, res) => {
        try {
        const sql = 'SELECT title, id, num FROM signVideo ORDER BY num ASC';
        const results = await db.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'DB 오류', err });
    }
});

app.post('/changePassword', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.userId;
    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: '필수 정보 누락' });
    }
    try {
        // 비밀번호 변경 로직
        const sql = 'UPDATE user_info SET password = ? WHERE id = ? AND password = ?';
        await db.query(sql, [newPassword, userId, oldPassword]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
    }
});

app.listen(PORT);
