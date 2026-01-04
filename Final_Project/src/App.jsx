import { useEffect, useState } from "react";
import { 
  Container, Table, Button, Form, Row, Col, Alert, Spinner, Card, Modal, Badge, Navbar, Nav, Tabs, Tab, InputGroup 
} from "react-bootstrap";

import { 
  getTheses, addThesis, deleteThesis, searchTheses, 
  getPeople, addPerson, updatePerson, deletePerson,
  getInstitutes, addInstitute, updateInstitute, deleteInstitute,
  getLanguages, addLanguage, updateLanguage, deleteLanguage,
  getTypes, addType, updateType, deleteType,
  getTopics, addTopic, updateTopic, deleteTopic,
  getKeywords, addKeyword, updateKeyword, deleteKeyword,
  getUniversities, addUniversity, updateUniversity, deleteUniversity
} from "./api";

import "./App.css";

function App() {

  // ==========================================
  // 1. STATE DEFINITIONS
  // ==========================================

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddThesisModal, setShowAddThesisModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false); 
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDataMgmtModal, setShowDataMgmtModal] = useState(false);

  // Editing States
  const [editingId, setEditingId] = useState(null);

  // Search Mode State
  const [searchKey, setSearchKey] = useState("simple");

  // Form States (Management Panel)
  const [newUniversity, setNewUniversity] = useState("");
  const [newInstitute, setNewInstitute] = useState({ name: "", universityId: "" });
  const [newLanguage, setNewLanguage] = useState("");
  const [newPerson, setNewPerson] = useState({ firstName: "", lastName: "", title: "Student", email: "" });
  const [newType, setNewType] = useState("");      
  const [newTopic, setNewTopic] = useState("");    
  const [newKeyword, setNewKeyword] = useState("");

  // Form Data (Add Thesis)
  const [formData, setFormData] = useState({
    thesisNo: "", title: "", abstract: "", year: new Date().getFullYear(),
    pageNum: "", typeId: "", instituteId: "", authorId: "", supervisorId: "", languageId: ""
  });

  // Search Parameters
  const [searchParams, setSearchParams] = useState({
    title: "",        
    authorId: "", 
    supervisorId: "",
    typeId: "", 
    instituteId: "", 
    universityId: "", 
    languageId: "",   
    thesisNo: "",     
    abstract: "",     
    yearStart: "",    
    yearEnd: ""       
  });

  // Data Lists
  const [theses, setTheses] = useState([]);
  const [people, setPeople] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [types, setTypes] = useState([]);
  const [topics, setTopics] = useState([]);     
  const [keywords, setKeywords] = useState([]); 
  const [universities, setUniversities] = useState([]); 

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
  // 3. DATA LOADING
  // ==========================================

  const fetchDataSafely = async (apiFunction, setStateFunction, dataName) => {
    try {
      if (typeof apiFunction !== 'function') return;
      const response = await apiFunction();
      if (response && response.data) setStateFunction(response.data);
    } catch (error) {
      console.error(`Error loading ${dataName}:`, error);
      setStateFunction([]);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDataSafely(getTheses, setTheses, "Theses"),
      fetchDataSafely(getPeople, setPeople, "People"),
      fetchDataSafely(getInstitutes, setInstitutes, "Institutes"),
      fetchDataSafely(getLanguages, setLanguages, "Languages"),
      fetchDataSafely(getTypes, setTypes, "Types"),
      fetchDataSafely(getTopics, setTopics, "Topics"),
      fetchDataSafely(getKeywords, setKeywords, "Keywords"),
      fetchDataSafely(getUniversities, setUniversities, "Universities")
    ]);
    setLoading(false);
  };

  useEffect(() => { loadAllData(); }, []);

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
      else showToast("No records found.");
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleClearSearch = async () => {
    setSearchParams({ 
      title: "", authorId: "", supervisorId: "", typeId: "", instituteId: "", universityId: "", 
      languageId: "", thesisNo: "", abstract: "", yearStart: "", yearEnd: "" 
    });
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
      } catch (err) { alert("Delete error."); }
    }
  };

  // --- Management Handlers ---
  const handleAddPersonQuick = async () => { try { await addPerson(newPerson); showToast("Person Added"); setShowPersonModal(false); await fetchDataSafely(getPeople, setPeople, "People"); } catch(e){alert(e.message)} };
  const handleSaveUniversity = async () => { try { if(editingId) await updateUniversity(editingId, {UniversityName: newUniversity}); else await addUniversity({UniversityName: newUniversity}); resetMgmtForms(); await fetchDataSafely(getUniversities, setUniversities, "Universities"); showToast("Success"); } catch(e){alert(e.message)} };
  const handleEditUniversity = (u) => { setEditingId(u.universityid || u.UniversityID); setNewUniversity(u.universityname || u.UniversityName); };
  const handleDeleteUniversity = async (id) => { if(window.confirm("Delete?")) { await deleteUniversity(id); await fetchDataSafely(getUniversities, setUniversities, "Universities"); }};
  
  const handleSavePerson = async () => { try { if(editingId) await updatePerson(editingId, newPerson); else await addPerson(newPerson); resetMgmtForms(); await fetchDataSafely(getPeople, setPeople, "People"); showToast("Saved"); } catch(e){alert(e.message)} };
  const handleEditPerson = (p) => { setEditingId(p.personid); setNewPerson({ firstName: p.firstname, lastName: p.lastname, title: p.title, email: p.email }); };
  const handleDeletePerson = async (id) => { if(window.confirm("Delete?")) { await deletePerson(id); await fetchDataSafely(getPeople, setPeople, "People"); }};

  const handleSaveInstitute = async () => { try { if(editingId) await updateInstitute(editingId, {InstituteName: newInstitute.name, UniversityID: newInstitute.universityId}); else await addInstitute({InstituteName: newInstitute.name, UniversityID: newInstitute.universityId}); resetMgmtForms(); await fetchDataSafely(getInstitutes, setInstitutes, "Institutes"); showToast("Saved"); } catch(e){alert(e.message)} };
  const handleEditInstitute = (i) => { setEditingId(i.instituteid); setNewInstitute({name: i.institutename, universityId: i.universityid}); };
  const handleDeleteInstitute = async (id) => { if(window.confirm("Delete?")) { await deleteInstitute(id); await fetchDataSafely(getInstitutes, setInstitutes, "Institutes"); }};

  const handleSaveType = async () => { try { if(editingId) await updateType(editingId, {TypeName: newType}); else await addType({TypeName: newType}); resetMgmtForms(); await fetchDataSafely(getTypes, setTypes, "Types"); showToast("Saved"); } catch(e){alert(e.message)} };
  const handleEditType = (t) => { setEditingId(t.typeid); setNewType(t.typename); };
  const handleDeleteType = async (id) => { if(window.confirm("Delete?")) { await deleteType(id); await fetchDataSafely(getTypes, setTypes, "Types"); }};

  const handleSaveTopic = async () => { try { if(editingId) await updateTopic(editingId, {TopicName: newTopic}); else await addTopic({TopicName: newTopic}); resetMgmtForms(); await fetchDataSafely(getTopics, setTopics, "Topics"); showToast("Saved"); } catch(e){alert(e.message)} };
  const handleEditTopic = (t) => { setEditingId(t.topicid); setNewTopic(t.topicname); };
  const handleDeleteTopic = async (id) => { if(window.confirm("Delete?")) { await deleteTopic(id); await fetchDataSafely(getTopics, setTopics, "Topics"); }};

  const handleSaveKeyword = async () => { try { if(editingId) await updateKeyword(editingId, {KeywordName: newKeyword}); else await addKeyword({KeywordName: newKeyword}); resetMgmtForms(); await fetchDataSafely(getKeywords, setKeywords, "Keywords"); showToast("Saved"); } catch(e){alert(e.message)} };
  const handleEditKeyword = (k) => { setEditingId(k.keywordid); setNewKeyword(k.keywordname); };
  const handleDeleteKeyword = async (id) => { if(window.confirm("Delete?")) { await deleteKeyword(id); await fetchDataSafely(getKeywords, setKeywords, "Keywords"); }};

  const handleSaveLanguage = async () => { try { if(editingId) await updateLanguage(editingId, {LanguageName: newLanguage}); else await addLanguage({LanguageName: newLanguage}); resetMgmtForms(); await fetchDataSafely(getLanguages, setLanguages, "Languages"); showToast("Saved"); } catch(e){alert(e.message)} };
  const handleEditLanguage = (l) => { setEditingId(l.languageid); setNewLanguage(l.languagename); };
  const handleDeleteLanguage = async (id) => { if(window.confirm("Delete?")) { await deleteLanguage(id); await fetchDataSafely(getLanguages, setLanguages, "Languages"); }};


  return (
    <div style={{
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))",
      backgroundSize: "cover", backgroundAttachment: "fixed", minHeight: "100vh", paddingTop: "30px", paddingBottom: "50px"
    }}>
      <Container>
        <Navbar bg="white" expand="lg" className="shadow-lg rounded-3 mb-5 px-4 py-3 border-bottom">
          <Container fluid>
            <Navbar.Brand href="#" className="fw-bold text-dark d-flex align-items-center" style={{ fontSize: '1.6rem' }}>
              <span style={{ marginRight: '12px', fontSize: '1.8rem' }}>🎓</span> Thesis Systems
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav className="ms-auto">
                <Nav.Link href="#" className="fw-bold px-3 text-primary">Home</Nav.Link>
                <Nav.Link onClick={() => {setShowDataMgmtModal(true); resetMgmtForms();}} className="fw-bold px-3 text-secondary">Data Management</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {showNotification && <div className="custom-toast-container"><div className="custom-toast"><div className="toast-icon">✔</div><div className="toast-message">{notificationMessage}</div></div></div>}

        {/* --- SEARCH PANEL --- */}
        <Card className="mb-4 shadow-sm border-0" style={{ borderTop: "4px solid var(--yok-blue)", backgroundColor: "white" }}>
          <Card.Header className="bg-white border-bottom-0 pt-3">
            <Tabs activeKey={searchKey} onSelect={(k) => setSearchKey(k)} className="mb-3 custom-search-tabs">
              <Tab eventKey="simple" title="🔍 Simple Search"></Tab>
              <Tab eventKey="detailed" title="⚙️ Detailed Search"></Tab>
            </Tabs>
          </Card.Header>
          <Card.Body className="pt-0">
            <Form onSubmit={handleSearchSubmit}>
              
              {/* SIMPLE SEARCH */}
              {searchKey === "simple" && (
                <Row className="g-2 align-items-center justify-content-center py-3">
                  <Col md={8}>
                    <InputGroup size="lg">
                      <InputGroup.Text className="bg-light border-end-0">🔍</InputGroup.Text>
                      <Form.Control className="border-start-0 bg-light" type="text" name="title" placeholder="Search Thesis Title or Keyword..." value={searchParams.title} onChange={handleSearchChange} />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                      <Form.Select size="lg" className="bg-light" name="authorId" value={searchParams.authorId} onChange={handleSearchChange}>
                        <option value="">All Authors</option>
                        {people.map(p => <option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>)}
                      </Form.Select>
                  </Col>
                  <Col md={12} className="text-center mt-3">
                    <Button variant="primary" type="submit" size="lg" className="px-5 rounded-pill shadow-sm">Search</Button>
                  </Col>
                </Row>
              )}

              {/* DETAILED SEARCH */}
              {searchKey === "detailed" && (
                <div className="animate-fade-in">
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Label className="fw-bold small text-muted">University</Form.Label>
                      <Form.Select className="bg-light" name="universityId" value={searchParams.universityId} onChange={handleSearchChange}>
                        <option value="">Select...</option>
                        {universities.map(u => <option key={u.universityid || u.UniversityID} value={u.universityid || u.UniversityID}>{u.universityname || u.UniversityName}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-bold small text-muted">Institute</Form.Label>
                      <Form.Select className="bg-light" name="instituteId" value={searchParams.instituteId} onChange={handleSearchChange}>
                        <option value="">Select...</option>
                        {institutes.map(i => <option key={i.instituteid} value={i.instituteid}>{i.institutename}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-bold small text-muted">Language</Form.Label>
                      <Form.Select className="bg-light" name="languageId" value={searchParams.languageId} onChange={handleSearchChange}>
                        <option value="">Select...</option>
                        {languages.map(l => <option key={l.languageid} value={l.languageid}>{l.languagename}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-bold small text-muted">Author</Form.Label>
                      <Form.Select className="bg-light" name="authorId" value={searchParams.authorId} onChange={handleSearchChange}>
                        <option value="">Select...</option>
                        {people.map(p => <option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-bold small text-muted">Supervisor</Form.Label>
                      <Form.Select className="bg-light" name="supervisorId" value={searchParams.supervisorId} onChange={handleSearchChange}>
                        <option value="">Select...</option>
                        {people.map(p => <option key={p.personid} value={p.personid}>{p.title} {p.firstname} {p.lastname}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-bold small text-muted">Thesis Type</Form.Label>
                      <Form.Select className="bg-light" name="typeId" value={searchParams.typeId} onChange={handleSearchChange}>
                        <option value="">Select...</option>
                        {types.map(t => <option key={t.typeid} value={t.typeid}>{t.typename}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Label className="fw-bold small text-muted">Thesis No</Form.Label>
                      <Form.Control className="bg-light" type="number" name="thesisNo" placeholder="No" value={searchParams.thesisNo} onChange={handleSearchChange} />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-bold small text-muted">Title / Keyword</Form.Label>
                      <Form.Control className="bg-light" type="text" name="title" placeholder="Search by title..." value={searchParams.title} onChange={handleSearchChange} />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-bold small text-muted">Year Range</Form.Label>
                      <InputGroup>
                        <Form.Control className="bg-light" type="number" name="yearStart" placeholder="Start" value={searchParams.yearStart} onChange={handleSearchChange} />
                        <InputGroup.Text>-</InputGroup.Text>
                        <Form.Control className="bg-light" type="number" name="yearEnd" placeholder="End" value={searchParams.yearEnd} onChange={handleSearchChange} />
                      </InputGroup>
                    </Col>
                    <Col md={12}>
                        <Form.Label className="fw-bold small text-muted">Search in Abstract</Form.Label>
                        <Form.Control as="textarea" rows={2} className="bg-light" name="abstract" placeholder="Keywords in abstract..." value={searchParams.abstract} onChange={handleSearchChange} />
                    </Col>
                    <Col md={12} className="d-flex justify-content-end gap-2 mt-3 border-top pt-3">
                      <Button variant="secondary" onClick={handleClearSearch}>Clear</Button>
                      <Button variant="primary" type="submit" className="px-4">Find</Button>
                    </Col>
                  </Row>
                </div>
              )}
            </Form>
          </Card.Body>
        </Card>

        {/* RESULTS ALERT */}
        {isSearchActive && <Alert variant="info" className="d-flex justify-content-between align-items-center shadow-sm mb-4 bg-white border-0 border-start border-info border-5"><span><strong>Results:</strong> {theses.length} records found.</span><Button variant="outline-info" size="sm" onClick={handleClearSearch}>Reset List</Button></Alert>}

        {/* THESIS LIST */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <Card.Header className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center"><h5 className="m-0 fw-bold text-dark">📚 Thesis List</h5><Button variant="success" size="md" className="shadow-sm px-4 rounded-pill" onClick={() => setShowAddThesisModal(true)}>+ Add New Thesis</Button></Card.Header>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading Data...</p>
            </div>
          ) : (
            <Table hover responsive className="m-0 align-middle"><thead className="bg-light text-secondary"><tr><th className="py-3 ps-4">No</th><th className="py-3">Title</th><th className="py-3">Year</th><th className="py-3 text-end pe-4">Actions</th></tr></thead>
              <tbody>
                {theses.length === 0 ? <tr><td colSpan="4" className="text-center py-4 text-muted">No records found.</td></tr> :
                theses.map((thesis) => (<tr key={thesis.thesisno} style={{cursor:'pointer'}}><td className="ps-4"><Badge bg="light" text="dark" className="border">{thesis.thesisno}</Badge></td><td className="fw-bold text-dark">{thesis.title}</td><td className="text-muted">{thesis.year}</td><td className="text-end pe-4"><Button variant="info" size="sm" className="me-2 text-white" onClick={() => { setSelectedThesis(thesis); setShowDetailModal(true); }}>Detail</Button><Button variant="danger" size="sm" onClick={() => handleDeleteThesis(thesis.thesisno)}>Delete</Button></td></tr>))}
              </tbody>
            </Table>
          )}
        </Card>

        {/* --- SYSTEM DATA MANAGEMENT MODAL --- */}
        <Modal show={showDataMgmtModal} onHide={() => setShowDataMgmtModal(false)} size="lg" centered>
           <Modal.Header closeButton><Modal.Title>Data Management</Modal.Title></Modal.Header>
           <Modal.Body>
             <Tabs defaultActiveKey="universities" className="mb-3">
                {/* Universities Tab */}
                <Tab eventKey="universities" title="Universities">
                   <div className="p-3 border rounded bg-light mb-3">
                      <Row><Col md={9}><Form.Control placeholder="University Name" value={newUniversity} onChange={(e)=>setNewUniversity(e.target.value)} /></Col>
                      <Col md={3}><Button variant={editingId?"warning":"success"} className="w-100" onClick={handleSaveUniversity}>{editingId?"Update":"Add"}</Button></Col></Row>
                   </div>
                   <div style={{maxHeight:'300px', overflowY:'auto'}}>
                     <Table size="sm"><tbody>{universities.map(u=><tr key={u.universityid || u.UniversityID}><td>{u.universityname || u.UniversityName}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditUniversity(u)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteUniversity(u.universityid || u.UniversityID)}>Del</Button></td></tr>)}</tbody></Table>
                   </div>
                </Tab>
                {/* Institutes Tab */}
                <Tab eventKey="institutes" title="Institutes">
                   <div className="p-3 border rounded bg-light mb-3">
                      <Row className="g-2"><Col md={5}><Form.Control placeholder="Institute Name" value={newInstitute.name} onChange={(e)=>setNewInstitute({...newInstitute, name: e.target.value})} /></Col>
                      <Col md={5}><Form.Select value={newInstitute.universityId} onChange={(e)=>setNewInstitute({...newInstitute, universityId: e.target.value})}><option value="">Select University...</option>{universities.map(u => <option key={u.universityid || u.UniversityID} value={u.universityid || u.UniversityID}>{u.universityname || u.UniversityName}</option>)}</Form.Select></Col>
                      <Col md={2}><Button variant={editingId?"warning":"success"} className="w-100" onClick={handleSaveInstitute}>{editingId?"Upd":"Add"}</Button></Col></Row>
                   </div>
                   <div style={{maxHeight:'300px', overflowY:'auto'}}><Table size="sm"><tbody>{institutes.map(i=><tr key={i.instituteid}><td>{i.institutename}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditInstitute(i)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteInstitute(i.instituteid)}>Del</Button></td></tr>)}</tbody></Table></div>
                </Tab>
                {/* People Tab */}
                <Tab eventKey="people" title="People">
                   <div className="p-3 border rounded bg-light mb-3">
                      <Row className="g-2"><Col md={3}><Form.Control placeholder="First Name" value={newPerson.firstName} onChange={(e)=>setNewPerson({...newPerson, firstName: e.target.value})} /></Col>
                      <Col md={3}><Form.Control placeholder="Last Name" value={newPerson.lastName} onChange={(e)=>setNewPerson({...newPerson, lastName: e.target.value})} /></Col>
                      <Col md={3}><Form.Select value={newPerson.title} onChange={(e)=>setNewPerson({...newPerson, title: e.target.value})}><option>Student</option><option>Dr.</option><option>Prof.</option></Form.Select></Col>
                      <Col md={3}><Button variant={editingId?"warning":"success"} className="w-100" onClick={handleSavePerson}>{editingId?"Update":"Add"}</Button></Col></Row>
                   </div>
                   <div style={{maxHeight:'300px', overflowY:'auto'}}><Table size="sm"><tbody>{people.map(p=><tr key={p.personid}><td>{p.firstname} {p.lastname}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditPerson(p)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeletePerson(p.personid)}>Del</Button></td></tr>)}</tbody></Table></div>
                </Tab>
                {/* Other Tabs (Types, Topics, Keywords, Languages) follow same pattern */}
                <Tab eventKey="types" title="Types">
                   <div className="p-3 border rounded bg-light mb-3"><Row><Col md={9}><Form.Control placeholder="Type Name" value={newType} onChange={(e)=>setNewType(e.target.value)} /></Col><Col md={3}><Button variant={editingId?"warning":"success"} className="w-100" onClick={handleSaveType}>{editingId?"Update":"Add"}</Button></Col></Row></div>
                   <div style={{maxHeight:'300px', overflowY:'auto'}}><Table size="sm"><tbody>{types.map(t=><tr key={t.typeid}><td>{t.typename}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditType(t)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteType(t.typeid)}>Del</Button></td></tr>)}</tbody></Table></div>
                </Tab>
                <Tab eventKey="topics" title="Topics">
                   <div className="p-3 border rounded bg-light mb-3"><Row><Col md={9}><Form.Control placeholder="Topic Name" value={newTopic} onChange={(e)=>setNewTopic(e.target.value)} /></Col><Col md={3}><Button variant={editingId?"warning":"success"} className="w-100" onClick={handleSaveTopic}>{editingId?"Update":"Add"}</Button></Col></Row></div>
                   <div style={{maxHeight:'300px', overflowY:'auto'}}><Table size="sm"><tbody>{topics.map(t=><tr key={t.topicid}><td>{t.topicname}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditTopic(t)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteTopic(t.topicid)}>Del</Button></td></tr>)}</tbody></Table></div>
                </Tab>
                <Tab eventKey="keywords" title="Keywords">
                   <div className="p-3 border rounded bg-light mb-3"><Row><Col md={9}><Form.Control placeholder="Keyword" value={newKeyword} onChange={(e)=>setNewKeyword(e.target.value)} /></Col><Col md={3}><Button variant={editingId?"warning":"success"} className="w-100" onClick={handleSaveKeyword}>{editingId?"Update":"Add"}</Button></Col></Row></div>
                   <div style={{maxHeight:'300px', overflowY:'auto'}}><Table size="sm"><tbody>{keywords.map(k=><tr key={k.keywordid}><td>{k.keywordname}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditKeyword(k)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteKeyword(k.keywordid)}>Del</Button></td></tr>)}</tbody></Table></div>
                </Tab>
                <Tab eventKey="languages" title="Languages">
                   <div className="p-3 border rounded bg-light mb-3"><Row><Col md={9}><Form.Control placeholder="Language" value={newLanguage} onChange={(e)=>setNewLanguage(e.target.value)} /></Col><Col md={3}><Button variant={editingId?"warning":"success"} className="w-100" onClick={handleSaveLanguage}>{editingId?"Update":"Add"}</Button></Col></Row></div>
                   <div style={{maxHeight:'300px', overflowY:'auto'}}><Table size="sm"><tbody>{languages.map(l=><tr key={l.languageid}><td>{l.languagename}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>handleEditLanguage(l)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>handleDeleteLanguage(l.languageid)}>Del</Button></td></tr>)}</tbody></Table></div>
                </Tab>
             </Tabs>
           </Modal.Body>
           <Modal.Footer><Button variant="secondary" onClick={() => setShowDataMgmtModal(false)}>Close</Button></Modal.Footer>
        </Modal>
        
        {/* Add Thesis Modal */}
        <Modal show={showAddThesisModal} onHide={() => setShowAddThesisModal(false)} size="xl" centered>
           <Modal.Header closeButton><Modal.Title>Add New Thesis</Modal.Title></Modal.Header>
           <Modal.Body>
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

        {/* Detail Modal */}
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
          <Modal.Header closeButton><Modal.Title>Thesis Details</Modal.Title></Modal.Header>
          <Modal.Body>{selectedThesis && (<div><h4>{selectedThesis.title}</h4><p><strong>Abstract:</strong> {selectedThesis.abstract}</p><p><strong>Year:</strong> {selectedThesis.year} | <strong>No:</strong> {selectedThesis.thesisno}</p></div>)}</Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button></Modal.Footer>
        </Modal>

        {/* --- MODAL 6: ADD PERSON --- */}
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