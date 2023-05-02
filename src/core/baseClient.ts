import ky, { type Options as KyOptions } from "ky-universal";
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
} from "../types.js";
import { PING_INTERVAL } from "../utils/consts.js";

/**
 * Shared client for both parent and student. This is not exported and should not be used directly
 * @internal
 */
export class BaseClient {
  /**
   * @property studentId Currently selected student ID
   */
  public studentId = 0;
  /**
   * @internal
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
   * @property API_BASE Base API URL, this is different depending if its called as a parent or student
   * @internal
   */
  protected API_BASE = "";
  /**
   *
   * @param API_BASE Base API URL, this is different depending if its called as a parent or student
   */
  constructor(API_BASE: string) {
    this.authCookies = [];
    this.API_BASE = API_BASE;
  }
  /**
   * Revalidates the session ID.
   *
   * This is called automatically when the session ID is older than 3 minutes or when intially using the .login() method
   * @internal
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
      { revalidateToken: false }
    );
    this.sessionId = pingData.meta.session_id;
    this.lastPing = Date.now();
  }
  /**
   * Makes a request to the Classcharts API with the required authentication headers
   *
   * @param path Path to the API endpoint
   * @param kyOptions Ky (fetch library) request options
   * @param options
   * @param options.revalidateToken Whether to revalidate the session ID if it is older than 3 minutes
   *
   * @returns Response
   * @internal
   */
  public async makeAuthedRequest(
    path: string,
    kyOptions: KyOptions,
    options?: { revalidateToken?: boolean }
  ) {
    if (!this.sessionId) throw new Error("No session ID");
    if (!options) {
      options = {};
    }
    if (typeof options?.revalidateToken == "undefined") {
      options.revalidateToken = true;
    }
    const requestOptions = {
      ...kyOptions,
      headers: {
        Cookie: this?.authCookies?.join(";") ?? [],
        Authorization: "Basic " + this.sessionId,
        ...kyOptions.headers,
      },
      credentials: undefined,
    } satisfies KyOptions;
    if (options?.revalidateToken === true && this.lastPing) {
      if (Date.now() - this.lastPing + 5000 > PING_INTERVAL) {
        await this.getNewSessionId();
      }
    }
    const request = await ky(path, requestOptions);
    const responseJSON = (await request.json()) as ClassChartsResponse<
      unknown,
      unknown
    >;
    if (responseJSON.success == 0) {
      throw new Error(responseJSON.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return responseJSON as any;
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
    return this.makeAuthedRequest(
      this.API_BASE + "/activity/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
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
    options: GetFullActivityOptions
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
    options?: GetBehaviourOptions
  ): Promise<BehaviourResponse> {
    const params = new URLSearchParams();
    options?.from && params.append("from", options?.from);
    options?.to && params.append("to", options?.to);
    return await this.makeAuthedRequest(
      this.API_BASE + "/behaviour/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
    );
  }
  /**
   * Gets the current student's homework
   * @param options GetHomeworkOptions
   * @returns Array of homeworks
   */
  async getHomeworks(options?: GetHomeworkOptions): Promise<HomeworksResponse> {
    const params = new URLSearchParams();
    if (options?.displayDate)
      params.append("display_date", String(options?.displayDate));

    options?.from && params.append("from", String(options?.from));
    options?.to && params.append("to", String(options?.to));
    const data: HomeworksResponse = await this.makeAuthedRequest(
      this.API_BASE + "/homeworks/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
    );

    for (let i = 0; i < data.data.length; i++) {
      data.data[i].description_raw = data.data[i].description;
      // homework.lesson.replace(/\\/g, '')
      data.data[i].description = data.data[i].description.replace(
        /(<([^>]+)>)/gi,
        ""
      );
      data.data[i].description = data.data[i].description.replace(
        /&nbsp;/g,
        ""
      );
      data.data[i].description = data.data[i].description.trim();
    }
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
      }
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
      }
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
        }
      )
    ).data;
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
        }
      )
    ).data;
  }
  /**
   * Gets the current student's attendance
   * @param options GetAttendanceOptions
   * @returns Array of dates of attendance
   */
  async getAttendance(
    options?: GetAttendanceOptions
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
        }
      )
    ).data;
  }
}
