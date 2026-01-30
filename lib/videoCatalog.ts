// lib/content/videoCatalog.ts

export type VideoItem = {
  url: string;
  title: string;
};

export function extractExerciseName(url: string) {
  try {
    const decoded = decodeURIComponent(url);
    const last = decoded.split("/").pop() || decoded;
    const noQuery = last.split("?")[0];
    const noExt = noQuery.replace(/\.(mp4|mov|m4v)$/i, "");
    return noExt
      .replace(/_/g, " ")
      .replace(/%20/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "Exercise";
  }
}

export function toVideoItems(urls: string[]): VideoItem[] {
  return urls.map((url) => ({ url, title: extractExerciseName(url) }));
}

// ----------------------
// 16-Day “Healer” Loop (From Swift)
// ----------------------

export const day1: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FDonkey%20kicks%20(left).mp4?alt=media&token=d8db6fce-0507-4d1e-982d-ec2c9ff76dd2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FDonkey%20kicks%20(right).mp4?alt=media&token=cc24fa53-faad-46df-be23-6e72f2de47e2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FFire%20hydrants%20(left).mp4?alt=media&token=1fd510fe-217c-44a7-aa46-ca8a727d444a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FFire%20hydrants%20(right).mp4?alt=media&token=9be80b14-6a80-40b0-80f7-84b408e44e52",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FHip%20flexor%20stretch%20(left).mp4?alt=media&token=9e1f9e2f-c29a-41fd-876f-4d9838465d10",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FHip%20flexor%20stretch%20(right).mp4?alt=media&token=65e43a26-63f8-40bd-9330-a0c9fe49b70c"
];

export const day2: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FClamshells%20(left).mp4?alt=media&token=f6ad2afd-1303-44a4-8237-3619b4b74eb8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FClamshells%20(right).mp4?alt=media&token=e84b022e-4501-465a-9902-23dbd549a3b0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FDownward%20facing%20dog.mp4?alt=media&token=50766c22-560a-44af-9471-76d89b748cec",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FGlute%20bridges.mp4?alt=media&token=f6a4858b-f9b5-4542-a42c-5f16b89128bf",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FSingle%20leg%20bridge%20pose%20(left).mp4?alt=media&token=23697497-a4d3-4431-a846-7b963b1fb292",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FSingle%20leg%20bridges%20(right).mp4?alt=media&token=289e790d-a530-48f8-89e7-a95faff05c5e"
];

export const day3: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FDonkey%20kick%20pulses%20(left).mp4?alt=media&token=34c9b197-832b-4b58-8718-e9046dc4c9b9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FDonkey%20kick%20pulses%20(right).mp4?alt=media&token=8bbb41ae-78d6-4a6f-9a9d-814b4cc95d3c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FLow%20lunge%20with%20rotation%20(left).mp4?alt=media&token=a5f6ded2-3b86-4584-951d-8714c7fc7345",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FLow%20lunge%20with%20rotation%20(right).mp4?alt=media&token=55b4e9aa-73d4-4c86-9b6e-6d1c8a0fff5f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FPlie%20squats.mp4?alt=media&token=347b6f10-4bb5-40be-ba1d-fd77d01f7a88",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FPlie%20with%20heel%20lifts.mp4?alt=media&token=000f4c2f-377d-4fe7-ac69-a47f6e95f373"
];

export const day4: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FFigure%20four%20stretch%20(left).mp4?alt=media&token=749f6688-012e-486e-911c-9fdead3d4555",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FFigure%20four%20stretch%20(right).mp4?alt=media&token=4eb00bbb-93f7-48a1-a771-ffc3dd3b33c7",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FKnee%20tuck%20to%20leg%20extension%20(right).mp4?alt=media&token=81dc8933-6d04-4402-9678-2b8c62bbd3e8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FKnee%20tuck%20to%20leg%20extensions%20(left).mp4?alt=media&token=752513e7-666b-43ba-b714-85291ac50917",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FSide%20kneeling%20leg%20lifts%20(left).mp4?alt=media&token=519d5da7-0443-4f9c-9bc6-2493bc6db0f0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FSide%20kneeling%20leg%20lilfts%20(right).mp4?alt=media&token=eedba964-0298-488f-9f53-006e28ddd277"
];

export const day5: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FGlute%20kickbacks%20(left).mp4?alt=media&token=8ef86b74-bba0-4a94-87cc-1ee63c028dfc",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FGlute%20kickbacks%20(right).mp4?alt=media&token=435616ba-518b-41e0-a210-429b01b08131",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FHip%20abduction%20with%20lift%20(left).mp4?alt=media&token=8200a0b2-0207-4d91-9c3e-6344f5a20664",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FHip%20abduction%20with%20lift%20(right).mp4?alt=media&token=717f5c2e-2a2e-45c4-a507-45c6227a5972",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FSide%20plank%20(left).mp4?alt=media&token=cfe7c77f-b984-4651-9c0a-049224602fe3",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FSide%20plank%20(right).mp4?alt=media&token=7e3e5b39-4fab-4283-b153-09b1d90cb328",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FSide%20plank%20(right).mp4?alt=media&token=7e3e5b39-4fab-4283-b153-09b1d90cb328"
];

