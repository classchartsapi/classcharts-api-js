import type { GetPupilsResponse } from "../types.ts";

import { BaseClient } from "./baseClient.ts";
import { API_BASE_PARENT, BASE_URL } from "../utils/consts.ts";
import { parseCookies } from "../utils/utils.ts";
/**
 * Parent Client
 */
export class ParentClient extends BaseClient {
  private password = "";
  private email = "";
  // @ts-expect-error Init in .login
  public pupils: GetPupilsResponse;
  /**
   * @param email Parent's email address
   * @param password Parent's password
   */
  constructor(email: string, password: string) {
    super(API_BASE_PARENT);
    this.email = String(email);
    this.password = String(password);
  }

  /**
   * Authenticates with ClassCharts
   */
  async login(): Promise<void> {
    if (!this.email) throw new Error("Email not provided");
    const formData = new URLSearchParams();
    formData.append("_method", "POST");
    formData.append("email", this.email);
    formData.append("logintype", "existing");
    formData.append("password", this.password);
    formData.append("recaptcha-token", "no-token-available");
    const headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    const response = await fetch(BASE_URL + "/parent/login", {
      method: "POST",
      body: formData,
      headers: headers,
      credentials: undefined,
    });
    if (response.status != 302 || !response.headers.get("set-cookie")) {
      throw new Error(
        "Unauthenticated: ClassCharts returned an error: " +
          response.status +
          " " +
          response.statusText
      );
    }

    const cookies = String(response.headers.get("set-cookie"));
    // this.authCookies = cookies.split(";");
    const sessionCookies = parseCookies(cookies);
    const sessionID = JSON.parse(
      String(sessionCookies["parent_session_credentials"])
    );
    super.sessionId = sessionID.session_id;
    this.pupils = await this.getPupils();
    if (!this.pupils) throw new Error("Account has no pupils attached");
    super.studentId = this.pupils[0].id;
  }
  /**
   * Get a list of pupils connected to this parent's account
   * @returns an array of Pupils connected to this parent's account
   */
  async getPupils(): Promise<GetPupilsResponse> {
    return await super.makeAuthedRequest(super.API_BASE + "/pupils", {
      method: "GET",
    });
  }
  /**
   * Selects a pupil to be used with API requests
   * @param pupilId Pupil ID obtained from this.pupils or getPupils()
   *
   * @see getPupils
   */
  selectPupil(pupilId: number) {
    if (!pupilId) throw new Error("No pupil ID specified");
    const pupils = this.pupils;
    for (let i = 0; i < pupils.length; i++) {
      const pupil = pupils[i];
      if (pupil.id == pupilId) {
        super.studentId = pupil.id;
        return;
      }
    }
    throw new Error("No pupil with specified ID returned");
  }
}
