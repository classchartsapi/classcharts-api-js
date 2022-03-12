import Undici from "undici";
import type { GetPupilsResponse } from "./types";

import { ClasschartsClient } from "./client";
import { API_BASE_PARENT, BASE_URL } from "./consts";
/**
 * The base client
 */
export class ClasschartsParentClient extends ClasschartsClient {
  private password = "";
  private email = "";
  // @ts-expect-error Init in .login
  public pupils: GetPupilsResponse;
  /**
   *
   * @param email Parents email address
   * @param password Parents password
   */
  constructor(email: string, password: string) {
    super(API_BASE_PARENT);
    this.email = String(email);
    this.password = String(password);
  }

  /**
   * Logs the user in the client and authenticates with classcharts
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
    this.pupils = await this.getPupils();
    if (!this.pupils) throw new Error("Account has no pupils attached");
    this.studentId = this.pupils[0].id;
    this.studentName = this.pupils[0].name;
  }
  /**
   * Get Pupil details
   * @returns an array fo Pupils connected to this parent's account
   */
  async getPupils(): Promise<GetPupilsResponse> {
    return this.makeAuthedRequest(this.API_BASE + "/pupils", {
      method: "GET",
    });
  }
  /**
   * Selects a pupil to be used with API requests
   * @param pupilId Pupil ID obtained from this.pupils or getPupils
   */
  async selectPupil(pupilId: number): Promise<void> {
    if (!pupilId) throw new Error("No pupil ID specified");
    const pupils = this.pupils;
    for (let i = 0; i < pupils.length; i++) {
      const pupil = pupils[i];
      if (pupil.id == pupilId) {
        this.studentId = pupil.id;
        this.studentName = pupil.name;
        return;
      }
    }
    throw new Error("No pupil with specified ID returned");
  }
}
