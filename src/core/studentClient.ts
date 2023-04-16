import { API_BASE_STUDENT, BASE_URL } from "../utils/consts.js";
import { BaseClient } from "./baseClient.js";
import { parseCookies } from "../utils/utils.js";
import ky from "ky-universal";

/**
 * Student Client
 */
export class StudentClient extends BaseClient {
  /**
   * @property studentCode Classcharts student code
   * @internal
   */
  private studentCode = "";
  /**
   * @property dateOfBirth Student's date of birth
   * @internal
   */
  private dateOfBirth = "";

  /**
   *
   * @param studentCode Classcharts student code
   * @param dateOfBirth Student's date of birth
   */
  constructor(studentCode: string, dateOfBirth?: string) {
    super(API_BASE_STUDENT);
    this.studentCode = String(studentCode);
    this.dateOfBirth = String(dateOfBirth);
  }

  /**
   * Authenticates with classcharts
   */
  async login(): Promise<void> {
    if (!this.studentCode) throw new Error("Student Code not inputted");
    const formData = new URLSearchParams();
    formData.append("_method", "POST");
    formData.append("code", this.studentCode.toUpperCase());
    formData.append("dob", this.dateOfBirth);
    formData.append("remember_me", "1");
    formData.append("recaptcha-token", "no-token-avaliable");
    const request = await ky(BASE_URL + "/student/login", {
      method: "POST",
      body: formData,
      redirect: "manual",
      throwHttpErrors: false,
      credentials: undefined,
    });
    if (request.status != 302 || !request.headers.get("set-cookie")) {
      throw new Error(
        "Unauthenticated: Classcharts returned an error: " +
          request.status +
          " " +
          request.statusText
      );
    }
    const cookies = String(request.headers.get("set-cookie"));
    this.authCookies = cookies.split(",");
    const sessionCookies = parseCookies(cookies);
    const sessionID = JSON.parse(
      String(sessionCookies["student_session_credentials"])
    );
    this.sessionId = sessionID.session_id;
    await this.getNewSessionId();
    const user = await this.getStudentInfo();
    this.studentId = user.data.user.id;
  }
}
