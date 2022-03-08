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

/**
 * The base client
 */
export class ClasschartsClient {
  protected studentId = 0;
  protected studentName = "";
  protected authCookies: Array<string> | undefined;
  protected sessionId = "";
  protected API_BASE = "";
  /**
   *
   * @param studentCode Classcharts student code
   * @param dateOfBirth Student's date of birth
   */
  constructor(API_BASE: string) {
    this.API_BASE = API_BASE
  }
  public async makeAuthedRequest(
    path: string,
    options: Omit<RequestOptions, "origin" | "path">
  ) {

    if (!this.authCookies) throw new Error("Not authenticated");
    const requestOptions: Omit<RequestOptions, "origin" | "path"> = {
      ...options,
      headers: {
        Cookie: this.authCookies.join(";"),
        authorization: "Basic " + this.sessionId,
      },
    };


    const request = await Undici.request(path, requestOptions);

    let responseJSON;
    try {
      responseJSON = await request.body.json();
    } catch {
      throw new Error("Invalid JSON response recieved");
    }
    if (responseJSON.success == 0) {

      throw new Error(responseJSON.error);
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
      body: "include_data=true",
    });

    return data?.user;
  }
  /**
   * Get's the logged in student's general activity
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


  async getPupil(options?: GetActivityOptions): Promise<ActivityResponse> {
    let pupils =   this.makeAuthedRequest(
        this.API_BASE + "/pupils",
        {
          method: "GET",
        }
      );

    return pupils

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
}
