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