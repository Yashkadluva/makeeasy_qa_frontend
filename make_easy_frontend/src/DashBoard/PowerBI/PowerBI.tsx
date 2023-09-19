// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from "react";
import { models } from "powerbi-client";
import { PowerBIEmbed } from "powerbi-client-react";

import "./PowerBI.scss";

// Root Component to demonstrate usage of wrapper component
function Power() {
    // PowerBI Report object (to be received via callback)
    const [, setReport] = useState();

    // API end-point url to get embed config for a sample report
    const sampleReportUrl =
        "https://playgroundbe-bck-1.azurewebsites.net/Reports/SampleReport";

    // Report config useState hook
    // Values for properties like embedUrl, accessToken and settings will be set on click of buttons below
    const [sampleReportConfig, setReportConfig] = useState({
        type: "report",
        embedUrl: undefined,
        tokenType: models.TokenType.Embed,
        accessToken: undefined,
        settings: undefined
    });

    // Map of event handlers to be applied to the embedding report
    const eventHandlersMap = new Map([
        [
            "loaded",
            function () {
                console.log("Report has loaded");
            }
        ],
        [
            "rendered",
            function () {
                console.log("Report has rendered");

                // Update display message
            }
        ],
        [
            "error",
            function (event: any) {
                if (event) {
                    console.error(event.detail);
                }
            }
        ]
    ]);

    // Fetch sample report's config (eg. embedUrl and AccessToken) for embedding
    const mockSignIn = async () => {
        // Fetch sample report's embed config
        const reportConfigResponse = await fetch(sampleReportUrl);

        if (!reportConfigResponse.ok) {
            console.error(
                `Failed to fetch config for report. Status: ${reportConfigResponse.status} ${reportConfigResponse.statusText}`
            );
            return;
        }

        const reportConfig = await reportConfigResponse.json();

        // Update display message

        // Set the fetched embedUrl and embedToken in the report config
        setReportConfig({
            ...sampleReportConfig,
            embedUrl: reportConfig.EmbedUrl,
            accessToken: reportConfig.EmbedToken.Token
        });
    };

    const changeSettings = () => {
        // Update the state "sampleReportConfig" and re-render DemoApp component
        setReportConfig({
            ...sampleReportConfig,
            // settings: {
            //     panes: {
            //         filters: {
            //             expanded: false,
            //             visible: false
            //         }
            //     }
            // }
        });
    };


    const controlButtons = (
        <div className="controls">
            <button onClick={mockSignIn} className='report-power-button'>Embed Report</button>
        </div>
    );

    return (
        <div>
            <PowerBIEmbed
                embedConfig={sampleReportConfig}
                eventHandlers={eventHandlersMap}
                cssClassName={"report-style-class"}
                getEmbeddedComponent={(embedObject: any) => {
                    console.log(
                        `Embedded object of type "${embedObject.embedtype}" received`
                    );
                    setReport(embedObject);
                }}
            />

            <div className="hr"></div>

            {controlButtons}
        </div>
    );
}

export default Power;
