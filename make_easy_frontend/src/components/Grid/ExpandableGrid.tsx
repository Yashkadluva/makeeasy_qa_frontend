import "./Grid.scss";
import { useState, useEffect } from "react";
import Pagination from "../pagination/Pagination";
import useClickOutside from "../../hooks/useClickOutside";
import loader from "../../assets/images/loader.gif";
import calender from "../../assets/images/calender.svg";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ButtonLight from "react-bootstrap/Button";
import iconCalendar from "../../assets/images/calander-icon.svg";
import iconFilter from "../../assets/images/filter-icon.svg";
import iconCols from "../../assets/images/col-icon.svg";
import {
  ArrowUp,
  ArrowDown,
  CaretRightFill,
  CaretDownFill, ChevronRight, ChevronDown, X
} from "react-bootstrap-icons";
import { Label } from "../Label/Label";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Form from "react-bootstrap/Form";
import { updatePreference } from "../../utility/CommonApiCall";
import { GridHeader, Filter, FilterOption, GridRow } from "./Grid";

export interface ExpandableData {
  headers: GridHeader[];
  rows: ExpandableRow[];
  filters?: Filter[];
  ShowLoader?: boolean;
  errorMessage?: string;
  isColumn?: boolean;
  dateFilter?: FilterOption[];
  onClickRow?: boolean;
  isSelectedRow?: any;
  hoverRow?: any;
  storeKey?: string;
  gridId?: string;
}

export interface ExpandableRow {
  header: string;
  isExpand: boolean;
  data: GridRow[];
}

