# Classcharts API

A very WIP client for the classcharts API

[Documentation](https://jamesatjaminit.github.io/classcharts-api/index.html)

# Examples

```typescript
import { ClasschartsClient } from 'classcharts-api'
async function main() {
    const client = new ClasschartsClient('classchartsCode', '01/1/2000')
    await client.init()
    console.log(
        await client.getBehaviour({
            displayDate: 'due_date',
            fromDate: '20/01/2000',
            toDate: '01/02/2000',
        })
    )
    console.log(await client.getActivity(null))
    console.log(await client.getStudentInfo())
    console.log(await client.getActivity(null))
    console.log(await client.getActivity(null))
}

main()
```
