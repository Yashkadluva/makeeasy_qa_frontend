
import { useState } from "react";
import editicon from "../../../../assets/images/edit.svg";
import { Row, Col, Button } from "react-bootstrap";
import { useSelector } from 'react-redux';
import { RootState } from '../../../../config/Store';
import { InviceSDMasterState } from '../../../../reducer/CommonReducer';
import HelperService from "../../../../utility/HelperService";
import NotesBlade from "../../../../components/NotesBlade/NotesBlade";



const SMNotes = () => {
    const [editData, setEditData] = useState<any>({})
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const [isShowEditModel, setShowEditModel] = useState(false)
    const closeModal = (value: any, e: any) => {
        setEditData("")
        setShowEditModel(value)
    }


    const onEdit = (e:any) => {
        if(e == "Internal Notes"){
            let obj = {data : invoceSDMaster?.invoceSDMaster?.SDServiceMaster?.InternalNotes, type:"Internal Notes" }
            setEditData(obj);
        }else if(e == "External Notes"){
            let obj = {data : invoceSDMaster?.invoceSDMaster?.SDServiceMaster?.Notes, type:"External Notes" }
            setEditData(obj);
        }
        setShowEditModel(true)
    }




    return <>
        {/* <NotesBlade */}

        <NotesBlade
            isShow={isShowEditModel}
            isClose={closeModal}
            title="Edit Note"
            data={editData.data}
            type={editData.type}
          />

        <div className="tab-style-2 call-info-tabs mb-0">

            <Row className="text-dark">
                <Col lg={12} className="border-bottom border-light pb-2 mb-2">
                    <label className="font-16 mb-1 font-w-medium">Internal Notes</label>
                    <div dangerouslySetInnerHTML={{__html:invoceSDMaster?.invoceSDMaster?.SDServiceMaster?.InternalNotes ? invoceSDMaster?.invoceSDMaster?.SDServiceMaster?.InternalNotes : ""}}>
                         </div>
                    <div className="text-end">
                        {/* <a onClick={() => onEdit('Internal Notes')}> <img src={editicon} alt="edit" className="theme-icon-color" width={18} /> </a> */}
                        <Button variant="light" className="btn-brand-light btn-small" onClick={() => onEdit('Internal Notes')}>Edit</Button>
                    </div>

                </Col>
                <Col lg={12} className=" pb-2">
                    <label className="font-16 mb-1 font-w-medium">External Notes</label>
                    <div dangerouslySetInnerHTML={{__html:invoceSDMaster?.invoceSDMaster?.SDServiceMaster?.Notes ? invoceSDMaster?.invoceSDMaster?.SDServiceMaster?.Notes : ""}}>
                    </div>
                    <div className="text-end">
                        {/* <a onClick={() => onEdit('External Notes')}> <img src={editicon} alt="edit" className="theme-icon-color" width={18} /> </a> */}
                        <Button variant="light" className="btn-brand-light btn-small" onClick={() => onEdit('External Notes')}>Edit</Button>
                    </div>

                </Col>
            </Row>

        </div>
    </>;
};

export default SMNotes;