export const day6: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FExtended%20side%20angle%20(left).mp4?alt=media&token=4636eeb0-8670-4854-b6eb-ebef1d42d53a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FExtended%20side%20angle%20(right).mp4?alt=media&token=f6ef9ba1-1a91-4480-86a8-8205f65c75d7",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FPlie%20pulses.mp4?alt=media&token=56fdb333-3406-4e93-b416-7b40122a51f1",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FPlie%20with%20diagonal%20arm%20reaches.mp4?alt=media&token=54038882-c299-48fd-aa3f-a251512afe5b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FWarrior%20I%20(left).mp4?alt=media&token=e02ef240-d253-42aa-9858-56ccb6df1b87",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FWarrior%20I%20(right).mp4?alt=media&token=365e8e9a-fc45-4a57-9de3-57dbf00ed55f"
];

export const day7: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FClamshells%20(left).mp4?alt=media&token=8d698ebd-15ef-403b-860c-068b39ee7d05",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FClamshells%20(right).mp4?alt=media&token=1f3d513e-6b6b-4deb-abe7-b368e06c313f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FDonkey%20kicks%20(left).mp4?alt=media&token=c4a51be6-bfeb-4dca-9045-8be190fa592e",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FDonkey%20kicks%20(right).mp4?alt=media&token=79c532de-25b9-4014-9c54-6eee63fdb4c9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FRevolved%20triangle%20(left).mp4?alt=media&token=807883a6-47f6-42e5-bd6c-d476ee207a17",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FRevolved%20triangle%20pose%20(right).mp4?alt=media&token=0bbb05c5-4ced-4707-9bae-02070feb4dd3"
];

export const day8: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FCrescent%20lunge%20(left).mp4?alt=media&token=8becfe16-78ec-4162-856c-67a31d117e2c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FCrescent%20lunge%20(right).mp4?alt=media&token=0d93e52a-6654-4f50-bf1e-b3783634cb3c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FHamstring%20curls%20(left).mp4?alt=media&token=8de86f63-5fef-458f-952e-020ea942c399",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FHamstring%20curls%20(right).mp4?alt=media&token=fb0f156e-92c5-462d-9952-9fc586480414",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FMarching%20glute%20bridges.mp4?alt=media&token=fd228c95-46f8-4289-a098-4afcb6f2c032",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FPlie%20with%20side%20bends.mp4?alt=media&token=6b7cda7d-d875-45ca-b8f5-f8baade9e022"
];

export const day9: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FChild_s%20pose.mp4?alt=media&token=4fb77fcd-2bbf-42c6-8462-f41a6918f573",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FClamshells%20(left).mp4?alt=media&token=7c57539b-9f35-498d-9a31-82198836507f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FClamshells%20(right).mp4?alt=media&token=eb5ba419-97d6-40c1-814b-4f9e966c4c40",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FDownward%20facing%20dog.mp4?alt=media&token=af0d3472-81b7-4f8c-b593-56c0a914b126",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FGlute%20kickbacks%20(left).mp4?alt=media&token=93388946-1e86-4b00-8db3-4235fe010bf9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FGlute%20kickbacks%20(right).mp4?alt=media&token=5c72b512-660a-4d9c-ad80-bfc5399cf23b"
];

export const day10: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FHip%20abduction%20with%20lift%20(left).mp4?alt=media&token=1a7d2099-3d19-4c1d-bddd-912e8bbc7340",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FHip%20abduction%20with%20lift%20(right).mp4?alt=media&token=eadc1bae-15c7-4463-aeec-734a16698af1",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FLow%20lunge%20(left).mp4?alt=media&token=14ac2671-343e-4c89-b63c-aecf9cbe4868",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FLow%20lunge%20(right).mp4?alt=media&token=ce24190a-9e37-4906-81ac-58bfc98cda7a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FSide%20plank%20(left).mp4?alt=media&token=ab1cf332-aca5-43c3-bcc3-14761712993f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FSide%20plank%20(right).mp4?alt=media&token=97722dc8-dd37-4483-8720-d4a850bc64f4"
];

export const day11: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FFire%20hydrants%20(left).mp4?alt=media&token=1e9781c4-4824-4fce-b3c3-4ff2b0a78021",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FFire%20hydrants%20(right).mp4?alt=media&token=d1c2655c-9101-4b13-af50-009a858d9fd3",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FPlie%20with%20diagonal%20arm%20reaches.mp4?alt=media&token=503cf6b4-2e33-41ef-8a39-610e1aeed2b5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FPlie%20with%20lateral%20extensions.mp4?alt=media&token=a135b388-1273-4c43-99d7-5f3133a70189",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FPyramid%20(left).mp4?alt=media&token=538f4292-24d9-4945-bbe8-591f8140dbcd",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FPyramid%20pose%20(right).mp4?alt=media&token=04e50fba-b7ce-472c-bbb8-35716e92eedb"
];

