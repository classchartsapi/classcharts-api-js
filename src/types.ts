/**
 * Helper type to define response from ClassCharts
 */
export type ClassChartsResponse<Data, Meta> = {
	data: Data;
	meta: Meta;
	error?: string;
	success: number;
};

export interface Student {
	id: number;
	name: string;
	first_name: string;
	last_name: string;
	avatar_url: string;
	display_behaviour: boolean;
	display_parent_behaviour: boolean;
	display_homework: boolean;
	display_rewards: boolean;
	display_detentions: boolean;
	display_report_cards: boolean;
	display_classes: boolean;
	display_announcements: boolean;
	display_attendance: boolean;
	display_attendance_type: string;
	display_attendance_percentage: boolean;
	display_activity: boolean;
	display_mental_health: boolean;
	display_timetable: boolean;
	is_disabled: boolean;
	display_two_way_communications: boolean;
	display_absences: boolean;
	can_upload_attachments: boolean | null;
	display_event_badges: boolean;
	display_avatars: boolean;
	display_concern_submission: boolean;
	display_custom_fields: boolean;
	pupil_concerns_help_text: string;
	allow_pupils_add_timetable_notes: boolean;
	announcements_count: number;
	messages_count: number;
	pusher_channel_name: string;
	has_birthday: boolean;
	has_new_survey: boolean;
	survey_id: number | null;
	detention_alias_plural_uc: string;
}
export interface GetStudentInfoData {
	user: Student;
}

export interface GetStudentInfoMeta {
	version: string;
}
export type GetStudentInfoResponse = ClassChartsResponse<
	GetStudentInfoData,
	GetStudentInfoMeta
>;

export interface GetBehaviourOptions {
	/**
	 * From date, in format YYYY-MM-DD
	 */
	from?: string;
	/**
	 * To date, in format YYYY-MM-DD
	 */
	to?: string;
}

export interface BehaviourTimelinePoint {
	positive: number;
	negative: number;
	name: string;
	start: string;
	end: string;
}
export interface BehaviourResponseData {
	timeline: BehaviourTimelinePoint[];
	positive_reasons: Record<string, number>;
	negative_reasons: Record<string, number>;
	other_positive: string[];
	other_negative: string[];
	other_positive_count: Record<string, number>[];
	other_negative_count: Record<string, number>[];
}
export interface BehaviourResponseMeta {
	start_date: string;
	end_date: string;
	step_size: string;
}
export type BehaviourResponse = ClassChartsResponse<
	BehaviourResponseData,
	BehaviourResponseMeta
>;

export interface GetActivityOptions {
	/**
	 * From date, in format YYYY-MM-DD
	 */
	from?: string;
	/**
	 * To date, in format YYYY-MM-DD
	 */
	to?: string;
	/**
	 *  ID of the last activityPoint (used in pagination)
	 */
	last_id?: string;
}

export interface ActivityPoint {
	id: number;
	type: string;
	polarity: "positive" | "blank" | "negative" | (string & {});
	reason: string;
	score: number;
	timestamp: string;
	timestamp_custom_time: string | null;
	style: {
		border_color: string | null;
		custom_class: string | null;
	};
	pupil_name: string;
	lesson_name: string | null;
	teacher_name: string | null;
	room_name: string | null;
	note: string | null;
	_can_delete: boolean;
	badges: string;
	detention_date: string | null;
	detention_time: string | null;
	detention_location: string | null;
	detention_type: string | null;
}
export type ActivityResponseData = ActivityPoint[];
interface ActivityResponseMeta {
	start_date: string;
	end_date: string;
	last_id: number | boolean;
	step_size: string;
	detention_alias_uc: string;
}
export type ActivityResponse = ClassChartsResponse<
	ActivityResponseData,
	ActivityResponseMeta
>;

export type DisplayDate = "due_date" | "issue_date";
export interface GetHomeworkOptions {
	/**
	 * Way to sort homeworks
	 *
	 * Used to sort homeworks by when they are due or when they were issued
	 * @default "issue_date"
	 */
	displayDate?: DisplayDate;
	/**
	 * From date, in format YYYY-MM-DD
	 */
	from?: string;
	/**
	 * To date, in format YYYY-MM-DD
	 */
	to?: string;
}

