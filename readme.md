# Classcharts API

A client for the classcharts API

* [Documentation](https://jamesatjaminit.github.io/classcharts-api/index.html)
* [Discord](https://discord.gg/DTcwugcgZ2)
# Examples
Docs are very much a WIP, for any help with the libary, please join the discord above
```typescript
import { ClasschartsStudentClient } from "classcharts-api";
async function main() {
  const client = new ClasschartsStudentClient("classchartsCode", "01/1/2000");
  await client.init();
  console.log(
    await client.getBehaviour({
      displayDate: "due_date",
      fromDate: "20/01/2000",
      toDate: "01/02/2000",
    })
  );
  console.log(await client.getActivity());
  console.log(await client.getStudentInfo());
  console.log(await client.getActivity());
  console.log(await client.getActivity());
}

main();
```
