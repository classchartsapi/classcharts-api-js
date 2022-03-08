import Undici from "undici";
import { RequestOptions } from "undici/types/dispatcher";
import {
  ActivityResponse,
  AnnouncementsResponse,
  BadgesResponse,
  BehaviourResponse,
  DetentionsResponse,
  GetActivityOptions,
  GetBehaviourOptions,
  GetHomeworkOptions,
  GetLessonsOptions,
  Homework,
  HomeworksResponse,
  LessonsResponse,
  Student,
} from "./types";
import { API_BASE_STUDENT, BASE_URL } from "./consts";
import {ClasschartsClient} from "./client"
/**
 * The base client
 */

export class ClasschartsClientStudent extends ClasschartsClient {
  public studentCode = "";
  public dateOfBirth = "";

  /**
   *
   * @param studentCode Classcharts student code
   * @param dateOfBirth Student's date of birth
   */
  constructor(studentCode: string, dateOfBirth?: string) {
    super(API_BASE_STUDENT)
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
    const request = await Undici.request(BASE_URL + "/student/login", {
      method: "POST",
      body: formData.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (request.statusCode != 302 || !request.headers["set-cookie"])
      throw new Error("Unauthenticated: Classcharts returned an error");
    const cookies = request.headers["set-cookie"];
    for (let i = 0; i < cookies.length; i++) {
      cookies[i] = cookies[i].substring(0, cookies[i].indexOf(";"));
    }
    this.authCookies = cookies;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sessionID: any = decodeURI(cookies[2])
      .replace(/%3A/g, ":")
      .replace(/%2C/g, ",");
    sessionID = JSON.parse(
      sessionID.substring(sessionID.indexOf("{"), sessionID.length)
    );
    this.sessionId = sessionID.session_id;
    const user = await this.getStudentInfo();
    this.studentId = user.id;
    this.studentName = user.name;
  }
}