export const day12: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FBear%20hold.mp4?alt=media&token=3f7cfde9-9d5b-406c-b2c7-5cef958ad34b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FButterfly%20stretch.mp4?alt=media&token=3ced6657-3702-41f4-8e27-9853576bd67a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FFrog%20pose.mp4?alt=media&token=12b70703-8a6a-4a9a-9593-e700d865cf7c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FGlute%20bridges.mp4?alt=media&token=5885a520-db3b-49d6-ace3-c28ec633f97c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FSingle%20leg%20bridge%20pose%20(left).mp4?alt=media&token=2d3fd0bf-271d-4009-9bfc-6216bf0856b4",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FSingle%20leg%20bridges%20(right).mp4?alt=media&token=c16a96dc-6ff5-45ac-b16f-5bf78a469c4d"
];

export const day13: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FBridge%20pose.mp4?alt=media&token=e60ed1d1-d742-4558-a353-74867cff17be",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FCamel%20pose.mp4?alt=media&token=22f4b81e-2c4b-4ba6-9c97-d17867462088",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FCrescent%20lunge%20(left).mp4?alt=media&token=25b5bfa0-2f3f-489c-a028-ecb72f9835dc",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FCrescent%20lunge%20(right).mp4?alt=media&token=0ed8aed6-9cf9-4a59-806c-4bea7338ce85",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FDonkey%20kicks%20(left).mp4?alt=media&token=728ae6c8-2f4f-4c37-b217-7d2352276e07",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FDonkey%20kicks%20(right).mp4?alt=media&token=001a21e3-5d23-4a19-b913-1912ed2e129c"
];

export const day14: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FClamshell%20to%20leg%20extension%20(right).mp4?alt=media&token=6562a7c0-abfe-45f4-a405-9b6aa88a2d28",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FClamshell%20to%20leg%20extensions%20(left).mp4?alt=media&token=222e283a-1d55-4031-bc63-887485d05d9a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FHappy%20baby.mp4?alt=media&token=b061e10d-2681-48f6-b24a-ce4fa0c125b2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FSphynx%20pose.mp4?alt=media&token=5b75cdf2-3a28-4ad6-8fb3-3c60ac620c2d",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FTree%20pose%20(left).mp4?alt=media&token=78a830c9-93a4-46e5-a85f-84fc674e1708",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FTree%20pose%20(right).mp4?alt=media&token=78725b7a-972e-4781-b6d1-bb0dd8f0cc1b"
];

export const day15: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FBear%20hold.mp4?alt=media&token=6c8e1ff6-8dd6-47d3-9bdd-254631a30236",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FGodess%20pose.mp4?alt=media&token=793947d3-c74e-4725-997e-904676523de9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FHip%20abduction%20with%20lift%20(left).mp4?alt=media&token=eb8f78f6-f4ae-48d9-a9f4-96b107b6ac1a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FHip%20abduction%20with%20lift%20(right).mp4?alt=media&token=ffa95ae8-7fe8-43a5-b418-9040cd8ee460",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FPlie%20with%20heel%20lifts.mp4?alt=media&token=e4a53ccf-d496-4d25-b0a5-cf6ecb43b3f0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FSeated%20wide%20angle%20straddle.mp4?alt=media&token=e62edb7d-2d85-4c4a-bbc5-23c56b1c5157"
];

export const day16: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2F90-90%20hip%20switch.mp4?alt=media&token=836475b3-db33-4b12-9be0-0a1f2b5c1879",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FMarching%20glute%20bridges.mp4?alt=media&token=b275a354-39a8-4096-b6c1-80af6a0e3e67",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FSide%20kneeling%20leg%20lifts%20(left).mp4?alt=media&token=761491d4-58d7-4bef-93b7-87d6f562af57",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FSide%20kneeling%20leg%20lilfts%20(right).mp4?alt=media&token=b924f8f2-c92e-451c-93cd-a728e93381d8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FTriangle%20pose%20(left).mp4?alt=media&token=31b12753-01f4-4b88-8160-625d7bf6de89",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FTriangle%20pose%20(right).mp4?alt=media&token=e3f782f5-16b0-4ffd-9ddd-5c17103fc031"
];

// The main rotation
export const healer16DayLoop: string[][] = [
  day1, day2, day3, day4, day5, day6, day7, day8,
  day9, day10, day11, day12, day13, day14, day15, day16
];

// ----------------------
// Library Categories (From Swift)
// ----------------------

