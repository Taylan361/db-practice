import { useEffect, useState } from "react";
import { getTheses, addThesis, deleteThesis, getPeople, getInstitutes, getLanguages, getTypes, searchTheses, addPerson } from "./api";
import { Container, Table, Button, Form, Row, Col, Alert, Spinner, Card, Modal, Badge } from "react-bootstrap";
import "./App.css";

function App() {

  // --- STATE'LER ---
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Modallar için State'ler
  const [showAddThesisModal, setShowAddThesisModal] = useState(false); // YENİ: Tez Ekleme Penceresi
  const [showPersonModal, setShowPersonModal] = useState(false); // Kişi Ekleme Penceresi
  const [showDetailModal, setShowDetailModal] = useState(false); // Detay Penceresi

  // Veri State'leri
  const [newPerson, setNewPerson] = useState({ firstName: "", lastName: "", title: "Student", email: "" });
  const [theses, setTheses] = useState([]);
  const [people, setPeople] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [types, setTypes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  
  const [searchParams, setSearchParams] = useState({
    title: "", authorId: "", typeId: "", instituteId: "", year: ""
  });

  const [formData, setFormData] = useState({
    thesisNo: "", title: "", abstract: "", year: new Date().getFullYear(),
    pageNum: "", typeId: "", instituteId: "", authorId: "", supervisorId: "", languageId: ""
  });

  // --- BİLDİRİM GÖSTERME ---
  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3500);
  };

  // --- VERİLERİ YÜKLE ---
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [thesesRes, peopleRes, instRes, langRes, typeRes] = await Promise.all([
          getTheses(), getPeople(), getInstitutes(), getLanguages(), getTypes()
        ]);
        
        setTheses(thesesRes.data);
        setPeople(peopleRes.data);
        setInstitutes(instRes.data);
        setLanguages(langRes.data);
        setTypes(typeRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // --- INPUT HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  // --- ARAMA ---
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSearchActive(true);
    try {
      const res = await searchTheses(searchParams);
      setTheses(res.data);
      setLoading(false);
      if(res.data.length > 0) showToast(`${res.data.length} adet tez bulundu.`);
    } catch (err) {
      console.error("Arama hatası:", err);
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchParams({ title: "", authorId: "", typeId: "", instituteId: "", year: "" });
    setIsSearchActive(false);
    setLoading(true);
    const res = await getTheses();
    setTheses(res.data);
    setLoading(false);
  };

  // --- TEZ EKLEME ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addThesis(formData);
      showToast("✅ Tez Başarıyla Eklendi!");
      
      const res = await getTheses(); 
      setTheses(res.data);
      
      // Formu sıfırla ve pencereyi kapat
      e.target.reset();
      setFormData({
        thesisNo: "", title: "", abstract: "", year: new Date().getFullYear(),
        pageNum: "", typeId: "", instituteId: "", authorId: "", supervisorId: "", languageId: ""
      });
      setShowAddThesisModal(false); // Modalı kapat
      
    } catch (err) {
      alert("Ekleme Hatası: " + err.message);
    }
  };

  // --- SİLME ---
  const handleDelete = async (id) => {
    if (window.confirm("Bu tezi silmek istediğinize emin misiniz?")) {
      try {
        await deleteThesis(id);
        const res = await getTheses();
        setTheses(res.data);
        showToast("🗑️ Tez silindi.");
      } catch (err) {
        alert("Silme hatası oluştu.");
      }
    }
  };

  // --- KİŞİ EKLEME ---
  const handleAddPerson = async () => {
    try {
      await addPerson(newPerson);
      showToast(`👤 ${newPerson.firstName} başarıyla eklendi!`);
      setShowPersonModal(false);
      setNewPerson({ firstName: "", lastName: "", title: "Student", email: "" });
      
      // Listeyi güncelle
      const peopleRes = await getPeople();
      setPeople(peopleRes.data);
    } catch (err) {
      alert("Kişi eklenemedi: " + err.message);
    }
  };

  const handleShowDetail = (thesis) => {
    setSelectedThesis(thesis);
    setShowDetailModal(true);
  };

  return (
    <Container className="mt-5 mb-5">
      
      {/* --- CUSTOM TOAST BİLDİRİM --- */}
      {showNotification && (
        <div className="custom-toast-container">
          <div className="custom-toast">
            <div className="toast-icon">✔</div>
            <div className="toast-message">{notificationMessage}</div>
          </div>
        </div>
      )}

      <h2 className="text-center mb-4 fw-bold">GTS - YÖK Lisansüstü Tez Sistemi</h2>

      {/* --- ARAMA PANELİ --- */}
      <Card className="mb-4 p-4 shadow-sm border-0" style={{borderTop: "4px solid var(--yok-blue)"}}>
        <h5 className="mb-3">🔍 Detaylı Tez Arama</h5>
        <Form onSubmit={handleSearchSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Control type="text" name="title" placeholder="Kelime Ara (Başlık veya Özet)..." value={searchParams.title} onChange={handleSearchChange} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Select name="authorId" value={searchParams.authorId} onChange={handleSearchChange}>
                <option value="">Tüm Yazarlar</option>
                {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select name="typeId" value={searchParams.typeId} onChange={handleSearchChange}>
                <option value="">Tüm Türler</option>
                {types.map(t => (<option key={t.typeid} value={t.typeid}>{t.typename}</option>))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Control type="number" name="year" placeholder="Yıl" value={searchParams.year} onChange={handleSearchChange} />
            </Col>
          </Row>
          <div className="d-flex justify-content-end mt-2 gap-2">
            <Button variant="secondary" onClick={handleClearSearch}>Temizle</Button>
            <Button variant="primary" type="submit">🔍 Ara</Button>
          </div>
        </Form>
      </Card>

      {/* --- ARAMA SONUÇ UYARISI --- */}
      {isSearchActive && (
        <Alert variant="info" className="d-flex justify-content-between align-items-center shadow-sm mb-4">
          <span><strong>Sonuçlar:</strong> {theses.length} tez bulundu.</span>
          <Button variant="outline-info" size="sm" onClick={handleClearSearch}>Listeyi Sıfırla</Button>
        </Alert>
      )}

      {/* --- TEZ LİSTESİ VE EKLEME BUTONU --- */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white p-3 border-bottom-0 d-flex justify-content-between align-items-center">
            <h5 className="m-0 fw-bold text-secondary">📚 Tez Listesi</h5>
            
            {/* İŞTE O YENİ BUTON: FORMU AÇAR */}
            <Button variant="success" size="lg" className="shadow-sm" onClick={() => setShowAddThesisModal(true)}>
              <span style={{marginRight: "8px", fontSize: "1.2rem"}}>+</span> Yeni Tez Ekle
            </Button>
        </Card.Header>

        {loading ? (
           <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
            <Table hover responsive className="m-0 align-middle">
            <thead className="table-dark">
                <tr>
                <th>No</th>
                <th>Başlık</th>
                <th>Yıl</th>
                <th>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                {theses.map((thesis) => (
                <tr key={thesis.thesisno}>
                    <td><Badge bg="secondary">{thesis.thesisno}</Badge></td>
                    <td className="fw-bold text-dark">{thesis.title}</td>
                    <td>{thesis.year}</td>
                    <td>
                    <Button variant="info" size="sm" className="me-2 text-white" onClick={() => handleShowDetail(thesis)}>Detay</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(thesis.thesisno)}>Sil</Button>
                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        )}
      </Card>

      {/* --- MODAL 1: YENİ TEZ EKLEME --- */}
      <Modal show={showAddThesisModal} onHide={() => setShowAddThesisModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-success fw-bold">📝 Yeni Tez Girişi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {/* Formu Buraya Taşıdık */}
            <div className="d-flex justify-content-end mb-3">
                 <Button variant="outline-primary" size="sm" onClick={() => setShowPersonModal(true)}>
                    + Listede Yoksa Yeni Kişi Ekle
                 </Button>
            </div>
            
            <Form onSubmit={handleSubmit}>
            <Row>
                <Col md={2}>
                <Form.Group className="mb-3">
                    <Form.Label>Tez No</Form.Label>
                    <Form.Control type="number" name="thesisNo" onChange={handleChange} required />
                </Form.Group>
                </Col>
                <Col md={8}>
                <Form.Group className="mb-3">
                    <Form.Label>Başlık</Form.Label>
                    <Form.Control type="text" name="title" onChange={handleChange} required />
                </Form.Group>
                </Col>
                <Col md={2}>
                <Form.Group className="mb-3">
                    <Form.Label>Yıl</Form.Label>
                    <Form.Control type="number" name="year" defaultValue={2025} onChange={handleChange} required />
                </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Özet (Abstract)</Form.Label>
                <Form.Control as="textarea" rows={4} name="abstract" onChange={handleChange} required />
            </Form.Group>
            
            <Row>
                <Col md={4}>
                <Form.Group className="mb-3">
                    <Form.Label>Yazar</Form.Label>
                    <Form.Select name="authorId" onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname} ({p.title})</option>))}
                    </Form.Select>
                </Form.Group>
                </Col>
                <Col md={4}>
                <Form.Group className="mb-3">
                    <Form.Label>Danışman</Form.Label>
                    <Form.Select name="supervisorId" onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}
                    </Form.Select>
                </Form.Group>
                </Col>
                <Col md={4}>
                <Form.Group className="mb-3">
                    <Form.Label>Enstitü</Form.Label>
                    <Form.Select name="instituteId" onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    {institutes.map(i => (<option key={i.instituteid} value={i.instituteid}>{i.institutename}</option>))}
                    </Form.Select>
                </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Dil</Form.Label>
                        <Form.Select name="languageId" onChange={handleChange} required>
                        <option value="">Seçiniz...</option>
                        {languages.map(l => (<option key={l.languageid} value={l.languageid}>{l.languagename}</option>))}
                        </Form.Select>
                </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tür</Form.Label>
                        <Form.Select name="typeId" onChange={handleChange} required>
                        <option value="">Seçiniz...</option>
                        {types.map(t => (<option key={t.typeid} value={t.typeid}>{t.typename}</option>))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Sayfa Sayısı</Form.Label>
                        <Form.Control type="number" name="pageNum" onChange={handleChange} required />
                    </Form.Group>
                </Col>
            </Row>
            
            <div className="d-flex justify-content-end gap-2 mt-3">
                 <Button variant="secondary" onClick={() => setShowAddThesisModal(false)}>İptal</Button>
                 <Button variant="success" type="submit" className="fw-bold px-4">+ Kaydet</Button>
            </div>
            </Form>
        </Modal.Body>
      </Modal>

      {/* --- MODAL 2: TEZ DETAY --- */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">📄 Tez Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedThesis && (
            <div>
              <h4 className="text-dark mb-3">{selectedThesis.title}</h4>
              <div className="p-3 bg-light border rounded mb-3">
                 <p className="mb-1"><strong>Özet:</strong></p>
                 <p className="text-muted fst-italic">{selectedThesis.abstract}</p>
              </div>
              <Row>
                  <Col md={6}>
                      <p><strong>Tez No:</strong> <Badge bg="primary">{selectedThesis.thesisno}</Badge></p>
                      <p><strong>Yıl:</strong> {selectedThesis.year}</p>
                      <p><strong>Sayfa:</strong> {selectedThesis.pagenum}</p>
                  </Col>
                  <Col md={6}>
                      <p><strong>Enstitü ID:</strong> {selectedThesis.instituteid}</p>
                      <p><strong>Dil ID:</strong> {selectedThesis.languageid}</p>
                  </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Kapat</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL 3: KİŞİ EKLEME --- */}
      <Modal show={showPersonModal} onHide={() => setShowPersonModal(false)} centered style={{zIndex: 1060}}>
        <Modal.Header closeButton>
          <Modal.Title>Yeni Kişi Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ad</Form.Label>
              <Form.Control type="text" value={newPerson.firstName} onChange={(e) => setNewPerson({...newPerson, firstName: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Soyad</Form.Label>
              <Form.Control type="text" value={newPerson.lastName} onChange={(e) => setNewPerson({...newPerson, lastName: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ünvan</Form.Label>
              <Form.Select value={newPerson.title} onChange={(e) => setNewPerson({...newPerson, title: e.target.value})}>
                <option value="Student">Student</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Assoc. Prof.">Assoc. Prof.</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={newPerson.email} onChange={(e) => setNewPerson({...newPerson, email: e.target.value})}/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPersonModal(false)}>İptal</Button>
          <Button variant="primary" onClick={handleAddPerson}>Kaydet</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default App;