const ExpandableGrid = (props: ExpandableData) => {
  //active collaplse row



  const [headers, setHeaders] = useState(
    props.headers.map((option: GridHeader) => {
      if (option.isShow === undefined) {
        option.isShow = true;
      }

      return { ...option };
    })
  );

  const [filters, setFilters] = useState(
    props.filters
      ? props.filters.map((option: Filter) => {
        if (option.isShow === undefined) {
          option.isShow = false;
        }

        option.child.map((child: FilterOption) => {
          if (child.isChecked === undefined) {
            child.isChecked = false;
          }
        });

        return { ...option };
      })
      : []
  );

  const [isFilter, setIsFilter] = useState(false);
  const [isShowColumns, setIsShowColumns] = useState(false);

  const [isShowDateRange, setIsShowDateRange] = useState(false);
  const [rows, setRows] = useState([...props.rows]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageItem, setPerPageItem] = useState(20);
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [data, setData] = useState<ExpandableRow[]>([]);
  const [dateFilterBy, setDateFilterBy] = useState("THIS_WEEK");
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  let isChildClick = false;

  useEffect(() => {
    setHeaders(
      props.headers.map((option: GridHeader) => {
        if (option.isShow === undefined) {
          option.isShow = true;
        }

        return { ...option };
      })
    );
  }, [props.headers]);

  useEffect(() => {
    var start = perPageItem * (currentPage - 1);
    setData(props.rows.slice(start, start + perPageItem));
  }, [currentPage]);

  useEffect(() => {
    setRows(props.rows);
    var start = perPageItem * (currentPage - 1);
    setData(props.rows.slice(start, start + perPageItem));
  }, [props.rows]);

  let domNode = useClickOutside(() => {
    setIsFilter(false);
    setIsShowColumns(false);
    setIsShowDateRange(false);
  }, this);

  useEffect(() => {
    var table = document.getElementById("resizable");
    resizableGrid(table);
    function resizableGrid(table: any) {
      var row = table.getElementsByTagName("tr")[0],
        cols = row ? row.children : undefined;
      if (!cols) return;

      var tableHeight = table.offsetHeight;

      for (var i = 0; i < cols.length; i++) {
        var div = createDiv(tableHeight);
        cols[i].appendChild(div);
        cols[i].style.position = "relative";
        setListeners(div);
      }

      function setListeners(div: any) {
        var pageX: any,
          curCol: any,
          nxtCol: any,
          curColWidth: any,
          nxtColWidth: any,
          tableWidth: any;

        div.addEventListener("mousedown", function (e: any) {
          var temp = document.getElementById("resizable");
          if (temp) {
            tableWidth = temp.offsetWidth;
          }

          curCol = e.target.parentElement;
          nxtCol = curCol.nextElementSibling;
          pageX = e.pageX;

          var padding = paddingDiff(curCol);

          curColWidth = curCol.offsetWidth - padding;
          //  if (nxtCol)
          //nxtColWidth = nxtCol.offsetWidth - padding;
        });

        div.addEventListener("mouseover", function (e: any) {
          e.target.style.borderRight = "2px solid #0000ff";
        });

        div.addEventListener("mouseout", function (e: any) {
          e.target.style.borderRight = "";
        });

        document.addEventListener("mousemove", function (e) {
          if (curCol) {
            var diffX = e.pageX - pageX;
            curCol.style.width = curColWidth + diffX + "px";
            var temp1 = document.getElementById("resizable");
            if (temp1 && temp1.style) {
              temp1.style.width = tableWidth + diffX + "px";
            }
          }
        });

        document.addEventListener("mouseup", function (e) {
          curCol = undefined;
          nxtCol = undefined;
          pageX = undefined;
          nxtColWidth = undefined;
          curColWidth = undefined;
        });
      }

      function createDiv(height: any) {
        var div = document.createElement("div");
        if (div && div.style) {
          div.style.top = "0";
          div.style.right = "0";
          div.style.width = "5px";
          div.style.position = "absolute";
          div.style.cursor = "col-resize";
          div.style.userSelect = "none";
          div.style.height = height + "px";
        }

        return div;
      }

      function paddingDiff(col: any) {
        if (getStyleVal(col, "box-sizing") == "border-box") {
          return 0;
        }

        var padLeft = getStyleVal(col, "padding-left");
        var padRight = getStyleVal(col, "padding-right");
        return parseInt(padLeft) + parseInt(padRight);
      }

      function getStyleVal(elm: any, css: any) {
        return window.getComputedStyle(elm, null).getPropertyValue(css);
      }
    }
  }, [headers]);

  const updateUserPreference = (data: GridHeader[]) => {
    if (props.storeKey) {
      updatePreference({ data, user_info, key: props.storeKey })
        .then((res: any) => { })
        .catch((e: any) => { });
    }
  };

  const activeCollaspse = (e: any) => {
    console.log(e.target.parentElement)
if(e.target.parentElement.classList.contains('active')){
  e.target.parentElement.classList.remove("active");
}else{
  e.target.parentElement.classList.add("active");
}
    
    //     //console.log(props)
    // }
  }

  const updateValue = (index: number) => {
    setHeaders(
      headers.map((option: GridHeader, i: number) => {
        return i === index ? { ...option, isShow: !option.isShow } : option;
      })
    );

    updateUserPreference(
      headers.map((option: GridHeader, i: number) => {
        return i === index ? { ...option, isShow: !option.isShow } : option;
      })
    );
  };
  const updatecheckValue = (index: number) => {
    isChildClick = true;
    setFilters(
      filters.map((option: Filter) => {
        return option.isShow
          ? {
            ...option,
            child: option.child.map((child: FilterOption, j: number) => {
              return j == index
                ? { ...child, isChecked: !child.isChecked }
                : child;
            }),
          }
          : option;
      })
    );
  };
  const removeFilter = (i: number, j: number) => {
    isChildClick = true;
    removeFilters(i, j);
  };
  const removeFilters = (i: number, j: number) => {
    isChildClick = true;
    setFilters(
      filters.map((option: Filter, k: number) => {
        return i == k
          ? {
            ...option,
            child: option.child.map((child: FilterOption, l: number) => {
              return j == l
                ? { ...child, isChecked: !child.isChecked }
                : child;
            }),
          }
          : option;
      })
    );
  };
  const removeAllFilter = () => {
    setStartDate("");
    setFilters(
      filters.map((option: Filter) => {
        return {
          ...option,
          child: option.child.map((child: FilterOption, l: number) => {
            return { ...child, isChecked: false };
          }),
        };
      })
    );
  };
  const sorting = (index: number) => {
    setIsFilter(false);
    setIsShowColumns(false);
    setIsShowDateRange(false);

    setHeaders(
      headers.map((option: GridHeader, i: number) =>
        i === index
          ? {
            ...option,
            isAsc: !option.isAsc,
            isDesc: option.isAsc,
          }
          : {
            ...option,
            isAsc: false,
            isDesc: false,
          }
      )
    );
  };

  const showFiterOption = (index: number) => {
    if (!isChildClick) {
      setFilters(
        filters.map((option: Filter, i: number) =>
          i === index
            ? { ...option, isShow: !option.isShow }
            : { ...option, isShow: false }
        )
      );
    } else {
      isChildClick = false;
    }
  };

  const OnSelectDateRange = (type: string) => {
    setDateFilterBy(type);
    if (type === "THIS_WEEK") {
      var startOfWeek = moment().startOf("week").toDate();
      var endOfWeek = moment().endOf("week").toDate();
      setStartDate(startOfWeek);
      setEndDate(endOfWeek);
    } else if (type === "THIS_MONTH") {
      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (type === "LAST_MONTH") {
      var date = new Date();
      const firstDayPrevMonth = new Date(
        date.getFullYear(),
        date.getMonth() - 1,
        1
      );
      const lastDayPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
      setStartDate(firstDayPrevMonth);
      setEndDate(lastDayPrevMonth);
    } else if (type === "LAST_YEAR") {
      var lastyear = new Date(new Date().getFullYear() - 1, 0, 1);
      var start = new Date(lastyear.getFullYear(), 0, 1).getTime();
      var end = new Date(lastyear.getFullYear(), 11, 31).getTime();
      setStartDate(start);
      setEndDate(end);
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  var count = 0;

  const [styledRow, setStyledRow] = useState<Number>();

  const onSelectRow = (e: any, data: any) => {
    if (props.onClickRow) {
      setStyledRow(e);
      props.isSelectedRow(e, data);
    }
  };

  const onclickArrow = (index: number) => {
    setData(
      data.map((option: ExpandableRow, i: number) =>
        i == index
          ? { ...option, isExpand: !option.isExpand }
          : { ...option }
      )
    );
  };

  return (
    <div className="grid-div" data-testid="comp-sawin-table">
      <Row className="align-items-top mx-0 grid-filter-options">
        <Col className=" pb-2 align-items-center">
          {props.filters && props.filters.length > 0 ? (
            <>
              {filters.length > 0
                ? filters.map((option: Filter, i: number) => {
                  return option.child.map(
                    (child: FilterOption, j: number) => {
                      if (child.isChecked) {
                        count++;
                      }
                      return "";
                    }
                  );
                })
                : ""}
              {count > 0 || (startDate && endDate) ? (
                <label className="font-medium font-14 font-w-medium d-inline me-3 text-dark">
                  Active Filters
                </label>
              ) : (
                ""
              )}

              <div className="applied-filter">
                {filters.length > 0
                  ? filters.map((option: Filter, i: number) => {
                    return option.child.map(
                      (child: FilterOption, j: number) => {
                        return (
                          <span key={"filter_" + i + "_" + j}>
                            {child.isChecked ? (
                              <span className="filter-name">
                                {child.title}{" "}
                                <X
                                  size={20}
                                  onClick={() => removeFilter(i, j)}
                                />{" "}
                              </span>
                            ) : (
                              ""
                            )}
                          </span>
                        );
                      }
                    );
                  })
                  : ""}
                {startDate && endDate && (
                  <span>
                    <span className="filter-name">
                      {`${moment(startDate).format("MM/DD/YYYY")}` +
                        " - " +
                        `${moment(endDate).format("MM/DD/YYYY")}`}{" "}
                      <X size={20} onClick={() => setStartDate("")} />
                    </span>
                  </span>
                )}

                {count > 0 || (startDate && endDate) ? (
                  <a
                    className="font-w-medium font-14 text-nowrap cursor-pointer"
                    onClick={() => removeAllFilter()}
                  >
                    Clear Filter
                  </a>
                ) : (
                  ""
                )}
              </div>
            </>
          ) : (
            ""
          )}{" "}
        </Col>
        <Col
          className="text-end pe-0 text-nowrap filter-opt-btns"
          style={{ maxWidth: "370px" }}
        >
          {props.dateFilter && props.dateFilter.length > 0 ? (
            <ButtonLight
              variant="light"
              className="btn-brand-light "
              onClick={() => {
                setIsShowDateRange(!isShowDateRange);
                setIsFilter(false);
                setIsShowColumns(false);
              }}
            >
              {" "}
              <img
                src={iconCalendar}
                height={16}
                width={16}
                className="icon"
              />{" "}
              Date Range
            </ButtonLight>
          ) : (
            ""
          )}
          {props.filters && props.filters.length > 0 ? (
            <ButtonLight
              variant="light"
              className="btn-brand-light"
              onClick={() => {
                setIsShowColumns(false);
                setIsFilter(!isFilter);
                setIsShowDateRange(false);
              }}
            >
              {" "}
              <img
                src={iconFilter}
                height={16}
                width={16}
                className="icon"
              />{" "}
              Filter
            </ButtonLight>
          ) : (
            ""
          )}
          {props.isColumn == true ? (
            <ButtonLight
              variant="light"
              className="btn-brand-light"
              onClick={() => {
                setIsShowColumns(!isShowColumns);
                setIsFilter(false);
                setIsShowDateRange(false);
              }}
            >
              {" "}
              <img
                src={iconCols}
                height={16}
                width={16}
                className="icon"
              />{" "}
              Column
            </ButtonLight>
          ) : (
            ""
          )}
          {isShowColumns ? (
            <ul ref={domNode} id="expandableGrid" className="submenu">
              {headers.map((header: GridHeader, j) =>
                header.isFilter == false ? (
                  ""
                ) : (
                  <li key={"columns_" + j} className="">
                    <Form.Group className="mb-1" controlId="">
                      <Form.Check
                        type="checkbox"
                        checked={header.isShow}
                        onClick={() => updateValue(j)}
                        label={header.title}
                      />
                    </Form.Group>
                  </li>
                )
              )}
            </ul>
          ) : (
            ""
          )}
          {isFilter ? (
            <ul ref={domNode} className="filtermenu">
              {filters.map((filter: Filter, j) => (
                <li
                  key={"columns_" + j}
                  className=" mt-1 mb-1 cursor-pointer"
                  onClick={() => showFiterOption(j)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    {" "}
                    <label className="col-10 mt-1 cursor-pointer me-2">
                      {filter.title}
                    </label>
                    <CaretRightFill size={12} className="icon" />
                  </div>

                  {filter.isShow ? (
                    <ul className="filteroption">
                      {filter.child.map((child: FilterOption, j: Number) => (
                        <li
                          key={"columns_" + j}
                          className=" mt-1 mb-1 cursor-pointer"
                        >
                          <Form.Group className="px-3" controlId="">
                            <Form.Check
                              type="checkbox"
                              checked={child.isChecked}
                              onClick={() => updatecheckValue(Number(j))}
                              label={child.title}
                            />
                          </Form.Group>
                        </li>
                      ))}{" "}
                    </ul>
                  ) : (
                    ""
                  )}
                </li>
              ))}
            </ul>
          ) : (
            ""
          )}
          {isShowDateRange ? (
            <ul ref={domNode} className="date-range-submenu">
              <li>
                <div className="row date-picker-border">
                  <div className="col-3  left-border">
                    <div onClick={() => OnSelectDateRange("THIS_WEEK")}>
                      <Label
                        title="This Week"
                        classNames={
                          dateFilterBy === "THIS_WEEK"
                            ? "mt-2 mb-2 date-filter-by-selected"
                            : "mt-2 mb-3 date-filter-by"
                        }
                      />{" "}
                    </div>
                    <div onClick={() => OnSelectDateRange("THIS_MONTH")}>
                      <Label
                        title="This Month"
                        classNames={
                          dateFilterBy === "THIS_MONTH"
                            ? "mb-2 date-filter-by-selected"
                            : "mb-3  date-filter-by"
                        }
                      />{" "}
                    </div>
                    <div onClick={() => OnSelectDateRange("LAST_MONTH")}>
                      <Label
                        title="Last Month"
                        classNames={
                          dateFilterBy === "LAST_MONTH"
                            ? "mb-3 date-filter-by-selected"
                            : "mb-3  date-filter-by"
                        }
                      />{" "}
                    </div>
                    <div onClick={() => OnSelectDateRange("LAST_YEAR")}>
                      <Label
                        title="Last year"
                        classNames={
                          dateFilterBy === "LAST_YEAR"
                            ? "mb-3 date-filter-by-selected"
                            : "mb-3  date-filter-by"
                        }
                      />{" "}
                    </div>
                    <div onClick={() => OnSelectDateRange("CUSTOM_RANGE")}>
                      <Label
                        title="Custom Range"
                        classNames={
                          dateFilterBy === "CUSTOM_RANGE"
                            ? "mb-3 date-filter-by-selected"
                            : "mb-3  date-filter-by"
                        }
                      />{" "}
                    </div>
                  </div>
                  <div className="col-9">
                    <div className="row ">
                      {props.dateFilter
                        ? props.dateFilter.map(
                          (filter: FilterOption, index: number) => (
                            <div key={index} className="col-4 mt-2">
                              <input
                                type="checkbox"
                                checked={filter.isChecked}
                                className="sawin-checkbox new-check"
                              />
                              <Label
                                title={filter.title}
                                classNames="mb-3 selection-option"
                              />
                            </div>
                          )
                        )
                        : ""}
                    </div>
                    <div className="row mb-3">
                      <div className="col-6 ">
                        <Label title="Start Date" classNames="text-dark" />
                        <div className="input-group input-group-sm bg-transparent">
                          <input
                            type="text"
                            disabled
                            className="form-control mt-0 bg-light border-end-0 text-dark bg-transparent"
                            value={
                              startDate &&
                              moment(startDate).format("MM/DD/YYYY")
                            }
                          />
                          <span
                            className="input-group-text bg-transparent mt-0 border-start-0 theme-icon-color"
                            id="basic-addon2"
                          >
                            <img
                              src={calender}
                              width="40"
                              className="calender-icon"
                              alt="hamburg"
                            />
                          </span>
                        </div>
                      </div>
                      <div className="col-6">
                        <Label title="End Date" classNames="text-dark" />
                        <div className="input-group input-group-sm bg-transparent">
                          <input
                            type="text"
                            disabled
                            className="form-control mt-0 bg-light border-end-0 text-dark bg-transparent"
                            value={
                              endDate && moment(endDate).format("MM/DD/YYYY")
                            }
                          />
                          <span
                            className="input-group-text bg-transparent mt-0 border-start-0"
                            id="basic-addon2"
                          >
                            <img
                              src={calender}
                              width="40"
                              className="calender-icon theme-icon-color"
                              alt="hamburg"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className=" row ">
                      <div className="col-6 ">
                        <DatePicker
                          selected={startDate}
                          onChange={(date: any) => setStartDate(date)}
                          readOnly={true}
                          inline
                        />
                      </div>
                      <div className="col-6">
                        <DatePicker
                          selected={endDate}
                          onChange={(date: any) => setEndDate(date)}
                          readOnly={
                            dateFilterBy == "CUSTOM_RANGE" ? false : true
                          }
                          inline
                        />
                      </div>
                    </div>
                    <div className="col-12  mt-3 text-center">
                      <Button
                        variant="primary"
                        className="btn-brand-solid me-3 mb-0"
                        type="submit"
                        onClick={() => {
                          setIsShowDateRange(!isShowDateRange);
                          setIsFilter(false);
                          setIsShowColumns(false);
                        }}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="primary"
                        className="btn-brand-outline"
                        type="button"
                        onClick={() => {
                          setIsShowDateRange(!isShowDateRange);
                          setIsFilter(false);
                          setIsShowColumns(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          ) : (
            ""
          )}
        </Col>
      </Row>
      <div
        className={
          props.ShowLoader === false ? "table-scroll" : "table-scroll px-0"
        }
      >
        <table className="grid-table" id="resizable">
          <thead>
            <tr>
              <th></th>
              {headers.map((header: GridHeader, i) =>
                header.isShow === false ? (
                  ""
                ) : header.isSorting === false ? (
                  <th
                    className={
                      "cursor-pointer text-center " +
                      (header.isFreeze == true ? "freeze-column" : "")
                    }
                    style={{ width: header.width ? header.width : "" }}
                    key={i.toString()}
                  >
                    {header.title}{" "}
                  </th>
                ) : (
                  <th
                    key={i.toString()}
                    className={
                      "cursor-pointer text-center " +
                      (header.isFreeze == true ? "freeze-column" : "")
                    }
                    style={{ width: header.width ? header.width : "" }}
                    onClick={() => sorting(i)}
                  >
                    {header.title}

                    <span className="sorting">
                      {header.isDesc ? <ArrowUp /> : null}
                      {header.isAsc ? <ArrowDown /> : null}
                    </span>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {props.ShowLoader === true || data.length == 0 ? (
              <></>
            ) : (
              data.map((expandableRow: ExpandableRow, r) => {
                return (
                  <>
                    <tr
                      className="expadable-header" onClick={event => activeCollaspse(event)}
                      key={"body_header_data_" + r.toString()}
                    >
                      <td colSpan={headers.length + 1} onClick={() => {
                        onclickArrow(r);
                      }}>
                        {expandableRow.isExpand ? (
                          <ChevronDown
                            className="expandIcon"

                          />
                        ) : (
                          <ChevronRight
                            className="expandIcon"
                            onClick={() => {
                              onclickArrow(r);
                            }}
                          />
                        )}{" "}
                        {expandableRow.header}
                      </td>
                    </tr>

                    {expandableRow.isExpand && expandableRow.data.map((row: GridRow, i) => (
                      <tr
                        onClick={() => onSelectRow(i, row)}
                        key={"body_data_" + i.toString()}
                        className={
                          (styledRow == i ? "selected-row" : "") ||
                          (props.hoverRow ? "hover-styled-row" : "")
                        }
                      >
                        <td></td>
                        {headers.map((header: GridHeader, j) =>
                          header.isShow === false ? (
                            ""
                          ) : (
                            <td
                              key={"row_" + i + "_" + j}
                              className={
                                (header.class?.toString() ||
                                  (styledRow == i ? "selected-row-text" : "")) +
                                (header.isFreeze == true
                                  ? " freeze-column"
                                  : "")
                              }
                            >
                              {row.data[j] ? (
                                row.data[j].type === "HTML" ? (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: row.data[j].value,
                                    }}
                                  />
                                ) : (
                                  row.data[j].value
                                )
                              ) : (
                                "-"
                              )}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </>
                );
              })
            )}
          </tbody>
        </table>
        {rows.length == 0 && props.ShowLoader === false ? (
          <div>
            <div className="error-message">{props.errorMessage}</div>
          </div>
        ) : null}
      </div>
      {props.ShowLoader === true ? (
        <div className="">
          <div></div>
          <div style={{ textAlign: "center", marginTop: "10%" }}>
            <img
              style={{ position: "relative" }}
              src={loader}
              alt="No loader found"
            />
            <div style={{ position: "relative", color: "white" }}>
              Loading...
            </div>
          </div>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="d-flex flex-row justify-content-between pb-3 align-items-center pagination-row">
          <div className="d-flex col-6 align-items-center">
            <Pagination
              className=" "
              changePage={(page: number) => setCurrentPage(page)}
              totalItems={rows.length}
              itemsCountPerPage={perPageItem}
            />
          </div>
          <div className="showing-text ps-3 col-6 text-end font-12">
            {perPageItem * (currentPage - 1) + 1} -{" "}
            {(currentPage - 1) * perPageItem + perPageItem > rows.length
              ? rows.length
              : (currentPage - 1) * perPageItem + perPageItem}{" "}
            of {rows.length}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ExpandableGrid;
