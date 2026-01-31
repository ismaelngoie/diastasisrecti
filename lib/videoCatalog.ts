// lib/videoCatalog.ts

export type VideoItem = {
  url: string;
  title: string;
};

function toTitleCase(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeSideLabel(name: string) {
  // Convert "(left)" → "— Left", "(right)" → "— Right"
  return name
    .replace(/\((left)\)/i, "— Left")
    .replace(/\((right)\)/i, "— Right")
    .replace(/\s+—\s+/g, " — ");
}

/**
 * Removes yoga/pelvic branding and converts yoga-pose-ish titles into neutral rehab language.
 * (We keep it conservative and not medical-claim-y.)
 */
export function sanitizeExerciseTitle(raw: string) {
  let s = String(raw || "").trim();

  // Strip explicit words you asked to remove
  s = s.replace(/\byoga\b/gi, "");
  s = s.replace(/\bpelvic\b/gi, "");

  // File name artifacts
  s = s.replace(/child_s/gi, "childs");
  s = s.replace(/\s{2,}/g, " ").trim();

  const lower = s.toLowerCase();

  const map: Array<[RegExp, string]> = [
    [/downward facing dog/gi, "Back + Hamstring Stretch"],
    [/childs pose/gi, "Back Decompression Stretch"],
    [/triangle pose/gi, "Side Stretch"],
    [/revolved triangle( pose)?/gi, "Rotation Stretch"],
    [/warrior i/gi, "Standing Lunge"],
    [/pyramid( pose)?/gi, "Hamstring Stretch"],
    [/happy baby/gi, "Hip Opener"],
    [/sphynx( pose)?/gi, "Gentle Back Extension"],
    [/frog( pose)?/gi, "Inner Thigh Stretch"],
    [/camel( pose)?/gi, "Chest Opener"],
    [/tree( pose)?/gi, "Single-Leg Balance"],
    [/godd?ess( pose)?/gi, "Wide-Stance Squat"],
    [/plie/gi, "Wide Squat"],
    [/pose\b/gi, ""], // remove leftover "pose"
  ];

  for (const [re, repl] of map) {
    if (re.test(lower)) {
      s = s.replace(re, repl);
    }
  }

  s = s.replace(/\s{2,}/g, " ").trim();
  s = normalizeSideLabel(s);

  // Title case for nicer UI
  return toTitleCase(s);
}

export function extractExerciseName(url: string) {
  try {
    const decoded = decodeURIComponent(url);
    const last = decoded.split("/").pop() || decoded;
    const noQuery = last.split("?")[0];
    const noExt = noQuery.replace(/\.(mp4|mov|m4v)$/i, "");
    const base = noExt
      .replace(/_/g, " ")
      .replace(/%20/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return sanitizeExerciseTitle(base || "Exercise");
  } catch {
    return "Exercise";
  }
}

export function toVideoItems(urls: string[]): VideoItem[] {
  return urls
    .filter(Boolean)
    .map((url) => ({ url, title: extractExerciseName(url) }));
}

// ----------------------
// 16-Day Loop
// ----------------------

export const day1: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FDonkey%20kicks%20(left).mp4?alt=media&token=d8db6fce-0507-4d1e-982d-ec2c9ff76dd2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FDonkey%20kicks%20(right).mp4?alt=media&token=cc24fa53-faad-46df-be23-6e72f2de47e2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FFire%20hydrants%20(left).mp4?alt=media&token=1fd510fe-217c-44a7-aa46-ca8a727d444a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FFire%20hydrants%20(right).mp4?alt=media&token=9be80b14-6a80-40b0-80f7-84b408e44e52",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FHip%20flexor%20stretch%20(left).mp4?alt=media&token=9e1f9e2f-c29a-41fd-876f-4d9838465d10",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%201%2FHip%20flexor%20stretch%20(right).mp4?alt=media&token=65e43a26-63f8-40bd-9330-a0c9fe49b70c",
];

export const day2: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FClamshells%20(left).mp4?alt=media&token=f6ad2afd-1303-44a4-8237-3619b4b74eb8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FClamshells%20(right).mp4?alt=media&token=e84b022e-4501-465a-9902-23dbd549a3b0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FDownward%20facing%20dog.mp4?alt=media&token=50766c22-560a-44af-9471-76d89b748cec",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FGlute%20bridges.mp4?alt=media&token=f6a4858b-f9b5-4542-a42c-5f16b89128bf",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FSingle%20leg%20bridge%20pose%20(left).mp4?alt=media&token=23697497-a4d3-4431-a846-7b963b1fb292",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%202%2FSingle%20leg%20bridges%20(right).mp4?alt=media&token=289e790d-a530-48f8-89e7-a95faff05c5e",
];

