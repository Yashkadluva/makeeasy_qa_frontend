import { useRef, useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import { useSelector, useDispatch } from "react-redux";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Label } from "../../../../../components/Label/Label";
import { Row, Col } from "react-bootstrap";
import { Dispatch } from "redux";
import { Id, toast } from "react-toastify";
import WebService from "../../../../../utility/WebService";
import Loader from "../../../../../components/Loader/Loader";
import TextEditor from "../../../../../components/TextEditor/TextEditor";

interface PropData {
  isShow: boolean;
  isClose: any;
  data: any;
  isEdit:boolean;
}

const AddTechNotesBlade = (props: PropData) => {
  const onCloseModal = (e: any) => {
    setpreviousData("")
    props.isClose(!props.isShow, e);
  };
  const [isLoading, setLoading] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const dispatch: Dispatch<any> = useDispatch();
  const [previousData, setpreviousData] = useState<any>();
  // const [dataId, setDataId ] = useState<any>() ;
  const [ShowLoader, setShowLoader] = useState(false);
  const [bladeTitle, setBladeTitle] = useState("Add Tech Notes");

  useEffect(() => {
    if (props.isEdit) {
      setpreviousData(props?.data?.TechNotes);
      setBladeTitle("Edit Tech Notes");
    } else {
      setBladeTitle("Add Tech Notes");
    }
  }, [props.data, props.isShow]);

  const currentValue = (value: any) => {
    setpreviousData("");
    setpreviousData(value);
  };

  const onSave = () => {
    if (previousData == "") {
      toast.error("Please Enter Tech Notes");
    } else {
      setLoading(true)
      let requestBody = {
        AccountId: user_info["AccountId"],
        CompanyId: user_info["CompanyId"],
        SDCallMasterId: props.data.SDCallMasterId,
        CallSequence: props.data.CallSequence,
        TechNum: props.data.SetupSaiSDTechMaster.TechNum,
        ServiceDate: props.data.ServiceDate,
        TechNotes: previousData,
        Id: props?.data?.Id
      };
      WebService[bladeTitle == "Add Tech Notes" ? "postAPI" : "putAPI"]({
        action: `SDTechNotes`,
        body: requestBody,
      })
        .then((res: any) => {
          setLoading(false);
          bladeTitle == "Add Tech Notes"
            ? toast.success("Tech Notes Created Succesfully")
            : toast.success("Tech Notes Updated Succesfully");
          onCloseModal("reset");
        })
        .catch((e) => {
          setLoading(false);
        });
    }
  }

  return (

    <Offcanvas
      show={props.isShow}
      onHide={() => onCloseModal("no")}
      placement={"end"}
      className="offcanvas-large"
    >
      <Loader show={isLoading} />
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">

        <Loader show={isLoading} />
        <div className="modal-inner-min-h">
          <div className="col-12 form-group form-style">
            <div className="textEditorInput mt-3 " >
              <TextEditor
              type={"NORMAL"}
                data={previousData}
                editedData={currentValue}
                height={500}
              />
            </div>
          </div>
        </div>
        <div className="offcanvas-footer mt-4 position-absolute">
          <Button
            variant="primary"
            className="btn-brand-solid me-3"
            type="submit"
            onClick={() => onSave()}
          >
            Submit
          </Button>
          <Button
            variant="primary"
            className="btn-brand-outline"
            type="button"
            onClick={() => onCloseModal("no")}
          >
            Cancel
          </Button>
        </div>


      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default AddTechNotesBlade;
