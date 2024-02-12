
/** Actually `hf_${string}`, but for convenience, using the string type */
type AccessToken = string;

interface Credentials {
	accessToken: AccessToken;
}

type SpaceHardwareFlavor =
	| "cpu-basic"
	| "cpu-upgrade"
	| "t4-small"
	| "t4-medium"
	| "a10g-small"
	| "a10g-large"
	| "a100-large";

type SpaceSdk = "streamlit" | "gradio" | "docker" | "static";

type SpaceStage =
	| "NO_APP_FILE"
	| "CONFIG_ERROR"
	| "BUILDING"
	| "BUILD_ERROR"
	| "RUNNING"
	| "RUNNING_BUILDING"
	| "RUNTIME_ERROR"
	| "DELETING"
	| "PAUSED"
	| "SLEEPING";

type AccessTokenRole = "admin" | "write" | "contributor" | "read";

type AuthType = "access_token" | "app_token" | "app_token_as_user";


interface SpaceRuntime {
	stage: SpaceStage;
	sdk?: SpaceSdk;
	sdkVersion?: string;
	errorMessage?: string;
	hardware?: {
		current: SpaceHardwareFlavor | null;
		currentPrettyName?: string;
		requested: SpaceHardwareFlavor | null;
		requestedPrettyName?: string;
	};
	/** when calling /spaces, those props are only fetched if ?full=true */
	resources?: SpaceResourceConfig;
	/** in seconds */
	gcTimeout?: number | null;
}

interface SpaceResourceRequirement {
	cpu?: string;
	memory?: string;
	gpu?: string;
	gpuModel?: string;
	ephemeral?: string;
}

interface SpaceResourceConfig {
	requests: SpaceResourceRequirement;
	limits: SpaceResourceRequirement;
	replicas?: number;
	throttled?: boolean;
	is_custom?: boolean;
}

export interface HFSpaceStatus {
  _id: string
  id: string
  author: string
  sha: string
  lastModified: string
  private: boolean
  gated: boolean
  disabled: boolean
  host: string
  subdomain: string
  tags: string[]
  likes: number
  sdk: string
  runtime: SpaceRuntime
  createdAt: string
}

export async function getHuggingFaceSpaceStatus({
  space,
  // userName,
  // spaceName,
}: {
  space: string // a joined "user_name/space_name"
  // userName: string
  // spaceName: string
}): Promise<HFSpaceStatus> {
  const res = await fetch(`https://huggingface.co/api/spaces/${space}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VC_HF_API_TOKEN || ""}`
    }
  })

  if (res.status !== 200)  {
    throw new Error("failed to get the space data")
  }

  try {
    const data = await res.json() as HFSpaceStatus
    return data
  } catch (err) {
    throw new Error("failed to parse space data", err)
  }
}