export const day3: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FDonkey%20kick%20pulses%20(left).mp4?alt=media&token=34c9b197-832b-4b58-8718-e9046dc4c9b9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FDonkey%20kick%20pulses%20(right).mp4?alt=media&token=8bbb41ae-78d6-4a6f-9a9d-814b4cc95d3c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FLow%20lunge%20with%20rotation%20(left).mp4?alt=media&token=a5f6ded2-3b86-4584-951d-8714c7fc7345",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FLow%20lunge%20with%20rotation%20(right).mp4?alt=media&token=55b4e9aa-73d4-4c86-9b6e-6d1c8a0fff5f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FPlie%20squats.mp4?alt=media&token=347b6f10-4bb5-40be-ba1d-fd77d01f7a88",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%203%2FPlie%20with%20heel%20lifts.mp4?alt=media&token=000f4c2f-377d-4fe7-ac69-a47f6e95f373",
];

export const day4: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FFigure%20four%20stretch%20(left).mp4?alt=media&token=749f6688-012e-486e-911c-9fdead3d4555",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FFigure%20four%20stretch%20(right).mp4?alt=media&token=4eb00bbb-93f7-48a1-a771-ffc3dd3b33c7",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FKnee%20tuck%20to%20leg%20extension%20(right).mp4?alt=media&token=81dc8933-6d04-4402-9678-2b8c62bbd3e8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FKnee%20tuck%20to%20leg%20extensions%20(left).mp4?alt=media&token=752513e7-666b-43ba-b714-85291ac50917",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FSide%20kneeling%20leg%20lifts%20(left).mp4?alt=media&token=519d5da7-0443-4f9c-9bc6-2493bc6db0f0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%204%2FSide%20kneeling%20leg%20lilfts%20(right).mp4?alt=media&token=eedba964-0298-488f-9f53-006e28ddd277",
];

export const day5: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FGlute%20kickbacks%20(left).mp4?alt=media&token=8ef86b74-bba0-4a94-87cc-1ee63c028dfc",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FGlute%20kickbacks%20(right).mp4?alt=media&token=435616ba-518b-41e0-a210-429b01b08131",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FHip%20abduction%20with%20lift%20(left).mp4?alt=media&token=8200a0b2-0207-4d91-9c3e-6344f5a20664",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FHip%20abduction%20with%20lift%20(right).mp4?alt=media&token=717f5c2e-2a2e-45c4-a507-45c6227a5972",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FSide%20plank%20(left).mp4?alt=media&token=cfe7c77f-b984-4651-9c0a-049224602fe3",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%205%2FSide%20plank%20(right).mp4?alt=media&token=7e3e5b39-4fab-4283-b153-09b1d90cb328",
];

export const day6: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FExtended%20side%20angle%20(left).mp4?alt=media&token=4636eeb0-8670-4854-b6eb-ebef1d42d53a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FExtended%20side%20angle%20(right).mp4?alt=media&token=f6ef9ba1-1a91-4480-86a8-8205f65c75d7",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FPlie%20pulses.mp4?alt=media&token=56fdb333-3406-4e93-b416-7b40122a51f1",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FPlie%20with%20diagonal%20arm%20reaches.mp4?alt=media&token=54038882-c299-48fd-aa3f-a251512afe5b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FWarrior%20I%20(left).mp4?alt=media&token=e02ef240-d253-42aa-9858-56ccb6df1b87",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%206%2FWarrior%20I%20(right).mp4?alt=media&token=365e8e9a-fc45-4a57-9de3-57dbf00ed55f",
];