export const pelvicStrengthVideos: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FBear%20hold.mp4?alt=media&token=a93e0e31-f4b7-4643-b6a7-9fce68cd7241",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FClamshells%20(left).mp4?alt=media&token=64a6fb42-e22a-48eb-bb4e-1a1538dc7f20",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FClamshells%20(right).mp4?alt=media&token=5869f584-a310-4590-9ff3-e4b45ba34b3c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FDonkey%20kicks%20(left).mp4?alt=media&token=fceefe43-d676-4d67-b9c9-148670748428",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FDonkey%20kicks%20(right).mp4?alt=media&token=cff42e1b-1814-43c8-8076-97b374c3f6cc",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FFire%20hydrants%20(left).mp4?alt=media&token=538485b2-1a18-464f-87a1-2cf2b52d28b6",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FFire%20hydrants%20(right).mp4?alt=media&token=1558c5ef-8794-4986-862d-fe28d55686c7",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FGlute%20bridges.mp4?alt=media&token=d5db8685-058d-4e73-9535-6aa325868da3",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FGlute%20kickbacks%20(left).mp4?alt=media&token=1c612978-bbd3-4dd6-a6a6-41420590d37e",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FGlute%20kickbacks%20(right).mp4?alt=media&token=34e03b6b-9284-470a-8c31-6e7b4fd4f1d9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FHip%20abduction%20with%20lift%20(left).mp4?alt=media&token=2a0aebf2-6200-4d96-b23c-9b6ed1c8a149",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FHip%20abduction%20with%20lift%20(right).mp4?alt=media&token=a8a73219-364d-4002-8c2d-848cce14dddc",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FMarching%20glute%20bridges.mp4?alt=media&token=e761c1d8-8627-41cf-932a-05e7f3f9d4a1",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FSide%20plank%20(left).mp4?alt=media&token=a143ead0-678c-43c7-b541-608c2c870697",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FSide%20plank%20(right).mp4?alt=media&token=6beca506-071f-4b03-a471-1c8d1a33a8d5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FSingle%20leg%20bridges%20(left).mp4?alt=media&token=4ee41905-84dd-4ec3-bd3e-de61cbc2647b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Strength%2FSingle%20leg%20bridges%20(right).mp4?alt=media&token=2df9f3cb-dfe0-4bc0-9ff8-db5d31ddf443"
];

export const pelvicReleaseVideos: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2F90-90%20hip%20switch.mp4?alt=media&token=f99810ff-3741-43f8-97f5-57882a03a64c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FButterfly%20stretch.mp4?alt=media&token=fad1fb3c-be5c-42cf-9d4d-53a67ccbecd9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FChild_s%20pose.mp4?alt=media&token=0699b92c-19cf-4424-b6d3-54f468965f86",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FDeep%20squat%20rotations.mp4?alt=media&token=5b4a765a-6adc-4586-8179-67aeac5b13e1",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FFigure%20four%20stretch%20(left).mp4?alt=media&token=d53729b0-9e2e-4a76-96d7-df99dc268b19",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FFigure%20four%20stretch%20(right).mp4?alt=media&token=65db3465-f997-4c7b-ac57-6fedb9fcb86f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FHip%20flexor%20stretch%20(left).mp4?alt=media&token=79244ade-fa8c-460e-ba95-21bc58d9a588",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FHip%20flexor%20stretch%20(right).mp4?alt=media&token=fcadf352-6fd4-45f1-8fdd-e0c79aad1f45",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FLow%20lunge%20with%20rotation%20(left).mp4?alt=media&token=b481dc31-71ae-4323-bc17-db5d2d75666f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Resistance%2FLow%20lunge%20with%20rotation%20(right).mp4?alt=media&token=a22fda18-b61f-4c6f-8062-deee8fd8c0d6"
];

