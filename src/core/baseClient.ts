import type {
  ActivityResponse,
  AnnouncementsResponse,
  AttendanceResponse,
  BadgesResponse,
  BehaviourResponse,
  ClassChartsResponse,
  DetentionsResponse,
  GetActivityOptions,
  GetAttendanceOptions,
  GetBehaviourOptions,
  GetFullActivityOptions,
  GetHomeworkOptions,
  GetLessonsOptions,
  GetStudentInfoResponse,
  HomeworksResponse,
  LessonsResponse,
} from "../types.ts";
import { PING_INTERVAL } from "../utils/consts.ts";

/**
 * Shared client for both parent and student. This is not exported and should not be used directly
 */
export class BaseClient {
  /**
   * @property studentId Currently selected student ID
   */
  public studentId = 0;
  /**
   * @property authCookies Cookies used for authentication (set during login and can be empty)
   */
  public authCookies: Array<string>;
  /**
   * @property sessionId Session ID used for authentication
   */
  public sessionId = "";
  /**
   * @property lastPing Last time the sessionId was updated
   */
  public lastPing = 0;
  /**
   * @property API_BASE Base API URL, this is different depending on if its called as a parent or student
   */
  protected API_BASE = "";
  /**
   * @param API_BASE Base API URL, this is different depending on if its called as a parent or student
   */
  constructor(API_BASE: string) {
    this.authCookies = [];
    this.API_BASE = API_BASE;
  }
  /**
   * Revalidates the session ID.
   *
   * This is called automatically when the session ID is older than 3 minutes or when initially using the .login() method
   */
  public async getNewSessionId() {
    const pingFormData = new URLSearchParams();
    pingFormData.append("include_data", "true");
    const pingData = await this.makeAuthedRequest(
      this.API_BASE + "/ping",
      {
        method: "POST",
        body: pingFormData,
      },
      { revalidateToken: false },
    );
    this.sessionId = pingData.meta.session_id;
    this.lastPing = Date.now();
  }
  /**
   * Makes a request to the ClassCharts API with the required authentication headers
   *
   * @param path Path to the API endpoint
   * @param fetchOptions Request Options
   * @param options
   * @param options.revalidateToken Whether to revalidate the session ID if it is older than 3 minutes
   *
   * @returns Response
   */
  public async makeAuthedRequest(
    path: string,
    fetchOptions: RequestInit,
    options?: { revalidateToken?: boolean },
  ) {
    if (!this.sessionId) throw new Error("No session ID");
    if (!options) {
      options = {};
    }
    if (typeof options?.revalidateToken == "undefined") {
      options.revalidateToken = true;
    }
    const requestOptions = {
      ...fetchOptions,
      headers: {
        Cookie: this?.authCookies?.join(";") ?? [],
        Authorization: "Basic " + this.sessionId,
        ...fetchOptions.headers,
      },
    } satisfies RequestInit;
    if (options?.revalidateToken === true && this.lastPing) {
      if (Date.now() - this.lastPing + 5000 > PING_INTERVAL) {
        await this.getNewSessionId();
      }
    }
    const request = await fetch(path, requestOptions);
    let responseJSON: ClassChartsResponse<unknown, unknown>;
    try {
      responseJSON = await request.json();
    } catch {
      throw new Error(
        "Error parsing JSON. Returned response: " + (await request.text()),
      );
    }
    if (responseJSON.success == 0) {
      throw new Error(responseJSON.error);
    }
    // deno-lint-ignore no-explicit-any
    return responseJSON as unknown as any;
  }
  /**
   * Gets general information about the current student
   * @returns Student object
   */
  async getStudentInfo(): Promise<GetStudentInfoResponse> {
    const body = new URLSearchParams();
    body.append("include_data", "true");
    const data = await this.makeAuthedRequest(this.API_BASE + "/ping", {
      method: "POST",
      body: body,
    });
    return data;
  }
  /**
   * Gets the current student's activity
   *
   * This function is only used for pagination, you likely want client.getFullActivity
   * @param options GetActivityOptions
   * @returns Activity data
   * @see getFullActivity
   */
  async getActivity(options?: GetActivityOptions): Promise<ActivityResponse> {
    const params = new URLSearchParams();
    options?.from && params.append("from", options?.from);
    options?.to && params.append("to", options?.to);
    options?.last_id && params.append("last_id", options?.last_id);
    return await this.makeAuthedRequest(
      this.API_BASE + "/activity/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      },
    );
  }
  /**
   * Gets the current student's activity between two dates
   *
   * This function will automatically paginate through all the data returned by getActivity
   * @param options GetFullActivityOptions
   * @returns Activity Data
   * @see getActivity
   */
  async getFullActivity(
    options: GetFullActivityOptions,
  ): Promise<ActivityResponse["data"]> {
    let data: ActivityResponse["data"] = [];
    let prevLast: number | undefined;
    let gotData = true;
    while (gotData) {
      const params: GetActivityOptions = {
        from: options.from,
        to: options.to,
      };
      if (prevLast) {
        params.last_id = String(prevLast);
      }
      const fragment = (await this.getActivity(params)).data;
      if (!fragment || !fragment.length) {
        gotData = false;
      } else {
        data = data.concat(fragment);
        prevLast = fragment[fragment.length - 1].id;
      }
    }
    return data;
  }
  /**
   * Gets the current student's behaviour
   * @param options GetBehaviourOptions
   * @returns Array of behaviour points
   */
  async getBehaviour(
    options?: GetBehaviourOptions,
  ): Promise<BehaviourResponse> {
    const params = new URLSearchParams();
    options?.from && params.append("from", options?.from);
    options?.to && params.append("to", options?.to);
    return await this.makeAuthedRequest(
      this.API_BASE + "/behaviour/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      },
    );
  }
  /**
   * Gets the current student's homework
   * @param options GetHomeworkOptions
   * @returns Array of homeworks
   */
  async getHomeworks(options?: GetHomeworkOptions): Promise<HomeworksResponse> {
    const params = new URLSearchParams();
    if (options?.displayDate) {
      params.append("display_date", String(options?.displayDate));
    }

    options?.from && params.append("from", String(options?.from));
    options?.to && params.append("to", String(options?.to));
    const data: HomeworksResponse = await this.makeAuthedRequest(
      this.API_BASE + "/homeworks/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      },
    );
    return data;
  }
  /**
   * Gets the current student's lessons for a given date
   * @param options GetLessonsOptions
   * @returns Array of lessons
   */
  async getLessons(options: GetLessonsOptions): Promise<LessonsResponse> {
    if (!options?.date) throw new Error("No date specified");
    const params = new URLSearchParams();
    params.append("date", String(options?.date));
    return await this.makeAuthedRequest(
      this.API_BASE + "/timetable/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      },
    );
  }
  /**
   * Gets the current student's earned badges
   * @returns Array of badges
   */
  async getBadges(): Promise<BadgesResponse> {
    return await this.makeAuthedRequest(
      this.API_BASE + "/eventbadges/" + this.studentId,
      {
        method: "GET",
      },
    );
  }
  /**
   * Gets the current student's announcements
   * @returns Array of announcements
   */
  async getAnnouncements(): Promise<AnnouncementsResponse> {
    return (
      await this.makeAuthedRequest(
        this.API_BASE + "/announcements/" + this.studentId,
        {
          method: "GET",
        },
      )
    );
  }
  /**
   * Gets the current student's detentions
   * @returns Array of detentions
   */
  async getDetentions(): Promise<DetentionsResponse> {
    return (
      await this.makeAuthedRequest(
        this.API_BASE + "/detentions/" + this.studentId,
        {
          method: "GET",
        },
      )
    ).data;
  }
  /**
   * Gets the current student's attendance
   * @param options GetAttendanceOptions
   * @returns Array of dates of attendance
   */
  async getAttendance(
    options?: GetAttendanceOptions,
  ): Promise<AttendanceResponse> {
    const params = new URLSearchParams();
    options?.from && params.append("from", options?.from);
    options?.to && params.append("to", options?.to);
    return (
      await this.makeAuthedRequest(
        this.API_BASE +
          "/attendance/" +
          this.studentId +
          "?" +
          params.toString(),
        {
          method: "GET",
        },
      )
    );
  }
}