export const day7: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FClamshells%20(left).mp4?alt=media&token=8d698ebd-15ef-403b-860c-068b39ee7d05",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FClamshells%20(right).mp4?alt=media&token=1f3d513e-6b6b-4deb-abe7-b368e06c313f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FDonkey%20kicks%20(left).mp4?alt=media&token=c4a51be6-bfeb-4dca-9045-8be190fa592e",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FDonkey%20kicks%20(right).mp4?alt=media&token=79c532de-25b9-4014-9c54-6eee63fdb4c9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FRevolved%20triangle%20(left).mp4?alt=media&token=807883a6-47f6-42e5-bd6c-d476ee207a17",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%207%2FRevolved%20triangle%20pose%20(right).mp4?alt=media&token=0bbb05c5-4ced-4707-9bae-02070feb4dd3",
];

export const day8: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FCrescent%20lunge%20(left).mp4?alt=media&token=8becfe16-78ec-4162-856c-67a31d117e2c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FCrescent%20lunge%20(right).mp4?alt=media&token=0d93e52a-6654-4f50-bf1e-b3783634cb3c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FHamstring%20curls%20(left).mp4?alt=media&token=8de86f63-5fef-458f-952e-020ea942c399",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FHamstring%20curls%20(right).mp4?alt=media&token=fb0f156e-92c5-462d-9952-9fc586480414",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FMarching%20glute%20bridges.mp4?alt=media&token=fd228c95-46f8-4289-a098-4afcb6f2c032",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%208%2FPlie%20with%20side%20bends.mp4?alt=media&token=6b7cda7d-d875-45ca-b8f5-f8baade9e022",
];

export const day9: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FChild_s%20pose.mp4?alt=media&token=4fb77fcd-2bbf-42c6-8462-f41a6918f573",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FClamshells%20(left).mp4?alt=media&token=7c57539b-9f35-498d-9a31-82198836507f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FClamshells%20(right).mp4?alt=media&token=eb5ba419-97d6-40c1-814b-4f9e966c4c40",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FDownward%20facing%20dog.mp4?alt=media&token=af0d3472-81b7-4f8c-b593-56c0a914b126",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FGlute%20kickbacks%20(left).mp4?alt=media&token=93388946-1e86-4b00-8db3-4235fe010bf9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%209%2FGlute%20kickbacks%20(right).mp4?alt=media&token=5c72b512-660a-4d9c-ad80-bfc5399cf23b",
];

export const day10: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FHip%20abduction%20with%20lift%20(left).mp4?alt=media&token=1a7d2099-3d19-4c1d-bddd-912e8bbc7340",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FHip%20abduction%20with%20lift%20(right).mp4?alt=media&token=eadc1bae-15c7-4463-aeec-734a16698af1",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FLow%20lunge%20(left).mp4?alt=media&token=14ac2671-343e-4c89-b63c-aecf9cbe4868",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FLow%20lunge%20(right).mp4?alt=media&token=ce24190a-9e37-4906-81ac-58bfc98cda7a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FSide%20plank%20(left).mp4?alt=media&token=ab1cf332-aca5-43c3-bcc3-14761712993f",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2010%2FSide%20plank%20(right).mp4?alt=media&token=97722dc8-dd37-4483-8720-d4a850bc64f4",
];

export const day11: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FFire%20hydrants%20(left).mp4?alt=media&token=1e9781c4-4824-4fce-b3c3-4ff2b0a78021",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FFire%20hydrants%20(right).mp4?alt=media&token=d1c2655c-9101-4b13-af50-009a858d9fd3",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FPlie%20with%20diagonal%20arm%20reaches.mp4?alt=media&token=503cf6b4-2e33-41ef-8a39-610e1aeed2b5",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FPlie%20with%20lateral%20extensions.mp4?alt=media&token=a135b388-1273-4c43-99d7-5f3133a70189",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FPyramid%20(left).mp4?alt=media&token=538f4292-24d9-4945-bbe8-591f8140dbcd",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2011%2FPyramid%20pose%20(right).mp4?alt=media&token=04e50fba-b7ce-472c-bbb8-35716e92eedb",
];

