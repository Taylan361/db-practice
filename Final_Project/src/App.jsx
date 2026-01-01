import { useEffect, useState } from "react";
import { Container, Table, Button, Form, Row, Col, Alert, Spinner, Card, Modal, Badge, Navbar, Nav } from "react-bootstrap";
import { getTheses, addThesis, deleteThesis, getPeople, getInstitutes, getLanguages, getTypes, searchTheses, addPerson } from "./api";
import "./App.css";

function App() {

  // --- STATES ---
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  // Page Transition State
  const [showLogicPage, setShowLogicPage] = useState(false);

  // Modal States
  const [showAddThesisModal, setShowAddThesisModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data States
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

  // --- NOTIFICATION ---
  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3500);
  };

  // --- LOAD DATA ---
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
        console.error("Data loading error:", err);
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  // --- SEARCH ---
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSearchActive(true);
    try {
      const res = await searchTheses(searchParams);
      setTheses(res.data);
      setLoading(false);
      if(res.data.length > 0) showToast(`${res.data.length} records found.`);
    } catch (err) {
      console.error("Search error:", err);
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

  // --- ADD THESIS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addThesis(formData);
      showToast("✅ Thesis Added Successfully!");
      
      const res = await getTheses(); 
      setTheses(res.data);
      
      e.target.reset();
      setFormData({
        thesisNo: "", title: "", abstract: "", year: new Date().getFullYear(),
        pageNum: "", typeId: "", instituteId: "", authorId: "", supervisorId: "", languageId: ""
      });
      setShowAddThesisModal(false);
      
    } catch (err) {
      alert("Add Error: " + err.message);
    }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this thesis?")) {
      try {
        await deleteThesis(id);
        const res = await getTheses();
        setTheses(res.data);
        showToast("🗑️ Thesis deleted.");
      } catch (err) {
        alert("Delete error occurred.");
      }
    }
  };

  // --- ADD PERSON ---
  const handleAddPerson = async () => {
    try {
      await addPerson(newPerson);
      showToast(`👤 ${newPerson.firstName} successfully added!`);
      setShowPersonModal(false);
      setNewPerson({ firstName: "", lastName: "", title: "Student", email: "" });
      
      const peopleRes = await getPeople();
      setPeople(peopleRes.data);
    } catch (err) {
      alert("Could not add person: " + err.message);
    }
  };

  const handleShowDetail = (thesis) => {
    setSelectedThesis(thesis);
    setShowDetailModal(true);
  };

  return (
    <div style={{
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95))",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      width: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      paddingTop: "30px",
      paddingBottom: "50px"
    }}>

      <Container>
        
        {/* --- HEADER (NAVBAR) --- */}
        <Navbar bg="white" expand="lg" className="shadow-lg rounded-3 mb-5 px-4 py-3 border-bottom">
          <Container fluid>
            <Navbar.Brand 
              href="#" 
              onClick={() => setShowLogicPage(false)} 
              className="fw-bold text-dark d-flex align-items-center"
              style={{ fontSize: '1.6rem', letterSpacing: '-0.5px' }}
            >
              <span style={{ marginRight: '12px', fontSize: '1.8rem' }}>🎓</span> 
              Thesis Systems
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link 
                  onClick={() => setShowLogicPage(false)} 
                  className={`fw-bold px-3 ${!showLogicPage ? 'text-primary bg-light rounded' : 'text-secondary'}`}
                >
                  Home
                </Nav.Link>
                <Nav.Link 
                  onClick={() => setShowLogicPage(true)} 
                  className={`fw-bold px-3 ${showLogicPage ? 'text-primary bg-light rounded' : 'text-secondary'}`}
                >
                  How it Works
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* --- NOTIFICATION --- */}
        {showNotification && (
          <div className="custom-toast-container">
            <div className="custom-toast">
              <div className="toast-icon">✔</div>
              <div className="toast-message">{notificationMessage}</div>
            </div>
          </div>
        )}

        {/* --- PAGE CONTENT SWITCH --- */}
        {showLogicPage ? (
          
          /* --- LOGIC PAGE (ENGLISH) --- */
          <div className="animate-fade-in">
             <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">System Architecture & Workflow</h2>
                <p className="text-muted">This project is developed using a 3-tier architecture with modern web technologies.</p>
             </div>

             <Row className="g-4">
                {/* Card 1: Frontend */}
                <Col md={4}>
                  <Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #0d6efd"}}>
                    <Card.Body>
                      <div className="display-4 text-primary mb-3">🖥️</div>
                      <Card.Title className="fw-bold">1. Frontend (UI)</Card.Title>
                      <Card.Text className="text-muted">
                        User interaction is handled by <strong>React.js</strong> and <strong>React Bootstrap</strong>. 
                        Forms, dynamic tables, and modals are managed in this layer.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Card 2: Backend */}
                <Col md={4}>
                  <Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #6610f2"}}>
                    <Card.Body>
                      <div className="display-4 text-primary mb-3">⚙️</div>
                      <Card.Title className="fw-bold">2. API & Backend</Card.Title>
                      <Card.Text className="text-muted">
                        Requests from React (GET, POST, DELETE) are handled by the server. 
                        Business logic and validation occur here before database interaction.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Card 3: Database */}
                <Col md={4}>
                  <Card className="h-100 shadow border-0 text-center p-3" style={{borderTop: "5px solid #198754"}}>
                    <Card.Body>
                      <div className="display-4 text-primary mb-3">🗄️</div>
                      <Card.Title className="fw-bold">3. Database</Card.Title>
                      <Card.Text className="text-muted">
                        A relational database structure is used.
                        <strong>Theses</strong>, <strong>Authors</strong>, and <strong>Institutes</strong> are linked via foreign keys to ensure data integrity.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
             </Row>
          </div>

        ) : (
          
          /* --- MAIN APPLICATION (ENGLISH) --- */
          <>
            {/* SEARCH PANEL */}
            <Card className="mb-4 p-4 shadow-sm border-0" style={{ borderTop: "4px solid var(--yok-blue)", backgroundColor: "white" }}>
              <h5 className="mb-3 text-secondary d-flex align-items-center">
                <span className="me-2">🔍</span> Advanced Thesis Search
              </h5>
              <Form onSubmit={handleSearchSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Control className="bg-light" type="text" name="title" placeholder="Search Keyword (Title or Abstract)..." value={searchParams.title} onChange={handleSearchChange} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Select className="bg-light" name="authorId" value={searchParams.authorId} onChange={handleSearchChange}>
                      <option value="">All Authors</option>
                      {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select className="bg-light" name="typeId" value={searchParams.typeId} onChange={handleSearchChange}>
                      <option value="">All Types</option>
                      {types.map(t => (<option key={t.typeid} value={t.typeid}>{t.typename}</option>))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Control className="bg-light" type="number" name="year" placeholder="Year" value={searchParams.year} onChange={handleSearchChange} />
                  </Col>
                </Row>
                <div className="d-flex justify-content-end mt-2 gap-2">
                  <Button variant="outline-secondary" onClick={handleClearSearch}>Clear</Button>
                  <Button variant="primary" type="submit" className="px-4">Search</Button>
                </div>
              </Form>
            </Card>

            {/* RESULTS ALERT */}
            {isSearchActive && (
              <Alert variant="info" className="d-flex justify-content-between align-items-center shadow-sm mb-4 bg-white border-0 border-start border-info border-5">
                <span><strong>Results:</strong> {theses.length} records found.</span>
                <Button variant="outline-info" size="sm" onClick={handleClearSearch}>Reset List</Button>
              </Alert>
            )}

            {/* THESIS LIST */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <Card.Header className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="m-0 fw-bold text-dark d-flex align-items-center">
                   📚 Thesis List
                </h5>
                <Button variant="success" size="md" className="shadow-sm px-4 rounded-pill" onClick={() => setShowAddThesisModal(true)}>
                  + Add New Thesis
                </Button>
              </Card.Header>

              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading...</p>
                </div>
              ) : (
                <Table hover responsive className="m-0 align-middle">
                  <thead className="bg-light text-secondary">
                    <tr>
                      <th className="py-3 ps-4">No</th>
                      <th className="py-3">Title</th>
                      <th className="py-3">Year</th>
                      <th className="py-3 text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theses.map((thesis) => (
                      <tr key={thesis.thesisno} style={{cursor:'pointer'}}>
                        <td className="ps-4"><Badge bg="light" text="dark" className="border">{thesis.thesisno}</Badge></td>
                        <td className="fw-bold text-dark">{thesis.title}</td>
                        <td className="text-muted">{thesis.year}</td>
                        <td className="text-end pe-4">
                          <Button variant="info" size="sm" className="me-2 text-white" onClick={() => handleShowDetail(thesis)}>Detail</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(thesis.thesisno)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          </>
        )}

        {/* --- MODALS --- */}
        
        {/* Modal 1: Add Thesis */}
        <Modal show={showAddThesisModal} onHide={() => setShowAddThesisModal(false)} size="xl" centered>
           <Modal.Header closeButton className="bg-light">
            <Modal.Title className="text-success fw-bold">📝 New Thesis Entry</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-end mb-3">
              <Button variant="outline-primary" size="sm" onClick={() => setShowPersonModal(true)}>
                + Add New Person (if not listed)
              </Button>
            </div>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thesis No</Form.Label>
                    <Form.Control type="number" name="thesisNo" onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" name="title" onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Year</Form.Label>
                    <Form.Control type="number" name="year" defaultValue={2025} onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Abstract</Form.Label>
                <Form.Control as="textarea" rows={4} name="abstract" onChange={handleChange} required />
              </Form.Group>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Author</Form.Label>
                    <Form.Select name="authorId" onChange={handleChange} required>
                      <option value="">Select...</option>
                      {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Supervisor</Form.Label>
                    <Form.Select name="supervisorId" onChange={handleChange} required>
                      <option value="">Select...</option>
                      {people.map(p => (<option key={p.personid} value={p.personid}>{p.firstname} {p.lastname}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Institute</Form.Label>
                    <Form.Select name="instituteId" onChange={handleChange} required>
                      <option value="">Select...</option>
                      {institutes.map(i => (<option key={i.instituteid} value={i.instituteid}>{i.institutename}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
               <Row>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Language</Form.Label>
                    <Form.Select name="languageId" onChange={handleChange} required>
                      <option value="">Select...</option>
                      {languages.map(l => (<option key={l.languageid} value={l.languageid}>{l.languagename}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select name="typeId" onChange={handleChange} required>
                      <option value="">Select...</option>
                      {types.map(t => (<option key={t.typeid} value={t.typeid}>{t.typename}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                   <Form.Group className="mb-3">
                    <Form.Label>Pages</Form.Label>
                     <Form.Control type="number" name="pageNum" onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={() => setShowAddThesisModal(false)}>Cancel</Button>
                <Button variant="success" type="submit" className="fw-bold px-4">+ Save</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal 2: Detail */}
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="text-primary">📄 Thesis Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedThesis && (
              <div>
                <h4 className="text-dark mb-3">{selectedThesis.title}</h4>
                <div className="p-3 bg-light border rounded mb-3">
                  <p className="mb-1"><strong>Abstract:</strong></p>
                  <p className="text-muted fst-italic">{selectedThesis.abstract}</p>
                </div>
                <Row>
                  <Col md={6}>
                    <p><strong>Thesis No:</strong> <Badge bg="primary">{selectedThesis.thesisno}</Badge></p>
                    <p><strong>Year:</strong> {selectedThesis.year}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Pages:</strong> {selectedThesis.pagenum}</p>
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        {/* Modal 3: Add Person */}
        <Modal show={showPersonModal} onHide={() => setShowPersonModal(false)} centered style={{ zIndex: 1060 }}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Person</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" value={newPerson.firstName} onChange={(e) => setNewPerson({ ...newPerson, firstName: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" value={newPerson.lastName} onChange={(e) => setNewPerson({ ...newPerson, lastName: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Select value={newPerson.title} onChange={(e) => setNewPerson({ ...newPerson, title: e.target.value })}>
                  <option value="Student">Student</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Assoc. Prof.">Assoc. Prof.</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={newPerson.email} onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPersonModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddPerson}>Save</Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
}

export default App;