export const pelvicPilateVideos: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FBridge%20pose.mp4?alt=media&token=36a9fd54-0dc9-4f04-9e8c-1657ae1d218c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FClamshell%20to%20leg%20extension%20(right).mp4?alt=media&token=396fb350-04fb-4858-b3ac-5b33bdaf4169",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FClamshell%20to%20leg%20extensions%20(left).mp4?alt=media&token=bbc1f9d2-f21a-4f65-abab-b34d4379323c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FClamshells%20(left).mp4?alt=media&token=cce989f2-185a-4eb1-aff0-12512ea0ef93",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FClamshells%20(right).mp4?alt=media&token=6cab81e8-1f58-4741-9192-baede813dc97",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FDonkey%20kick%20pulses%20(left).mp4?alt=media&token=19c8a95a-33d8-42d0-ae51-07983da95cdc",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FDonkey%20kick%20pulses%20(right).mp4?alt=media&token=e54f561b-f0b2-48a3-962f-8876d46ccf32",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FDonkey%20kicks%20(left).mp4?alt=media&token=78e3a1a0-70b9-43a0-b389-ff7422692f0f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FDonkey%20kicks%20(right).mp4?alt=media&token=a3a9ebc1-2a26-4edc-9644-9278ee09bd88",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FDonkey%20kicks.mp4?alt=media&token=ee94a816-b2d3-4228-91fe-627d51c383d4",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FFire%20hydrants%20(left).mp4?alt=media&token=a24ae942-4390-4eee-abff-80349cbd65ae",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FFire%20hydrants%20(right).mp4?alt=media&token=bc27ed8e-907c-4d1f-9ad5-253a29e4fc45",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FFire%20hydrants.mp4?alt=media&token=f4508a23-25a0-44ab-b16c-bf374084d154",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FHamstring%20curls%20(left).mp4?alt=media&token=2826ff9d-af60-48cb-acfc-a6dd29211a6e",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FHamstring%20curls%20(right).mp4?alt=media&token=9fa5b9fe-1a2a-4a7e-a06e-dab989aa8b94",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FHamstring%20curls.mp4?alt=media&token=9dae61b3-1a82-4328-a3c2-44e74c970380",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FKnee%20tuck%20to%20leg%20extension%20(right).mp4?alt=media&token=2bf10f85-3438-4d9b-a7cf-c63617e9cbc6",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FKnee%20tuck%20to%20leg%20extensions%20(left).mp4?alt=media&token=a48fcadf-c645-4901-b2cf-68b9e290f77c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FMarching%20bridges.mp4?alt=media&token=0faa3760-50d6-4568-a739-cc7d8ac8a62c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FPlie%20pulses.mp4?alt=media&token=fb6f6410-2f8f-4b19-945c-d985e35bfdea",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FPlie%20squats.mp4?alt=media&token=ab63a728-9f62-45b2-9e29-6af0f0e179b4",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FPlie%20with%20diagonal%20arm%20reaches.mp4?alt=media&token=031964f1-e0f0-4250-a478-0ca463948a03",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FPlie%20with%20heel%20lifts.mp4?alt=media&token=e9b2f661-41a6-4bad-96a5-034c794b7fd7",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FPlie%20with%20lateral%20extensions.mp4?alt=media&token=fcbf1b82-50fb-46b3-bec8-ea0a69f7a3e5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FPlie%20with%20side%20bends.mp4?alt=media&token=a5486e67-fd05-4ce1-9701-65a59f7fa4ec",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FSide%20kneeling%20leg%20lifts%20(left).mp4?alt=media&token=87edd650-6bb7-4faf-b215-4256a7fe6b2b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FSide%20kneeling%20leg%20lilfts%20(right).mp4?alt=media&token=51fb22f9-f4bc-457a-8177-2ded058d6432",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FSingle%20leg%20bridge%20pose%20(left).mp4?alt=media&token=21a40567-dab7-436d-bef8-70ceb5c94310",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Pilates%2FSingle%20leg%20bridges%20(right).mp4?alt=media&token=0d98232c-2fbf-4895-b8c1-8de27814d827"
];

