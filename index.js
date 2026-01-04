const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors()); 
app.use(express.json());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});


app.get("/", (req, res) => {
  res.send("GTS Backend Çalışıyor! 🚀");
});


app.get("/api/theses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Theses");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
});

// --- YENİ EKLENECEK KISIMLAR ---

// 1. YENİ TEZ EKLEME (POST)
app.post("/api/theses", async (req, res) => {
  try {
    // Frontend'den gelen verileri al
    const { thesisNo, title, abstract, year, pageNum, typeId, instituteId, authorId, supervisorId, languageId } = req.body;

    const query = `
      INSERT INTO Theses (ThesisNo, Title, Abstract, Year, PageNum, TypeID, InstituteID, AuthorID, SupervisorID, LanguageID)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [thesisNo, title, abstract, year, pageNum, typeId, instituteId, authorId, supervisorId, languageId];
    
    const newThesis = await pool.query(query, values);
    res.json(newThesis.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Tez eklenirken hata oluştu: " + err.message);
  }
});

// 2. TEZ SİLME (DELETE)
app.delete("/api/theses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Önce ilişkili tablolardan sil (CASCADE ayarlı ama garanti olsun)
    // Sonra ana tablodan sil
    await pool.query("DELETE FROM Theses WHERE ThesisNo = $1", [id]);
    res.json("Tez başarıyla silindi!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Silme işlemi başarısız.");
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});

// --- YARDIMCI LİSTELERİ GETİRME (DROPDOWN İÇİN) ---

// Yazarları ve Danışmanları Getir
app.get("/api/people", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM People ORDER BY FirstName ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// ==========================================
// --- UNIVERSITIES (ÜNİVERSİTELER) ---
// ==========================================

// 1. Tüm Üniversiteleri Getir
app.get("/api/universities", async (req, res) => {
  try {
    const allUniversities = await pool.query("SELECT * FROM Universities ORDER BY UniversityID ASC");
    res.json(allUniversities.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. Yeni Üniversite Ekle
app.post("/api/universities", async (req, res) => {
  try {
    const { UniversityName } = req.body;
    const newUniversity = await pool.query(
      "INSERT INTO Universities (UniversityName) VALUES($1) RETURNING *",
      [UniversityName]
    );
    res.json(newUniversity.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. Üniversite Güncelle
app.put("/api/universities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { UniversityName } = req.body;
    await pool.query(
      "UPDATE Universities SET UniversityName = $1 WHERE UniversityID = $2",
      [UniversityName, id]
    );
    res.json("University was updated!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. Üniversite Sil
app.delete("/api/universities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Önce bu üniversiteye bağlı enstitü var mı kontrol edilebilir ama şimdilik direkt siliyoruz.
    // Eğer Foreign Key hatası alırsan önce bağlı enstitüleri silmelisin.
    await pool.query("DELETE FROM Universities WHERE UniversityID = $1", [id]);
    res.json("University was deleted!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Enstitüleri Getir
app.get("/api/institutes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Institutes ORDER BY InstituteName ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// Dilleri Getir
app.get("/api/languages", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Languages");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// Tez Türlerini Getir
app.get("/api/types", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ThesisTypes");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// --- DETAYLI ARAMA ENDPOINT'İ (Filtreleme) ---
app.get("/api/search", async (req, res) => {
  try {
    // URL'den gelen filtreleri al (Örn: ?title=sql&year=2024)
    const { title, authorId, typeId, instituteId, year } = req.query;

    // Temel sorgumuz (Her zaman doğru olan 1=1 taktiği ile başlarız)
    let sqlQuery = `SELECT * FROM Theses WHERE 1=1`;
    const values = [];
    let paramCounter = 1; // $1, $2 sırasını takip etmek için

    // 1. Başlık Arıyor mu? (ILIKE ile büyük/küçük harf duyarsız arama)
    if (title) {
      sqlQuery += ` AND Title ILIKE $${paramCounter}`;
      values.push(`%${title}%`); // İçinde geçen kelimeyi bulur
      paramCounter++;
    }

    // 2. Yazar Seçmiş mi?
    if (authorId) {
      sqlQuery += ` AND AuthorID = $${paramCounter}`;
      values.push(authorId);
      paramCounter++;
    }

    // 3. Tür Seçmiş mi?
    if (typeId) {
      sqlQuery += ` AND TypeID = $${paramCounter}`;
      values.push(typeId);
      paramCounter++;
    }

    // 4. Enstitü Seçmiş mi?
    if (instituteId) {
      sqlQuery += ` AND InstituteID = $${paramCounter}`;
      values.push(instituteId);
      paramCounter++;
    }

    // 5. Yıl Girmiş mi?
    if (year) {
      sqlQuery += ` AND Year = $${paramCounter}`;
      values.push(year);
      paramCounter++;
    }

    // Sorguyu çalıştır
    const result = await pool.query(sqlQuery, values);
    res.json(result.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Arama hatası");
  }
});