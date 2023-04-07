import type { AxiosRequestConfig } from "axios";
import { API_BASE_STUDENT, BASE_URL } from "./consts";
import { ClasschartsClient } from "./baseClient";
import { parseCookies } from "./utils";
/**
 * Student Client
 */

export class StudentClient extends ClasschartsClient {
  public studentCode = "";
  public dateOfBirth = "";

  /**
   *
   * @param studentCode Classcharts student code
   * @param dateOfBirth Student's date of birth
   */
  constructor(
    studentCode: string,
    dateOfBirth?: string,
    axiosConfig?: AxiosRequestConfig
  ) {
    super(API_BASE_STUDENT, axiosConfig);
    this.studentCode = String(studentCode);
    this.dateOfBirth = String(dateOfBirth);
  }

  /**
   * Initialises the client and authenticates with classcharts
   */
  async login(): Promise<void> {
    if (!this.studentCode) throw new Error("Student Code not inputted");
    const formData = new URLSearchParams();
    formData.append("_method", "POST");
    formData.append("code", this.studentCode.toUpperCase());
    formData.append("dob", this.dateOfBirth);
    formData.append("remember_me", "1");
    formData.append("recaptcha-token", "no-token-avaliable");
    const request = await this.axios.request({
      url: BASE_URL + "/student/login",
      method: "POST",
      data: formData.toString(),
      maxRedirects: 0,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      validateStatus: () => true,
    });
    if (request.status != 302 || !request.headers["set-cookie"])
      throw new Error("Unauthenticated: Classcharts returned an error");
    const cookies = String(request.headers["set-cookie"]);
    this.authCookies = cookies.split(";");
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
