import WorkDescriptionImg from "../../../../assets/images/icon-work-description.svg";
import TechTime from "../../../../assets/images/icon-time-note.svg";
import ProbDescrp from "../../../../assets/images/icon-prob-description.svg";
import smNote from "../../../../assets/images/icon-sm-note.svg";
import BackComponent from "../../../../components/BackComponent/BackComponent";
import { Tabs, Tab, Card, Row, Col } from "react-bootstrap";
import "./InvoiceEntry.scss"
import WorkDescription from "./WorkDescription"
import ProblemDescriptionAndSpecialInstruction from "./ProblemDescriptionAndSpecialInstruction";
import SMNotes from "./SMNotes";
import TechNote from "./TechNote";



const DescriptionNotes = () => {
  return <>
    <div className=''>
      <Row>
        <Col md={12} id="wideCol">
          <BackComponent title={'Description & Notes'} />
          <Card className="card-style">
            <div className="tab-style-2 descrip-note-tabs mb-0">
              <Tabs defaultActiveKey="serviceMaster" >
                <Tab
                  eventKey="serviceMaster"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          WorkDescriptionImg
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      <label className="nav-text">Work Description</label>
                    </div>
                  }
                >
                  <WorkDescription />
                </Tab>
                <Tab
                  eventKey="defaults"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          TechTime
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      <label className="nav-text">Tech Time/ Notes</label>
                    </div>
                  }
                >
                  <TechNote />
                </Tab>
                <Tab
                  eventKey="notes"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          ProbDescrp
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      <label className="nav-text">PD/SI</label>
                    </div>
                  }
                >
                  <ProblemDescriptionAndSpecialInstruction />
                </Tab>
                <Tab
                  eventKey="map"
                  title={
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <img
                        src={
                          smNote
                        }
                        className="theme-icon-color"
                        height={21}
                        width={21}
                      />
                      {" "}
                      <label className="nav-text">SM Notes</label>
                    </div>
                  }
                >
                  <SMNotes />
                </Tab>
              </Tabs>
            </div>




          </Card>
        </Col>
      </Row>
    </div>

  </>;
};

export default DescriptionNotes;

