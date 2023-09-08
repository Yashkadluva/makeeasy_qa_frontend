import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../config/Store";
import { SDMaster } from "../../../../../reducer/CommonReducer";
import WebService from "../../../../../utility/WebService";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Dispatch } from "redux";
import { useOutletContext } from "react-router-dom";
import Loader from "../../../../../components/Loader/Loader";
import TextEditor from "../../../../../components/TextEditor/TextEditor";
import { Label } from "../../../../../components/Label/Label";
import BsButton from "react-bootstrap/Button";
import StandardDescriptionModal from "../../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import { toast } from "react-toastify";

interface PropData {
  isShow: boolean;
  isClose: any;
  title: string;
  data: any;
}

const WorkDescriptionBlade = (props: PropData) => {
  const [isLoading, setLoading] = useState(false);
  const [isShowStandardDescription, setShowStandardDescription] =
    useState(false);
  const value: any = useSelector<RootState, SDMaster>(
    (state) => state.sdMaster
  );
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const dispatch: Dispatch<any> = useDispatch();
  const previousData  = useRef<any>("");
  const data: any = useOutletContext();
  const [bladeTitle, setBladeTitle] = useState("Edit Work Description");

  useEffect(() => {
    if (props?.data?.Id) {
      previousData.current = props?.data?.WorkDescription ;
      setBladeTitle("Edit Work Description");
    } else {
      setBladeTitle("Add Work Description");
    }
  }, [props.data, props.isShow]);

  const currentValue = (value: any) => {
    previousData.current = value;
  };

  const onCloseModal = (e: any) => {
    previousData.current = "";
    props.isClose(!props.isShow, e);
  };

  const onSave = () => {
    if (previousData.current == "") {
      toast.error("Please Enter Work Description");
    } else {
      setLoading(true);
      let requestBody = {
        AccountId: user_info["AccountId"],
        CompanyId: user_info["CompanyId"],
        InvoiceNum: props?.title ? props?.title : "",
        ServiceDate: "",
        WorkDescription: previousData.current,
        Id: props?.data?.Id ? props?.data?.Id : "",
      };
      WebService[bladeTitle == "Edit Work Description" ? "putAPI" : "postAPI"]({
        action: `SDWorkDescription`,
        body: requestBody,
      })
        .then((res: any) => {
          setLoading(false);
          bladeTitle == "Edit Work Description"
            ? toast.success("Work Description Created Succesfully")
            : toast.success("Work Description Updated Succesfully");
          onCloseModal("reset");
        })
        .catch((e) => {
          setLoading(false);
        });
    }
  };

  const closeStandardDescription = (value: any, type: any, data: any) => {
    if (type === "ON_SAVE") {
      if (previousData.current) {
        previousData.current = (`${previousData.current} ${data}`);
      } else {
        previousData.current = `${data}`;
      }
    }
    setShowStandardDescription(value);
  };

  return (
    <>
      <Loader show={isLoading} />
      <StandardDescriptionModal
        isShow={isShowStandardDescription}
        isClose={closeStandardDescription}
        title="Standard Descriptions"
        workDescription={true}
      />

      <Offcanvas
        show={props.isShow}
        onHide={() => onCloseModal("no")}
        placement={"end"}
        className="offcanvas-large"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
          <div className="form-style">
            <Loader show={isLoading} />
            <div className="notes-edit-view mx-0 modal-body px-3 mt-2">
              <div className="text-end mb-2">

                <BsButton
                  variant="primary"
                  className="btn-brand-light"
                  onClick={() => setShowStandardDescription(true)}
                  type="button"
                >
                  Standard Description
                </BsButton>
              </div>
              <div className="mb-3">
                <TextEditor
                  type={"NORMAL"}
                  data={previousData.current}
                  height={parseInt(window.innerHeight - 300 + "")}
                  editedData={currentValue}
                />
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
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default WorkDescriptionBlade;
