import { useState, useEffect, useRef } from "react";
import Editicon from "../../../../assets/images/delete-icon.svg";
import iconPo from "../../../../assets/images/icon-po.svg";
import iconManulEntry from "../../../../assets/images/icon-manual-entry.svg";
import iconQuote from "../../../../assets/images/icon-quote.svg";
import iconSolutionCode from "../../../../assets/images/icon-solution-code.svg";
import iconParts from "../../../../assets/images/icon-parts.svg";
import iconSystem from "../../../../assets/images/icon-system.svg";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import saveIcon from "../../../../assets/images/save.svg";
import cancelIcon from "../../../../assets/images/cancel.svg";
import Loader from '../../../../components/Loader/Loader';
import BackComponent from "../../../../components/BackComponent/BackComponent";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";

import { useForm } from "react-hook-form";
import SawinSelect, {
  Options,
} from "../../../../components/Select/SawinSelect";
import { getPreference } from "../../../../utility/CommonApiCall";
import { toast } from "react-toastify";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
} from "../../../../components/Grid/Grid";

import "./InvoiceEntry.scss";
import { FormGroup } from "react-bootstrap";
import WebService from "../../../../utility/WebService";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InvoiceState, InviceSDMasterState } from "../../../../reducer/CommonReducer";
import HelperService from "../../../../utility/HelperService";
import AddPricingItem from "../InvoiceEntryBlade/AddPricingItem/AddPricingItem";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import SolutionCodeModal from "./BillingDetails/SolutionCodeModal";
import CallPartsModal from "./BillingDetails/CallPartsModal";
import POItemBlade from "../InvoiceEntryBlade/POItemBlade/POItemBlade";
import ReturnItemBlade from "../InvoiceEntryBlade/ReturnItemBlade/ReturnItemBlade";
import { Dispatch } from "redux";
import { setDataInRedux, SET_IS_REFRESH } from "../../../../action/CommonAction";
import AddServiceBillingDetails from "../InvoiceEntryBlade/AddServiceBillingDetails/AddServiceBillingDetails";

interface PropData {
  InvoiceData?: any;
}