export const pelvicYogaVideos: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FBridge%20pose.mp4?alt=media&token=3a5e08f2-228f-4474-8718-2fc4fac15e56",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FCamel%20pose.mp4?alt=media&token=5c5530b4-a8d7-467b-a485-c0d8ab305e17",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FCat%20pose.mp4?alt=media&token=7162739e-bc0e-43d7-9837-669aa94af355",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FChair%20pose.mp4?alt=media&token=505901dd-5711-48e5-a0c3-4520eb51e3a8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FChild_s%20pose.mp4?alt=media&token=f37c418c-5891-4fd2-859b-74205ec475b5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FCobra%20pose.mp4?alt=media&token=72f7e301-4295-4729-bb75-1c5421c30a0b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FCow%20pose.mp4?alt=media&token=1a482fe5-b421-470f-9c77-c9f336a28fab",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FCrescent%20lunge%20(left).mp4?alt=media&token=d3a7b69a-1e5d-40d8-ac30-5960c3bd0f10",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FCrescent%20lunge%20(right).mp4?alt=media&token=6ae7b7e8-eac4-4f1d-bf02-3ccc6a796b8e",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FDownward%20facing%20dog.mp4?alt=media&token=46a482bb-c68c-4498-8824-a63f269443c7",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FExtended%20side%20angle%20(left).mp4?alt=media&token=8c47bed2-b0f8-4990-b261-18761df179b8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FExtended%20side%20angle%20(right).mp4?alt=media&token=1bfb42c1-5eed-413b-8c01-31bccbf9eabb",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FFrog%20pose.mp4?alt=media&token=86cf92eb-63a1-4d03-a9f2-bf73e86cf5b5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FGate%20pose%20(left).mp4?alt=media&token=280604e0-8f43-4f0b-8b05-ba3c2a6775a9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FGate%20pose%20(right).mp4?alt=media&token=a3fcc356-43a9-436b-98ee-8af3ee944b91",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FGodess%20pose.mp4?alt=media&token=78d92059-f45a-4bd5-b611-288dfc262311",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FHappy%20baby.mp4?alt=media&token=b78006e2-4860-4e55-bfc5-3e62b54757d9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FLotus%20pose.mp4?alt=media&token=b631269b-60a3-4249-9430-c94b410481f9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FLow%20lunge%20(left).mp4?alt=media&token=a94f3bca-da95-4ef9-8d07-253277e0441a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FLow%20lunge%20(right).mp4?alt=media&token=8d27b3ff-19f7-4d57-970e-8eb2f45739b8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FMountain%20pose.mp4?alt=media&token=fcab6c0e-f316-48ef-934b-eb42f2052c49",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FPlow%20pose.mp4?alt=media&token=3ce9a83d-bb09-49ea-9005-75f6fafe6235",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FPuppy%20pose.mp4?alt=media&token=e378d0a2-9bc9-4332-a125-9e71cfede445",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FPyramid%20(left).mp4?alt=media&token=fac503df-06c2-44ad-9c00-c3924ddd6fb2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FPyramid%20pose%20(right).mp4?alt=media&token=bba04551-e21a-40a4-8c88-3b08e224330d",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FReverse%20warrior%20(left).mp4?alt=media&token=7dc2d184-3201-47cc-9e4f-607abacc5fab",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FReverse%20warrior%20(right).mp4?alt=media&token=d1fd616a-9310-4d2b-a1c9-70fcf44ad314",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FRevolved%20triangle%20(left).mp4?alt=media&token=64fe6980-9b7f-4c93-a02e-f99246d63129",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FRevolved%20triangle%20pose%20(right).mp4?alt=media&token=744f1bfe-b2bd-4ad1-8ee0-936abb033dc3",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FSeated%20wide%20angle%20straddle.mp4?alt=media&token=2d64a3bf-33d1-4d75-94a3-5f66c9fa5514",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FSide%20plank%20(left).mp4?alt=media&token=9217e09f-c2b2-4d58-91db-c7aa5a42b2a5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FSide%20plank%20(right).mp4?alt=media&token=98b1d981-2c7b-4fda-8c8d-5c3fb288f7ed",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FSphynx%20pose.mp4?alt=media&token=3eab15aa-d2e1-420b-a4a8-f716c98c98d5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FTree%20pose%20(left).mp4?alt=media&token=4f9be318-8324-40d8-8ee2-ec2a6159037c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FTree%20pose%20(right).mp4?alt=media&token=55ae4696-7161-452e-904a-65dc83ac0bb1",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FTriangle%20pose%20(left).mp4?alt=media&token=9a1cf61b-8845-401f-8eca-ff267126dd00",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FTriangle%20pose%20(right).mp4?alt=media&token=76b3b5e8-b461-44eb-b10a-6c7ffe63720b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FWarrior%20I%20(left).mp4?alt=media&token=d4691f77-b4be-4b6f-9697-dbb042e2e840",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FWarrior%20I%20(right).mp4?alt=media&token=325c69cf-5024-44f0-8a0c-93eb16495809",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FWarrior%20II%20(left).mp4?alt=media&token=98a50051-94ae-4279-b8da-eff21f3c81af",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Exercise%20Categories%2FPelvic%20Yoga%2FWarrior%20II%20(right).mp4?alt=media&token=472beac2-163e-4705-8e37-b0d02bd656a8"
];

// ----------------------
// Challenges & Extra Tracks (From Swift)
// ----------------------

