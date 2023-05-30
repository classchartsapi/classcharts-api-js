<p align="center">
	<h1 align="center">ClassCharts API JS</h1>
	<p align="center">
	A typescript wrapper for getting information from the Classcharts API
	</p>
</p>
<p align="center">
	<a href="https://github.com/classchartsapi/classcharts-api-js">Source</a>
	<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
	<a href="https://github.com/classchartsapi/classcharts-api-js/issues">Issues</a>
	<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
	<a href="https://www.npmjs.com/package/classcharts-api">NPM</a>
	<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
	<a href="https://discord.gg/DTcwugcgZ2">Discord</a>
	<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
	<a href="https://classchartsapi.github.io/classcharts-api-js/typedoc/">TypeDoc</a>
	<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
	<a href="https://classchartsapi.github.io/api-docs/">API Docs</a>
</p>

# Introduction

The ClassCharts API is a typescript wrapper around the ClassCharts API. It allows you to easily make requests to the ClassCharts API without having to worry about the underlying implementation of making requests.

## Help

For any help with the library, please join the [discord](https://discord.gg/DTcwugcgZ2) where you can ask questions and get help from the community.

# Installation

## Requirements

- Node.js 18 or newer

## NPM

```bash
npm install classcharts-api # npm
```

```bash
yarn add classcharts-api # yarn
```

```bash
pnpm add classcharts-api # pnpm
```

# Logging In

Before making any requests, you must login to the client. This will get you a session ID which will be used for all requests.

## Student Client

```typescript
import { StudentClient } from "classcharts-api";

// Date of birth MUST in the format DD/MM/YYYY
const client = new StudentClient("classchartsCode", "01/1/2000");
await client.login();
```

## Parent Client

```typescript
import { ParentClient } from "classcharts-api";

const client = new ParentClient("username", "password");
await client.login();
```

# Universal Methods

All the following methods can be used on both the student and parent client. Each example expects the client to be already logged in.

## `.getStudentInfo`

```typescript
const studentInfo = await client.getStudentInfo();
console.log(studentInfo);
/**
{
  success: 1,
  data: {
    user: {
      id: 2339528,
      ...
    }
  },
  meta: {
    session_id: '5vf2v7n5uk9jftrxaarrik39vk6yjm48',
    ...
  }
}
*/
```

## `.getActivity`

```typescript
// Dates must be in format YYYY-MM-DD
const activity = await client.getActivity({
  from: "2023-04-01",
  to: "2023-05-10",
  last_id: "12",
});
console.log(activity);
```

## `.getFullActivity`

```typescript
// Dates must be in format YYYY-MM-DD
const activity = await client.getFullActivity({
  from: "2023-04-01",
  to: "2023-05-10",
});
console.log(activity);
```

## `.getBehaviour`

Gets behaviour for a given date range.

```typescript
// Dates must be in format YYYY-MM-DD
const behaviour = await client.getBehaviour({
  from: "2023-04-01",
  to: "2023-05-10",
});
console.log(behaviour);

/**
{
  "success": 1,
  "data": {
    "timeline": [
      {
        "positive": 426,
        ...
      },
    ],
	...
  "meta": {
    "start_date": "2023-04-01T00:00:00+00:00",
    ...
  }
}
*/
```

## `.getHomeworks`

Gets homeworks for a given date range.

```typescript
// Dates must be in format YYYY-MM-DD
const homeworks = await client.getHomeworks({
  from: "2023-04-01",
  to: "2023-05-10",
	displayDate: 'issue_date' // Can be 'due_date' or 'issue_date'
});
console.log(homeworks);

/**
{
  success: 1,
  data: [
    {
      lesson: '7A/Pe1',
			...
		},
  ],
  meta: {
    start_date: '2023-04-01T00:00:00+00:00',
		...
  }
}

```

## `.getLessons`

Gets lessons for a specific date.

```typescript
// Dates must be in format YYYY-MM-DD
const lessons = await client.getLessons({
  date: "2023-04-01",
});
console.log(lessons);

/**
{
  "success": 1,
  "data": [
    {
      "teacher_name": "Mr J Doe",
      ...
		}
		...
  ],
  "meta": {
    "dates": [
      "2023-05-04"
    ],
    ...
  }
}
*/
```

## `.getBadges`

Gets all earned badges.

```typescript
const badges = await client.getBadges();
console.log(badges);

/**
{
  success: 1,
  data: [
    {
      id: 123,
			name: 'Big Badge',
			...
    },
		...
  ],
  meta: []
}
*/
```

## `.getAnnouncements`

?> This method does not include `meta` in the response, since I do not have access to this endpoint to test it. If you have access to this endpoint, please open a PR to add the `meta` response. Thanks!

Gets all announcements.

```typescript
const announcements = await client.getAnnouncements();
console.log(announcements);
```

## `.getDetentions`

?> This method does not include `meta` in the response, since I do not have access to this endpoint to test it. If you have access to this endpoint, please open a PR to add the `meta` response. Thanks!

Gets all detentions.

```typescript
const detentions = await client.getDetentions();
console.log(detentions);
```

## `.getAttendance`

?> This method does not include `meta` in the response, since I do not have access to this endpoint to test it. If you have access to this endpoint, please open a PR to add the `meta` response. Thanks!

Gets attendance.

```typescript
const attendance = await client.getAttendance();
console.log(attendance);
```

# Parent Specific Methods

## `.getPupils`

Gets a list of all pupils the parent has access to.

```typescript
const pupils = await client.getPupils();
console.log(pupils);
/**
[
	{
		id: 123,
		name: 'John Doe',
		...
	},
	...
]
*/
```

## `.selectPupil`

Selects a pupil to make subsequent requests for.

```typescript
await client.selectPupil(123);
```
