import { useEffect, useState } from "react";
import { 
  Container, Table, Button, Form, Row, Col, Alert, Spinner, Card, Modal, Badge, Navbar, Nav, Tabs, Tab 
} from "react-bootstrap";

// API fonksiyonlarını import ediyoruz.
// EĞER api.js dosyasında bu fonksiyonlardan biri yoksa hata alırsın.
// Hata almamak için api.js dosyanı kontrol et veya aşağıda hata yönetimi yapan yapıyı kullan.
import { 
  getTheses, addThesis, deleteThesis, searchTheses, 
  getPeople, addPerson, updatePerson, deletePerson,
  getInstitutes, addInstitute, updateInstitute, deleteInstitute,
  getLanguages, addLanguage, updateLanguage, deleteLanguage,
  getTypes, addType, updateType, deleteType,
  getTopics, addTopic, updateTopic, deleteTopic,
  getKeywords, addKeyword, updateKeyword, deleteKeyword
} from "./api";

import "./App.css";

function App() {

  // ==========================================
  // 1. STATE DEFINITIONS
  // ==========================================

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showLogicPage, setShowLogicPage] = useState(false);
  
  // Loading State
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddThesisModal, setShowAddThesisModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false); 
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDataMgmtModal, setShowDataMgmtModal] = useState(false);

  // Editing States
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [newUniversity, setNewUniversity] = useState("");
  const [newInstitute, setNewInstitute] = useState({ name: "", universityId: "" });
  const [newLanguage, setNewLanguage] = useState("");
  const [newPerson, setNewPerson] = useState({ firstName: "", lastName: "", title: "Student", email: "" });
  const [newType, setNewType] = useState("");      
  const [newTopic, setNewTopic] = useState("");    
  const [newKeyword, setNewKeyword] = useState("");

  const [formData, setFormData] = useState({
    thesisNo: "", title: "", abstract: "", year: new Date().getFullYear(),
    pageNum: "", typeId: "", instituteId: "", authorId: "", supervisorId: "", languageId: ""
  });

  const [searchParams, setSearchParams] = useState({
    title: "", authorId: "", typeId: "", instituteId: "", year: ""
  });

  // Data Lists (Başlangıçta boş array olarak tanımlı)
  const [theses, setTheses] = useState([]);
  const [people, setPeople] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [types, setTypes] = useState([]);
  const [topics, setTopics] = useState([]);     
  const [keywords, setKeywords] = useState([]); 

  // Mock Universities
  const [universities, setUniversities] = useState([
    { UniversityID: 1, UniversityName: 'Maltepe University' },
    { UniversityID: 2, UniversityName: 'Marmara University' },
    { UniversityID: 3, UniversityName: 'ITU' },
    { UniversityID: 4, UniversityName: 'Bogazici University' },
    { UniversityID: 5, UniversityName: 'Yildiz Technical University' }
  ]);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);

  // ==========================================
  // 2. HELPER FUNCTIONS
  // ==========================================

  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => { setShowNotification(false); }, 3000);
  };

  const resetMgmtForms = () => {
    setEditingId(null);
    setNewInstitute({ name: "", universityId: "" });
    setNewUniversity("");
    setNewLanguage("");
    setNewPerson({ firstName: "", lastName: "", title: "Student", email: "" });
    setNewType("");
    setNewTopic("");
    setNewKeyword("");
  };

  // ==========================================
  // 3. DATA LOADING (DÜZELTİLEN KISIM)
  // ==========================================

  // Bu yardımcı fonksiyon, api çağrısı hata verse bile uygulamayı çökertmez
  const fetchDataSafely = async (apiFunction, setStateFunction, dataName) => {
    try {
      if (typeof apiFunction !== 'function') {
        console.warn(`${dataName} API fonksiyonu bulunamadı, atlanıyor.`);
        return;
      }
      const response = await apiFunction();
      if (response && response.data) {
        setStateFunction(response.data);
      }
    } catch (error) {
      console.error(`HATA: ${dataName} yüklenemedi.`, error);
      // Hata olsa bile state'i boş array yap ki sayfa patlamasın
      setStateFunction([]); 
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    
    // Her birini ayrı ayrı güvenli şekilde çağıyoruz.
    // Biri hata verse bile diğerleri yüklenir.
    await Promise.all([
      fetchDataSafely(getTheses, setTheses, "Theses"),
      fetchDataSafely(getPeople, setPeople, "People"),
      fetchDataSafely(getInstitutes, setInstitutes, "Institutes"),
      fetchDataSafely(getLanguages, setLanguages, "Languages"),
      fetchDataSafely(getTypes, setTypes, "Types"),
      fetchDataSafely(getTopics, setTopics, "Topics"),
      fetchDataSafely(getKeywords, setKeywords, "Keywords")
    ]);

    setLoading(false);
  };

  // Sayfa açılışında verileri çek
  useEffect(() => { 
    loadAllData(); 
  }, []);

  // ==========================================
  // 4. HANDLERS
  // ==========================================

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSearchChange = (e) => setSearchParams({ ...searchParams, [e.target.name]: e.target.value });

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSearchActive(true);
    try {
      const res = await searchTheses(searchParams);
      setTheses(res.data);
      if(res.data.length > 0) showToast(`${res.data.length} records found.`);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleClearSearch = async () => {
    setSearchParams({ title: "", authorId: "", typeId: "", instituteId: "", year: "" });
    setIsSearchActive(false);
    await loadAllData(); 
  };

  const handleSubmitThesis = async (e) => {
    e.preventDefault();
    try {
      await addThesis(formData);
      showToast("✅ Thesis Added Successfully!");
      await loadAllData();
      e.target.reset();
      setShowAddThesisModal(false);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDeleteThesis = async (id) => {
    if (window.confirm("Are you sure you want to delete this thesis?")) {
      try {
        await deleteThesis(id);
        await loadAllData();
        showToast("🗑️ Thesis deleted.");
      } catch (err) { alert("Delete error occurred."); }
    }
  };

  const handleAddPersonQuick = async () => {
    try {
      await addPerson(newPerson);
      showToast(`👤 ${newPerson.firstName} successfully added!`);
      setShowPersonModal(false);
      setNewPerson({ firstName: "", lastName: "", title: "Student", email: "" });
      await fetchDataSafely(getPeople, setPeople, "People");
    } catch (err) { alert("Error: " + err.message); }
  };

  // ==========================================
  // 5. DATA MANAGEMENT HANDLERS (CRUD)
  // ==========================================

  // --- PEOPLE ---
  const handleSavePerson = async () => {
    try {
      if (editingId) {
        await updatePerson(editingId, newPerson);
        showToast("✅ Person Updated!");
      } else {
        await addPerson(newPerson);
        showToast("✅ Person Added!");
      }
      resetMgmtForms();
      await fetchDataSafely(getPeople, setPeople, "People");
    } catch (err) { alert("Error: " + err.message); }
  };
  const handleEditPerson = (p) => {
    setEditingId(p.personid);
    setNewPerson({ firstName: p.firstname, lastName: p.lastname, title: p.title || "Student", email: p.email });
  };
  const handleDeletePerson = async (id) => {
    if(!window.confirm("Delete this person?")) return;
    try { await deletePerson(id); showToast("🗑️ Person Deleted"); await fetchDataSafely(getPeople, setPeople, "People"); } 
    catch (err) { alert("Error: " + err.message); }
  };

  // --- INSTITUTES ---
  const handleSaveInstitute = async () => {
    try {
      if (editingId) {
        await updateInstitute(editingId, { InstituteName: newInstitute.name, UniversityID: newInstitute.universityId });
        showToast("✅ Institute Updated!");
      } else {
        await addInstitute({ InstituteName: newInstitute.name, UniversityID: newInstitute.universityId });
        showToast("✅ Institute Added!");
      }
      resetMgmtForms();
      await fetchDataSafely(getInstitutes, setInstitutes, "Institutes");
    } catch (err) { alert("Error: " + err.message); }
  };
  const handleEditInstitute = (inst) => {
    setEditingId(inst.instituteid);
    setNewInstitute({ name: inst.institutename, universityId: inst.universityid });
  };
  const handleDeleteInstitute = async (id) => {
    if(!window.confirm("Delete this institute?")) return;
    try { await deleteInstitute(id); showToast("🗑️ Institute Deleted"); await fetchDataSafely(getInstitutes, setInstitutes, "Institutes"); }
    catch (err) { alert("Error: " + err.message); }
  };

  // --- UNIVERSITIES (Mock) ---
  const handleSaveUniversity = async () => {
    if (editingId) {
       const updated = universities.map(u => u.UniversityID === editingId ? {...u, UniversityName: newUniversity} : u);
       setUniversities(updated);
       showToast("✅ University Updated!");
    } else {
       const newId = universities.length > 0 ? Math.max(...universities.map(u => u.UniversityID)) + 1 : 1;
       setUniversities([...universities, { UniversityID: newId, UniversityName: newUniversity }]);
       showToast("✅ University Added!");
    }
    resetMgmtForms();
  };
  const handleEditUniversity = (u) => {
    setEditingId(u.UniversityID);
    setNewUniversity(u.UniversityName);
  };
  const handleDeleteUniversity = (id) => {
    if(!window.confirm("Delete this university?")) return;
    setUniversities(universities.filter(u => u.UniversityID !== id));
    showToast("🗑️ University Deleted");
  };

  // --- LANGUAGES ---
  const handleSaveLanguage = async () => {
    try {
      if (editingId) {
        await updateLanguage(editingId, { LanguageName: newLanguage });
        showToast("✅ Language Updated!");
      } else {
        await addLanguage({ LanguageName: newLanguage });
        showToast("✅ Language Added!");
      }
      resetMgmtForms();
      await fetchDataSafely(getLanguages, setLanguages, "Languages");
    } catch (err) { alert("Error: " + err.message); }
  };
  const handleEditLanguage = (lang) => {
    setEditingId(lang.languageid);
    setNewLanguage(lang.languagename);
  };
  const handleDeleteLanguage = async (id) => {
    if(!window.confirm("Delete this language?")) return;
    try { await deleteLanguage(id); showToast("🗑️ Language Deleted"); await fetchDataSafely(getLanguages, setLanguages, "Languages"); }
    catch (err) { alert("Error: " + err.message); }
  };

  // --- TYPES ---
  const handleSaveType = async () => {
    try {
      if (editingId) {
        await updateType(editingId, { TypeName: newType });
        showToast("✅ Type Updated!");
      } else {
        await addType({ TypeName: newType });
        showToast("✅ Type Added!");
      }
      resetMgmtForms();
      await fetchDataSafely(getTypes, setTypes, "Types");
    } catch (err) { alert("Error: " + err.message); }
  };
  const handleEditType = (t) => { setEditingId(t.typeid); setNewType(t.typename); };
  const handleDeleteType = async (id) => {
    if(!window.confirm("Delete this type?")) return;
    try { await deleteType(id); showToast("🗑️ Type Deleted"); await fetchDataSafely(getTypes, setTypes, "Types"); }
    catch (err) { alert("Error: " + err.message); }
  };

  // --- TOPICS ---
  const handleSaveTopic = async () => {
    try {
      if (editingId) {
        await updateTopic(editingId, { TopicName: newTopic });
        showToast("✅ Topic Updated!");
      } else {
        await addTopic({ TopicName: newTopic });
        showToast("✅ Topic Added!");
      }
      resetMgmtForms();
      await fetchDataSafely(getTopics, setTopics, "Topics");
    } catch (err) { alert("Error: " + err.message); }
  };
  const handleEditTopic = (t) => { setEditingId(t.topicid); setNewTopic(t.topicname); };
  const handleDeleteTopic = async (id) => {
    if(!window.confirm("Delete this topic?")) return;
    try { await deleteTopic(id); showToast("🗑️ Topic Deleted"); await fetchDataSafely(getTopics, setTopics, "Topics"); }
    catch (err) { alert("Error: " + err.message); }
  };

  // --- KEYWORDS ---
  const handleSaveKeyword = async () => {
    try {
      if (editingId) {
        await updateKeyword(editingId, { KeywordName: newKeyword });
        showToast("✅ Keyword Updated!");
      } else {
        await addKeyword({ KeywordName: newKeyword });
        showToast("✅ Keyword Added!");
      }
      resetMgmtForms();
      await fetchDataSafely(getKeywords, setKeywords, "Keywords");
    } catch (err) { alert("Error: " + err.message); }
  };
  const handleEditKeyword = (k) => { setEditingId(k.keywordid); setNewKeyword(k.keywordname); };
  const handleDeleteKeyword = async (id) => {
    if(!window.confirm("Delete this keyword?")) return;
    try { await deleteKeyword(id); showToast("🗑️ Keyword Deleted"); await fetchDataSafely(getKeywords, setKeywords, "Keywords"); }
    catch (err) { alert("Error: " + err.message); }
  };


  // ==========================================
  // 6. RENDER
  // ==========================================
  
  return (
    <div style={{
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      width: "100%",
      position: "absolute",
      top: 0, left: 0, paddingTop: "30px", paddingBottom: "50px"
    }}>

      <Container>
   
        {/* --- NAVBAR --- */}
        <Navbar bg="white" expand="lg" className="shadow-lg rounded-3 mb-5 px-4 py-3 border-bottom">
          <Container fluid>
            <Navbar.Brand href="#" onClick={() => setShowLogicPage(false)} className="fw-bold text-dark d-flex align-items-center" style={{ fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              <span style={{ marginRight: '12px', fontSize: '1.8rem' }}>🎓</span> Thesis Systems
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link onClick={() => setShowLogicPage(false)} className={`fw-bold px-3 ${!showLogicPage && !showDataMgmtModal ? 'text-primary bg-light rounded' : 'text-secondary'}`}>Home</Nav.Link>
                <Nav.Link onClick={() => { setShowDataMgmtModal(true); resetMgmtForms(); }} className="fw-bold px-3 text-secondary hover-primary">System Data</Nav.Link>
                <Nav.Link onClick={() => setShowLogicPage(true)} className={`fw-bold px-3 ${showLogicPage ? 'text-primary bg-light rounded' : 'text-secondary'}`}>How it Works</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* --- TOAST NOTIFICATION --- */}
        {showNotification && (
          <div className="custom-toast-container">
            <div className="custom-toast">
              <div className="toast-icon">✔</div>
              <div className="toast-message">{notificationMessage}</div>
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT SWITCH --- */}
        {showLogicPage ? (
          /* LOGIC PAGE */
          <div className="animate-fade-in">
             <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">System Architecture</h2>
                <p className="text-muted">Overview of the technical infrastructure.</p>
             </div>
             <Row className="g-4">
                <Col md={4}><Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #0d6efd"}}><Card.Body><div className="display-4 text-primary mb-3">🖥️</div><Card.Title className="fw-bold">1. Frontend</Card.Title><Card.Text className="text-muted">React.js & Bootstrap UI handles user interactions.</Card.Text></Card.Body></Card></Col>
                <Col md={4}><Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #6610f2"}}><Card.Body><div className="display-4 text-primary mb-3">⚙️</div><Card.Title className="fw-bold">2. Backend</Card.Title><Card.Text className="text-muted">Node.js API Services process logic and validation.</Card.Text></Card.Body></Card></Col>
                <Col md={4}><Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #198754"}}><Card.Body><div className="display-4 text-primary mb-3">🗄️</div><Card.Title className="fw-bold">3. Database</Card.Title><Card.Text className="text-muted">PostgreSQL stores relational data securely.</Card.Text></Card.Body></Card></Col>
             </Row>
          </div>
        ) : (
          /* MAIN APP PAGE */
          <>
            {/* Search Panel */}
            <Card className="mb-4 p-4 shadow-sm border-0" style={{ borderTop: "4px solid var(--yok-blue)", backgroundColor: "white" }}>
              <h5 className="mb-3 text-secondary d-flex align-items-center"><span className="me-2">🔍</span> Advanced Thesis Search</h5>
              <Form onSubmit={handleSearchSubmit}>
                <Row>
                  <Col md={4}><Form.Group className="mb-2"><Form.Control className="bg-light" type="text" name="title" placeholder="Search Keyword..." value={searchParams.title} onChange={handleSearchChange} /></Form.Group></Col>
                  <Col md={3}><Form.Select className="bg-light" name="authorId" value={searchParams.authorId} onChange={handleSearchChange}><option value="">All Authors</option>{people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}</Form.Select></Col>
                  <Col md={3}><Form.Select className="bg-light" name="typeId" value={searchParams.typeId} onChange={handleSearchChange}><option value="">All Types</option>{types.map(t => (<option key={t.typeid} value={t.typeid}>{t.typename}</option>))}</Form.Select></Col>
                  <Col md={2}><Form.Control className="bg-light" type="number" name="year" placeholder="Year" value={searchParams.year} onChange={handleSearchChange} /></Col>
                </Row>
                <div className="d-flex justify-content-end mt-2 gap-2"><Button variant="outline-secondary" onClick={handleClearSearch}>Clear</Button><Button variant="primary" type="submit" className="px-4">Search</Button></div>
              </Form>
            </Card>

            {/* Results Alert */}
            {isSearchActive && <Alert variant="info" className="d-flex justify-content-between align-items-center shadow-sm mb-4 bg-white border-0 border-start border-info border-5"><span><strong>Results:</strong> {theses.length} records found.</span><Button variant="outline-info" size="sm" onClick={handleClearSearch}>Reset List</Button></Alert>}

            {/* Thesis List */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <Card.Header className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center"><h5 className="m-0 fw-bold text-dark">📚 Thesis List</h5><Button variant="success" size="md" className="shadow-sm px-4 rounded-pill" onClick={() => setShowAddThesisModal(true)}>+ Add New Thesis</Button></Card.Header>
              
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                  <p className="mt-3 text-muted">Loading Data...</p>
                </div>
              ) : (
                <Table hover responsive className="m-0 align-middle"><thead className="bg-light text-secondary"><tr><th className="py-3 ps-4">No</th><th className="py-3">Title</th><th className="py-3">Year</th><th className="py-3 text-end pe-4">Actions</th></tr></thead>
                  <tbody>
                    {theses.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">No theses found.</td></tr>
                    ) : (
                      theses.map((thesis) => (<tr key={thesis.thesisno} style={{cursor:'pointer'}}><td className="ps-4"><Badge bg="light" text="dark" className="border">{thesis.thesisno}</Badge></td><td className="fw-bold text-dark">{thesis.title}</td><td className="text-muted">{thesis.year}</td><td className="text-end pe-4"><Button variant="info" size="sm" className="me-2 text-white" onClick={() => { setSelectedThesis(thesis); setShowDetailModal(true); }}>Detail</Button><Button variant="danger" size="sm" onClick={() => handleDeleteThesis(thesis.thesisno)}>Delete</Button></td></tr>))
                    )}
                  </tbody>
                </Table>
              )}
            </Card>
          </>
        )}

        {/* --- SYSTEM DATA MANAGEMENT MODAL (7 TABS) --- */}
        <Modal show={showDataMgmtModal} onHide={() => setShowDataMgmtModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold text-dark">⚙️ System Data Management</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs defaultActiveKey="people" id="data-mgmt-tabs" className="mb-3 custom-tabs" onSelect={resetMgmtForms}>
              
              {/* TAB 1: PEOPLE */}
              <Tab eventKey="people" title="People">
                 <div className="bg-light p-3 rounded mb-4 border">
                   <h6 className="fw-bold text-primary mb-3">{editingId ? 'Edit Person' : 'Add New Person'}</h6>
                   <Row className="g-2">
                      <Col md={3}><Form.Control type="text" placeholder="First Name" value={newPerson.firstName} onChange={(e)=>setNewPerson({...newPerson, firstName: e.target.value})}/></Col>
                      <Col md={3}><Form.Control type="text" placeholder="Last Name" value={newPerson.lastName} onChange={(e)=>setNewPerson({...newPerson, lastName: e.target.value})}/></Col>
                      <Col md={2}>
                        <Form.Select value={newPerson.title} onChange={(e)=>setNewPerson({...newPerson, title: e.target.value})}>
                          <option>Student</option><option>Dr.</option><option>Prof.</option><option>Assoc. Prof.</option>
                        </Form.Select>
                      </Col>
                      <Col md={4}><Form.Control type="email" placeholder="Email" value={newPerson.email} onChange={(e)=>setNewPerson({...newPerson, email: e.target.value})}/></Col>
                   </Row>
                   <Button className="mt-2 w-100 text-white fw-bold" variant={editingId?"warning":"success"} onClick={handleSavePerson}>{editingId?"Update Person":"Add Person"}</Button>
                 </div>
                 <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                      <thead><tr><th>Name</th><th>Title</th><th className="text-end">Actions</th></tr></thead>
                      <tbody>{people.map(p => (<tr key={p.personid}><td>{p.firstname} {p.lastname}</td><td>{p.title}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditPerson(p)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeletePerson(p.personid)}>Del</Button></td></tr>))}</tbody>
                    </Table>
                 </div>
              </Tab>

              {/* TAB 2: TYPES */}
              <Tab eventKey="types" title="Types">
                 <div className="bg-light p-3 rounded mb-4 border">
                   <h6 className="fw-bold text-primary mb-3">{editingId ? 'Edit Type' : 'Add New Type'}</h6>
                   <Row className="g-2">
                      <Col md={9}><Form.Control type="text" placeholder="Type Name" value={newType} onChange={(e)=>setNewType(e.target.value)}/></Col>
                      <Col md={3}><Button variant={editingId?"warning":"success"} className="w-100 text-white fw-bold" onClick={handleSaveType}>{editingId?"Update":"Add"}</Button></Col>
                   </Row>
                 </div>
                 <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                      <thead><tr><th>Type Name</th><th className="text-end">Actions</th></tr></thead>
                      <tbody>{types.map(t => (<tr key={t.typeid}><td>{t.typename}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditType(t)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteType(t.typeid)}>Del</Button></td></tr>))}</tbody>
                    </Table>
                 </div>
              </Tab>

              {/* TAB 3: TOPICS */}
              <Tab eventKey="topics" title="Topics">
                 <div className="bg-light p-3 rounded mb-4 border">
                   <h6 className="fw-bold text-primary mb-3">{editingId ? 'Edit Topic' : 'Add New Topic'}</h6>
                   <Row className="g-2">
                      <Col md={9}><Form.Control type="text" placeholder="Topic Name" value={newTopic} onChange={(e)=>setNewTopic(e.target.value)}/></Col>
                      <Col md={3}><Button variant={editingId?"warning":"success"} className="w-100 text-white fw-bold" onClick={handleSaveTopic}>{editingId?"Update":"Add"}</Button></Col>
                   </Row>
                 </div>
                 <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                      <thead><tr><th>Topic Name</th><th className="text-end">Actions</th></tr></thead>
                      <tbody>{topics.map(t => (<tr key={t.topicid}><td>{t.topicname}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditTopic(t)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteTopic(t.topicid)}>Del</Button></td></tr>))}</tbody>
                    </Table>
                 </div>
              </Tab>

              {/* TAB 4: KEYWORDS */}
              <Tab eventKey="keywords" title="Keywords">
                 <div className="bg-light p-3 rounded mb-4 border">
                   <h6 className="fw-bold text-primary mb-3">{editingId ? 'Edit Keyword' : 'Add New Keyword'}</h6>
                   <Row className="g-2">
                      <Col md={9}><Form.Control type="text" placeholder="Keyword Name" value={newKeyword} onChange={(e)=>setNewKeyword(e.target.value)}/></Col>
                      <Col md={3}><Button variant={editingId?"warning":"success"} className="w-100 text-white fw-bold" onClick={handleSaveKeyword}>{editingId?"Update":"Add"}</Button></Col>
                   </Row>
                 </div>
                 <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                      <thead><tr><th>Keyword Name</th><th className="text-end">Actions</th></tr></thead>
                      <tbody>{keywords.map(k => (<tr key={k.keywordid}><td>{k.keywordname}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditKeyword(k)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteKeyword(k.keywordid)}>Del</Button></td></tr>))}</tbody>
                    </Table>
                 </div>
              </Tab>

              {/* TAB 5: INSTITUTES */}
              <Tab eventKey="institutes" title="Institutes">
                 <div className="bg-light p-3 rounded mb-4 border">
                   <h6 className="fw-bold text-primary mb-3">{editingId ? 'Edit Institute' : 'Add New Institute'}</h6>
                   <Row className="g-2">
                      <Col md={5}><Form.Control type="text" placeholder="Institute Name" value={newInstitute.name} onChange={(e) => setNewInstitute({...newInstitute, name: e.target.value})} /></Col>
                      <Col md={5}><Form.Select value={newInstitute.universityId} onChange={(e) => setNewInstitute({...newInstitute, universityId: e.target.value})}><option value="">Select University...</option>{universities.map(u => <option key={u.UniversityID} value={u.UniversityID}>{u.UniversityName}</option>)}</Form.Select></Col>
                      <Col md={2}>
                        <div className="d-flex gap-1">
                           <Button variant={editingId ? "warning" : "success"} className="w-100 text-white fw-bold" onClick={handleSaveInstitute}>{editingId ? "Update" : "Add"}</Button>
                           {editingId && <Button variant="secondary" onClick={resetMgmtForms}>X</Button>}
                        </div>
                      </Col>
                   </Row>
                 </div>
                 <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                      <thead><tr><th>Name</th><th className="text-end">Actions</th></tr></thead>
                      <tbody>
                        {institutes.map(i => (
                          <tr key={i.instituteid}>
                            <td className="align-middle">{i.institutename}</td>
                            <td className="text-end">
                              <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditInstitute(i)}>Edit</Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteInstitute(i.instituteid)}>Del</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                 </div>
              </Tab>

              {/* TAB 6: UNIVERSITIES */}
              <Tab eventKey="universities" title="Universities">
                 <div className="bg-light p-3 rounded mb-4 border">
                   <h6 className="fw-bold text-primary mb-3">{editingId ? 'Edit University' : 'Add New University'}</h6>
                   <Row className="g-2">
                      <Col md={9}><Form.Control type="text" placeholder="University Name" value={newUniversity} onChange={(e) => setNewUniversity(e.target.value)} /></Col>
                      <Col md={3}>
                        <div className="d-flex gap-1">
                          <Button variant={editingId ? "warning" : "success"} className="w-100 text-white fw-bold" onClick={handleSaveUniversity}>{editingId ? "Update" : "Add"}</Button>
                          {editingId && <Button variant="secondary" onClick={resetMgmtForms}>X</Button>}
                        </div>
                      </Col>
                   </Row>
                 </div>
                 <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                      <thead><tr><th>Name</th><th className="text-end">Actions</th></tr></thead>
                      <tbody>
                        {universities.map(u => (
                          <tr key={u.UniversityID}>
                            <td className="align-middle">{u.UniversityName}</td>
                            <td className="text-end">
                              <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditUniversity(u)}>Edit</Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUniversity(u.UniversityID)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                 </div>
              </Tab>

              {/* TAB 7: LANGUAGES */}
              <Tab eventKey="languages" title="Languages">
                 <div className="bg-light p-3 rounded mb-4 border">
                   <h6 className="fw-bold text-primary mb-3">{editingId ? 'Edit Language' : 'Add New Language'}</h6>
                   <Row className="g-2">
                      <Col md={9}><Form.Control type="text" placeholder="Language Name" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} /></Col>
                      <Col md={3}>
                         <div className="d-flex gap-1">
                           <Button variant={editingId ? "warning" : "success"} className="w-100 text-white fw-bold" onClick={handleSaveLanguage}>{editingId ? "Update" : "Add"}</Button>
                           {editingId && <Button variant="secondary" onClick={resetMgmtForms}>X</Button>}
                         </div>
                      </Col>
                   </Row>
                 </div>
                 <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped hover size="sm">
                      <thead><tr><th>Name</th><th className="text-end">Actions</th></tr></thead>
                      <tbody>
                        {languages.map(l => (
                          <tr key={l.languageid}>
                            <td className="align-middle">{l.languagename}</td>
                            <td className="text-end">
                              <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditLanguage(l)}>Edit</Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteLanguage(l.languageid)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                 </div>
              </Tab>

            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDataMgmtModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        {/* --- MODAL 4: ADD THESIS --- */}
        <Modal show={showAddThesisModal} onHide={() => setShowAddThesisModal(false)} size="xl" centered>
           <Modal.Header closeButton className="bg-light"><Modal.Title className="text-success fw-bold">📝 New Thesis Entry</Modal.Title></Modal.Header>
           <Modal.Body>
            <div className="d-flex justify-content-end mb-3"><Button variant="outline-primary" size="sm" onClick={() => setShowPersonModal(true)}>+ Add New Person (if not listed)</Button></div>
            <Form onSubmit={handleSubmitThesis}>
              <Row><Col md={2}><Form.Group className="mb-3"><Form.Label>Thesis No</Form.Label><Form.Control type="number" name="thesisNo" onChange={handleChange} required /></Form.Group></Col><Col md={8}><Form.Group className="mb-3"><Form.Label>Title</Form.Label><Form.Control type="text" name="title" onChange={handleChange} required /></Form.Group></Col><Col md={2}><Form.Group className="mb-3"><Form.Label>Year</Form.Label><Form.Control type="number" name="year" defaultValue={2025} onChange={handleChange} required /></Form.Group></Col></Row>
              <Form.Group className="mb-3"><Form.Label>Abstract</Form.Label><Form.Control as="textarea" rows={4} name="abstract" onChange={handleChange} required /></Form.Group>
              <Row>
                <Col md={4}><Form.Group className="mb-3"><Form.Label>Author</Form.Label><Form.Select name="authorId" onChange={handleChange} required><option value="">Select...</option>{people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}</Form.Select></Form.Group></Col>
                <Col md={4}><Form.Group className="mb-3"><Form.Label>Supervisor</Form.Label><Form.Select name="supervisorId" onChange={handleChange} required><option value="">Select...</option>{people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}</Form.Select></Form.Group></Col>
                <Col md={4}><Form.Group className="mb-3"><Form.Label>Institute</Form.Label><Form.Select name="instituteId" onChange={handleChange} required><option value="">Select...</option>{institutes.map(i => (<option key={i.instituteid} value={i.instituteid}>{i.institutename}</option>))}</Form.Select></Form.Group></Col>
              </Row>
               <Row>
                <Col md={4}><Form.Group className="mb-3"><Form.Label>Language</Form.Label><Form.Select name="languageId" onChange={handleChange} required><option value="">Select...</option>{languages.map(l => (<option key={l.languageid} value={l.languageid}>{l.languagename}</option>))}</Form.Select></Form.Group></Col>
                <Col md={4}><Form.Group className="mb-3"><Form.Label>Type</Form.Label><Form.Select name="typeId" onChange={handleChange} required><option value="">Select...</option>{types.map(t => (<option key={t.typeid} value={t.typeid}>{t.typename}</option>))}</Form.Select></Form.Group></Col>
                <Col md={4}><Form.Group className="mb-3"><Form.Label>Pages</Form.Label><Form.Control type="number" name="pageNum" onChange={handleChange} required /></Form.Group></Col>
              </Row>
              <div className="d-flex justify-content-end gap-2 mt-3"><Button variant="secondary" onClick={() => setShowAddThesisModal(false)}>Cancel</Button><Button variant="success" type="submit" className="fw-bold px-4">+ Save</Button></div>
            </Form>
           </Modal.Body>
        </Modal>

        {/* --- MODAL 5: DETAIL --- */}
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-light"><Modal.Title className="text-primary">📄 Thesis Details</Modal.Title></Modal.Header>
          <Modal.Body>{selectedThesis && (<div><h4 className="text-dark mb-3">{selectedThesis.title}</h4><div className="p-3 bg-light border rounded mb-3"><p className="mb-1"><strong>Abstract:</strong></p><p className="text-muted fst-italic">{selectedThesis.abstract}</p></div><Row><Col md={6}><p><strong>Thesis No:</strong> <Badge bg="primary">{selectedThesis.thesisno}</Badge></p><p><strong>Year:</strong> {selectedThesis.year}</p></Col><Col md={6}><p><strong>Pages:</strong> {selectedThesis.pagenum}</p></Col></Row></div>)}</Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button></Modal.Footer>
        </Modal>

        {/* --- MODAL 6: ADD PERSON (QUICK) --- */}
        <Modal show={showPersonModal} onHide={() => setShowPersonModal(false)} centered style={{ zIndex: 1060 }}>
          <Modal.Header closeButton><Modal.Title>Add New Person</Modal.Title></Modal.Header>
          <Modal.Body><Form><Form.Group className="mb-3"><Form.Label>First Name</Form.Label><Form.Control type="text" value={newPerson.firstName} onChange={(e) => setNewPerson({ ...newPerson, firstName: e.target.value })} /></Form.Group><Form.Group className="mb-3"><Form.Label>Last Name</Form.Label><Form.Control type="text" value={newPerson.lastName} onChange={(e) => setNewPerson({ ...newPerson, lastName: e.target.value })} /></Form.Group><Form.Group className="mb-3"><Form.Label>Title</Form.Label><Form.Select value={newPerson.title} onChange={(e) => setNewPerson({ ...newPerson, title: e.target.value })}><option value="Student">Student</option><option value="Dr.">Dr.</option><option value="Prof.">Prof.</option><option value="Assoc. Prof.">Assoc. Prof.</option></Form.Select></Form.Group><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={newPerson.email} onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })} /></Form.Group></Form></Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={() => setShowPersonModal(false)}>Cancel</Button><Button variant="primary" onClick={handleAddPersonQuick}>Save</Button></Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
}

export default App;