// "Leakproof Control" with Coach Laura
// Note: This was provided as a single list in Swift.
// You can use this array to populate a "Leakproof" category or split it manually later.
export const leakproofControlVideos: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSeated%20Diaphragmatic%20Breathing.mov?alt=media&token=ef93a089-a28e-4cd2-887d-800d2b3532b1",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSupine%20Abdominal%20Bracing%20(Hands%20on%20Stomach).mov?alt=media&token=1d37ed92-0800-494b-bfcd-89dd66bc6700",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSupine%20March%20with%20Posterior%20Pelvic%20Tilt.mov?alt=media&token=da171e6e-cbb0-4828-9de6-32b6a45e09ad",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FProne%20Glute%20Squeeze.mov?alt=media&token=5b5f8e20-51d9-4837-8d2f-11a4da69e020",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FHeel%20Slides.mov?alt=media&token=3a7b85dd-79bf-4e27-9408-11189bbca715",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Felevated%20glute%20bridge.mov?alt=media&token=3e31793c-ff65-4f4d-bcdb-437f65a95835",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FClamshell.mov?alt=media&token=ddd2432d-225c-43df-b723-94979bd1e856",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FFire%20Hydrant%20Circles.mov?alt=media&token=289ad6de-ab36-4741-ba3b-c7a08a630c08",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FHooklying%20Small%20March.mov?alt=media&token=28324a3d-7f34-4233-9040-4c1bbd939a7b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FLifting%20Techniques%201.mov?alt=media&token=00fd4dd1-4ac6-4e4f-842d-e33e7b060e9e",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FBanded%20Glute%20Bridge.mov?alt=media&token=aba71479-2ebe-4355-9323-207760cf9be7",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FBanded%20Lateral%20Walks.mov?alt=media&token=6bd02765-afcd-4a9d-8cec-239cdd7828b4",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FBanded%20squats.mov?alt=media&token=4d6a1bdc-c32b-491f-8930-62aa5ae20228",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FDead%20bugs.mov?alt=media&token=d0a277a5-d68c-4fc9-9f60-21989d7873c8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSide%20plank%20%20(with%20leg%20lift).mov?alt=media&token=a0c37497-4068-42dc-ae7e-fdf298b161e0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2F-%20Reverse%20plank.mov?alt=media&token=a9db328c-24c7-4e3b-83c7-85bc8792535c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FHollow%20Hold%20Flutter%20Kick.mov?alt=media&token=b08b4751-5b9f-4972-b2cc-2dd0a45d235f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FWall%20Slides__.mov?alt=media&token=f8fc7fab-f20f-4af3-9926-d38821d5eb48",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSide-Lying%20Leg%20Bend%20and%20Straighten%202.mov?alt=media&token=be8891bd-476f-47ab-8cfe-df0be911add3",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSeated_Core_Transverse%20Abdominis%20Bracing.mov?alt=media&token=06b6bfee-eeb1-48d2-9239-83c922ba33bb",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FBird%20Dog%20with%20crunch.mov?alt=media&token=cf366857-e973-419b-a702-5d8d4fa13c3f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FThe%20Hundred.mov?alt=media&token=69b274c5-e6aa-4b2d-9a71-58c105748743",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FEccentric%20Walking%20Lunge.mov?alt=media&token=d410dba4-5a81-4da2-af78-8cd2ddebf121",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FPlank%20Walkup___.mov?alt=media&token=e143a38f-3fd9-46c5-9b6f-13dc5565bbfd",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FBear%20Plank%20Shoulder%20Taps.mov?alt=media&token=1a2d7256-c6c2-4edc-816d-7f6153c55e17",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fhip%20trusts.mov?alt=media&token=a363dc27-dbd6-48ac-9def-2426ed19be8e",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSit%20to%20Stand%20-%20Increased%20Speed.mov?alt=media&token=6984b728-2ac8-4750-88e7-9b4ec124bfc6",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fstep%20ups.mov?alt=media&token=90e40229-45fa-440f-a259-a171a146a58f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FStanding%20Hip%20Abduction%20with%20Counter%20Support.mov?alt=media&token=e36d2974-356f-4c8c-b64b-70e5c77dff08",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FStanding%20Hip%20Extension%20with%20Counter%20Support.mov?alt=media&token=cad1ee07-a134-4272-854e-b4082c410f15",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FInner%20Thigh%20Lift.mov?alt=media&token=0fede580-fa4a-42cd-b8f0-8ec6be4cf3f0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSingle-Leg%20Glute%20Bridge.mov?alt=media&token=fa3e1a26-c3d6-4f26-9e2d-2df1f8774aee",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FProne%20Hip%20Extension%20with%20Bent%20Knee%20-%20One%20Pillow.mov?alt=media&token=003bba09-bd3d-4c0c-a2a8-67d321f02615",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FSide-Lying%20Leg%20Bend%20and%20Straighten.mov?alt=media&token=a4c9539d-83db-4fc0-9279-9559d205ecbb",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FLifting%20Techniques%202.mov?alt=media&token=5fffa9c1-b4e3-42cb-a93e-deaee15bdada",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2FLifting%20Techniques%203.mov?alt=media&token=6dcf3125-a0e4-4048-a48b-2e7dbf22f48f"
];

