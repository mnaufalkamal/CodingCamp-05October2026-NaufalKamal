# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side, single-page web application that serves as a personal productivity hub. It combines four core widgets — a contextual greeting with live date/time, a Pomodoro-style focus timer, a persistent to-do list, and a quick-links launcher — into one minimal, distraction-free interface. The application runs entirely in the browser with no backend, persisting all user data via the LocalStorage API. It must work as a standalone web page or as a browser extension across Chrome, Firefox, Edge, and Safari.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-of-day greeting message.
- **Timer**: The Pomodoro-style countdown component set to 25 minutes by default.
- **Task_List**: The UI component that manages the collection of user to-do items.
- **Task**: A single to-do item consisting of a text description and a completion state.
- **Quick_Links**: The UI component that displays and manages user-defined shortcut buttons to external URLs.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **LocalStorage**: The browser's built-in client-side key-value storage API.
- **Storage_Manager**: The module responsible for reading and writing all persisted data to and from LocalStorage.
- **UI_Renderer**: The module responsible for updating the DOM in response to state changes.

---

## Requirements

### Requirement 1: Live Greeting Display

**User Story:** As a user, I want to see the current time, date, and a greeting appropriate to the time of day, so that the dashboard provides immediate daily context when I open it.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in 24-hour HH:MM format, updated every 60 seconds, reflecting the user's local system clock.
2. THE Greeting_Widget SHALL display the current full date in the format "Weekday, Month Day, Year" (e.g., "Monday, October 5, 2026"), derived from the user's local system clock.
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local time is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local time is between 21:00 and 23:59 or between 00:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. IF the system clock is unreadable or returns an invalid date, THEN THE Greeting_Widget SHALL display a static fallback message indicating the time is unavailable.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can manage focused work sessions without leaving the dashboard.

#### Acceptance Criteria

1. THE Timer SHALL initialise with a countdown duration of 25 minutes (1500 seconds) and display 25:00 in MM:SS format.
2. WHEN the user activates the Start control, THE Timer SHALL begin counting down from the current remaining time at one-second intervals.
3. WHILE the Timer is counting down, THE Timer SHALL update the displayed time every second in MM:SS format, where minutes range from 00 to 25 and seconds range from 00 to 59.
4. WHEN the user activates the Stop control, THE Timer SHALL pause the countdown and retain the remaining time without decrementing it further.
5. WHEN the user activates the Reset control, THE Timer SHALL stop any active countdown and restore the displayed time to 25:00 (1500 seconds).
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and display a visible on-screen notification indicating the session has ended.
7. IF the countdown reaches 00:00 and the browser permits alert dialogs, THEN THE Timer SHALL also notify the user with a browser alert indicating the session has ended.
8. WHILE the Timer is counting down, THE Timer SHALL disable the Start control to prevent duplicate intervals.
9. WHILE the Timer is paused or reset, THE Timer SHALL disable the Stop control.
10. IF the user activates the Start control while the Timer is already counting down, THEN THE Timer SHALL ignore the activation and continue the existing countdown without creating a duplicate interval.

---

### Requirement 3: To-Do List Management

**User Story:** As a user, I want to add, edit, mark as done, and delete tasks, with all tasks persisted across browser sessions, so that I can track my daily responsibilities reliably.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task description, THE Task_List SHALL add a new Task with a unique identifier, a completion state of false, and display it in the task list.
2. IF the user submits an empty or whitespace-only task description, THEN THE Task_List SHALL reject the submission and display an inline validation message without clearing any previously entered input.
3. WHEN the user activates the edit control on a Task, THE Task_List SHALL present the existing task description in an editable input field and disable the edit and delete controls on all other Tasks until the edit is confirmed or cancelled.
4. WHEN the user confirms an edit with a non-empty description of at most 500 characters, THE Task_List SHALL update the Task's description and exit edit mode.
5. IF the user confirms an edit with an empty or whitespace-only description, THEN THE Task_List SHALL reject the update, retain the Task's previous description, and display an inline validation message.
6. IF the user confirms an edit with a description exceeding 500 characters, THEN THE Task_List SHALL reject the update and display an inline validation message indicating the character limit.
7. WHEN the user activates the completion toggle on a Task, THE Task_List SHALL toggle the Task's completion state between true and false.
8. WHILE a Task has a completion state of true, THE UI_Renderer SHALL apply a visual strikethrough style to the Task's description.
9. WHEN the user activates the delete control on a Task, THE Task_List SHALL remove that Task from the list permanently.
10. WHEN any Task is added, updated, toggled, or deleted, THE Storage_Manager SHALL synchronously write the complete current task collection to LocalStorage before the operation is considered complete.
11. WHEN the Dashboard loads, THE Storage_Manager SHALL read the task collection from LocalStorage and THE Task_List SHALL render all previously saved Tasks within 500 milliseconds.
12. IF LocalStorage is unavailable or the stored data cannot be parsed as a valid task collection, THEN THE Storage_Manager SHALL initialize with an empty task collection and display an inline message indicating that previously saved tasks could not be loaded.

---

