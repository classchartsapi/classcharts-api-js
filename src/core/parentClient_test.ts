import { BaseClient } from "./baseClient.js";
import { API_BASE_PARENT, BASE_URL } from "../utils/consts.js";
import { parseCookies } from "../utils/utils.js";
import type { ChangePasswordResponse, GetPupilsResponse } from "../types.js";

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
  public pupils: GetPupilsResponse = [];

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
   * Authenticates with ClassCharts.
   *
   * Handles the TES SSO verification step introduced in April 2026.
   * Without the handshake, getPupils() would trigger an infinite redirect loop
   * between classcharts.com and session.tes.com, causing a
   * "redirect count exceeded" error.
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
      await response.body?.cancel();
      throw new Error(
        "Unauthenticated: ClassCharts didn't return authentication cookies"
      );
    }

    const cookies = String(response.headers.get("set-cookie"));
    const sessionCookies = parseCookies(cookies);
    const sessionID = JSON.parse(
      String(sessionCookies.parent_session_credentials)
    );
    this.sessionId = sessionID.session_id;

    // Perform the TES SSO handshake before calling getPupils(), otherwise the
    // /apiv2parent/pupils endpoint redirects to session.tes.com/v1/verify and
    // back in an infinite loop (introduced ~27 April 2026).
    await this.performTesSsoHandshake(sessionCookies);

    this.pupils = await this.getPupils();
    if (!this.pupils) {
      throw new Error("Account has no pupils attached");
    }
    this.studentId = this.pupils[0].id;
  }

  /**
   * Satisfies the TES SSO verification handshake introduced in April 2026.
   *
   * ClassCharts now redirects the first authenticated request to
   * `session.tes.com/v1/verify`, which redirects straight back, creating a
   * loop. Following the two-hop chain once (with `redirect: "manual"`) sets
   * the necessary TES cookies and allows subsequent API calls to succeed.
   *
   * @param sessionCookies Parsed session cookies from the login POST response
   */
  private async performTesSsoHandshake(
    sessionCookies: Record<string, string>
  ): Promise<void> {
    const ccSession = sessionCookies["cc-session"];
    const parentCreds = sessionCookies["parent_session_credentials"];

    if (!ccSession || !parentCreds) {
      // Cookies absent — skip handshake gracefully (guards against future
      // auth flow changes where these cookie names may differ).
      return;
    }

    const cookieHeader = `cc-session=${ccSession}; parent_session_credentials=${parentCreds}`;

    const verifyUrl =
      "https://session.tes.com/v1/verify?returnUrl=" +
      encodeURIComponent(`${BASE_URL}/apiv2parent/pupils`);

    // Hop 1: classcharts.com → session.tes.com/v1/verify
    const tesRes = await fetch(verifyUrl, {
      headers: { Cookie: cookieHeader },
      redirect: "manual",
    });

    // Hop 2: session.tes.com → classcharts.com (back-redirect completing the handshake)
    const tesLocation = tesRes.headers.get("location");
    if (tesLocation) {
      await fetch(tesLocation, {
        headers: { Cookie: cookieHeader },
        redirect: "manual",
      });
    }
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
  selectPupil(pupilId: number): void {
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
   * Changes the login password for the current parent account
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Whether the request was successful
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
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