// "Pelvic Pain Release" (also a good category)
export const pelvicPainReleaseCategory: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FResting%20pose.mov?alt=media&token=dd23c8a7-ab9a-4d6f-bbdb-0a8cf6fdabea",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FLeg%20Up%20the%20Wall.mov?alt=media&token=457599b1-d49a-42f8-8aff-055dd39f4439",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FKnee-to-Chest%20Stretch.mov?alt=media&token=2a8a6d1c-acf1-4ed3-ac4e-e7bfe367ae5c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSeated_Ankle_Pumps.mov?alt=media&token=352f8b6a-d07b-424b-a805-231d88a63e5f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSeated_Neck_Stretch_Upper%20Trapezius.mov?alt=media&token=beb66e12-cf40-436a-9d4b-209ce94840bf",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2F-%20Hamstring%20Stretch.mov?alt=media&token=c2fbc981-df6c-44f2-91d8-77286a0400e2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FIT%20Band%20Stretch%20right.mov?alt=media&token=e6e7e003-c69a-444e-92f5-ac59bd4b071c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSidelying%20Quadriceps%20Stretch.mov?alt=media&token=3565c1ed-f380-4597-8c81-8670df0f1334",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FPsoas%20stretch%20with%20a%20chair.mov?alt=media&token=f42f76a4-5f3c-4fca-a5e6-26e553ab84dd",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSupine%20Piriformis%20Stretch%20with%20Leg%20Straight.mov?alt=media&token=3d717c50-ed95-44a9-9125-c4f97dffa8a2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2F-%20Hip%20circles.mov?alt=media&token=f5225ed2-e9e8-45ca-86c9-ba5368fa3e5d",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSide%20Knee%20Drops%20.mov?alt=media&token=bb77ee8b-1228-42c3-89fb-2907bdea99e9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FOpen%20Book%20Chest%20Rotation%20Stretch%20on%20Foam%20Half%20Roll.mov?alt=media&token=746a8fb5-e012-4e0e-a690-3009ad2d9c0d",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSpine%20CARS.mov?alt=media&token=336d02b1-8b98-4d7d-8ca2-084c0514b410",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FRoll%20Down%20.mov?alt=media&token=7b1324fa-839b-45e9-9048-9da8eaa6b753",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FWindshield%20wipers%20.mov?alt=media&token=069a288e-56f6-4a1a-bd48-06f707d472b2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FTransverse%20Abdominal%20Contraction.mov?alt=media&token=dc2dd71d-0cc8-477d-9608-a71755875d3e",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FTransverse%20Abdominal%20March.mov?alt=media&token=6b04fac6-0652-4642-98bb-7af479759fd6",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSeated%20Forward%20Bend.mov?alt=media&token=ef5a5b03-1d1f-4b8a-84c4-a1fd8d822777",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FChest%20Opener.mov?alt=media&token=eb4d3caf-895a-4897-8e06-9d69614be5a2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2F-%20Prone%20W%20to%20lifts.mov?alt=media&token=3bf9b03e-af8e-408b-b677-cfc30e4aa1cf",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSide-lying%20hip%20abduction.mov?alt=media&token=abaa31dc-2b8f-466f-b8ce-1d6ce8640ab9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSidelying%20Hip%20Adduction%20(Inner%20Thigh%20Lifts)_0A.mov?alt=media&token=0e836794-85ca-4893-aa6b-5bd8f2c8c8b9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSeated_Hip%20Abduction_With%20Band.mov?alt=media&token=c9802038-881f-467d-9391-f18b1e1463b0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSeated_Hip%20Adduction%20with%20Ball%20Squeeze.mov?alt=media&token=c4e3d784-484c-4677-9e48-3f6a2e3ee970",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2F-%20Hip%20thrusts.mov?alt=media&token=cba6564b-24c9-4d6f-8f3d-1169f9ae87e9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FBodyweight%20Good%20Morning.mov?alt=media&token=0026cdb6-329c-4e48-bde9-dc4cc1868487",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSpiderman%20Stretch.mov?alt=media&token=89b2f1c5-82bf-4112-a8a7-cc7fd444b5be",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FLog%20Roll.mov?alt=media&token=79906f6b-2a72-453a-bfb4-eff4040568f3",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FLying%20on%20Your%20Weak%20Side%20to%20Sitting.mov?alt=media&token=48e3289d-d787-4152-98ac-ea95ecdc1a25",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FCouch%20Stretch__.mov?alt=media&token=a5772ccd-1bea-4786-a330-786c053d36c5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FHip%20Hinge%20Straddle%20Pose%20.mov?alt=media&token=71037df0-4b87-4571-a902-03aee2acbbf5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2Fthoracic%20extension%20stretch.mov?alt=media&token=3a1b6992-ef95-41b0-9997-1d74554aa037",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSciatic%20nerve%20flossing%20(nerve%20glide)%20with%20a%20chair.mov?alt=media&token=dfe30513-dfba-41c7-bd45-5253d4dc0403",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Workout%20with%20Coaches%2FLeakproof%20with%20Coach%20Laura%2Fpostpartum%20and%20pelvic%20pain%2FSingle%20leg%20deadlift.mov?alt=media&token=6751ef60-f413-4435-bfa3-8726f3ca3cc7"
];

// ----------------------
// Library Category Export
// ----------------------

export const CATEGORIES = [
  {
    key: "release",
    title: "Pelvic Release",
    subtitle: "Gentle decompression + hip opening",
    urls: pelvicReleaseVideos
  },
  {
    key: "strength",
    title: "Pelvic Strength",
    subtitle: "Glutes + deep core support",
    urls: pelvicStrengthVideos
  },
  {
    key: "yoga",
    title: "Pelvic Yoga",
    subtitle: "Flow and balance",
    urls: pelvicYogaVideos
  },
  {
    key: "pilates",
    title: "Pelvic Pilates",
    subtitle: "Control and precision",
    urls: pelvicPilateVideos
  }
];