export interface TeacherValidatedHomeworkAttachment {
	id: number;
	file_name: string;
	file: string;
	validated_file: string;
}

export interface TeacherValidatedHomeworkLink {
	link: string;
	validated_link: string;
}

export interface StudentHomeworkAttachment {
	id: number;
	file_name: string;
	file: string;
	validated_file: string;
	teacher_note: string;
	teacher_homework_attachments: TeacherValidatedHomeworkAttachment[];
	can_delete: boolean;
}
export interface Homework {
	lesson: string;
	subject: string;
	teacher: string;
	homework_type: string;
	id: number;
	title: string;
	meta_title: string;
	description: string;
	issue_date: string;
	due_date: string;
	completion_time_unit: string;
	completion_time_value: string;
	publish_time: string;
	status: {
		id: number;
		state: "not_completed" | "late" | "completed" | null;
		mark: unknown | null;
		mark_relative: number;
		ticked: "yes" | "no";
		allow_attachments: boolean;
		allow_marking_completed: boolean;
		first_seen_date: string | null;
		last_seen_date: string | null;
		attachments: StudentHomeworkAttachment[];
		has_feedback: boolean;
	};
	validated_links: TeacherValidatedHomeworkLink[];
	validated_attachments: TeacherValidatedHomeworkAttachment[];
}
export type HomeworksResponseData = Homework[];
export interface HomeworksResponseMeta {
	start_date: string;
	end_date: string;
	display_type: DisplayDate;
	max_files_allowed: number;
	allowed_file_types: string[];
	this_week_due_count: number;
	this_week_outstanding_count: number;
	this_week_completed_count: number;
	allow_attachments: boolean;
	display_marks: boolean;
}
export type HomeworksResponse = ClassChartsResponse<
	HomeworksResponseData,
	HomeworksResponseMeta
>;

export interface GetLessonsOptions {
	/**
	 * Date to get lessons for, in format YYYY-MM-DD
	 */
	date: string;
}
export interface Lesson {
	teacher_name: string;
	teacher_id: string;
	lesson_name: string;
	subject_name: string;
	is_alternative_lesson: boolean;
	period_name: string;
	period_number: string;
	room_name: string;
	date: string;
	start_time: string;
	end_time: string;
	key: number;
	note_abstract: string;
	note: string;
	pupil_note_abstract: string;
	pupil_note: string;
	pupil_note_raw: string;
}
export type LessonsResponseData = Lesson[];
interface PeriodMeta {
	number: string;
	start_time: string;
	end_time: string;
}
export interface LessonsResponseMeta {
	dates: string[];
	timetable_dates: string[];
	periods: PeriodMeta[];
	start_time: string;
	end_time: string;
}
export type LessonsResponse = ClassChartsResponse<
	LessonsResponseData,
	LessonsResponseMeta
>;

export interface LessonPupilBehaviour {
	reason: string;
	score: number;
	icon: string;
	polarity: string;
	timestamp: string;
	teacher: {
		title: string;
		first_name: string;
		last_name: string;
	};
}
export interface PupilEvent {
	timestamp: string;
	lesson_pupil_behaviour: LessonPupilBehaviour;
	event: {
		label: string;
	};
}
export interface Badge {
	id: number;
	name: string;
	icon: string;
	colour: string;
	created_date: string;
	pupil_badges: { pupil_event: PupilEvent }[];
	icon_url: string;
}
export type BadgesResponseData = Badge[];
export type BadgesResponseMeta = [];
export type BadgesResponse = ClassChartsResponse<
	BadgesResponseData,
	BadgesResponseMeta
>;

export interface Detention {
	id: number;
	attended: "yes" | "no" | "upscaled" | "pending";
	date: string | null;
	length: number | null;
	location: string | null;
	notes: string | null;
	time: string | null;
	pupil: {
		id: number;
		first_name: string;
		last_name: string;
		school: {
			opt_notes_names: "yes" | "no";
			opt_notes_comments: "yes" | "no";
			opt_notes_comments_pupils: "yes" | "no";
		};
	};
	lesson: {
		id: number;
		name: string;
		subject: {
			id: number;
			name: string;
		} | null;
	} | null;
	lesson_pupil_behaviour: {
		reason: string;
	};
	teacher: {
		id: number;
		first_name: string;
		last_name: string;
		title: string;
	} | null;
	detention_type: {
		name: string;
	};
}

