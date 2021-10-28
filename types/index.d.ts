export interface User {
    id: number
    name: string
    first_name: string
    last_name: string
    avatar_url: string
    display_behaviour: boolean
    display_parent_behaviour: boolean
    display_homework: boolean
    display_rewards: boolean
    display_detentions: boolean
    display_report_cards: boolean
    display_classes: boolean
    display_announcements: boolean
    display_attendance: boolean
    display_attendance_type: string
    display_attendance_percentage: boolean
    display_activity: boolean
    display_mental_health: boolean
    display_timetable: boolean
    is_disabled: boolean
    display_two_way_communications: boolean
    display_absences: boolean
    can_upload_attachments: string | null
    display_event_badges: boolean
    display_avatars: boolean
    display_concern_submission: boolean
    display_custom_fields: boolean
    pupil_concerns_help_text: string
    allow_pupils_add_timetable_notes: boolean
    announcements_count: number
    messages_count: number
    pusher_channel_name: string
    has_birthday: boolean
    has_new_survey: boolean
    survey_id: number | null
    detention_alias_plural_uc: string
}
export interface Homework {
    lesson: string
    subject: string
    teacher: string
    homework_type: string
    id: number
    title: string
    meta_title: string
    description: string
    issue_date: string
    due_date: string
    completion_time_unit: string
    completion_time_value: string
    publish_time: string
    status: {
        id: number
        state: null
        mark: null
        mark_relative: number
        ticked: boolean
        allow_attachments: string
        first_seen_date: string
        last_seen_date: string
        attachments: Array
        has_feedback: boolean
    }
    validated_links: Array
    validated_attachments: Array
}
export type DisplayDate = 'due_date' | 'issue_date'