### Requirement 4: Quick Links Management

**User Story:** As a user, I want to add and access shortcut buttons to my favourite websites, with links saved across sessions, so that I can navigate to frequent destinations without typing URLs.

#### Acceptance Criteria

1. WHEN the user submits a valid label and a valid URL, THE Quick_Links SHALL add a new Link and display it as a clickable button showing the label text, and the total number of Link buttons SHALL NOT exceed 20.
2. IF the user submits a missing label or a missing URL, THEN THE Quick_Links SHALL reject the submission, retain the entered values in the form fields, and display an inline validation message indicating which field is missing.
3. IF the user submits a URL that does not begin with "http://" or "https://", THEN THE Quick_Links SHALL reject the submission, retain the entered values in the form fields, and display an inline validation message indicating the URL format requirement.
4. IF the user submits a label exceeding 50 characters or a URL exceeding 2000 characters, THEN THE Quick_Links SHALL reject the submission and display an inline validation message indicating the exceeded limit.
5. WHEN the user activates a Link button, THE Dashboard SHALL open the associated URL in a new browser tab.
6. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove that Link from the list permanently without requiring additional confirmation.
7. WHEN any Link is added or deleted, THE Storage_Manager SHALL write the current link collection to LocalStorage within 500 milliseconds.
8. WHEN the Dashboard loads, THE Storage_Manager SHALL read the link collection from LocalStorage and THE Quick_Links SHALL render all previously saved Links within 1000 milliseconds of the Dashboard load event.
9. IF LocalStorage is unavailable or returns a read error on Dashboard load, THEN THE Quick_Links SHALL render an empty link list and display an inline error message indicating that saved links could not be loaded.

---

### Requirement 5: Data Persistence and Isolation

**User Story:** As a user, I want all my tasks and links to be stored independently using namespaced keys, so that the Dashboard's data does not conflict with other applications using LocalStorage in the same browser origin.

#### Acceptance Criteria

1. THE Storage_Manager SHALL store task data under the LocalStorage key "todo_life_dashboard_tasks".
2. THE Storage_Manager SHALL store link data under the LocalStorage key "todo_life_dashboard_links".
3. WHEN LocalStorage is unavailable or throws an error, THE Storage_Manager SHALL catch the error and fall back to an in-memory state for the remainder of the session.
4. WHEN LocalStorage is unavailable or throws an error, THE Dashboard SHALL display a non-dismissible warning banner in the application header for the remainder of the session.
5. THE Storage_Manager SHALL serialise all stored collections as JSON strings and deserialise them on read, returning an empty array when the key is absent.
6. IF the data retrieved from LocalStorage cannot be parsed as valid JSON, THEN THE Storage_Manager SHALL discard the corrupt data, initialise with an empty collection, and trigger the same error-handling behaviour described in criteria 3 and 4.

---

### Requirement 6: Layout and File Structure

**User Story:** As a developer, I want the codebase to follow a strict single-file-per-type structure, so that the project remains easy to navigate and maintain.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using exactly one HTML file at the project root, one CSS file located in the css/ directory, and one JavaScript file located in the js/ directory, with no additional HTML, CSS, or JavaScript files present in the project.
2. WHEN the Dashboard is opened in a browser from the local filesystem, THE Dashboard SHALL render its complete initial state — including all visible UI elements and default data — without issuing any network requests beyond the initial load of the one HTML file, one CSS file, and one JavaScript file.
3. THE Dashboard SHALL display all content and interactive elements without horizontal scrolling or overlapping elements at any viewport width between 320px and 2560px inclusive, using responsive CSS techniques.
4. THE Dashboard SHALL meet WCAG 2.1 Level AA colour contrast requirements for all text and interactive elements, such that every text element achieves a contrast ratio of at least 4.5:1 against its background for normal text and at least 3:1 for large text (18pt or 14pt bold and above).
5. IF the Dashboard is opened in a browser that does not support a responsive CSS technique used in the implementation, THEN THE Dashboard SHALL remain usable with no content clipped or hidden at viewport widths between 320px and 2560px.

---

### Requirement 7: Cross-Browser Compatibility

**User Story:** As a user, I want the Dashboard to function correctly in all major modern browsers, so that I can use it regardless of my preferred browser or as a browser extension.

#### Acceptance Criteria

1. THE Dashboard SHALL function correctly in the current stable release of Chrome, Firefox, Edge, and Safari, where "function correctly" means all UI interactions complete without JavaScript errors, all data displays render as intended, and all features produce the same observable output across all four browsers.
2. THE Dashboard SHALL use only Web APIs available natively in all four target browsers as of 2024, including setInterval, clearInterval, localStorage, and JSON, without requiring polyfills or transpilation.
3. WHERE the Dashboard is packaged as a browser extension, THE Dashboard SHALL comply with the Manifest V3 extension specification for Chrome and Edge, and Manifest V2 for Firefox and Safari.
4. IF the Dashboard is loaded in a browser other than the current stable release of Chrome, Firefox, Edge, or Safari, THEN the Dashboard SHALL display a message indicating the browser is not supported.
