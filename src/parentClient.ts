import type { AxiosRequestConfig } from "axios";
import type { GetPupilsResponse } from "./types";

import { ClasschartsClient } from "./baseClient";
import { API_BASE_PARENT, BASE_URL } from "./consts";
import { parseCookies } from "./utils";
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
  constructor(
    email: string,
    password: string,
    axiosConfig?: AxiosRequestConfig
  ) {
    super(API_BASE_PARENT, axiosConfig);
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
    const request = await this.axios.request({
      url: BASE_URL + "/parent/login",
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
      String(sessionCookies["parent_session_credentials"])
    );
    this.sessionId = sessionID.session_id;
    this.pupils = await this.getPupils();
    if (!this.pupils) throw new Error("Account has no pupils attached");
    this.studentId = this.pupils[0].id;
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
        return;
      }
    }
    throw new Error("No pupil with specified ID returned");
  }
}