const BillingDetails = (props: PropData) => {
  const dispatch: Dispatch<any> = useDispatch();
  const headers: GridHeader[] = [
    {
      title: " ",
      isSorting: false,
      class: "text-center",
    },
    {
      title: "Item Category",
    },
    {
      title: "Category ID",
      class: "text-center",
    },
    {
      title: "Description",
    },
    {
      title: "Qty",
      class: "text-end",
    },
    {
      title: "Ext.Cost",
      class: "text-end",
    },
    {
      title: "Sales Amount",
      class: "text-end",
    },
    {
      title: "Disc",
      class: "text-end",
    },
    {
      title: "Action",
      isFilter: false,
    },
  ];

  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [ShowLoader, setShowLoader] = useState(false);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [billingCode, setBillingCode] = useState<any[]>([]);
  const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
    (state) => state.invoceSDMaster);
  const invoiceData: any = useSelector<RootState, InvoiceState>(
    (state) => state.invoice);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [categoryOption, setCategoryOption] = useState<any>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const categoryOptions = useRef<any[]>([]);
  const [allInventry, setAllInventry] = useState<any[]>([]);
  let rowCompute = useRef<GridRow[]>([]);
  let billingDetailData = useRef<GridRow[]>([]);
  const [itemCategoryValue, setItemCatergoryValue] = useState('')
  const [categoryDataValue, setCategoryDataValue] = useState('')
  const [isShowAddBillingDetailModal, setShowAddBillingDetailModal] = useState(false)
  const [isShowEditBillingDetailModal, setShowEditBillingDetailModal] = useState(false)
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pageLoader, setPageLoader] = useState(false);
  const [isShowCallPartsModal, setIsShowCallPartsModal] = useState(false);
  const [isShowPOItemModal, setIsShowPOItemModal] = useState(false);
  const [isShowReturnItemModal, setIsShowReturnItemModal] = useState(false);
  const [isShowSolutionCodeModal, setIsShowSolutionCodeModal] = useState(false)
  const [billingData, setBillingData] = useState<any[]>([]);
  const [billingDataSequenceNo, setBillingDataSequenceNo] = useState<any[]>([]);
  const [partCount, setPartCount] = useState("")
  const [poCount, setPoCount] = useState("")
  const [returnItem, setReturnItem] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [recalculateErrorMessage, setRecalculateErrorMessage] = useState("");
  const [showRecalculateModal, setRecalculateModal] = useState(false);
  const [showRecalculate, setRecalculate] = useState<any>({});
  const [editedData, setEditedData] = useState<any>({});
  const [editIndex, setEditIndex] = useState<any>('');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const { formState: { errors }, control, } = useForm();
  const editData = useRef({})
  const isDisableExtCost = useRef(false);
  let Description: any = "";
  let Quantity: any = "";
  let ExtCost: any = "";
  let SaleAmount: any = "";
  let Discount: any = "";
  let billingEditData: any

  useEffect(() => {
    getBillingData();
    getBillingCode();
    getPartCategory();
    getAllInventry();
    getAllLabor();
    getMenuCount();
  }, []);

  useEffect(() => {
    setRecalculate(invoiceData.invoiceData)
  }, [invoiceData])

  const getMenuCount = () => {
    WebService.getAPI({
      action: `SaiSDCallPart/GetCallPartsCount/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
      body: null,
    })
      .then((res: any) => { setPartCount(res) })
      .catch((e) => { });

    WebService.getAPI({
      action: `SaiPO/GetPOCount/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
      body: null,
    })
      .then((res: any) => { setPoCount(res) })
      .catch((e) => { });

    WebService.getAPI({
      action: `SaiReturnPO/GetReturnCount/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
      body: null,
    })
      .then((res: any) => { setReturnItem(res) })
      .catch((e) => { });
  }

  const getBillingData = () => {
    setShowLoader(true);
    WebService.getAPI({
      action: `SDInvoiceDetail/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false);
        setBillingData(res);
        billingDetailData.current = res;
        let rows: GridRow[] = [];
        let sequenceArray: any = [];
        for (var i in res) {
          sequenceArray.push(res[i].SeqNum)
          let columns: GridColumn[] = [];
          columns.push({ value: getIcon(res[i]) });
          columns.push({ value: res[i].ItemCategory });
          columns.push({ value: res[i].CategoryId });
          columns.push({ value: res[i].CategoryDescription });
          columns.push({ value: HelperService.getCurrencyFormatter(res[i].Quantity) });
          columns.push({ value: HelperService.getCurrencyFormatter(res[i].UnitCost) });
          columns.push({ value: HelperService.getCurrencyFormatter(res[i].RetailPrice) });
          columns.push({ value: HelperService.getCurrencyFormatter(res[i].Discount) });
          columns.push({ value: actionList(Number(i), "ACTION", res[i]) });
          rows.push({ data: columns });
        }
        rowCompute.current = rows;
        setRows(rows);
        setBillingDataSequenceNo(sequenceArray)
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const getIcon = (data: any) => {
    var iconSolutionCode = "";
    if (data.ItemEntrySource == "PO") {
      iconSolutionCode = iconPo;
    } else if (data.ItemEntrySource == "M") {
      iconSolutionCode = iconManulEntry;
    } else if (data.ItemEntrySource == "Q") {
      iconSolutionCode = iconQuote;
    } else if (data.ItemEntrySource == "FR") {
      iconSolutionCode = iconSolutionCode;
    } else if (data.ItemEntrySource == "CP") {
      iconSolutionCode = iconParts;
    } else if (data.ItemEntrySource == "S") {
      iconSolutionCode = iconSystem;
    } else if (data.ItemEntrySource == "RTN") {
      iconSolutionCode = "";
    } else {
      iconSolutionCode = "";
    }

    return (iconSolutionCode ? <div className="text-center"><img
      src={iconSolutionCode}
      className="theme-icon-color"
      alt="Solution Code "
      width={18}
    /></div> : <></>)
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
              <img src={editicon} height={20} className="theme-icon-color" />
            </a>
            <a
              onClick={() => onDelete(data, value)}
              className="text-dark ms-2 font-18 cursor-pointer"
            >
              <img src={deleteicon} height={25} />
            </a>
          </div>
        ) : (
          <div style={{ flexDirection: 'row', display: 'flex' }}>
            <a
              onClick={() => onSave(data)}
              className="text-dark ms-2 font-17 cursor-pointer"
            >
              <img src={saveIcon} />
            </a>
            <a
              onClick={() => onRemove()}
              className="text-dark ms-2 font-18 cursor-pointer"
            >
              <img src={cancelIcon} className="theme-icon-color" />
            </a>
          </div>
        )}
      </div>
    );
  };

  const onSave = (e: any) => {
    if (ExtCost == "" && isDisableExtCost.current == false) {
      toast.error("Please Enter Ext. Cost");
    } else {
      let requestBody: any = editData.current;
      requestBody.CategoryDescription = Description;
      requestBody.Quantity = Quantity;
      requestBody.RetailPrice = ExtCost;
      requestBody.SalesAmount = SaleAmount;
      requestBody.Discount = Discount;
      WebService.putAPI({
        action: `SDInvoiceDetail`,
        body: requestBody,
      })
        .then((res: any) => {
          toast.success("Billing Detail updated successfully.");
          dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
          getBillingData();
          getInvoiceData(invoiceData?.invoiceData?.InvoiceNum);
        })
        .catch((e) => { });

    }
  };

  const onEdit = (index: number, data: any) => {
    setEditedData(data);
    setShowEditBillingDetailModal(true)
    // isDisableExtCost.current = data.IsInventory
    // editData.current = data
    // Description = data.CategoryDescription;
    // Quantity = HelperService.getCurrencyFormatter(data.Quantity)
    // ExtCost = HelperService.getCurrencyFormatter(data.UnitCost)
    // SaleAmount = HelperService.getCurrencyFormatter(data.SalesAmount)
    // Discount = HelperService.getCurrencyFormatter(data.Discount)
    // billingEditData = data;
    // let columns: GridColumn[] = [];
    // {
    //   columns.push({ value: rowCompute.current[index].data[0].value });
    //   columns.push({ value: rowCompute.current[index].data[1].value });
    //   columns.push({ value: rowCompute.current[index].data[2].value });
    //   columns.push({ value: addInput("Description") });
    //   columns.push({ value: addInput("Qty", index) });
    //   columns.push({ value: addInput("Ext") });
    //   columns.push({ value: addInput("sale") });
    //   columns.push({ value: addInput("discount") });
    //   columns.push({ value: actionList(0, "UPDATE", data) });
    // }
    // let newdata = rowCompute.current.map((option: GridRow, i: number) => {
    //   return i === index ? { data: columns } : option;
    // });
    // setRows(
    //   rowCompute.current.map((option: GridRow, i: number) => {
    //     return i === index ? { data: columns } : option;
    //   })
    // );
  };

  const onSelectCategory = (data: any) => {
    let rows: GridRow[] = [];
    for (var i in billingData) {
      if (data.value == billingData[i].ItemCategory || data.value == "All") {
        let columns: GridColumn[] = [];
        columns.push({ value: getIcon(billingData[i]) });
        columns.push({ value: billingData[i]?.ItemCategory });
        columns.push({ value: billingData[i]?.CategoryId });
        columns.push({ value: billingData[i]?.CategoryDescription });
        columns.push({ value: HelperService.getCurrencyFormatter(billingData[i]?.Quantity) });
        columns.push({ value: HelperService.getCurrencyFormatter(billingData[i].RetailPrice) });
        columns.push({ value: HelperService.getCurrencyFormatter(billingData[i].SalesAmount) });
        columns.push({ value: HelperService.getCurrencyFormatter(billingData[i].Discount) });
        columns.push({ value: actionList(Number(i), "ACTION", billingData[i]) });
        rows.push({ data: columns });
      }
    }
    rowCompute.current = rows;
    setRows(rows);
  }

  const addInput = (e: string, index?: any) => {
    return (
      <div>
        {e == "Description" && <input
          type="text"
          className="form-control"
          defaultValue={Description}
          onChange={(e) => Description = e.target.value}

        />
        }
        {
          e == "Qty" &&
          <input
            type="text"
            className="form-control"
            defaultValue={Quantity}
            onChange={(e) => Quantity = e.target.value}
            onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
            onBlur={(e) => {
              HelperService.formateUptoTwoDecimal(e)
              onGetCalulatedAmount(e.target.value, index)
            }}
          />
        }
        {
          e == "Ext" &&
          <input
            type="text"
            className="form-control"
            defaultValue={ExtCost}
            disabled={isDisableExtCost.current}
            onChange={(e) => ExtCost = e.target.value}
            onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
            onBlur={(e) => HelperService.formateUptoTwoDecimal(e)}
          />
        }
        {
          e == "sale" &&
          <input
            type="text"
            className="form-control"
            defaultValue={SaleAmount}
            onChange={(e) => SaleAmount = e.target.value}
            onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
            onBlur={(e) => HelperService.formateUptoTwoDecimal(e)}
          />
        }
        {
          e == "discount" &&
          <input
            type="text"
            className="form-control"
            defaultValue={Discount}
            onChange={(e) => Discount = e.target.value}
            onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
            onBlur={(e) => HelperService.formateUptoTwoDecimal(e)}
          />
        }
      </div>
    );
  };

  const addNewInput = (e: string, index?: any) => {
    return (
      <div>
        {e == "Description" && <input
          type="text"
          className="form-control"
          defaultValue={Description}
          onChange={(e) => Description = e.target.value}

        />
        }
        {
          e == "Qty" &&
          <input
            type="text"
            className="form-control"
            defaultValue={Quantity}
            onChange={(e) => Quantity = e.target.value}
            onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
            onBlur={(e) => {
              HelperService.formateUptoTwoDecimal(e)
              onGetCalulatedAmount(e.target.value, index)
            }}
          />
        }
        {
          e == "Ext" &&
          <input
            type="text"
            className="form-control"
            defaultValue={ExtCost}
            disabled={isDisableExtCost.current}
            onChange={(e) => ExtCost = e.target.value}
            onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
            onBlur={(e) => HelperService.formateUptoTwoDecimal(e)}
          />
        }
        {
          e == "sale" &&
          <input
            type="text"
            className="form-control"
            defaultValue={SaleAmount}
            onChange={(e) => SaleAmount = e.target.value}
            onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
            onBlur={(e) => HelperService.formateUptoTwoDecimal(e)}
          />
        }
        {
          e == "discount" &&
          <input
            type="text"
            className="form-control"
            defaultValue={Discount}
            onChange={(e) => Discount = e.target.value}
            onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
            onBlur={(e) => HelperService.formateUptoTwoDecimal(e)}
          />
        }
      </div>
    );
  };

  const getBillingCode = () => {
    WebService.getAPI({
      action: `SetupSaiBillingCode/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        var array = [];
        array.push({
          id: "", value: "All",
        });
        for (var i in res) {

          array.push({
            id: res[i].BillingCode,
            value: res[i].BillingCodeDescription,
          });
        }
        setBillingCode(array);
      })
      .catch((e) => { });
  };

  const getPartCategory = () => {
    WebService.getAPI({
      action: `SetupSaiBillingCode/${user_info["AccountId"]}/${user_info["CompanyId"]}/true`,
      body: null,
    })
      .then((res: any) => {
        let temp: any = [];
        for (let i in res) {
          temp.push({
            value: res[i].BillingCodeDescription,
            id: res[i].BillingCode,
            object: res[i]
          });
        }
        setCategoryOption(temp);
        categoryOptions.current = temp;
      })
      .catch((e) => { });
  }

  const getAllInventry = () => {
    WebService.getAPI({
      action: `SaiPIPartMaster/GetParts/340/1/true`,
      body: null
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({
            id: res[i].PartNum,
            value: res[i].PartNum,
          });
        }
        setAllInventry(array);
      })
  }

  const getAllLabor = () => {

  }

  const getCategoryData = (type: string, data: any) => {
    if (type === 'A') {
      setRows(rows);
      setItemCatergoryValue(itemCategoryValue)
      // categoryData.current = allInventry
      setCategoryData(allInventry)
    } else if (type === 'B') {
      setCategoryDataValue(data.BillingCode)
    }
    onAddItem()
  }

  const onAddItem = () => {
    let columns: GridColumn[] = [];
    {
      columns.push({ value: '' });
      columns.push({ value: itemCategory() });
      columns.push({ value: category() });
      columns.push({ value: description() });
      columns.push({ value: quantity() });
      columns.push({ value: cost() });
      columns.push({ value: sales() });
      columns.push({ value: disc() });
      columns.push({ value: actionList(0, "ADD", {}) });
    }
    setRows([{ data: columns }, ...rows]);
  };

  const itemCategory = () => {

    return (

      <div className="d-flex justify-content-center">
        <SawinSelect
          options={categoryOption}
          value={itemCategoryValue}
          onChange={(data: any) => {
            setItemCatergoryValue(data.id)
            getCategoryData(data.object.BillingCodeType, data.object)
          }} />
      </div>
    );
  }

  const category = () => {
    return (
      <div className="d-flex justify-content-center">
        <SawinSelect
          options={categoryData}
          selected={categoryDataValue}
          onChange={(data: any) => {
          }} />
      </div>
    );
  }

  const description = () => {
    return (
      <div className="form-style">
        <input
          type="text"
          className="form-control"
          // onChange={(e) => (code = e.target.value)}
          placeholder="Description"
        />
      </div>
    )
  }

  const quantity = () => {
    return (
      <div className="form-style">
        <input
          type="text"
          className="form-control"
          // onChange={(e) => (code = e.target.value)}
          placeholder="Qty"
        />
      </div>
    )
  }

  const cost = () => {
    return (
      <div className="form-style">
        <input
          type="text"
          className="form-control"
          // onChange={(e) => (code = e.target.value)}
          placeholder="Ext. Cost"
        />
      </div>
    )
  }

  const sales = () => {
    return (
      <div className="form-style">
        <input
          type="text"
          className="form-control"
          // onChange={(e) => (code = e.target.value)}
          placeholder="Sales Amount"
        />
      </div>
    )
  }

  const disc = () => {
    return (
      <div className="form-style">
        <input
          type="text"
          className="form-control"
          // onChange={(e) => (code = e.target.value)}
          placeholder="Disc"
        />
      </div>
    )
  }

  const onGetCalulatedAmount = (qty: any, index: any) => {
    setLoading(true)
    var data: any = {};
    var BillingCodeType: any = "";
    for (var i in billingDetailData.current) {
      if (i == index) {
        data = billingDetailData.current[i];
      }
    }
    for (let i in categoryOptions.current) {
      if (categoryOptions.current[i].id.trim() == data.ItemCategory.trim()) {
        BillingCodeType = categoryOptions.current[i].object.BillingCodeType
      }
    }
    setRows(rowCompute.current);
    var requestedBody = {
      BillingCodeType: BillingCodeType,
      PriceCode: data.PriceSheetUsed,
      TaxCode: invoiceData.invoiceData.TaxCode,
      LaborType: data.LaborType,
      UseTax: data.UseTax ? data.UseTax : false,
      UnitCost: data.UnitCost,
      Quantity: qty,
      IsTaxable: data.ItemTaxable,
      ServiceType: data.ServiceType,
      InvoiceNum: data.InvoiceNum,
      CategoryId: data.CategoryId,
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      ItemEntrySource: data.ItemEntrySource,
    }
    WebService.postAPI({
      action: `SDInvoice/GetCalculatedCharges`,
      body: requestedBody
    })
      .then((res: any) => {
        if (res.Data) {
          isDisableExtCost.current = data.IsInventory
          editData.current = data
          Description = data.CategoryDescription;
          Quantity = HelperService.getCurrencyFormatter(res.Data.Quantity)
          ExtCost = HelperService.getCurrencyFormatter(res.Data.UnitCost)
          SaleAmount = HelperService.getCurrencyFormatter(res.Data.SalesAmount)
          Discount = HelperService.getCurrencyFormatter(res.Data.Discount)
          billingEditData = data;
          let columns: GridColumn[] = [];
          {
            columns.push({ value: getIcon(res.Data) });
            columns.push({ value: data.ItemCategory });
            columns.push({ value: data.CategoryId });
            columns.push({ value: addNewInput("Description") });
            columns.push({ value: addNewInput("Qty", index) });
            columns.push({ value: addNewInput("Ext") });
            columns.push({ value: addNewInput("sale") });
            columns.push({ value: addNewInput("discount") });
            columns.push({ value: actionList(index, "UPDATE", data) });
          }
          setRows(
            rowCompute.current.map((option: GridRow, i: number) => {
              return i === index ? { data: columns } : option;
            })
          );
        }
        setLoading(false)
      })
      .catch((e) => {
        setLoading(false)
      })
  }

  const onRemove = () => {
    setRows(rowCompute.current);
  };

  const closeAddPartModal = (value: any, e: any) => {
    setShowAddBillingDetailModal(false)
    if (e == "Added") {
      getBillingData();
      dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
    }
  }

  const closeEditPartModal = (value: any, e: any) => {
    setShowEditBillingDetailModal(false)
    if (e == "Added") {
      getBillingData();
      dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
    }
  }

  const onDelete = (data: any, e: any) => {
    setShowDeleteModal(true)
    var obj = {
      id: data.InvoiceNum,
      value: data.SeqNum
    }
    setDeletedData(obj)
  }

  const onDeleteBillingDetails = () => {
    setShowDeleteModal(false)
    setPageLoader(true);
    WebService.deleteAPI({
      action: `SDInvoiceDetail/DeletePricingItem/${user_info['AccountId']}/${user_info['CompanyId']}/${deletedData.id}/${deletedData.value}`,
      body: null,
      isShowError: false
    })
      .then((res) => {
        setPageLoader(false);
        getInvoiceData(invoiceData.invoiceData.InvoiceNum)
        getBillingData()
        toast.success('Billing Details deleted successfully.')
      })
      .catch((e) => {
        setPageLoader(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      })
  }

  const closeModal = (e: any) => {
    setIsShowSolutionCodeModal(false);

  };

  const closePOItemModal = (e: any, type: any) => {
    setIsShowPOItemModal(false)
    type == "yes" && getBillingData();
  }

  const closeReturnItemModal = (e: any, type: any) => {
    setIsShowReturnItemModal(false)
    type == "yes" && getBillingData();
  }

  const CloseCallPartsModal = (e: any) => {
    setIsShowCallPartsModal(false);
  }

  const onRecalculate = () => {
    setRecalculateErrorMessage("Are you sure you want to recalculate?")
    setRecalculateModal(!showRecalculateModal)
  }

  const onConfirmSave = () => {
    setRecalculateModal(false);
    setLoading(true);
    WebService.postAPI({
      action: `SDInvoice/RecalculateInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData.invoiceData.InvoiceNum}`,

    })
      .then((res: any) => {
        setLoading(false)
        WebService.getAPI({
          action: `SDInvoiceDetail/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData.invoiceData.InvoiceNum}`
        })
          .then((res: any) => {
            getInvoiceData(invoiceData.invoiceData.InvoiceNum)
            setLoading(false);
            let rows: GridRow[] = [];
            for (var i in res) {
              let columns: GridColumn[] = [];
              columns.push({ value: getIcon(res[i]) });
              columns.push({ value: res[i].ItemCategory });
              columns.push({ value: res[i].CategoryId });
              columns.push({ value: res[i].CategoryDescription });
              columns.push({ value: HelperService.getCurrencyFormatter(res[i].Quantity) });
              columns.push({ value: HelperService.getCurrencyFormatter(res[i].UnitCost) });
              columns.push({ value: HelperService.getCurrencyFormatter(res[i].RetailPrice) });
              columns.push({ value: HelperService.getCurrencyFormatter(res[i].Discount) });
              columns.push({ value: actionList(Number(i), "ACTION", res[i]) });
              rows.push({ data: columns });
            }
            rowCompute.current = rows;
            setRows(rows);

          })
          .catch((e) => { });
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      })
  }

  const getInvoiceData = (id: string) => {
    setLoading(true)
    var requestedBody = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      InvoiceNum: id
    }
    WebService.postAPI({
      action: `SDInvoice/GetInvoiceDataToPrint/`,
      body: requestedBody
    })
      .then((res) => {
        setLoading(false)
        setRecalculate(res)
      })
      .catch((e) => {
        setPageLoader(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      })
  }

  const onDoubleClick = (index: any, isData: any) => {
    setEditIndex(index)
    var data: any;
    for (var i in billingData) {
      if (i == index) {
        data = billingData[i]
      }
    }
    isDisableExtCost.current = data.IsInventory
    editData.current = data
    Description = data.CategoryDescription;
    Quantity = HelperService.getCurrencyFormatter(data.Quantity)
    ExtCost = HelperService.getCurrencyFormatter(data.UnitCost)
    SaleAmount = HelperService.getCurrencyFormatter(data.SalesAmount)
    Discount = HelperService.getCurrencyFormatter(data.Discount)
    billingEditData = data;
    let columns: GridColumn[] = [];
    {
      columns.push({ value: getIcon(data) });
      columns.push({ value: rowCompute.current[index].data[1].value });
      columns.push({ value: rowCompute.current[index].data[2].value });
      columns.push({ value: addInput("Description") });
      columns.push({ value: addInput("Qty", index) });
      columns.push({ value: addInput("Ext") });
      columns.push({ value: addInput("sale") });
      columns.push({ value: addInput("discount") });
      columns.push({ value: actionList(0, "UPDATE", data) });
    }
    let newdata = rowCompute.current.map((option: GridRow, i: number) => {
      return i === index ? { data: columns } : option;
    });
    setRows(
      rowCompute.current.map((option: GridRow, i: number) => {
        return i === index ? { data: columns } : option;
      })
    );
  }

  const closeServiceModal = (type: any, value: any) => {
    setShowAddServiceModal(false)
    if (value == 'SAVE') {
      getBillingData()
    }
  }

  return (
    <>
      <Loader show={isLoading} />
      <DraggableModal
        isOpen={showRecalculateModal}
        onClose={() => setRecalculateModal(false)}
        title="Alert"
        type="CONFIRM_MODAL"
        width={600}
        previousData={recalculateErrorMessage}
        onConfirm={onConfirmSave}

      />

      <CallPartsModal
        isShow={isShowCallPartsModal}
        title={'Call Parts'}
        isClose={CloseCallPartsModal}
        data={invoceSDMaster.invoceSDMaster}
      />

      <POItemBlade
        isShow={isShowPOItemModal}
        isClose={closePOItemModal}
        data={invoceSDMaster.invoceSDMaster}
      />

      <ReturnItemBlade
        isShow={isShowReturnItemModal}
        isClose={closeReturnItemModal}
        data={invoceSDMaster.invoceSDMaster}
      />
      <SolutionCodeModal
        isShow={isShowSolutionCodeModal}
        title={'Solution Code'}
        isClose={closeModal}
      />

      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_MODAL"
        width={600}
        delete={onDeleteBillingDetails}
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

      {
        isShowAddBillingDetailModal &&
        <AddPricingItem
          isShow={isShowAddBillingDetailModal}
          title="Add Part"
          isClose={closeAddPartModal}
          data={[]}
          isEdit={false}
          categoryOption={categoryOption}
        />
      }

      {
        isShowEditBillingDetailModal &&
        <AddPricingItem
          isShow={isShowEditBillingDetailModal}
          title="Add Part"
          isClose={closeEditPartModal}
          data={editedData}
          isEdit={true}
          categoryOption={categoryOption}
          sequenceNo={billingDataSequenceNo}
        />
      }
      {
        showAddServiceModal &&
        <AddServiceBillingDetails
          isShow={showAddServiceModal}
          isClose={closeServiceModal}
          invoiceNum={invoiceData?.invoiceData?.InvoiceNum}
        />
      }
      <div className=" ">
        <Row>
          <Col md={12} id="wideCol">
            <BackComponent title={"Billing Details"} />
            <Card className="card-style form-style">
              <Card.Body className="pb-0">
                <Row className="align-items-center">
                  <Col md={5} className="d-flex align-items-center">
                    <label className="me-2">Category</label>
                    <SawinSelect
                      options={billingCode}
                      type={"ARROW"}
                      onChange={(data: any) => { onSelectCategory(data) }}
                    />
                  </Col>
                  <Col className="text-end d-flex justify-content-end align-items-center">
                    <Button variant="light" className="btn-brand-light me-3" onClick={() => setShowAddServiceModal(true)}>
                      + Add Service
                    </Button>
                    <Button variant="light" className="btn-brand-light me-3" onClick={() => setShowAddBillingDetailModal(true)}>
                      + Add Pricing Items
                    </Button>
                    <Dropdown className="action-dd">
                      <Dropdown.Toggle id="dropdown-basic">
                        <img
                          src={require("../../../../assets/images/blue-hamburg-icon.svg").default}
                          className="hamburg-icon show theme-icon-color"
                          alt="hamburg"
                        />
                        <img src={require("../../../../assets/images/cross-icon-new.svg").default}
                          className="hamburg-icon close theme-icon-color"
                          alt="hamburg"
                        />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="invoice-entry-dropmenu">
                        <Dropdown.Item onClick={() => setIsShowSolutionCodeModal(true)}>Solution Code</Dropdown.Item>
                        <Dropdown.Item onClick={() => setIsShowPOItemModal(true)}>Po Items ({poCount})</Dropdown.Item>
                        <Dropdown.Item onClick={() => setIsShowCallPartsModal(true)}>Call Parts ({partCount})</Dropdown.Item>
                        <Dropdown.Item onClick={() => onRecalculate()}>Recalculate</Dropdown.Item>
                        <Dropdown.Item onClick={() => setIsShowReturnItemModal(true)}>Return Items ({returnItem})</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>



                </Row>
              </Card.Body>
              <Card.Body className="billing-detail-grid">

                <Grid
                  headers={gridHeader}
                  rows={rows}
                  ShowLoader={ShowLoader}
                  errorMessage={"No Data Found"}
                  hoverRow={true}
                  doubleClick={(value: any, data: any) => onDoubleClick(value, data)}
                />

                <div className="text-dark d-flex justify-content-end mt-3">
                  <div className="text-end px-4 font-14">
                    <p className="font-w-medium mb-0">Sub Total</p>
                    <span>
                      {showRecalculate?.SubTotal ? HelperService.getCurrencyFormatter(
                        showRecalculate?.SubTotal
                      ) : "0.00"}
                    </span>
                  </div>
                  <div className="text-end px-4">
                    <p className="font-w-medium mb-0">Discount</p>
                    <span>
                      {showRecalculate?.Discount ? HelperService.getCurrencyFormatter(
                        showRecalculate?.Discount
                      ) : "0.00"}
                    </span>
                  </div>
                  <div className="text-end px-4">
                    <p className="font-w-medium mb-0">Sales Tax</p>
                    <span>
                      {showRecalculate?.SalesTax ? HelperService.getCurrencyFormatter(
                        showRecalculate?.SalesTax
                      ) : "0.00"}
                    </span>
                  </div>
                  <div className="text-end">
                    <p className="font-w-medium mb-0">Total</p>
                    <span>
                      {showRecalculate?.InvoiceTotal ? HelperService.getCurrencyFormatter(
                        showRecalculate?.InvoiceTotal
                      ) : "0.00"}
                    </span>
                  </div>
                </div>

                <div className="text-end text-dark font-14 mt-3">
                  <span className="me-4">
                    <img
                      src={iconPo}
                      className="theme-icon-color"
                      alt="PO"
                      width={12}
                    />{" "}
                    PO{" "}
                  </span>
                  <span className="me-4">
                    <img
                      src={iconManulEntry}
                      className="theme-icon-color"
                      alt="Manual Entry"
                      width={18}
                    />{" "}
                    Manual Entry{" "}
                  </span>
                  <span className="me-4">
                    <img
                      src={iconQuote}
                      className="theme-icon-color"
                      alt="Quote"
                      width={18}
                    />{" "}
                    Quote{" "}
                  </span>
                  <span className="me-4">
                    <img
                      src={iconSolutionCode}
                      className="theme-icon-color"
                      alt="Solution Code "
                      width={18}
                    />{" "}
                    Solution Code{" "}
                  </span>
                  <span className="me-4">
                    <img
                      src={iconParts}
                      className="theme-icon-color"
                      alt="Call Parts "
                      width={18}
                    />{" "}
                    Call Parts{" "}
                  </span>
                  <span className="me-4">
                    <img
                      src={iconSystem}
                      className="theme-icon-color"
                      alt="System "
                      width={18}
                    />{" "}
                    System{" "}
                  </span>
                  <span className=" "> RTN Return </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default BillingDetails;
function setIsShowSolutionCodeModal(arg0: boolean) {
  throw new Error("Function not implemented.");
}

