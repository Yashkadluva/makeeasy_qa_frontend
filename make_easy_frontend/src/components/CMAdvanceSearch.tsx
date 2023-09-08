import { useEffect, useState } from "react";
import loader from "../assets/images/loader.gif";
import WebService from "../utility/WebService";

interface Suggestions {
    text: string;
    value: string;
    key: string;
}

interface PropData {
    selected?: any;
    onChange: any;
}

const CMAdvanceSearch = (props: PropData) => {
    const [userInput, setUserInput] = useState("");
    const [showSearchSuggestions, setShowSearchSuggestions] =
        useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchResult, setSearchResult] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<
        Suggestions[]
    >([]);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [loading, setLoading] = useState(false);
    const [isInventory, setInventory] = useState(false)

    useEffect(() => {
        setUserInput(props.selected)
    }, [props.selected])


    const onChange = (e: any) => {
        setShowSearchSuggestions(false);
        setShowSuggestions(true);
        setSearchResult([]);
        showResult(e.currentTarget.value);
        setUserInput(e.currentTarget.value);
    };

    const showResult = (userInput: any) => {
        const suggestions: Suggestions[] = [
            {
                text: "<b>" + userInput + "</b> in AR#",
                value: userInput,
                key: "AR_ARCustomerMasterIdValue",
            },
            {
                text: "<b>" + userInput + "</b> in Company Name",
                value: userInput,
                key: "AR_CompanyNameValue",
            },
            {
                text: "<b>" + userInput + "</b> in First Name",
                value: userInput,
                key: "AR_FirstNameValue",
            },
            {
                text: "<b>" + userInput + "</b> in Last Name",
                value: userInput,
                key: "AR_LastNameValue",
            }
        ];
        setFilteredSuggestions(suggestions);
    }

    const onKeyDown = (e: any) => {
        // User pressed the enter key
        setUserInput(e.target.value);
        if (e.keyCode === 13) {
            setActiveSuggestion(0);
            setShowSuggestions(false);
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
        console.log(e);

        let requestBody: any = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            AR_ARCustomerMasterIdField: 'Id',
            AR_ARCustomerMasterIdValue: "",
            AR_CompanyNameField: 'CompanyName',
            AR_CompanyNameValue: "",
            AR_FirstNameField: 'FirstName',
            AR_FirstNameValue: "",
            AR_LastNameField: 'LastName',
            AR_LastNameValue: "",
            AR_EmailField: 'Email',
            SearchCriteria: 4,
        }
        let arr = ["AR_ARCustomerMasterIdValue", "AR_CompanyNameValue", "AR_FirstNameValue", "AR_LastNameValue"]

        for (let x of arr) {
            if (x == e.key) {
                requestBody[e.key] = e.value
            }
        };

        


        setActiveSuggestion(0);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        setShowSearchSuggestions(true);
        setLoading(true)
        WebService.postAPI({
            action: `ARCustomerMaster/SearchAR`,
            body: requestBody,
        })
            .then((res: any) => {
                setSearchResult(res);
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
            });
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
                                    {`${data.Id} ${data.CompanyName}`}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            );
        } else {
            searchResultComponent = (
                <div className="no-suggestions">
                    {
                        loading ? <div style={{ textAlign: "center" }}>
                            <img
                                style={{ position: "relative" }}
                                src={loader}
                                alt="No loader found"
                            />
                            <div style={{ position: "relative", color: "black" }}>
                                Loading...
                            </div>
                        </div>
                            :
                            <em>No search result found</em>
                    }
                </div>
            );
        }
    }

    const onClickSearchResult = (e: any, data: any) => {
        setSearchResult([]);
        setShowSearchSuggestions(false);
        setUserInput(data.PartNum);
        props.onChange({ id: data.Id, code: data.CompanyName }, data)
    }


    return (
        <>
            <div className="w-100 position-relative">
                <input
                    className="form-control mt-0"
                    type="text"
                    onChange={(e: any) => {
                        onChange(e);
                    }}
                    onKeyDown={onKeyDown}
                    value={userInput}
                    placeholder={"Search"}
                />
                {suggestionsListComponent}
                {searchResultComponent}
            </div>
        </>
    )
}

export default CMAdvanceSearch;