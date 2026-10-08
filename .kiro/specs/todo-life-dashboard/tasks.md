# Implementation Plan: To-Do List Life Dashboard

## Overview

Implement a zero-dependency, client-side single-page application as three static files: `index.html`, `css/style.css`, and `js/app.js`. The build order is: HTML skeleton → CSS → JS modules (Storage_Manager → Greeting_Widget → Timer → Task_List → Quick_Links → UI_Renderer → App.init()). All modules live inside a single IIFE in `app.js`.

## Tasks

- [ ] 1. Create the HTML skeleton (`index.html`)
  - [ ] 1.1 Scaffold the base HTML document with semantic structure
    - Create `index.html` at the project root with `<!DOCTYPE html>`, `<html lang="en">`, `<head>`, and `<body>`
    - Add `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, and a `<title>`
    - Link `css/style.css` and `js/app.js` (defer attribute) — no other external resources
    - _Requirements: 6.1, 6.2, 7.2_

  - [ ] 1.2 Add the storage-unavailable warning banner
    - Add `<div id="storage-banner" role="alert" aria-live="assertive" hidden>` in the `<header>`
    - Include descriptive text: "Storage unavailable — changes will not be saved."
    - _Requirements: 5.3, 5.4_

  - [ ] 1.3 Add the Greeting Widget section
    - Add `<section id="greeting-section">` containing `<p id="greeting">`, `<p id="time">`, and `<p id="date">`
    - _Requirements: 1.1, 1.2, 1.3–1.6, 1.7_

  - [ ] 1.4 Add the Focus Timer section
    - Add `<section id="timer-section">` containing `<div id="timer-display">25:00</div>` and three `<button>` elements with `id="timer-start"`, `id="timer-stop"`, and `id="timer-reset"`
    - Add `<div id="timer-notification" role="alert" hidden>` for the session-ended message
    - _Requirements: 2.1, 2.6, 2.8, 2.9_

  - [ ] 1.5 Add the To-Do List section
    - Add `<section id="task-section">` with a `<form id="add-task-form">` containing a text `<input id="task-input">`, a submit `<button>`, and `<span id="task-form-error">` for inline validation messages
    - Add `<ul id="task-list" aria-live="polite">` — each task will be rendered as `<li>` elements by `UI_Renderer`
    - _Requirements: 3.1, 3.2, 3.3, 3.8, 3.11_

  - [ ] 1.6 Add the Quick Links section
    - Add `<section id="links-section">` with a `<form id="add-link-form">` containing `<input id="link-label-input">`, `<input id="link-url-input">`, a submit `<button>`, and `<span id="link-form-error">` for inline validation messages
    - Add `<div id="link-list">` — link buttons will be rendered by `UI_Renderer`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.8_

- [ ] 2. Implement the CSS stylesheet (`css/style.css`)
  - [ ] 2.1 Define CSS custom properties and base reset
    - Declare `:root` variables for colours, spacing, font sizes, and border-radius tokens
    - Choose a colour palette that achieves WCAG 2.1 AA contrast (≥ 4.5:1 for normal text, ≥ 3:1 for large text)
    - Apply a minimal box-sizing and margin reset
    - _Requirements: 6.4_

  - [ ] 2.2 Implement the responsive dashboard layout
    - Style the `<body>` as a CSS Grid or Flexbox container that stacks the four widget sections vertically on narrow viewports and arranges them in a two-column grid on wider viewports
    - Ensure no horizontal scrolling or overlapping elements between 320 px and 2560 px; use `min-width`/`max-width` and `clamp()` or media queries
    - _Requirements: 6.3, 6.5_

  - [ ] 2.3 Style the storage banner, greeting widget, and timer
    - Style `#storage-banner` as a fixed top-of-viewport warning bar (visible when not `hidden`)
    - Style `#greeting-section` typography (time large, date and greeting as secondary text)
    - Style `#timer-section`: large `#timer-display` monospace clock, three clearly labelled control buttons with disabled-state visual distinction
    - _Requirements: 2.8, 2.9, 5.4_

  - [ ] 2.4 Style the task list and quick links
    - Style `#task-list` items: description text, strikethrough style for completed tasks (`.completed`), inline edit input, and action buttons (edit, delete, confirm, cancel)
    - Style `#links-section` link buttons and the delete control on each link
    - Style inline validation error messages (`#task-form-error`, `#link-form-error`) to be visually distinct
    - _Requirements: 3.8, 4.1, 4.5_