export const day12: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FBear%20hold.mp4?alt=media&token=3f7cfde9-9d5b-406c-b2c7-5cef958ad34b",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FButterfly%20stretch.mp4?alt=media&token=3ced6657-3702-41f4-8e27-9853576bd67a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FFrog%20pose.mp4?alt=media&token=12b70703-8a6a-4a9a-9593-e700d865cf7c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FGlute%20bridges.mp4?alt=media&token=5885a520-db3b-49d6-ace3-c28ec633f97c",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FSingle%20leg%20bridge%20pose%20(left).mp4?alt=media&token=2d3fd0bf-271d-4009-9bfc-6216bf0856b4",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2012%2FSingle%20leg%20bridges%20(right).mp4?alt=media&token=c16a96dc-6ff5-45ac-b16f-5bf78a469c4d",
];

export const day13: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FBridge%20pose.mp4?alt=media&token=e60ed1d1-d742-4558-a353-74867cff17be",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FCamel%20pose.mp4?alt=media&token=22f4b81e-2c4b-4ba6-9c97-d17867462088",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FCrescent%20lunge%20(left).mp4?alt=media&token=25b5bfa0-2f3f-489c-a028-ecb72f9835dc",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FCrescent%20lunge%20(right).mp4?alt=media&token=0ed8aed6-9cf9-4a59-806c-4bea7338ce85",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FDonkey%20kicks%20(left).mp4?alt=media&token=728ae6c8-2f4f-4c37-b217-7d2352276e07",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2013%2FDonkey%20kicks%20(right).mp4?alt=media&token=001a21e3-5d23-4a19-b913-1912ed2e129c",
];

export const day14: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FClamshell%20to%20leg%20extension%20(right).mp4?alt=media&token=6562a7c0-abfe-45f4-a405-9b6aa88a2d28",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FClamshell%20to%20leg%20extensions%20(left).mp4?alt=media&token=222e283a-1d55-4031-bc63-887485d05d9a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FHappy%20baby.mp4?alt=media&token=b061e10d-2681-48f6-b24a-ce4fa0c125b2",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FSphynx%20pose.mp4?alt=media&token=5b75cdf2-3a28-4ad6-8fb3-3c60ac620c2d",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FTree%20pose%20(left).mp4?alt=media&token=78a830c9-93a4-46e5-a85f-84fc674e1708",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2014%2FTree%20pose%20(right).mp4?alt=media&token=78725b7a-972e-4781-b6d1-bb0dd8f0cc1b",
];

export const day15: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FBear%20hold.mp4?alt=media&token=6c8e1ff6-8dd6-47d3-9bdd-254631a30236",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FGodess%20pose.mp4?alt=media&token=793947d3-c74e-4725-997e-904676523de9",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FHip%20abduction%20with%20lift%20(left).mp4?alt=media&token=eb8f78f6-f4ae-48d9-a9f4-96b107b6ac1a",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FHip%20abduction%20with%20lift%20(right).mp4?alt=media&token=ffa95ae8-7fe8-43a5-b418-9040cd8ee460",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FPlie%20with%20heel%20lifts.mp4?alt=media&token=e4a53ccf-d496-4d25-b0a5-cf6ecb43b3f0",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2015%2FSeated%20wide%20angle%20straddle.mp4?alt=media&token=e62edb7d-2d85-4c4a-bbc5-23c56b1c5157",
];

export const day16: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2F90-90%20hip%20switch.mp4?alt=media&token=836475b3-db33-4b12-9be0-0a1f2b5c1879",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FMarching%20glute%20bridges.mp4?alt=media&token=b275a354-39a8-4096-b6c1-80af6a0e3e67",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FSide%20kneeling%20leg%20lifts%20(left).mp4?alt=media&token=761491d4-58d7-4bef-93b7-87d6f562af57",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FSide%20kneeling%20leg%20lilfts%20(right).mp4?alt=media&token=b924f8f2-c92e-451c-93cd-a728e93381d8",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FTriangle%20pose%20(left).mp4?alt=media&token=31b12753-01f4-4b88-8160-625d7bf6de89",
  "https://firebasestorage.googleapis.com/v0/b/pelvic-floor-exercise-908ed.appspot.com/o/Daily%20Exercise%20Plans%2FDay%2016%2FTriangle%20pose%20(right).mp4?alt=media&token=e3f782f5-16b0-4ffd-9ddd-5c17103fc031",
];

// main rotation
export const healer16DayLoop: string[][] = [
  day1, day2, day3, day4, day5, day6, day7, day8,
  day9, day10, day11, day12, day13, day14, day15, day16,
];
