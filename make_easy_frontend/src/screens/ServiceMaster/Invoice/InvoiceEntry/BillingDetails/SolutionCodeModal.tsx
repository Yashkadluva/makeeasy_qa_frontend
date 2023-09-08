import { useRef, useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";


interface PropData {
  isShow: boolean;
  isClose: any;
  title: string;
}

const SolutionCodeModal = (props: PropData) => {
  const onCloseModal = (e: any) => {
    props.isClose(!props.isShow, e);
  };
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [bladeTitle, setBladeTitle] = useState("Solution Code");

  return (

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
        <p>Try Me ...</p>

        <div className="offcanvas-footer mt-4 position-absolute">
          <Button
            variant="primary"
            className="btn-brand-solid me-3"
            type="submit"
            // onClick={() => onSave()}
          >
            Submit
          </Button>
          <Button
            variant="primary"
            className="btn-brand-outline"
          >
            Cancel
          </Button>
        </div>


      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SolutionCodeModal;