- [ ] 3. Checkpoint — open `index.html` in a browser and verify static structure
  - Ensure all sections are visible, the page renders without console errors, there is no horizontal scroll at 320 px, and all text meets visible contrast requirements at a glance.

- [ ] 4. Implement `js/app.js` — IIFE shell, State object, and Storage_Manager
  - [ ] 4.1 Set up the IIFE shell and central State object
    - Wrap all application code in `const App = (function () { ... })();`
    - Define the `state` object with all properties from the design: `storageAvailable`, `storageError`, `timerStatus`, `timerRemaining`, `timerIntervalId`, `tasks`, `editingTaskId`, `links`
    - Define `KEYS` constants: `{ tasks: "todo_life_dashboard_tasks", links: "todo_life_dashboard_links" }`
    - _Requirements: 5.1, 5.2_

  - [ ] 4.2 Implement `Storage_Manager.load()`
    - Wrap each `localStorage.getItem()` call in `try/catch`; on error set `state.storageAvailable = false`
    - Parse each value with `JSON.parse`; on `SyntaxError` set the collection to `[]` and `state.storageError = true`
    - Populate `state.tasks` and `state.links` from the parsed values (default to `[]` when the key is absent)
    - _Requirements: 3.11, 4.8, 5.1, 5.2, 5.3, 5.5, 5.6_

  - [ ] 4.3 Implement `Storage_Manager.saveTasks()` and `Storage_Manager.saveLinks()`
    - Short-circuit immediately if `!state.storageAvailable`
    - Serialise with `JSON.stringify`; write with `localStorage.setItem`; wrap in `try/catch` and set `state.storageAvailable = false` on error
    - _Requirements: 3.10, 4.7, 5.1, 5.2, 5.3, 5.5_

  - [ ]* 4.4 Write property tests for Storage_Manager serialisation round-trips
    - **Property 3: Task serialisation round-trip** — for any `Task[]`, `saveTasks()` then `load()` produces a deeply-equal array
    - **Validates: Requirements 3.10, 5.5**
    - **Property 4: Link serialisation round-trip** — for any `Link[]`, `saveLinks()` then `load()` produces a deeply-equal array
    - **Validates: Requirements 4.7, 5.5**

- [ ] 5. Implement `Greeting_Widget`
  - [ ] 5.1 Implement `getGreeting(hours)`, `formatTime(date)`, and `formatDate(date)` pure functions
    - `getGreeting`: map integer 0–23 → `"Good Morning"` (5–11), `"Good Afternoon"` (12–17), `"Good Evening"` (18–20), `"Good Night"` (21–23 and 0–4)
    - `formatTime`: return zero-padded `"HH:MM"` string from a `Date` object
    - `formatDate`: return `"Weekday, Month Day, Year"` using `Date` prototype methods (no external libraries)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 5.2 Write property tests for `getGreeting`
    - **Property 8: Greeting covers all 24 hours unambiguously** — for any integer in [0, 23], `getGreeting` returns exactly one of the four valid strings and never `undefined`
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [ ] 5.3 Implement `Greeting_Widget.tick()` and `Greeting_Widget.init()`
    - `tick()`: call `new Date()`; if invalid (`isNaN(date.getTime())`), pass `{ fallback: true }` to renderer; otherwise derive and pass the greeting, time, and date strings
    - `init()`: call `tick()` immediately; schedule `setInterval(tick, 60000)` and store the handle
    - _Requirements: 1.1, 1.2, 1.7_

- [ ] 6. Implement `Timer`
  - [ ] 6.1 Implement `Timer.start()`, `Timer.stop()`, and `Timer.reset()`
    - `start()`: guard with `if (state.timerStatus === "running") return;`; set status to `"running"`; store `setInterval(tick, 1000)` handle in `state.timerIntervalId`
    - `stop()`: call `clearInterval(state.timerIntervalId)`; set status to `"idle"`
    - `reset()`: call `clearInterval`; set `timerRemaining = 1500`, status to `"idle"`
    - _Requirements: 2.2, 2.4, 2.5, 2.8, 2.9, 2.10_

  - [ ] 6.2 Implement `Timer.tick()` and `Timer.done()`
    - `tick()`: decrement `state.timerRemaining`; call renderer; if `=== 0`, call `done()`
    - `done()`: call `clearInterval`; set status to `"done"`; call renderer; set `#timer-notification` visible; if `window.alert` is available, call `alert("Focus session complete!")`
    - Ensure `timerRemaining` is never decremented below 0
    - _Requirements: 2.3, 2.6, 2.7_

  - [ ] 6.3 Implement `Timer.init()`
    - Attach `click` listeners to `#timer-start`, `#timer-stop`, and `#timer-reset` buttons, routing to `start()`, `stop()`, and `reset()` respectively
    - _Requirements: 2.2, 2.4, 2.5_

  - [ ]* 6.4 Write property test for Timer countdown
    - **Property 9: Timer never goes below zero** — for any starting `timerRemaining` in [1, 1500], repeated `tick()` calls decrement by 1 each time until 0 and never below 0
    - **Validates: Requirements 2.3, 2.6**

