import { useState } from "react";
import editicon from "../../../../assets/images/edit.svg";
import { Row, Col, Button } from "react-bootstrap";
import { useSelector } from 'react-redux';
import { RootState } from '../../../../config/Store';
import { InviceSDMasterState } from '../../../../reducer/CommonReducer';
import HelperService from "../../../../utility/HelperService";
import ProblemDescriptionBlade from "../InvoiceEntryBlade/ProblemDescription/ProblemDescriptionBlade";




const ProblemDescriptionAndSpecialInstruction = () => {
  const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
    (state) => state.invoceSDMaster);
  const [editData, setEditData] = useState<any>({});
  const [problemDescription, setProblemDescription] = useState<any>(invoceSDMaster?.invoceSDMaster?.SDCallMaster?.ProblemDescription ? invoceSDMaster?.invoceSDMaster?.SDCallMaster?.ProblemDescription : "")

  const [isShowEditModel, setShowEditModel] = useState(false)
  const closeModal = (value: any, e: any) => {
    setEditData("")
    setShowEditModel(value)
    setProblemDescription(e)
  }

  const onEdit = () => {
    let obj = {
      AccountId: invoceSDMaster?.invoceSDMaster?.AccountId ? invoceSDMaster?.invoceSDMaster?.AccountId : "",
      CompanyId: invoceSDMaster?.invoceSDMaster?.CompanyId ? invoceSDMaster?.invoceSDMaster?.CompanyId : "",
      SDCallMasterId: invoceSDMaster?.invoceSDMaster?.SDCallMasterId ? invoceSDMaster?.invoceSDMaster?.SDCallMasterId : "",
      SDServiceMasterId: invoceSDMaster?.invoceSDMaster?.SDServiceMasterId ? invoceSDMaster?.invoceSDMaster?.SDServiceMasterId : "",
      Type: invoceSDMaster?.invoceSDMaster?.SDCallMaster?.CallStatus ? invoceSDMaster?.invoceSDMaster?.SDCallMaster?.CallStatus : "",
      Description: problemDescription,
    }
    setEditData(obj);
    setShowEditModel(true)
  }



  // var data = res.content && res.content.replace(/(?:\r\n|\r|\n)/g, "<br />")

  return <>
    {/* <NotesBlade */}
    <ProblemDescriptionBlade
      isShow={isShowEditModel}
      isClose={closeModal}
      data={editData}
    />

    <div className="tab-style-2 call-info-tabs mb-0">

      <Row className="text-dark">
        <Col lg={12} className="border-bottom border-light pb-2 mb-2">
          <label className="font-16 mb-1 font-w-medium">Problem Description</label>


          <div className="font-14" dangerouslySetInnerHTML={{ __html: problemDescription.replace(/(?:\r\n|\r|\n)/g, "<br />") }}>
          </div>
          <div className="text-end">
            {/* <a onClick={() => onEdit()} href="javascript:void(0)" > <img src={editicon} alt="edit" width={18} className="theme-icon-color" /> </a> */}
            <Button variant="light" className="btn-brand-light btn-small" onClick={() => onEdit()}>Edit</Button>
          </div>
        </Col>
        <Col lg={12} className="pb-2">
          <label className="font-16 mb-1 font-w-medium">Special Instruction</label>
          <div className="font-14">{invoceSDMaster?.invoceSDMaster?.SDCallMaster?.SpecialInstructions ? HelperService.removeHtml(invoceSDMaster?.invoceSDMaster?.SDCallMaster?.SpecialInstructions) : ""}</div>
        </Col>
      </Row>

    </div>
  </>;
};

export default ProblemDescriptionAndSpecialInstruction;

