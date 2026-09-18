const Database = require('better-sqlite3');
const express = require('express');


// ===============================
// DATABASE
// ===============================

const db = new Database('mahsulotlar.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS mahsulotlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL,
        kategoriya TEXT NOT NULL,
        soni INTEGER NOT NULL,
        narxi INTEGER NOT NULL
    )
`);


// ===============================
// BOSHLANG‘ICH MAHSULOTLAR
// ===============================

const jamiMahsulot = db
    .prepare('SELECT COUNT(*) AS soni FROM mahsulotlar')
    .get();

if (jamiMahsulot.soni === 0) {

    const qoshish = db.prepare(`
        INSERT INTO mahsulotlar
        (nomi, kategoriya, soni, narxi)
        VALUES (?, ?, ?, ?)
    `);

    qoshish.run(
        'Arduino Uno',
        'Arduino',
        14,
        85000
    );

    qoshish.run(
        'HC-SR04',
        'Sensor',
        20,
        35000
    );

    qoshish.run(
        'Servo SG90',
        'Motor',
        15,
        30000
    );

    qoshish.run(
        'L298N',
        'Motor driver',
        10,
        45000
    );
}


// ===============================
// EXPRESS
// ===============================

const app = express();

app.use(express.json());
app.use(express.static('public'));


// ===============================
// BOSH SAHIFA
// ===============================

app.get('/', (req, res) => {

    res.send('Robototexnika ombori ishlayapti!');

});


// ===============================
// BARCHA MAHSULOTLAR
// GET /mahsulotlar
// ===============================

app.get('/mahsulotlar', (req, res) => {

    const mahsulotlar = db
        .prepare('SELECT * FROM mahsulotlar')
        .all();

    res.json(mahsulotlar);

});
// ===============================
// BITTA MAHSULOT
// GET /mahsulotlar/:id
// ===============================

app.get('/mahsulotlar/:id', (req, res) => {

    const id = Number(req.params.id);

    const mahsulot = db
        .prepare('SELECT * FROM mahsulotlar WHERE id = ?')
        .get(id);

    if (!mahsulot) {

        return res.status(404).json({
            xabar: 'Mahsulot topilmadi'
        });

    }

    res.json(mahsulot);

});


// ===============================
// YANGI MAHSULOT QO‘SHISH
// POST /mahsulotlar
// ===============================

app.post('/mahsulotlar', (req, res) => {

    const {
        nomi,
        kategoriya,
        soni,
        narxi
    } = req.body;


    const natija = db
        .prepare(`
            INSERT INTO mahsulotlar
            (nomi, kategoriya, soni, narxi)
            VALUES (?, ?, ?, ?)
        `)
        .run(
            nomi,
            kategoriya,
            soni,
            narxi
        );


    const yangiMahsulot = db
        .prepare('SELECT * FROM mahsulotlar WHERE id = ?')
        .get(natija.lastInsertRowid);


    res.status(201).json({

        xabar: "Mahsulot muvaffaqiyatli qo'shildi",

        mahsulot: yangiMahsulot

    });

});
// ===============================
// MAHSULOTNI O‘ZGARTIRISH
// PUT /mahsulotlar/:id
// ===============================

app.put('/mahsulotlar/:id', (req, res) => {

    const id = Number(req.params.id);

    const {
        nomi,
        kategoriya,
        soni,
        narxi
    } = req.body;


    const mavjud = db
        .prepare('SELECT * FROM mahsulotlar WHERE id = ?')
        .get(id);


    if (!mavjud) {

        return res.status(404).json({
            xabar: 'Mahsulot topilmadi'
        });

    }


    db.prepare(`
        UPDATE mahsulotlar
        SET
            nomi = ?,
            kategoriya = ?,
            soni = ?,
            narxi = ?
        WHERE id = ?
    `)
        .run(
            nomi,
            kategoriya,
            soni,
            narxi,
            id
        );


    const yangilangan = db
        .prepare('SELECT * FROM mahsulotlar WHERE id = ?')
        .get(id);


    res.json({

        xabar: "Mahsulot muvaffaqiyatli o'zgartirildi",

        mahsulot: yangilangan

    });

});


// ===============================
// MAHSULOTNI O‘CHIRISH
// DELETE /mahsulotlar/:id
// ===============================

app.delete('/mahsulotlar/:id', (req, res) => {

    const id = Number(req.params.id);


    const mahsulot = db
        .prepare('SELECT * FROM mahsulotlar WHERE id = ?')
        .get(id);


    if (!mahsulot) {

        return res.status(404).json({
            xabar: 'Mahsulot topilmadi'
        });

    }


    db.prepare(
        'DELETE FROM mahsulotlar WHERE id = ?'
    ).run(id);


    res.json({

        xabar: "Mahsulot muvaffaqiyatli o'chirildi",

        mahsulot: mahsulot

    });

});


// ===============================
// SERVER
// ===============================

app.listen(3000, () => {

    console.log('Server 3000-portda ishlamoqda');

});
