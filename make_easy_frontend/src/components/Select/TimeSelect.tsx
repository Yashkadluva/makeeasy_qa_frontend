import moment from "moment";
import React, { Fragment, useEffect, useState } from "react";
import { Clock } from "react-bootstrap-icons";
import useClickOutside from "../../hooks/useClickOutside";
import HelperService from "../../utility/HelperService";
import "./SawinSelect.scss";

interface PropData {
  placeholder?: string;
  options: Options[];
  selected: any;
  customInput?: boolean;
  onChange: any;
  value?: string;
  isDisable?: boolean;
  sakey?: string;
}

export interface Options {
  id: any;
  value: string;
  object?: any;
}

const TimeSelect = (props: PropData) => {
  let textInput = React.createRef<HTMLInputElement>();
  const [options, setOptions] = useState(props.options);
  const [selectedOption, setSelectedOption] = useState(props.selected);
  const [isFocus, setIsFocus] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpenTop, setIsOpenTop] = useState(false);
  let index = -1;
  let selectedValue = "";
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    setOptions(props.options);
    if (props.selected != selectedOption) {
      setSelectedOption(props.selected);
    }

    props.options.map((value, i: number) => {
      if (value.id === props.selected) {
        index = i;
        selectedValue = value.value;
        if (userInput != selectedValue) {
          setUserInput(selectedValue);
        }
      }
    });

    if (props.selected != selectedOption) {
      for (var i in props.options) {
        if (props.options[i].id == props.selected) {
          if (props.onChange) {
            props.onChange(props.options[i]);
          }
        }
      }
    }

    if (!userInput) {
      setUserInput(props.selected);
    }

    if (props.selected == "resetsawin") {
      setSearch("");
      setUserInput("");
      setUserInput("");
    }
  }, [props.selected, props.options]);

  const [selectedIndex, setSelectedIndex] = useState(index);

  let domNode = useClickOutside(() => {
    if (search) {
      setUserInput(search);
      setSelectedOption(search);
      !isFocus && props.onChange(search);
    }
    setIsFocus(false);
  }, this);

  const checkPossition = () => {
    var topHeight = domNode.current.getBoundingClientRect().y;
    var bottomHeight =
      window.innerHeight - domNode.current.getBoundingClientRect().y;
    if (bottomHeight > 300 || topHeight <= 280) {
      setIsOpenTop(false);
    } else {
      setIsOpenTop(true);
    }
  };

  let optionsListComponent;

  let searchOption: Options[] = search
    ? options.filter(function (option) {
        return option.value.toLowerCase().includes(search.toLowerCase());
      })
    : options;

  if (searchOption.length) {
    optionsListComponent = (
      <ul className={"options " + (isOpenTop ? "open-top" : "")}>
        {searchOption.map((suggestion: Options, index) => {
          let className;
          if (index === selectedIndex) {
            className = "option-active";
          }

          return (
            <li
              className={className}
              key={index}
              onMouseDown={() => onSelect(suggestion)}
            >
              <div className="option">{suggestion.value}</div>
            </li>
          );
        })}
      </ul>
    );
  } else {
    optionsListComponent = (
      <div className="no-options">
        <em>No data found</em>
      </div>
    );
  }

  const onSelect = (e: Options) => {
    setSearch("");
    setIsFocus(false);
    setUserInput(e.value);
    setSelectedOption(e.id);
    options.map((value, i: number) => {
      if (value.id === e.id) {
        index = i;
        selectedValue = value.value;
      }
    });
    setSelectedIndex(index);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleKey = (e: any) => {
    if (e.keyCode === 40) {
      if (selectedIndex < options.length - 1)
        setSelectedIndex(selectedIndex + 1);
    } else if (e.keyCode === 38) {
      if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
    } else if (e.keyCode === 13) {
      options.map((value: Options, i: number) => {
        if (selectedIndex === i) {
          onSelect(value);
        }
      });
    }
  };

  const checkOption = (enterValue: any) => {
    var isFound = false;
    options.map((value: Options, i: number) => {
      if (value.id === search) {
        onSelect(value);
        isFound = true;
      }
    });

    if (props.customInput && !isFound && search) {
      if (search.match("^(0[1-9]|1[0-2]):([0-5][0-9]) ((a|p)m|(A|P)M)$")) {
       
        setUserInput(search);
        var date = moment(search, "hh:mm A").format("YYYY-MM-DD HH:mm:ss");
        var temp: Options = { value: date, id: date };
        onSelect(temp);
        setUserInput(search);
        setSelectedOption(date);
      }
      //  else {
      //   setSearch(HelperService.getFormatedTime(props.selected)); 
      //   setUserInput(HelperService.getFormatedTime(props.selected));
      //   var temp: Options = { value: props.selected, id: props.selected };
      //   onSelect(temp);
      //   setSelectedOption(props.selected);
      // }
    } else {
      if (search) {
        setSelectedOption(search);
        setUserInput(search);
      }
    }

    setSearch("");
  };

  return (
    <>
      <Fragment>
        <div
          ref={domNode}
          id={props.sakey ? props.sakey : "selectId"}
          key={props.sakey}
          className={
            props.isDisable === true ? "disabled-select" : "select w-100"
          }
        >
          <div
            className={"form-style " + (isFocus ? "zindex" : "")}
            tabIndex={0}
          >
            <input
              ref={textInput}
              className="form-control"
              value={isFocus ? search : userInput}
              type="text"
              onBlur={(e) => {
                checkOption(e.target.value);
              }}
              onKeyDown={(e) => {
                handleKey(e);
              }}
              onClick={() => setIsFocus(!isFocus)}
              onMouseDown={() => {
                if (!props.isDisable) {
                  if (!isFocus) {
                    checkPossition();
                  }
                }
              }}
              disabled={props.isDisable}
              placeholder={props.placeholder ? props.placeholder : ""}
              onChange={(e) => {
                HelperService.timeFormatter(e);
                var datetime =
                  HelperService.getFormatedDateForSorting(props.value) +
                  " " +
                  e.target.value;
                var date = moment(datetime, "YYYY-MM-DD hh:mm A").format(
                  "YYYY-MM-DD HH:mm:ss"
                );
                setSearch(e.target.value);
                props.onChange({ id: date });
              }}
            />
            {props.isDisable === true ? (
              ""
            ) : (
              <Clock
                id="img_downarrow"
                style={{ position: "absolute", top: 10, right: 0 }}
                className="searchdownarrow text-dark"
              />
            )}
            {isFocus ? optionsListComponent : ""}
          </div>
        </div>
      </Fragment>
    </>
  );
};

TimeSelect.defaultProps = {
  placeholder: "__:__ __",
  selected: "",
  isSearchable: false,
  sakey: new Date().getTime(),
  type: "ARROW",
  isHideArrow: false,
  options: [],
};

export default TimeSelect;