export type DetentionsData = Detention[];

export interface DetentionsMeta {
	detention_alias_plural: string;
}

export type DetentionsResponse = ClassChartsResponse<
	DetentionsData,
	DetentionsMeta
>;

export interface Announcement {
	id: number;
	title: string;
	description: string | null;
	school_name: string;
	teacher_name: string;
	school_logo: string | null;
	sticky: "yes" | "no";
	state: string | null;
	timestamp: string;
	attachments: {
		filename: string;
		url: string;
	}[];
	for_pupils: unknown[];
	comment_visibility: string;
	allow_comments: "yes" | "no";
	allow_reactions: "yes" | "no";
	allow_consent: "yes" | "no";
	priority_pinned: "yes" | "no";
	requires_consent: "yes" | "no";
	can_change_consent: boolean;
	consent: unknown | null;
	pupil_consents: unknown[];
}

export type AnnouncementsResponse = ClassChartsResponse<Announcement[], []>;

export interface Pupil extends Student {
	school_name: string;
	school_logo: string;
	timezone: string;
	display_covid_tests: boolean;
	can_record_covid_tests: boolean;
	detention_yes_count: number;
	detention_no_count: number;
	detention_pending_count: number;
	detention_upscaled_count: number;
	homework_todo_count: number;
	homework_late_count: number;
	homework_not_completed_count: number;
	homework_excused_count: number;
	homework_completed_count: number;
	homework_submitted_count: number;
	announcements_count: number;
	messages_count: number;
}
export type GetPupilsResponse = Pupil[];

export interface GetFullActivityOptions {
	/**
	 * From date, in format YYYY-MM-DD
	 */
	from: string;
	/**
	 * To date, in format YYYY-MM-DD
	 */
	to: string;
}

export interface GetAttendanceOptions {
	/**
	 * From date, in format YYYY-MM-DD
	 */
	from: string;
	/**
	 * To date, in format YYYY-MM-DD
	 */
	to: string;
}

export interface AttendancePeriod {
	code: string;
	status: "present" | "ignore" | (string & {});
	late_minutes: number | string;
	lesson_name?: string;
	room_name?: string;
}

export interface AttendanceMeta {
	dates: string[];
	sessions: string[];
	start_date: string;
	end_date: string;
	percentage: string;
	percentage_singe_august: string;
}

export type AttendanceData = Record<string, Record<string, AttendancePeriod>>;

export type AttendanceResponse = ClassChartsResponse<
	AttendanceData,
	AttendanceMeta
>;

export type RewardsData = {
	id: number;
	name: string;
	description: string;
	photo: string;
	price: number;
	stock_control: boolean;
	stock: number;
	can_purchase: boolean;
	unable_to_purchase_reason: string;
	once_per_pupil: boolean;
	purchased: boolean;
	purchased_count: string | number;
	price_balance_difference: number;
}[];

export interface RewardsMeta {
	pupil_score_balance: number;
}

export type RewardsResponse = ClassChartsResponse<RewardsData, RewardsMeta>;

export interface RewardPurchaseData {
	single_purchase: "yes" | "no";
	order_id: number;
	balance: number;
}

export type RewardPurchaseResponse = ClassChartsResponse<
	RewardPurchaseData,
	[]
>;

export interface PupilFieldsData {
	note: string;
	fields: {
		id: number;
		name: string;
		graphic: string;
		value: string;
	}[];
}

export type PupilFieldsResponse = ClassChartsResponse<PupilFieldsData, []>;

export type ChangePasswordResponse = ClassChartsResponse<[], []>;

export interface GetStudentCodeOptions {
	/**
	 * Date of birth, in format YYYY-MM-DD
	 */
	dateOfBirth: string;
}

export interface GetStudentCodeResponseData {
	code: string;
}

export type GetStudentCodeResponseMeta = [];
export type GetStudentCodeResponse = ClassChartsResponse<
	GetStudentCodeResponseData,
	GetStudentCodeResponseMeta
>;
