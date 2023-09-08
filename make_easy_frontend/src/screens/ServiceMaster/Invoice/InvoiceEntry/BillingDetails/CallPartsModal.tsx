import { useRef, useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import Grid, {
  GridHeader,
  GridRow,
  GridColumn,
  Filter,
} from "../../../../../components/Grid/Grid";
import WebService from "../../../../../utility/WebService";
import { RootState } from "../../../../../config/Store";
import { InvoiceState } from "../../../../../reducer/CommonReducer";
import editicon from "../../../../../assets/images/edit.svg";
import saveIcon from "../../../../../assets/images/save.svg";
import cancelIcon from "../../../../../assets/images/cancel.svg";
import { toast } from "react-toastify";
import Loader from '../../../../../components/Loader/Loader';
import Form from "react-bootstrap/Form";
import HelperService from "../../../../../utility/HelperService"
import { useSelector } from "react-redux";
import DraggableModal from "../../../../../components/DraggableModal/DraggableModal";
const componentKey = "EntityCallPartsModal";

const headers: GridHeader[] = [
  {
    title: "",
    isSorting: false,
    class: "text-center"
  },
  {
    title: "Is Inv",
    class: "text-center",
  },
  {
    title: " Part #",
    class: "text-center",
  },
  {
    title: " Description",
    class: "text-start",
  },
  {
    title: " Unit Cost",
    class: "text-end",
  },
  {
    title: " Qty",
    class: "text-end",
  },
  {
    title: " Qty Used",
    class: "text-end",
  },
  {
    title: " Qty To Add",
    class: "text-end",
  },

  {
    title: "Action",
    class: "text-center freeze-column",
  },
];

interface PropData {
  isShow: boolean;
  isClose: any;
  title: string;
  data: any;
}

const CallPartsModal = (props: PropData) => {
  const invoiceData: any = useSelector<RootState, InvoiceState>(
    (state) => state.invoice);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [bladeTitle, setBladeTitle] = useState("Call Parts");
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [ShowLoader, setShowLoader] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlertModel, setAlertModel] = useState(false);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [enableSubmit, setEnableSubmit] = useState(false)
  let rowCompute = useRef<GridRow[]>([]);
  const selectedPart = useRef<any[]>([]);
  let QtyToAdd: any = "";

  const CloseModal = (e: any) => {
    QtyToAdd = "";
    setRows([])
    setEnableSubmit(false)
    rowCompute.current = [];
    selectedPart.current = [];
    props.isClose(!props.isShow, e);
  }

  useEffect(() => {
    if (props.isShow == true) {
      getCallParts()
    }
  }, [props.isShow]);


  const getCallParts = () => {
    setShowLoader(true);
    WebService.getAPI({
      action: `SaiSDCallPart/GetAll/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
    })
      .then((res: any) => {
        setShowLoader(false);
        let rows: GridRow[] = [];
        for (var i in res.Data) {
          let columns: GridColumn[] = [];
          columns.push({ value: checkBox(Number(i), res.Data[i]), });
          columns.push({ value: isActive(res.Data[i].IsInventory), });
          columns.push({ value: res.Data[i].PartNum, });
          columns.push({ value: res.Data[i].PartDescription, });
          columns.push({ value: HelperService.getCurrencyFormatter(res.Data[i].UnitCost), });
          columns.push({ value: res.Data[i].Qty, });
          columns.push({ value: res.Data[i].QtyUsed, });
          columns.push({ value: res.Data[i].QtyToAdd, });

          res.Data[i].OriginalQuantityToAdd = res.Data[i].QtyToAdd;

          columns.push({
            value: actionList(Number(i), "ACTION", res.Data[i]),
            type: "COMPONENT",

          });
          rows.push({ data: columns, isChecked: false });
        }
        rowCompute.current = rows

        setRows(rows);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const addInput = (e: string) => {
    return (
      <div>
        <input

          className="form-control"
          placeholder={e}
          defaultValue={QtyToAdd}
          onKeyPress={(e) =>
            HelperService.allowOnlyNumericValue(e)
          }
          onChange={(e) => { QtyToAdd = e.target.value }}
        />
      </div>
    );
  };

  const checkBox = (index: number, data: any) => {
    return (
      <div className="d-flex justify-content-center">
        <Form.Check onClick={() => click(index, data)} type="checkbox" label=" " />
      </div>
    );
  };

  const click = (index: number, e: any) => {
    if (e.QtyToAdd == 0) {
      setErrorMessage(`Cannot add line item with zero quantity.`)
      setAlertModel(true)
    } else {
      if (rowCompute.current[index].isChecked == false) {
        selectedPart.current.push(e)
        setEnableSubmit(true)
      } else {
        selectedPart.current = selectedPart.current.filter((item: any) => {
          return item.PartNum !== e.PartNum
        })
        selectedPart.current.length == 0 && setEnableSubmit(false)
      }
      rowCompute.current[index].isChecked = !rowCompute.current[index].isChecked;
      setRows(rowCompute.current)
    }
  }

  const isActive = (e: any) => {
    if (e == true) {
      return (
        <span>Yes</span>
      )
    }
    else if (e == false) {
      return (
        <span>No</span>
      )
    }
  }

  const onEdit = (index: any, data: any) => {
    QtyToAdd = data.QtyToAdd;
    let columns: GridColumn[] = [];
    {
      columns.push({ value: rowCompute.current[index].data[0].value });
      columns.push({ value: rowCompute.current[index].data[1].value });
      columns.push({ value: rowCompute.current[index].data[2].value });
      columns.push({ value: rowCompute.current[index].data[3].value });
      columns.push({ value: rowCompute.current[index].data[4].value });
      columns.push({ value: rowCompute.current[index].data[5].value });
      columns.push({ value: rowCompute.current[index].data[6].value });
      columns.push({ value: addInput("QtyToAdd"), });
      columns.push({ value: actionList(index, "UPDATE", data) });
    }
    setRows(
      rowCompute.current.map((option: GridRow, i: number) => {
        return i === index ? { data: columns } : option;
      })
    );
  };

  const onRemove = () => {
    setRows(rowCompute.current);
  };

  const onSave = (index: number, e: any) => {
    if (e.OriginalQuantityToAdd >= QtyToAdd) {
      e.QuantityToAdd = QtyToAdd;
      let temp:any[] = rowCompute.current;
      temp[index].data[7].value = QtyToAdd;
      temp[index].data[8].value = actionList(index, "ACTION", e);
      setRows(temp)
      rowCompute.current = temp;
    } else {
      setErrorMessage(`Qty To Add should be less than ${e.OriginalQuantityToAdd}`)
      setAlertModel(true)
    }
  };

  const onSubmit = (e: number) => {
    if (e < selectedPart.current.length) {
      setLoading(true)
      sendCallPartDetail(selectedPart.current[e],e)
    }else{
      setLoading(false)
      CloseModal("yes");
    }
  }

  const sendCallPartDetail = (e: any,index:number) => {
    let requestBody = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      InvoiceNum: invoiceData.invoiceData.InvoiceNum,
      CallParts: [e]
    };

    WebService.postAPI({
      action: `/SDInvoiceDetail/AddCallPartItemsToInvoice`,
      body: requestBody,
    })
      .then((res: any) => {
        onSubmit(++index)
      })
      .catch((e) => {setLoading(false) });
  }

  const actionList = (value: number, type: string, data: object) => {
    return (
      <div className="action-ele action-btns">
        {type === "ACTION" ? (
          <div>
            <a
              onClick={() => onEdit(value, data)}
              className="text-dark ms-2 font-18 cursor-pointer"
            >
              <img src={editicon} height={20} />
            </a>
          </div>
        ) : (
          <div>
            <a
              onClick={() => onSave(value, data)}
              className="text-dark ms-3 font-18 cursor-pointer"
            >
              <img src={saveIcon} />
            </a>
            <a
              onClick={() => onRemove()}
              className="text-dark ms-3 font-18 cursor-pointer"
            >
              <img src={cancelIcon} />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DraggableModal
        isOpen={showAlertModel}
        onClose={() => setAlertModel(false)}
        title="Alert"
        type="ALERT_MODEL"
        width={600}
        previousData={errorMessage}
      />

      <Loader show={isLoading} />

      <Offcanvas
        show={props.isShow}
        onHide={() => CloseModal({})}
        placement={"end"}
        className="offcanvas-dex-large"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
          <div className="px-4 pb-3 modal-inner-min-h">
            <Grid errorMessage={'No Call Parts Found'} headers={gridHeader} rows={rows} ShowLoader={ShowLoader}
              isColumn={false} hoverRow={true}
            // storeKey={componentKey} 
            />
          </div>
          <div className="offcanvas-footer mt-4 position-absolute">
            <Button
              variant="primary"
              className="btn-brand-solid me-3"
              type="submit"
              disabled={!enableSubmit}
              onClick={() => onSubmit(0)}>
              Add To Invoice
            </Button>
            <Button variant="primary" className="btn-brand-outline" type="button" onClick={() => CloseModal({})}>Cancel</Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CallPartsModal;
