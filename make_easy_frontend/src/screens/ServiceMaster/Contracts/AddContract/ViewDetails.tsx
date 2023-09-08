import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';


import { PatchCheckFill } from 'react-bootstrap-icons';

import ImgBackArrow from "../../../../assets/images/left-arrow-black.svg"
//import WebService from "../../../utility/WebService";
//import { useDispatch, useSelector } from "react-redux";
//import { RootState } from "../../../config/Store";
import "./AddContracts.scss";

const ViewDetails = () => {
  const goBack = () => {
    window.history.back();
  };


  return (
    <>
      <div className="page-content-wraper">
        <Breadcrumb>
          <Breadcrumb.Item href="#">UpWork</Breadcrumb.Item>
          <Breadcrumb.Item href=" ">
            Service Contract
          </Breadcrumb.Item>
          <Breadcrumb.Item active>View Details</Breadcrumb.Item>
        </Breadcrumb>
        <div className="content-card card">
          <Row className="mb-3">
            <Col md={'6'}>
              <div className="d-flex align-items-center">
                <Button variant="link" className="ps-0" onClick={goBack}><img src={ImgBackArrow} className='menu-icon' alt={'Back icon'} width={'20'} height={"20"} /></Button>
                <h2 className="page-title">Apple_New Apple <PatchCheckFill size={20} className="text-success ms-3" /> <span className="text-success font-14 font-w-regular">Approved</span></h2>
              </div>
            </Col>
            <Col md={'6'} className="text-end">
              <Dropdown className="action-dd">
                <Dropdown.Toggle   id="dropdown-basic">
                <img
                src={require("../../../../assets/images/blue-hamburg-icon.svg").default}
                className="hamburg-icon show"
                alt="hamburg"
              />
                <img src={require("../../../../assets/images/cross-icon-new.svg").default}
                className="hamburg-icon close"
                alt="hamburg"
              />
              </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#/action-1" disabled>Approve</Dropdown.Item>
                  <Dropdown.Item href="#/action-1">Edit</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Renew</Dropdown.Item>
                  <Dropdown.Item href="#/action-3">Cancel</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
          <Card className="mb-3">
            <Card.Body className="">
              <Row className="border-bottom pb-2 align-items-center mb-2">
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Contract #</span>
                  <span className="">AMC</span>
                </Col>
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block"># Of Systems</span>
                  <span className="">12</span>
                </Col>
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Start Date</span>
                  <span className="">566-545-4565</span>
                </Col>
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Expiration Date</span>
                  <span className="">09/30/22</span>
                </Col>
              </Row>
              <Row className=" pb-2 align-items-center mb-2 border-bottom">
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Contract Type</span>
                  <span className="">CPM</span>
                </Col>
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Customer PO</span>
                  <span className="">112233</span>
                </Col>
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Amount</span>
                  <span className="">3,450,000.00</span>
                </Col>
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Location</span>
                  <span className="">Test Location</span>
                </Col>
              </Row>
              <Row className=" pb-2 align-items-center ">
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Class</span>
                  <span className="">ABC</span>
                </Col>
                <Col lg={3} md={4}>
                  <span className="text-secondary d-block">Salesman</span>
                  <span className="">Carl Hornsby</span>
                </Col>
                <Col lg={3} md={4}>
                  <Form.Check
                    type="switch"
                    disabled
                    id="ContractBilling"
                    label="Contract Billing"
                  />
                </Col>
                <Col lg={3} md={4}>
                  <Form.Check
                    type="switch"
                    disabled
                    checked
                    id="ReserveAccounting"
                    label="Reserve Accounting"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4 className="font-18 mb-0">Contract Description</h4>
            </Card.Header>
            <Card.Body>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cupiditate doloribus quis excepturi non ducimus ea. Sint labore dolores consectetur dicta nostrum! Inventore hic, nostrum atque harum maiores nesciunt dolorum pariatur.
            </Card.Body>
          </Card>

          <Tabs
            defaultActiveKey="Profitability"
            id="jnoanim-tab-example"
            className="mb-3 tab-style-1"
          >
            <Tab eventKey="Profitability" title="Profitability">
              <Row>
                <Col md={6}>
                  <img src="http://139.59.31.42/graph.png" className="w-100" alt="" />
                </Col>
                <Col md={6}>
                  <img src="http://139.59.31.42/table.png" className="w-100" alt="" />
                </Col>
              </Row>
            </Tab>
            {/* Tab 2  listing */}
            <Tab eventKey="Equipment" title="Equipment">
              <h4 className="text-secondary text-center">Equipment Table</h4>
            </Tab>
            <Tab eventKey="RegularBilling" title="Regular Billing">
              <h4 className="text-secondary text-center">Regular Billing Table</h4>
            </Tab>
            <Tab eventKey="ReserveAccounting " title="Reserve Accounting ">
              <h4 className="text-secondary text-center">Reserve Accounting  Table</h4>
            </Tab>
            <Tab eventKey="MaintenanceSchedule " title="Maintenance Schedule ">
              <h4 className="text-secondary text-center">Maintenance Schedule Table</h4>
            </Tab>
            <Tab eventKey="Note " title="Note">
              <Form className="form-style">
                <Form.Group className="mb-3" >
                  <Form.Label className="mb-0 mt-2">Note
                  </Form.Label>
                  <Button variant="light" className="btn-brand-light float-end mb-2 ">Save</Button>
                  <Form.Control as="textarea" rows={4} className="h-auto" />
                </Form.Group>
              </Form>
            </Tab>
          </Tabs>

        </div>

      </div>

    </>
  );
};

export default ViewDetails;