- [ ] 7. Implement `Task_List`
  - [ ] 7.1 Implement `Task_List.add(description)`
    - Reject empty or whitespace-only input: write error to `#task-form-error`, do not clear the input, return early
    - On valid input: create a `Task` object `{ id: generateId(), description: description.trim(), completed: false }`; push to `state.tasks`; call `Storage_Manager.saveTasks()`; call renderer
    - `generateId()`: return `String(Date.now())`
    - _Requirements: 3.1, 3.2, 3.10_

  - [ ]* 7.2 Write property tests for `Task_List.add()`
    - **Property 1 (add branch): Whitespace-only descriptions are always rejected** — for any string of only whitespace, `add()` leaves `state.tasks` unchanged
    - **Validates: Requirements 3.2**
    - **Property 2: Task addition grows the list by exactly 1** — for any valid description and any starting task list, `add()` increases `state.tasks.length` by exactly 1 with `completed = false`
    - **Validates: Requirements 3.1**

  - [ ] 7.3 Implement `Task_List.startEdit()`, `Task_List.confirmEdit()`, and `Task_List.cancelEdit()`
    - `startEdit(id)`: set `state.editingTaskId = id`; call renderer (renderer shows inline input, disables other task controls)
    - `confirmEdit(id, newDescription)`: reject if empty/whitespace (show `#task-form-error`, retain previous description); reject if > 500 chars (show length-limit message); on valid: update task description, clear `editingTaskId`, save, render
    - `cancelEdit()`: clear `editingTaskId`; render
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.10_

  - [ ]* 7.4 Write property tests for `Task_List.confirmEdit()`
    - **Property 1 (confirmEdit branch): Whitespace-only descriptions always rejected** — for any whitespace string, `confirmEdit()` leaves the task's description unchanged
    - **Validates: Requirements 3.5**
    - **Property 10: Edit description length cap enforced** — for any description > 500 chars, `confirmEdit()` leaves the task's description unchanged
    - **Validates: Requirements 3.6**

  - [ ] 7.5 Implement `Task_List.toggleComplete(id)` and `Task_List.deleteTask(id)`
    - `toggleComplete(id)`: find task by id, flip `completed`; save; render
    - `deleteTask(id)`: filter out task by id; save; render
    - _Requirements: 3.7, 3.9, 3.10_

  - [ ]* 7.6 Write property test for `toggleComplete`
    - **Property 5: Completion toggle is its own inverse** — for any task, toggling twice restores the original `completed` value
    - **Validates: Requirements 3.7**

  - [ ] 7.7 Implement `Task_List.init()`
    - Attach `submit` listener to `#add-task-form`; call `add()` with the trimmed input value; prevent default
    - Attach delegated `click` listener to `#task-list`; read `data-action` and `data-id` from `event.target` and route to `startEdit`, `confirmEdit`, `cancelEdit`, `toggleComplete`, or `deleteTask`
    - _Requirements: 3.1, 3.3, 3.7, 3.9_

- [ ] 8. Implement `Quick_Links`
  - [ ] 8.1 Implement `Quick_Links.validateUrl(url)` and `Quick_Links.add(label, url)`
    - `validateUrl(url)`: return `true` if url starts with `"http://"` or `"https://"`
    - `add(label, url)`: run the full validation matrix (label present, URL present, URL format, label ≤ 50 chars, URL ≤ 2000 chars, collection length < 20); on any failure write to `#link-form-error`, retain form values, return early
    - On valid: create `Link { id: String(Date.now()), label, url }`; push to `state.links`; save; render; clear error and reset form
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 8.2 Write property tests for `Quick_Links.add()`
    - **Property 6: Invalid URLs always rejected** — for any string not starting with `http://` or `https://`, `add()` leaves `state.links` unchanged
    - **Validates: Requirements 4.3**
    - **Property 7: 20-link cap enforced** — for a collection of exactly 20 links, `add()` with a valid label and URL leaves `state.links` at length 20
    - **Validates: Requirements 4.1**

  - [ ] 8.3 Implement `Quick_Links.deleteLink(id)` and `Quick_Links.init()`
    - `deleteLink(id)`: filter out link by id; save; render
    - `init()`: attach `submit` listener to `#add-link-form`; attach delegated `click` listener to `#link-list` routing `data-action="delete"` to `deleteLink`
    - _Requirements: 4.5, 4.6, 4.7_

