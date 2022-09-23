import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance } from "axios";
import type {
  ActivityResponse,
  AnnouncementsResponse,
  AttendanceResponse,
  BadgesResponse,
  BehaviourResponse,
  DetentionsResponse,
  GetActivityOptions,
  GetAttendanceOptions,
  GetBehaviourOptions,
  GetFullActivityOptions,
  GetHomeworkOptions,
  GetLessonsOptions,
  Homework,
  HomeworksResponse,
  LessonsResponse,
  Student,
} from "./types";
/**
 * The base client
 */
export class ClasschartsClient {
  protected studentId = 0;
  protected studentName = "";
  public authCookies: Array<string> | undefined;
  public sessionId = "";
  protected API_BASE = "";
  protected axios: AxiosInstance;
  /**
   *
   * @param API_BASE Base API URL, this is different depending if its called as a parent or student
   */
  constructor(API_BASE: string, axiosConfig?: AxiosRequestConfig) {
    this.API_BASE = API_BASE;
    this.axios = axios.create({
      ...axiosConfig,
      headers: {
        ...axiosConfig?.headers,
      },
      validateStatus: () => true,
    });
  }
  public async makeAuthedRequest(
    path: string,
    axiosOptions: Omit<AxiosRequestConfig, "path">,
    options?: { includeMeta?: boolean }
  ) {
    if (!this.authCookies) throw new Error("Not authenticated");
    const requestOptions: AxiosRequestConfig = {
      ...axiosOptions,
      url: path,
      headers: {
        Cookie: this.authCookies.join(";"),
        authorization: "Basic " + this.sessionId,
        ...axiosOptions.headers,
      },
    };
    const request = await this.axios.request(requestOptions);
    const responseJSON = request.data;
    if (responseJSON.success == 0) {
      throw new Error(responseJSON.error);
    }
    if (options?.includeMeta) {
      return responseJSON;
    }
    return responseJSON.data;
  }

  /**
   * Gets general information about the logged in student
   * @returns Student object
   */
  async getStudentInfo(): Promise<Student> {
    const data = await this.makeAuthedRequest(this.API_BASE + "/ping", {
      method: "POST",
      data: "include_data=true",
    });

    return data?.user;
  }
  /**
   * This function is only used for pagination, you likely want client.getFullActivity
   * @param options GetActivityOptions
   * @returns Activity data
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
   * Helper function for getActivity, returns all the data from the selected dates
   * @param options GetFullActivityOptions
   * @returns Activity Data
   */
  async getFullActivity(
    options: GetFullActivityOptions
  ): Promise<ActivityResponse> {
    let data: ActivityResponse = [];
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
      const fragment = await this.getActivity(params);
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
   * Gets the logged in students behaviour points
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
   * Gets a list of the logged in student's homeworks
   * @param options GetHomeworkOptions
   * @returns Array of homeworks
   */
  async listHomeworks(
    options?: GetHomeworkOptions
  ): Promise<HomeworksResponse> {
    const params = new URLSearchParams();
    if (options?.displayDate)
      params.append("display_date", String(options?.displayDate));

    options?.fromDate && params.append("from", String(options?.fromDate));
    options?.toDate && params.append("to", String(options?.toDate));
    options?.from && params.append("from", String(options?.from));
    options?.to && params.append("to", String(options?.to));
    const data: Array<Homework> = await this.makeAuthedRequest(
      this.API_BASE + "/homeworks/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
    );

    for (let i = 0; i < data.length; i++) {
      data[i].description_raw = data[i].description;
      // homework.lesson.replace(/\\/g, '')
      data[i].description = data[i].description.replace(/(<([^>]+)>)/gi, "");
      data[i].description = data[i].description.replace(/&nbsp;/g, "");
      data[i].description = data[i].description.trim();
    }
    return data;
  }
  /**
   * Gets the logged in student's lessons for a day
   * @param options GetLessonsOptions
   * @returns Array of lessons
   */
  async getLessons(options?: GetLessonsOptions): Promise<LessonsResponse> {
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
   * Gets a list of the students badges
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
   * Lists the logged in student's announcements
   * @returns Array of announcements
   */
  async listAnnouncements(): Promise<AnnouncementsResponse> {
    return await this.makeAuthedRequest(
      this.API_BASE + "/announcements/" + this.studentId,
      {
        method: "GET",
      }
    );
  }
  /**
   * Gets the logged in student's detentions
   * @returns Array of detentions
   */
  async getDetentions(): Promise<DetentionsResponse> {
    return await this.makeAuthedRequest(
      this.API_BASE + "/detentions/" + this.studentId,
      {
        method: "GET",
      }
    );
  }
  /**
   * Gets the logged in student's attendance
   * @param options GetAttendanceOptions
   * @returns Array of dates of attendance
   */
  async listAttendance(
    options?: GetAttendanceOptions
  ): Promise<AttendanceResponse> {
    const params = new URLSearchParams();
    options?.from && params.append("from", options?.from);
    options?.to && params.append("to", options?.to);
    return await this.makeAuthedRequest(
      this.API_BASE + "/attendance/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
    );
  }
}
