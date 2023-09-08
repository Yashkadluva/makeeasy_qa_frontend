import search from "../../assets/images/Search.svg";
import React, { useState, Fragment, useEffect } from "react";
import WebService from "../../utility/WebService";
import Loader from "../Loader/Loader";
import {
  getCurrentPage,
  search_criteria,
  search_field,
} from "../../utility/HelperService";
import { Dispatch } from "redux";
import { useDispatch, useSelector } from "react-redux";
import {
  setDataInRedux,
  SET_ACTIVE_TAB,
  SEARCH_RESULT,
  SET_SALE_DATA,
  SET_SD_MASTER_DATA,
  SET_SD_ADDRESS_DATA,
  PAGE_TITLE,
  SET_WORK_ORDER_ID,
  SET_BILLING_DATA,
  SET_CALL_TIME_ENTRY_DATA,
  UPDATE_OVERVIEW,
} from "../../action/CommonAction";
import SawinSelect, { Options } from "../Select/SawinSelect";
import useClickOutside from "../../hooks/useClickOutside";
import "./Search.scss";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../config/Store";
import { getDictionaryState } from "../../reducer/CommonReducer";
import { useForm, Controller } from "react-hook-form";

interface Suggestions {
  text: string;
  value: string;
  key: string;
}

const Search = () => {
  const { control } = useForm();
  let domNode = useClickOutside(() => {
    setForceClose(true);
    setSearchResult([]);
    setFilteredSuggestions([]);
    setShowSearchSuggestions(false);
    setTimeout(() => {
      setForceClose(false);
    }, 100);
  }, this);

  const dispatch: Dispatch<any> = useDispatch();
  let history = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestions[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false); // advance search
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false); // normal search and also use for show api output in advance search
  const [userInput, setUserInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [showField, setShowField] = useState(false);
  const [forceClose, setForceClose] = useState(false);
  const [value, setValue] = useState("");
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const dictionary: any = useSelector<RootState, getDictionaryState>(
    (state) => state.getDictionaryData?.getDictionary
  );

  useEffect(() => {
    setValue(dictionary.db_ServiceMaster);
  }, []);

  const onChange = (e: any) => {
    setShowSearchSuggestions(false);
    setShowSuggestions(true);
    setSearchResult([]);
    showResult(e.currentTarget.value, value);
  };

  const showResult = (userInput: any, selected: string) => {
    if (!selected) {
      selected = value;
    }

    if (selected === "Service Master") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in SM#",
          value: userInput,
          key: "Id",
        },
        {
          text: "<b>" + userInput + "</b> in SM Name",
          value: userInput,
          key: "Name",
        },
        {
          text: "<b>" + userInput + "</b> in Company",
          value: userInput,
          key: "CompanyName",
        },
        {
          text: "<b>" + userInput + "</b> in Zip",
          value: userInput,
          key: "ZipCode",
        },
        {
          text: "<b>" + userInput + "</b> in Address",
          value: userInput,
          key: "Address",
        },
      ];

      setFilteredSuggestions(suggestions);
    } else if (selected === "Proposal") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in SM#",
          value: userInput,
          key: "Id",
        },
        {
          text: "<b>" + userInput + "</b> in Name",
          value: userInput,
          key: "Name",
        },
        {
          text: "<b>" + userInput + "</b> in Company",
          value: userInput,
          key: "CompanyName",
        },
        {
          text: "<b>" + userInput + "</b> in Quote#",
          value: userInput,
          key: "Quote#",
        },
      ];
      setFilteredSuggestions(suggestions);
    } else if (selected === "Service Call") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in  Call#",
          value: userInput,
          key: "Id",
        },
        {
          text: "<b>" + userInput + "</b> in Invoice#",
          value: userInput,
          key: "InvoiceNum",
        },
        {
          text: "<b>" + userInput + "</b> in SM#",
          value: userInput,
          key: "SDServiceMasterId",
        },
        {
          text: "<b>" + userInput + "</b> in Name",
          value: userInput,
          key: "Name",
        },
        {
          text: "<b>" + userInput + "</b> in Quote#",
          value: userInput,
          key: "QuoteNum",
        },
      ];
      setFilteredSuggestions(suggestions);
    } else if (selected === "Quote") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in Call#",
          value: userInput,
          key: "Id",
        },
        {
          text: "<b>" + userInput + "</b> in  SM#",
          value: userInput,
          key: "SM#",
        },
        {
          text: "<b>" + userInput + "</b> in Name",
          value: userInput,
          key: "Name",
        },
        {
          text: "<b>" + userInput + "</b> in Zip",
          value: userInput,
          key: "ZipCode",
        },
      ];
      setFilteredSuggestions(suggestions);
    } else if (selected === "Invoice") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in  Invoice#",
          value: userInput,
          key: "InvoiceNum",
        },
        {
          text: "<b>" + userInput + "</b> in  Call#",
          value: userInput,
          key: "Call#",
        },
        {
          text: "<b>" + userInput + "</b> in  SM#",
          value: userInput,
          key: "SM#",
        },
        {
          text: "<b>" + userInput + "</b> in  Name",
          value: userInput,
          key: "Name",
        },
      ];
      setFilteredSuggestions(suggestions);
    } else if (selected === "PO") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in  PO#",
          value: userInput,
          key: "Id",
        },
        {
          text: "<b>" + userInput + "</b> in  Call#",
          value: userInput,
          key: "SDCallMasterId",
        },
        {
          text: "<b>" + userInput + "</b> in  SM#",
          value: userInput,
          key: "SDServiceMasterId",
        },
      ];
      setFilteredSuggestions(suggestions);
    } else if (selected === "Project") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in  Project#",
          value: userInput,
          key: "Id",
        },
        {
          text: "<b>" + userInput + "</b> in  Call#",
          value: userInput,
          key: "Call#",
        },
        {
          text: "<b>" + userInput + "</b> in  SM#",
          value: userInput,
          key: "SM#",
        },
        {
          text: "<b>" + userInput + "</b> in  Name",
          value: userInput,
          key: "Name",
        },
        {
          text: "<b>" + userInput + "</b> in  Invoice#",
          value: userInput,
          key: "Invoice#",
        },
      ];
      setFilteredSuggestions(suggestions);
    } else if (selected === "Return") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in  Return#",
          value: userInput,
          key: "Id",
        },
        {
          text: "<b>" + userInput + "</b> in  Call#",
          value: userInput,
          key: "SDCallMasterId",
        },
        {
          text: "<b>" + userInput + "</b> in  SM#",
          value: userInput,
          key: "SDServiceMasterId",
        },
      ];
      setFilteredSuggestions(suggestions);
    } else if (selected === "Contract") {
      const suggestions: Suggestions[] = [
        {
          text: "<b>" + userInput + "</b> in  Contract#",
          value: userInput,
          key: "Contract#",
        },
        {
          text: "<b>" + userInput + "</b> in  SM#",
          value: userInput,
          key: "SM#",
        },
        {
          text: "<b>" + userInput + "</b> in  Name",
          value: userInput,
          key: "Name",
        },
      ];
      setFilteredSuggestions(suggestions);
    } else {
      const suggestions: Suggestions[] = [];
      setFilteredSuggestions(suggestions);
    }

    setActiveSuggestion(0);
    setShowSuggestions(true);
    setUserInput(userInput);
  };

  const showSearchField = () => {
    setUserInput("");
    setValue("Service Master");
    setShowField(!showField);
    showResult("", "Service Master");
  };

  const onChange1 = (e: any) => {
    setUserInput(e.currentTarget.value);
    if (e.currentTarget.value.length >= 3) {
      WebService.postAPI({
        action: "SDServiceMaster/SearchSM",
        body: {
          SearchField: search_field,
          SearchCriteria: search_criteria,
          SearchValue: e.currentTarget.value,
          IncludeInactive: true,
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
        },
      })
        .then((res: any) => {
          setShowSearchSuggestions(true);
          setSearchResult(res);
        })
        .catch((e) => { });
    }
  };

  const onKeyDown = (e: any) => {
    // User pressed the enter key
    if (e.keyCode === 13) {
      setActiveSuggestion(0);
      setShowSuggestions(false);
      setUserInput(filteredSuggestions[activeSuggestion].value);
      onClick(filteredSuggestions[activeSuggestion]);
    }
    // User pressed the up arrow
    else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }
      setActiveSuggestion(activeSuggestion - 1);
    }
    // User pressed the down arrow
    else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }
      setActiveSuggestion(activeSuggestion + 1);
    }
  };

  const onClick = (e: Suggestions) => {
    setActiveSuggestion(0);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setLoading(true);
    setShowSearchSuggestions(true);

    if (value === "Invoice123") {
      WebService.getAPI({
        action:
          "/SDInvoice/IsInvoiceExist/" +
          user_info["AccountId"] +
          "/" +
          user_info["CompanyId"] +
          "/" +
          e.value,
        body: {},
      })
        .then((res: any) => {
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    } else if (value === "Proposal") {
      WebService.postAPI({
        action: "SaiSDQuoteMaster/FilterQuotes",
        body: {
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
          FieldName: e.key,
          Operator: 1,
          Value: "CPU-Check",
        },
      })
        .then((res: any) => {
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    } else if (value == dictionary["db_ServiceMaster"]) {
      WebService.postAPI({
        action: "SDserviceMaster/V2/AdvanceSearch",
        body: {
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
          SearchField: e.key,
          SearchValue: e.value,
        },
      })
        .then((res: any) => {
          var temp: any = [];
          for (var i in res.Data) {
            temp.push({ Id: res.Data[i].Id, SMName: res.Data[i].Value1, Address: res.Data[i].Value2 })
          }
          setSearchResult(temp);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    } else if (value === 'Service Call') {
      WebService.postAPI({
        action: `SDCallMaster/V2/AdvanceSearch`,
        body: {
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
          SearchField: e.key,
          SearchValue: e.value,
        }
      })
        .then((res: any) => {
          var temp: any = [];
          for (var i in res.Data) {
            temp.push({ Id: res.Data[i].Id, SMName: res.Data[i].Value1, Address: res.Data[i].Value2 })
          }
          setSearchResult(temp);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    } else if (value === 'Return') {
      WebService.postAPI({
        action: `SaiReturnPO/V2/AdvanceSearch`,
        body: {
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
          SearchField: e.key,
          SearchValue: e.value,
        }
      })
        .then((res: any) => {
          var temp: any = [];
          for (var i in res.Data) {
            temp.push({ Id: res.Data[i].Id, SMName: res.Data[i].Value1, Address: res.Data[i].Value2 })
          }
          setSearchResult(temp);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    } else if (value === 'PO') {
      WebService.postAPI({
        action: `SaiPO/V2/AdvanceSearch`,
        body: {
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
          SearchField: e.key,
          SearchValue: e.value,
        }
      })
        .then((res: any) => {
          var temp: any = [];
          for (var i in res.Data) {
            temp.push({ Id: res.Data[i].Id, SMName: res.Data[i].Value1, Address: res.Data[i].Value2 })
          }
          setSearchResult(temp);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    } else {
      WebService.postAPI({
        action: "Search/Search",
        body: {
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
          Field: e.key,
          Operator: search_criteria,
          SearchText: e.value,
        },
      })
        .then((res: any) => {
          setSearchResult(res);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    }
  };

  const onClickSearchResult = (e: any, data: any) => {
    setSearchResult([]);
    setShowSearchSuggestions(false);
    setUserInput("");
    if (value === 'Invoice') {
      history("/invoice-entry");
    } else if (value === 'Service Call') {
      dispatch(
        setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: data.Id, SMId: data.Value2 }, })
      );
      history("/call-information");
    } else if (value === 'Return') {
      dispatch(
        setDataInRedux({
          type: SET_CALL_TIME_ENTRY_DATA,
          value: {
            isEdit: true,
            PONum: data.Id,
            type: "Return"
          },
        })
      );
      history("/return-po");
    } else if (value === 'PO') {
      dispatch(
        setDataInRedux({
          type: SET_CALL_TIME_ENTRY_DATA,
          value: {
            createPO: true,
            isEdit: true,
            PONum: data.Id,
            type: "PO"
          },
        })
      );
      history("/create-po");
    } else {
      dispatch(
        setDataInRedux({
          type: SET_SD_MASTER_DATA,
          value: {},
        })
      );

      dispatch(
        setDataInRedux({
          type: SET_SD_ADDRESS_DATA,
          value: {},
        })
      );

      dispatch(
        setDataInRedux({
          type: SET_BILLING_DATA,
          value: {},
        })
      );

      dispatch(
        setDataInRedux({
          type: SET_SALE_DATA,
          value: {},
        })
      );

      dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" }));
      if (window.location.pathname != "/service-master") {
        history("/service-master");
      }
    }
    dispatch(setDataInRedux({ type: SEARCH_RESULT, value: data }));
    dispatch(setDataInRedux({ type: UPDATE_OVERVIEW, value: new Date().getTime() }));
    dispatch(
      setDataInRedux({
        type: PAGE_TITLE,
        value: getCurrentPage(window.location.pathname) as string,
      })
    );
  };

  let suggestionsListComponent;

  if (showSuggestions && userInput) {
    if (filteredSuggestions.length) {
      suggestionsListComponent = (
        <ul className="suggestions">
          {filteredSuggestions.map((suggestion: Suggestions, index) => {
            let className;
            return (
              <li
                className={className}
                key={index}
                onClick={() => onClick(suggestion)}
              >
                <div dangerouslySetInnerHTML={{ __html: suggestion.text }} />
              </li>
            );
          })}
        </ul>
      );
    } else {
      suggestionsListComponent = (
        <div className="no-suggestions">
          <em>No suggestions, you're on your own!</em>
        </div>
      );
    }
  }

  let searchResultComponent;

  if (showSearchSuggestions && userInput) {
    if (searchResult.length) {
      searchResultComponent = (
        <ul className="suggestions">
          {searchResult.map((data: any, index) => {
            let className;

            return (
              <li
                className={className}
                key={index}
                onClick={(e) => onClickSearchResult(e, data)}
              >
                <div>
                  {data["Id"]}-{data["SMName"]}
                  <br />
                  <p className="search-address"> {data["Address"]}</p>
                </div>
              </li>
            );
          })}
        </ul>
      );
    } else {
      searchResultComponent = (
        <div className="no-suggestions">
          <em>No search result found</em>
        </div>
      );
    }
  }

  const options: Options[] = [
    { id: "Service Master", value: dictionary.db_ServiceMaster },
    { id: "Invoice", value: "Invoice" },
    { id: "Contract", value: "Contract" },
    { id: "PO", value: "PO" },
    { id: "Return", value: "Return" },
    { id: "Project", value: "Project" },
    { id: "Service Call", value: dictionary.db_ServiceCall },
    { id: "Quote", value: dictionary.db_Quote },
  ];

  const selectValue = (data: any) => {
    if (value != data.id) {
      setUserInput("");
    }

    setValue(data.id);
  };

  return (
    <>
      <Loader show={isLoading} />
      <Fragment>
        <div
          id="globleSearch"
          ref={domNode}
          className="row col-10 justify-content-end mr-15 search align-items-center"
        >
          {showField && (
            <div className="col-4">
              <Controller
                control={control}
                name="dictionaryOption"
                render={({ field }) => (
                  <SawinSelect
                    forceClose={forceClose}
                    options={options}
                    selected={value}
                    onChange={selectValue}
                  />
                )}
              />
            </div>
          )}
          {showField ? (
            <div className="col-lg-6 form-style position-relative form-style mt-0">
              <input
                className="form-control mt-0"
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={userInput}
                placeholder={"Search"}
              />
              {suggestionsListComponent}
              {searchResultComponent}
            </div>
          ) : (
            <div className="col-lg-7 form-style position-relative">
              <input
                className="form-control mt-0"
                type="text"
                onChange={onChange1}
                value={userInput}
                placeholder={"Search"}
              />
              {searchResultComponent}
            </div>
          )}
          <a
            onClick={() => showSearchField()}
            className="header-icons"
            style={{ borderRadius: "4px" }}
          >
            <img
              src={search}
              className="icon theme-icon-color"
              alt="Dark mode"
            />
          </a>
        </div>
      </Fragment>
    </>
  );
};

export default Search;
