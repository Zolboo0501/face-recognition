import { v4 as uuidv4 } from "uuid";
import { type NextRequest } from "next/server";

async function getClient() {
  const { RekognitionClient } = await import("@aws-sdk/client-rekognition");
  const { fromCognitoIdentityPool } =
    await import("@aws-sdk/credential-providers");

  return new RekognitionClient({
    region: process.env.NEXT_PUBLIC_REGION,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: process.env.NEXT_PUBLIC_REGION },
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
    }),
  });
}

export async function POST() {
  const { CreateFaceLivenessSessionCommand } =
    await import("@aws-sdk/client-rekognition");

  const config: any = {
    ClientRequestToken: uuidv4(),
    Settings: {
      AuditImagesLimit: 4, // Capture 4 audit images for better analysis
    },
  };
  try {
    const command = new CreateFaceLivenessSessionCommand(config);

    const client = await getClient();
    const response = await client.send(command);
    return Response.json(
      { sessionId: response.SessionId as string },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { GetFaceLivenessSessionResultsCommand } =
    await import("@aws-sdk/client-rekognition");

  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    const command = new GetFaceLivenessSessionResultsCommand({
      SessionId: sessionId as string,
    });
    const client = await getClient();
    const data = await client.send(command);

    return Response.json({ data });
  } catch (error) {
    return Response.json(
      { error: "Something went wrong" },
      {
        status: 500,
      },
    );
  }
}
