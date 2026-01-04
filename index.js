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
    const result = await pool.query("SELECT * FROM Theses ORDER BY Year DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
});

app.post("/api/theses", async (req, res) => {
  try {
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
    res.status(500).send(err.message);
  }
});

app.delete("/api/theses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Theses WHERE ThesisNo = $1", [id]);
    res.json("Tez silindi!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Silme başarısız.");
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { 
      title, authorId, typeId, instituteId, universityId, 
      languageId, supervisorId, thesisNo,
      yearStart, yearEnd, abstract 
    } = req.query;

    let queryText = `
      SELECT t.*, 
             p.FirstName as AuthorName, p.LastName as AuthorSurname, 
             i.InstituteName, u.UniversityName,
             l.LanguageName, typ.TypeName
      FROM Theses t
      JOIN People p ON t.AuthorID = p.PersonID
      JOIN Institutes i ON t.InstituteID = i.InstituteID
      JOIN Universities u ON i.UniversityID = u.UniversityID
      JOIN Languages l ON t.LanguageID = l.LanguageID
      JOIN ThesisTypes typ ON t.TypeID = typ.TypeID
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (thesisNo) {
      queryText += ` AND t.ThesisNo = $${paramIndex}`;
      queryParams.push(thesisNo);
      paramIndex++;
    }
    if (title) {
      queryText += ` AND t.Title ILIKE $${paramIndex}`;
      queryParams.push(`%${title}%`);
      paramIndex++;
    }
    if (abstract) {
      queryText += ` AND t.Abstract ILIKE $${paramIndex}`;
      queryParams.push(`%${abstract}%`);
      paramIndex++;
    }
    if (yearStart) {
      queryText += ` AND t.Year >= $${paramIndex}`;
      queryParams.push(yearStart);
      paramIndex++;
    }
    if (yearEnd) {
      queryText += ` AND t.Year <= $${paramIndex}`;
      queryParams.push(yearEnd);
      paramIndex++;
    }
    if (authorId) { queryText += ` AND t.AuthorID = $${paramIndex}`; queryParams.push(authorId); paramIndex++; }
    if (supervisorId) { queryText += ` AND t.SupervisorID = $${paramIndex}`; queryParams.push(supervisorId); paramIndex++; }
    if (typeId) { queryText += ` AND t.TypeID = $${paramIndex}`; queryParams.push(typeId); paramIndex++; }
    if (languageId) { queryText += ` AND t.LanguageID = $${paramIndex}`; queryParams.push(languageId); paramIndex++; }
    if (instituteId) { queryText += ` AND t.InstituteID = $${paramIndex}`; queryParams.push(instituteId); paramIndex++; }
    if (universityId) { queryText += ` AND u.UniversityID = $${paramIndex}`; queryParams.push(universityId); paramIndex++; }

    queryText += ` ORDER BY t.Year DESC`;

    const results = await pool.query(queryText, queryParams);
    res.json(results.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Arama Hatası");
  }
});

app.get("/api/people", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM People ORDER BY FirstName ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

app.post("/api/people", async (req, res) => {
    try {
        const { firstName, lastName, title, email } = req.body;
        const newPerson = await pool.query("INSERT INTO People (FirstName, LastName, Title, Email) VALUES($1, $2, $3, $4) RETURNING *", [firstName, lastName, title, email]);
        res.json(newPerson.rows[0]);
    } catch (err) { res.status(500).json(err); }
});

app.put("/api/people/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, title, email } = req.body;
        await pool.query("UPDATE People SET FirstName = $1, LastName = $2, Title = $3, Email = $4 WHERE PersonID = $5", [firstName, lastName, title, email, id]);
        res.json("Person updated");
    } catch (err) { res.status(500).json(err); }
});

app.delete("/api/people/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM People WHERE PersonID = $1", [id]);
        res.json("Person deleted");
    } catch (err) { res.status(500).json(err); }
});

app.get("/api/institutes", async (req, res) => {
  try {
    const allInstitutes = await pool.query("SELECT * FROM Institutes ORDER BY InstituteName ASC");
    res.json(allInstitutes.rows);
  } catch (err) { console.error(err.message); }
});

app.post("/api/institutes", async (req, res) => {
  try {
    const { InstituteName, UniversityID } = req.body;
    const newInstitute = await pool.query("INSERT INTO Institutes (InstituteName, UniversityID) VALUES($1, $2) RETURNING *", [InstituteName, UniversityID]);
    res.json(newInstitute.rows[0]);
  } catch (err) { console.error(err.message); }
});

app.put("/api/institutes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { InstituteName, UniversityID } = req.body;
    await pool.query("UPDATE Institutes SET InstituteName = $1, UniversityID = $2 WHERE InstituteID = $3", [InstituteName, UniversityID, id]);
    res.json("Institute updated");
  } catch (err) { console.error(err.message); }
});

app.delete("/api/institutes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Institutes WHERE InstituteID = $1", [id]);
    res.json("Institute deleted");
  } catch (err) { console.error(err.message); }
});

app.get("/api/universities", async (req, res) => {
  try {
    const allUniversities = await pool.query("SELECT * FROM Universities ORDER BY UniversityName ASC");
    res.json(allUniversities.rows);
  } catch (err) { console.error(err.message); }
});

app.post("/api/universities", async (req, res) => {
  try {
    const { UniversityName } = req.body;
    const newUniversity = await pool.query("INSERT INTO Universities (UniversityName) VALUES($1) RETURNING *", [UniversityName]);
    res.json(newUniversity.rows[0]);
  } catch (err) { console.error(err.message); }
});

app.put("/api/universities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { UniversityName } = req.body;
    await pool.query("UPDATE Universities SET UniversityName = $1 WHERE UniversityID = $2", [UniversityName, id]);
    res.json("University updated");
  } catch (err) { console.error(err.message); }
});

app.delete("/api/universities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Universities WHERE UniversityID = $1", [id]);
    res.json("University deleted");
  } catch (err) { console.error(err.message); }
});

app.get("/api/languages", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Languages ORDER BY LanguageName ASC");
    res.json(result.rows);
  } catch (err) { console.error(err.message); }
});

app.post("/api/languages", async (req, res) => {
  try {
    const { LanguageName } = req.body;
    const newLang = await pool.query("INSERT INTO Languages (LanguageName) VALUES($1) RETURNING *", [LanguageName]);
    res.json(newLang.rows[0]);
  } catch (err) { console.error(err.message); }
});

app.put("/api/languages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { LanguageName } = req.body;
    await pool.query("UPDATE Languages SET LanguageName = $1 WHERE LanguageID = $2", [LanguageName, id]);
    res.json("Language updated");
  } catch (err) { console.error(err.message); }
});

app.delete("/api/languages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Languages WHERE LanguageID = $1", [id]);
    res.json("Language deleted");
  } catch (err) { console.error(err.message); }
});

app.get("/api/types", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ThesisTypes ORDER BY TypeName ASC");
    res.json(result.rows);
  } catch (err) { console.error(err.message); }
});

app.post("/api/types", async (req, res) => {
  try {
    const { TypeName } = req.body;
    const newType = await pool.query("INSERT INTO ThesisTypes (TypeName) VALUES($1) RETURNING *", [TypeName]);
    res.json(newType.rows[0]);
  } catch (err) { console.error(err.message); }
});

app.put("/api/types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { TypeName } = req.body;
    await pool.query("UPDATE ThesisTypes SET TypeName = $1 WHERE TypeID = $2", [TypeName, id]);
    res.json("Type updated");
  } catch (err) { console.error(err.message); }
});

app.delete("/api/types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ThesisTypes WHERE TypeID = $1", [id]);
    res.json("Type deleted");
  } catch (err) { console.error(err.message); }
});

app.get("/api/topics", async (req, res) => {
  try {
    const allTopics = await pool.query("SELECT * FROM SubjectTopics ORDER BY TopicName ASC");
    res.json(allTopics.rows);
  } catch (err) { console.error(err.message); }
});

app.post("/api/topics", async (req, res) => {
  try {
    const { TopicName } = req.body;
    const newTopic = await pool.query("INSERT INTO SubjectTopics (TopicName) VALUES($1) RETURNING *", [TopicName]);
    res.json(newTopic.rows[0]);
  } catch (err) { console.error(err.message); }
});

app.put("/api/topics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { TopicName } = req.body;
    await pool.query("UPDATE SubjectTopics SET TopicName = $1 WHERE TopicID = $2", [TopicName, id]);
    res.json("Topic updated");
  } catch (err) { console.error(err.message); }
});

app.delete("/api/topics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM SubjectTopics WHERE TopicID = $1", [id]);
    res.json("Topic deleted");
  } catch (err) { console.error(err.message); }
});

app.get("/api/keywords", async (req, res) => {
  try {
    const allKeywords = await pool.query("SELECT * FROM Keywords ORDER BY KeywordName ASC");
    res.json(allKeywords.rows);
  } catch (err) { console.error(err.message); }
});

app.post("/api/keywords", async (req, res) => {
  try {
    const { KeywordName } = req.body;
    const newKeyword = await pool.query("INSERT INTO Keywords (KeywordName) VALUES($1) RETURNING *", [KeywordName]);
    res.json(newKeyword.rows[0]);
  } catch (err) { console.error(err.message); }
});

app.put("/api/keywords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { KeywordName } = req.body;
    await pool.query("UPDATE Keywords SET KeywordName = $1 WHERE KeywordID = $2", [KeywordName, id]);
    res.json("Keyword updated");
  } catch (err) { console.error(err.message); }
});

app.delete("/api/keywords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Keywords WHERE KeywordID = $1", [id]);
    res.json("Keyword deleted");
  } catch (err) { console.error(err.message); }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});