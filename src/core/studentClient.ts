import { API_BASE_STUDENT, BASE_URL } from "../utils/consts.ts";
import { BaseClient } from "../core/baseClient.ts";
import { parseCookies } from "../utils/utils.ts";
import {
	GetStudentCodeOptions,
	GetStudentCodeResponse,
	RewardPurchaseResponse,
	RewardsResponse,
} from "../types.ts";

/**
 * Student Client
 */
export class StudentClient extends BaseClient {
	/**
	 * @property studentCode ClassCharts student code
	 */
	private studentCode = "";
	/**
	 * @property dateOfBirth Student's date of birth
	 */
	private dateOfBirth = "";

	/**
	 * @param studentCode ClassCharts student code
	 * @param dateOfBirth Student's date of birth
	 */
	constructor(studentCode: string, dateOfBirth?: string) {
		super(API_BASE_STUDENT);
		this.studentCode = String(studentCode);
		this.dateOfBirth = String(dateOfBirth);
	}

	/**
	 * Authenticates with ClassCharts
	 */
	async login(): Promise<void> {
		if (!this.studentCode) throw new Error("Student Code not provided");
		const formData = new URLSearchParams();
		formData.append("_method", "POST");
		formData.append("code", this.studentCode.toUpperCase());
		formData.append("dob", this.dateOfBirth);
		formData.append("remember_me", "1");
		formData.append("recaptcha-token", "no-token-available");
		const request = await fetch(`${BASE_URL}/student/login`, {
			method: "POST",
			body: formData,
			redirect: "manual",
		});
		if (request.status !== 302 || !request.headers.has("set-cookie")) {
			await request.body?.cancel(); // Make deno tests happy by closing the body, unsure whether this is needed for the actual library
			throw new Error(
				"Unauthenticated: ClassCharts didn't return authentication cookies",
			);
		}
		const cookies = String(request.headers.get("set-cookie"));
		this.authCookies = cookies.split(",");
		const sessionCookies = parseCookies(cookies);
		const sessionID = JSON.parse(
			String(sessionCookies.student_session_credentials),
		);
		this.sessionId = sessionID.session_id;
		await this.getNewSessionId();
		const user = await this.getStudentInfo();
		this.studentId = user.data.user.id;
	}

	/**
	 * Gets the available items in the current student's rewards shop
	 * @returns Array of purchasable items
	 */
	async getRewards(): Promise<RewardsResponse> {
		return await this.makeAuthedRequest(
			`${this.API_BASE}/rewards/${this.studentId}`,
			{
				method: "GET",
			},
		);
	}

	/**
	 * Purchase a reward item from the current student's rewards shop
	 * @param itemId number
	 * @returns An object containing the current student's balance and item ID purchased
	 */
	async purchaseReward(itemId: number): Promise<RewardPurchaseResponse> {
		return await this.makeAuthedRequest(`${this.API_BASE}/purchase/${itemId}`, {
			method: "POST",
			body: `pupil_id=${this.studentId}`,
		});
	}

	/**
	 * Gets the current student's student code
	 * @param options GetStudentCodeOptions
	 * @param options.dateOfBirth Date of birth in the format YYYY-MM-DD
	 * @returns
	 */
	async getStudentCode(
		options: GetStudentCodeOptions,
	): Promise<GetStudentCodeResponse> {
		const data = await this.makeAuthedRequest(`${this.API_BASE}/getcode`, {
			method: "POST",
			body: JSON.stringify({
				date: options.dateOfBirth,
			}),
		});
		return data;
	}
}
