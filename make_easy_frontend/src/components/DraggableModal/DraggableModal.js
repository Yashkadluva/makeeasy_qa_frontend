import ReactModal from "react-modal-resizable-draggable";
import "./DraggableModal.scss";
import ForgotPasswordModal from "../ForgotPasswordModal/ForgotPasswordModal";
import AlertModal from "../AlertModal/AlertModal";
import DeleteModal from "../DeleteModal/DeleteModal";
import ZoomImageModal from "../AddEquipmentModal/ZoomImageModal";
import DocumentPreviewModal from "../AddDocumentModal/DocumentPreviewModal";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import CopyMoveModal from "../../screens/DispatchBoard/CopyMoveModal/CopyMoveModal";
import AddOutcomeModal from "../../screens/CallTimeEntry/AddOutcomeModal";
import { useEffect, useState } from "react";
import ConfirmGenerateBilligModal from "../../screens/Contract/GenerateContractBilling/ConfirmGenerateBilligModal";

const DraggableModal = (props) => {
  const closeModal = (showGoogleModal, data) => {
    if (showGoogleModal && data) {
      props.onClose(false, showGoogleModal, data);
    } else {
      props.onClose(false);
    }
  };

  // useEffect(() => { setTop(10); setLeft(10) }, [props.isOpen])

  const [top, setTop] = useState(10);
  const [left, setLeft] = useState(10);

  return (
    <>
      <div className="dragModal alert-modal">
        <ReactModal
          initWidth={
            props.width
              ? props.width
              : window.innerWidth - window.innerWidth / 3
          }
          initHeight={"auto"}
          onRequestClose={props.closeModal}
          disableResize={true}
          isOpen={props.isOpen}
        >
          <div className="modal-header">
            <div className="modal-title d-flex justify-content-start mt-2">
              {props.title}{" "}
            </div>
            <div className="modal-title d-flex justify-content-end ">
              <img
                src={require("../../assets/images/cross-black.svg").default}
                alt="right-arrow"
                onClick={() => closeModal()}
                width={20}
                height={15}
                className="right-icon theme-icon-color"
              />
            </div>
          </div>
          <div className="modal-body">
            {props.type === "FORGOT_PASSWORD" && (
              <ForgotPasswordModal close={closeModal} />
            )}
            {props.type === "ALERT_MODEL" && (
              <AlertModal
                close={closeModal}
                message={props.previousData}
              />
            )}
            {props.type === 'DELETE_MODAL' && (
              <DeleteModal
                close={closeModal}
                message={props.message}
                onDelete={props.delete}
              />
            )}
            {props.type === 'CONFIRM_MODAL' && (
              <ConfirmModal
                close={(e, data) => closeModal(e, data)}
                onConfirm={props.onConfirm}
                showCopyMove={props.showCopyMove}
                message={props.previousData}
              />
            )}
            {props.type === 'DELETE_IMAGE' && (
              <DeleteModal
                close={closeModal}
                onDelete={props.delete}
              />
            )}
            {props.type === 'ZOOM_IMAGE' && (
              <ZoomImageModal
                close={closeModal}
                data={props.data}
              />
            )}
            {props.type === 'DOCUMENT_PREVIEW' && (
              <DocumentPreviewModal
                close={closeModal}
                data={props.data}
              />
            )}
            {props.type === 'COPY_MOVE' && (
              <CopyMoveModal
                close={closeModal}
                onConfirm={props.onConfirm}
              />
            )}
            {props.type === 'ADD_OUTCOME' && (
              <AddOutcomeModal
                close={closeModal}
                onConfirm={props.onConfirm}
              />
            )}
            {props.type === 'CONFIRM_GENERATE_BILLING' && (
              <ConfirmGenerateBilligModal
                close={closeModal}
                onConfirm={props.onConfirm}
                title={props.previousData}
              />
            )}
          </div>
        </ReactModal>
      </div>
    </>
  );
};

export default DraggableModal;
