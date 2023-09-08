import { useState, useEffect } from "react";
import Editicon from "../../../../assets/images/delete-icon.svg";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";

import BackComponent from "../../../../components/BackComponent/BackComponent"
import { Button, Card, Row, Col, Form } from 'react-bootstrap';

import { Envelope, Telephone, Phone, ArrowUpRight, CheckCircleFill, CircleFill } from 'react-bootstrap-icons';
import InvoiceEntryHeader from './InvoiceEntryHeader';
import InvoiceEntryLeftCol from './InvoiceEntryLeftCol';
import { useForm, Controller } from "react-hook-form";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";

import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
  FilterOption,
  Filter,
} from "../../../../components/Grid/Grid";

import { toast } from "react-toastify";
import "./InvoiceEntry.scss"
import { FormGroup } from "react-bootstrap";
import WebService from "../../../../utility/WebService";
import { getPreference } from "../../../../utility/CommonApiCall";
import { useSelector } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InvoiceState } from "../../../../reducer/CommonReducer";
import HelperService from "../../../../utility/HelperService";
import AddRecommendationModal from "../../Recommendations/AddRecommendationModal";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";
const componentKey = "invocieRecommendationEntry";

const headers: GridHeader[] = [

  {
    title: "Recommended Date",
    class: "text-center",
  },
  {
    title: "Comments",
    class: "description-text"
  },
  {
    title: "Recommended By",
  },
  {
    title: "Status",
    isSorting: false,
    class: "text-center"
  },
  {
    title: "Accepted On",
    class: "text-center",
    isShow: false,
  },
  {
    title: "Reason to Deny",
    isShow: false,
    class: "description-text"
  },
  {
    title: "Actions",
    class: "freeze-column text-center",
    isFreeze: true,
    isSorting: false,
    isFilter: false,
  }

];

const Recommendations = () => {
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const [rows, setRows] = useState<GridRow[]>([]);
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [ShowLoader, setShowLoader] = useState(false);
  const invoiceData: any = useSelector<RootState, InvoiceState>(
    (state) => state.invoice);
  const [showModal, setShowModal] = useState(false)
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isShowDescription, setIsShowDescription] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");

  const recommendationPropData = {
    SDServiceMasterId: invoiceData?.invoiceData?.SMNum,
    Id: invoiceData?.invoiceData?.CallNum,
    IsInvoice: true
  }

  const {
    formState: { errors },
    control,
  } = useForm();

  const dateFilter: FilterOption[] = [
    {
      title: "Recommended Date",
      value: "RecommendedDate",
    },
    {
      title: "Accepted On",
      value: "AcceptedOn",
    },
  ];


  const filters: Filter[] = [
    {
      title: "Status",
      key: "Status",
      child: [
        {
          title: "Accepted",
          value: "1",
        },
        {
          title: "Pending",
          value: "2",
        },
      ],
    },
  ];

  useEffect(() => {
    getRecommendations();
    getUserPreference();
  }, [])

  const getUserPreference = () => {
    getPreference({ key: componentKey, user_info })
      .then((res: any) => {
        if (res.value && res.value.length > 10) {
          let temp: GridHeader[] = JSON.parse(res.value);
          if (temp.length > 1) {
            setHeader(temp);
          }
        }
      })
      .catch((e: any) => { });
  };

  const closeModal = (e: any, data: any) => {
    setEditedData({})
    setShowModal(false)
    if (data == "add") {
      getRecommendations()
    }
  }

  const getRecommendations = () => {
    setShowLoader(true)
    WebService.getAPI({
      action: `SDServiceMasterRecommendation/GetPendingRecommendationsForInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.SMNum}`,
      body: null,
    })
      .then((res: any) => {
        let rows: GridRow[] = [];
        for (var i in res) {
          let columns: GridColumn[] = [];
          columns.push({
            value: res[i].RecommendedDate && HelperService.getFormatedDate(res[i].RecommendedDate),
          });
          columns.push({
            value: res[i].RecommendationText && showDescription(res[i].RecommendationText),
          });
          columns.push({
            value: res[i].TechNameInternal,
          });
          columns.push({
            value: res[i].Status == "1" && "Pending" || res[i].Status == "2" && "Accepted" || res[i].Status == "3" && "Decline",
          });
          columns.push({
            value: res[i].AcceptedOn && HelperService.getFormatedDate(res[i].AcceptedOn),
          });
          columns.push({
            value: showDescription(res[i].ReasonToDeny),
          });
          columns.push({
            value: actionList(res[i]),
          });
          rows.push({ data: columns });
        }
        setShowLoader(false)
        setRows(rows)
      })
      .catch((e) => { setShowLoader(false) });
  }

  const actionList = (data: any) => {
    return (
      <div className="action-ele action-btns">
        <div>
          <a
            onClick={() => onEdit(data)}
            className="text-dark ms-2 font-18 cursor-pointer"
          >
            <img src={editicon} height={20} />
          </a>
          <a
            onClick={() => onDelete(data)}
            className="text-dark ms-2 font-18 cursor-pointer"
          >
            <img src={deleteicon} height={25} />
          </a>
        </div>
      </div>
    );
  };

  const showDescription = (e: any) => {
    if (e) {
      return (
        <a
          className="grid-hypper-link"
          onClick={() => viewFullDescription(e)}
        >
          {HelperService.removeHtml(e)}
        </a>
      );
    }
  };

  const viewFullDescription = (data: any) => {
    setDescriptionData(data);
    setIsShowDescription(true);
  };

  const closeDescription = (value: any) => {
    setIsShowDescription(value);
  };


  const onEdit = (data: any) => {
    setEditedData(data);
    setShowModal(true)
  }

  const onDelete = (data: any) => {
    setShowDeleteModal(true)
    setDeletedData(data)
  }

  const onDeleteRecommendation = () => {
    setShowDeleteModal(false)
    setLoading(true)
    WebService.deleteAPI({
      action: `SDServiceMasterRecommendation/${user_info["AccountId"]}/${user_info["CompanyId"]}/${deletedData?.SDServiceMasterId}/${deletedData?.Id}`,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        setLoading(false)
        toast.success("Recommendation deleted successfully.");
        getRecommendations();
      })
      .catch((e) => {
        setLoading(false)
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  }

  return <>
    <Loader show={isLoading} />

    <DescriptionModal
        isShow={isShowDescription}
        title="Description"
        isClose={closeDescription}
        data={descriptionData}
      />

    <AddRecommendationModal
      isShow={showModal}
      isClose={closeModal}
      popupData={editedData}
      Ids={recommendationPropData}
    />

    <DraggableModal
      isOpen={isShoWDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Alert"
      type="DELETE_MODAL"
      width={600}
      delete={onDeleteRecommendation}
      data={deletedData}
    />
    <DraggableModal
      isOpen={showAlertModel}
      onClose={() => setAlertModel(false)}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage}
    />

    <div className=' '>
      <Row>
        <Col md={12} id="wideCol">
          <BackComponent title={'Recommendations'} />
          <Card className="card-style form-style recommendation-card">
            <Card.Body className="border-bottom border-light">
              <Col className="text-end"><Button variant="light" className="btn-brand-light mb-2" onClick={() => setShowModal(!showModal)}>+ Add</Button></Col>


              <Grid
                filters={filters}
                storeKey={componentKey}
                dateFilter={dateFilter}
                headers={gridHeader}
                rows={rows}
                ShowLoader={ShowLoader}
                hoverRow={true}
                isColumn={true}
                errorMessage={'No Recommendations Found'} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>

  </>;
};

export default Recommendations;


