import { useState, useEffect } from "react";
import WebService from "../../utility/WebService";

interface Suggestions {
    text: string;
    value: string;
    key: string;
}

interface PropData {
    selected?: any;
    onChange: any;
}

const VendorAdvanceSearch = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showVendorSearchSuggestions, setShowVendorSearchSuggestions] = useState(false);
    const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
    const [searchVendorResult, setSearchVendorResult] = useState([]);
    const [userVendorInput, setUserVendorInput] = useState("");
    const [activeVendorSuggestion, setActiveVendorSuggestion] = useState(0);
    const [filteredVendorSuggestions, setFilteredVendorSuggestions] = useState<Suggestions[]>([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setUserVendorInput(props.selected)
    }, [props.selected])


    const onChange = (e: any) => {
        setShowVendorSearchSuggestions(false);
        setShowVendorSuggestions(true);
        setSearchVendorResult([]);
        showVendorResult(e.currentTarget.value);
        setUserVendorInput(e.currentTarget.value);
    }

    const showVendorResult = (userInput: any) => {
        const suggestions: Suggestions[] = [
            {
                text: "<b>" + userInput + "</b> in Name",
                value: userInput,
                key: "Name",
            },
            {
                text: "<b>" + userInput + "</b> in Phone",
                value: userInput,
                key: "Phone"
            },
            {
                text: "<b>" + userInput + "</b> in Fax",
                value: userInput,
                key: "Fax"
            },
            {
                text: "<b>" + userInput + "</b> in Website",
                value: userInput,
                key: "Website"
            },
            {
                text: "<b>" + userInput + "</b> in Email",
                value: userInput,
                key: "ApContactEmail"
            },
            {
                text: "<b>" + userInput + "</b> in Company Name",
                value: userInput,
                key: "CompanyName"
            },
            {
                text: "<b>" + userInput + "</b> in Notes",
                value: userInput,
                key: "Notes"
            }
        ]
        setFilteredVendorSuggestions(suggestions);
    }

    const onKeyDown = (e: any) => {
        setUserVendorInput(e.target.value);
        if (e.keyCode === 13) {
            setActiveVendorSuggestion(0);
            setShowVendorSuggestions(false);
            onClick(filteredVendorSuggestions[activeVendorSuggestion]);
        } else if (e.keyCode === 38) {
            if (activeVendorSuggestion === 0) {
                return;
            }
            setActiveVendorSuggestion(activeVendorSuggestion - 1);
        } else if (e.keyCode === 40) {
            if (activeVendorSuggestion - 1 === filteredVendorSuggestions.length) {
                return;
            }
            setActiveVendorSuggestion(activeVendorSuggestion + 1);
        }
    }

    const onClick = (e: Suggestions) => {
        setActiveVendorSuggestion(0);
        setFilteredVendorSuggestions([]);
        setShowVendorSuggestions(false);
        setLoading(true);
        setShowVendorSearchSuggestions(true);

        WebService.postAPI({
            action: `SaiAPVendorMaster/SearchVendors`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                FieldName: e.key,
                Operator: "4",
                SearchText: e.value,
            },
        })
            .then((res: any) => {
                setSearchVendorResult(res);
            })
            .catch((e: any) => { });
    }

    let suggestionsListComponent;
    if (showVendorSuggestions && userVendorInput) {
        if (filteredVendorSuggestions.length) {
            suggestionsListComponent = (
                <ul className="suggestions">
                    {filteredVendorSuggestions.map((suggestion: Suggestions, index) => {
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
    if (showVendorSearchSuggestions && userVendorInput) {
        if (searchVendorResult.length) {
            searchResultComponent = (
                <ul className="suggestions">
                    {searchVendorResult.map((data: any, index) => {
                        let className;
                        var id = data["MailAddrId"];
                        var name = data["Name"];
                        var companyName = data["CompanyName"];
                        return (
                            <li
                                className={className}
                                key={index}
                                onClick={(e) => onClickSearchResult(e, data)}
                            >
                                <div>
                                    {id}-{name}
                                    <br />
                                    <p className="search-address"> {companyName}</p>
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

    const onClickSearchResult = (e: any, data: any) => {
        setSearchVendorResult([]);
        setShowVendorSearchSuggestions(false);
        // setUserVendorInput(data.VendorId);
        props.onChange({ id: data.VendorId, code: data.Name }, data)
    };

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
                    value={userVendorInput}
                    placeholder="Search"
                />
                {suggestionsListComponent}
                {searchResultComponent}
            </div>
        </>
    )
}

export default VendorAdvanceSearch;