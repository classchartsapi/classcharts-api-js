import Undici from 'undici'
import { DisplayDate, Homework, User } from '../types'
import { API_BASE, BASE_URL } from './consts'

export class ClasschartsClient {
    public studentCode = ''
    public dateOfBirth = ''
    public studentId = 0
    public studentName = ''
    private authCookies: Array<string> | undefined
    private sessionId = ''
    constructor(studentCode: unknown, dateOfBirth: unknown) {
        this.studentCode = String(studentCode)
        this.dateOfBirth = String(dateOfBirth)
    }
    async init() {
        const formData = new URLSearchParams()
        if (!this.studentCode) throw new Error('Student Code not inputted')
        formData.append('_method', 'POST')
        formData.append('code', this.studentCode.toUpperCase())
        formData.append('dob', this.dateOfBirth)
        formData.append('remember_me', '1')
        formData.append('recaptcha-token', 'no-token-avaliable')
        const request = await Undici.request(BASE_URL + '/student/login', {
            method: 'POST',
            body: formData.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        if (request.statusCode != 302 || !request.headers['set-cookie'])
            throw new Error('Unauthenticated: Classcharts returned an error')
        let cookies = request.headers['set-cookie']
        for (let i = 0; i < cookies.length; i++) {
            cookies[i] = cookies[i].substring(0, cookies[i].indexOf(';'))
        }
        this.authCookies = cookies
        let sessionID: any = decodeURI(cookies[2])
            .replace(/%3A/g, ':')
            .replace(/%2C/g, ',')
        sessionID = JSON.parse(
            sessionID.substring(sessionID.indexOf('{'), sessionID.length)
        )
        this.sessionId = sessionID.session_id
        const user = await this.getStudentInfo()
        this.studentId = user.id
        this.studentName = user.name
    }

    /**
     *
     * @returns {User}
     */
    async getStudentInfo(): Promise<User> {
        if (!this.authCookies) throw new Error('Not authenticated')
        const request = await Undici.request(API_BASE + '/ping', {
            method: 'POST',
            body: 'include_date=true',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: this.authCookies.join(';'),
                authorization: 'Basic ' + this.sessionId,
            },
        })
        const data = await request.body.json()
        return data.data?.user
    }
    /**
     * Gets all the homework from
     * @param displayDate {DisplayDate}
     * @param fromDate
     * @param toDate
     * @returns {Array<Homework>}
     */
    async listHomeworks(
        displayDate: DisplayDate,
        fromDate: string,
        toDate: string
    ): Promise<Array<Homework>> {
        if (!this.authCookies) throw new Error('Not authenticated')
        const params = new URLSearchParams()
        params.append('display_date', String(displayDate))
        fromDate && params.append('from', String(fromDate))
        toDate && params.append('to', String(toDate))
        const request = await Undici.request(
            API_BASE + '/homeworks/' + this.studentId + '?' + params.toString(),
            {
                method: 'GET',
                headers: {
                    Cookie: this.authCookies.join(';'),
                    authorization: 'Basic ' + this.sessionId,
                },
            }
        )
        let responseJSON
        try {
            responseJSON = await request.body.json()
        } catch (err) {
            throw new Error('Invalid JSON response, check your dates')
        }

        if (responseJSON.success == 0) {
            throw new Error(responseJSON.error)
        }
        let data: Array<Homework> = responseJSON?.data
        for (let i = 0; i < data.length; i++) {
            // homework.lesson.replace(/\\/g, '')
            data[i].description = data[i].description.replace(
                /(<([^>]+)>)/gi,
                ''
            )
            data[i].description = data[i].description.replace(/&nbsp;/g, '')
            data[i].description = data[i].description.trim()
        }
        return data
    }
}
