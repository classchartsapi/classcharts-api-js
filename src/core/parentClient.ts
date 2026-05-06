import type {
	ChangePasswordResponse,
	GetHomeworkOptions,
	GetPupilsResponse,
	HomeworksResponse,
} from "../types.ts";

import { BaseClient } from "../core/baseClient.ts";
import { API_BASE_PARENT, BASE_URL } from "../utils/consts.ts";
import { parseCookies } from "../utils/utils.ts";
/**
 * Parent Client.
 * See {@link BaseClient} for all shared methods.
 *
 * @example
 * ```ts
 * import { ParentClient } from "classcharts-api";
 * const client = new ParentClient("username", "password");
 * await client.login();
 * ```
 */
export class ParentClient extends BaseClient {
	private password = "";
	private email = "";
	public pupils: GetPupilsResponse;
	/**
	 * @param email Parent's email address
	 * @param password Parent's password
	 */
	constructor(email: string, password: string) {
		super(API_BASE_PARENT);
		this.email = String(email);
		this.password = String(password);
		this.pupils = [];
	}

	/**
	 * Authenticates with ClassCharts
	 */
	async login(): Promise<void> {
		if (!this.email) {
			throw new Error("Email not provided");
		}
		if (!this.password) {
			throw new Error("Password not provided");
		}
		const formData = new URLSearchParams();
		formData.append("_method", "POST");
		formData.append("email", this.email);
		formData.append("logintype", "existing");
		formData.append("password", this.password);
		formData.append("recaptcha-token", "no-token-available");
		const headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
		});
		const response = await fetch(`${BASE_URL}/parent/login`, {
			method: "POST",
			body: formData,
			headers: headers,
			redirect: "manual",
		});
		if (response.status !== 302 || !response.headers.has("set-cookie")) {
			await response.body?.cancel(); // Make deno tests happy by closing the body, unsure whether this is needed for the actual library
			throw new Error(
				"Unauthenticated: ClassCharts didn't return authentication cookies",
			);
		}

		const cookies = String(response.headers.get("set-cookie"));
		this.authCookies = cookies.split(";");
		const sessionCookies = parseCookies(cookies);
		const sessionID = JSON.parse(
			String(sessionCookies.parent_session_credentials),
		);
		this.sessionId = sessionID.session_id;
		this.pupils = await this.getPupils();
		if (!this.pupils) {
			throw new Error("Account has no pupils attached");
		}
		this.studentId = this.pupils[0].id;
	}
	/**
	 * Get a list of pupils connected to this parent's account
	 * @returns an array of Pupils connected to this parent's account
	 */
	async getPupils(): Promise<GetPupilsResponse> {
		const response = await this.makeAuthedRequest(`${this.API_BASE}/pupils`, {
			method: "GET",
		});
		return response.data;
	}
	/**
	 * Selects a pupil to be used with API requests
	 * @param pupilId Pupil ID obtained from this.pupils or getPupils()
	 *
	 * @see getPupils
	 */
	selectPupil(pupilId: number) {
		if (!pupilId) {
			throw new Error("No pupil ID specified");
		}
		const pupils = this.pupils;
		for (let i = 0; i < pupils.length; i++) {
			const pupil = pupils[i];
			if (pupil.id === pupilId) {
				this.studentId = pupil.id;
				return;
			}
		}
		throw new Error("No pupil with specified ID returned");
	}

	/**
	 * Gets homework for a specific pupil ID without changing the selected pupil permanently.
	 * @param pupilId Pupil ID obtained from this.pupils or getPupils()
	 * @param options GetHomeworkOptions
	 * @returns Homeworks response for the specified pupil
	 */
	async getHomeworksForPupil(
		pupilId: number,
		options?: GetHomeworkOptions,
	): Promise<HomeworksResponse> {
		const previousStudentId = this.studentId;
		try {
			this.selectPupil(pupilId);
			return await this.getHomeworks(options);
		} finally {
			this.studentId = previousStudentId;
		}
	}

	/**
	 * Gets homework for multiple pupil IDs.
	 *
	 * If no pupil IDs are passed, this fetches homework for every pupil attached
	 * to the parent account.
	 *
	 * @param options GetHomeworkOptions
	 * @param pupilIds Optional list of pupil IDs to fetch homework for
	 * @returns A record where each key is a pupil ID and value is that pupil's homework response
	 */
	async getHomeworksForEachPupil(
		options?: GetHomeworkOptions,
		pupilIds?: number[],
	): Promise<Record<number, HomeworksResponse>> {
		const targetPupilIds = pupilIds?.length
			? pupilIds
			: this.pupils.map((pupil) => pupil.id);

		if (!targetPupilIds.length) {
			throw new Error("No pupils available");
		}

		const invalidPupilIds = targetPupilIds.filter((pupilId) =>
			!this.pupils.some((pupil) => pupil.id === pupilId)
		);
		if (invalidPupilIds.length) {
			throw new Error(
				`No pupil with specified ID returned: ${invalidPupilIds.join(", ")}`,
			);
		}

		const previousStudentId = this.studentId;
		const homeworksByPupilId: Record<number, HomeworksResponse> = {};

		try {
			for (const pupilId of targetPupilIds) {
				homeworksByPupilId[pupilId] = await this.getHomeworksForPupil(
					pupilId,
					options,
				);
			}
		} finally {
			this.studentId = previousStudentId;
		}

		return homeworksByPupilId;
	}

	/**
	 * Changes the login password for the current parent account
	 * @param currentPassword Current password
	 * @param newPassword New password
	 * @returns Whether the request was successful
	 */
	async changePassword(
		currentPassword: string,
		newPassword: string,
	): Promise<ChangePasswordResponse> {
		const formData = new URLSearchParams();
		formData.append("current", currentPassword);
		formData.append("new", newPassword);
		formData.append("repeat", newPassword);
		return await this.makeAuthedRequest(`${this.API_BASE}/password`, {
			method: "POST",
			body: formData,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});
	}
}
