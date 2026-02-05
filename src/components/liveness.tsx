"use client";

import "@aws-amplify/ui-react/styles.css";
import React from "react";
import { Loader, ThemeProvider } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import type { GetFaceLivenessSessionResultsCommandOutput } from "@aws-sdk/client-rekognition";

const credentials = {
  aws_project_region: process.env.NEXT_PUBLIC_REGION,
  aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NEXT_PUBLIC_REGION,
};

Amplify.configure(credentials);

export const Liveness = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [createLivenessApiData, setCreateLivenessApiData] =
    React.useState<GetFaceLivenessSessionResultsCommandOutput | null>(null);

  React.useEffect(() => {
    const fetchCreateLiveness: () => Promise<void> = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/session", { method: "POST" });
        const data = await response.json();
        setSessionId(data.sessionId);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreateLiveness();
  }, []);

  const handleAnalysisComplete = async () => {
    if (!sessionId) return alert("Session ID not found");

    try {
      const response = await fetch(`/api/session?sessionId=${sessionId}`);
      const { data } = await response.json();
      setCreateLivenessApiData(data);
      console.log("data", data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSessionId(null);
    }
  };

  return (
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : (
        <>
          {createLivenessApiData ? (
            <>
              <div>Confidence: {createLivenessApiData.Confidence}</div>
              <div>SessionId: {createLivenessApiData.SessionId}</div>
            </>
          ) : (
            <div
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "80vh",
                minHeight: "400px",
                margin: "0 auto",
              }}
            >
              <FaceLivenessDetector
                sessionId={sessionId!}
                region={process.env.NEXT_PUBLIC_REGION!}
                onAnalysisComplete={handleAnalysisComplete}
                onError={(error) => {
                  console.error(error);
                }}
              />
            </div>
          )}
        </>
      )}
    </ThemeProvider>
  );
};