- [ ] 9. Implement `UI_Renderer`
  - [ ] 9.1 Implement `renderGreeting(opts)`
    - If `opts.fallback` is `true`, set `#greeting`, `#time`, and `#date` to `"Time unavailable"`
    - Otherwise, update `#greeting`, `#time`, and `#date` with the passed strings
    - _Requirements: 1.1, 1.2, 1.3–1.6, 1.7_

  - [ ] 9.2 Implement `renderTimer()`
    - Update `#timer-display` with zero-padded `MM:SS` derived from `state.timerRemaining`
    - Set `#timer-start` disabled when `state.timerStatus === "running"`; set `#timer-stop` disabled when status is `"idle"` or `"done"`
    - Show/hide `#timer-notification` based on `state.timerStatus === "done"`
    - _Requirements: 2.1, 2.3, 2.8, 2.9_

  - [ ] 9.3 Implement `renderTasks()`
    - Full re-render of `#task-list`: clear innerHTML, then for each task in `state.tasks` create an `<li>` with appropriate `data-id` and `data-action` attributes
    - Normal mode: show description (with `.completed` class when `task.completed === true`), toggle button, edit button (`data-action="edit"`), delete button (`data-action="delete"`)
    - Edit mode (when `task.id === state.editingTaskId`): replace description with `<input>` pre-filled with current description, confirm (`data-action="confirmEdit"`) and cancel (`data-action="cancelEdit"`) buttons; all other tasks' edit and delete buttons are disabled
    - _Requirements: 3.3, 3.8, 3.11_

  - [ ] 9.4 Implement `renderLinks()`
    - Full re-render of `#link-list`: clear innerHTML, then for each link in `state.links` create a `<button>` that opens the URL in a new tab (`window.open(url, "_blank")`) and a delete button with `data-action="delete"` and `data-id`
    - _Requirements: 4.5, 4.8_

  - [ ] 9.5 Implement `renderStorageBanner()`
    - Remove the `hidden` attribute from `#storage-banner` — once shown it stays visible for the session
    - _Requirements: 5.3, 5.4_

  - [ ] 9.6 Implement `renderAll()`
    - Call `renderGreeting()`, `renderTimer()`, `renderTasks()`, `renderLinks()`, and `renderStorageBanner()` in sequence
    - _Requirements: 3.11, 4.8_

- [ ] 10. Implement `App.init()` and wire everything together
  - [ ] 10.1 Implement `App.init()` bootstrap sequence
    - Call `Storage_Manager.load()` first
    - If `state.storageAvailable === false` or `state.storageError === true`, call `UI_Renderer.renderStorageBanner()`
    - Call `Greeting_Widget.init()`, `Timer.init()`, `Task_List.init()`, `Quick_Links.init()` to attach all event listeners
    - Call `UI_Renderer.renderAll()` for the initial paint
    - _Requirements: 3.11, 4.8, 5.3, 5.4_

  - [ ] 10.2 Register the `DOMContentLoaded` bootstrap call
    - Add `document.addEventListener("DOMContentLoaded", App.init)` as the only top-level statement outside the IIFE
    - Expose `App` on `window` only if needed for manual debugging (optional)
    - _Requirements: 6.1, 6.2_

- [ ] 11. Final checkpoint — full functional smoke test
  - Ensure all tests pass, ask the user if questions arise.
  - Verify in a browser: greeting updates every 60 s, timer counts down and stops at 00:00 with notification, tasks add/edit/delete/toggle and survive a page refresh, 21st link is rejected, private-mode banner appears, no horizontal scroll at 320 px.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (Properties 1–10 from the design)
- Unit tests validate specific examples and edge cases
- The single-file-per-type constraint (Requirement 6.1) means all JS must stay in `js/app.js` — do not create additional files

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "5.1", "6.1"] },
    { "id": 6, "tasks": ["4.4", "5.2", "5.3", "6.2", "7.1", "8.1"] },
    { "id": 7, "tasks": ["6.3", "6.4", "7.2", "7.3", "8.2", "8.3"] },
    { "id": 8, "tasks": ["7.4", "7.5", "9.1", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 9, "tasks": ["7.6", "7.7", "9.6"] },
    { "id": 10, "tasks": ["10.1"] },
    { "id": 11, "tasks": ["10.2"] }
  ]
}
```
