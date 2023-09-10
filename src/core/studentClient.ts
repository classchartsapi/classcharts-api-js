import { API_BASE_STUDENT, BASE_URL } from "../utils/consts.ts";
import { BaseClient } from "./baseClient.ts";
import { parseCookies } from "../utils/utils.ts";

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
    const request = await fetch(BASE_URL + "/student/login", {
      method: "POST",
      body: formData,
      redirect: "manual",
    });
    if (request.status != 302 || !request.headers.has("set-cookie")) {
      await request.body?.cancel(); // Make deno tests happy by closing the body, unsure whether this is needed for the actual library
      throw new Error(
        "Unauthenticated: ClassCharts didn't return authentication cookies",
      );
    }
    const cookies = String(request.headers.get("set-cookie"));
    this.authCookies = cookies.split(",");
    const sessionCookies = parseCookies(cookies);
    const sessionID = JSON.parse(
      String(sessionCookies["student_session_credentials"]),
    );
    this.sessionId = sessionID.session_id;
    await this.getNewSessionId();
    const user = await this.getStudentInfo();
    this.studentId = user.data.user.id;
  }
}
