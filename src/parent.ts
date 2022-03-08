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

import {ClasschartsClient} from "./client"
import { API_BASE_PARENT, BASE_URL } from "./consts";
/**
 * The base client
 */
export class ClasschartsClientParent extends ClasschartsClient {
  public password = "";
  public email = "";
  /**
   *
   * @param studentCode Classcharts student code
   * @param dateOfBirth Student's date of birth
   */
  constructor(email: string, password: string) {
    super(API_BASE_PARENT)
    this.email = String(email);
    this.password = String(password);
  }

  /**
   * Initialises the client and authenticates with classcharts
   */
  async login(): Promise<void> {
    if (!this.email) throw new Error("Email not inputted");
    const formData = new URLSearchParams();
    formData.append("_method", "POST");
    formData.append("email", this.email);
    formData.append("logintype", "existing");
    formData.append("password", this.password);
    formData.append("recaptcha-token", "no-token-avaliable");

    const request = await Undici.request(BASE_URL + "/parent/login", {
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

    let pupil = await this.getPupil();

    this.studentId = pupil[0].id;
    this.studentName = pupil[0].pupil_name;
  }

}
