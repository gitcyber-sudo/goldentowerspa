# Project Protocols (Agent Rules)

## 1. Pre-flight Check
- **Mandatory:** At the start of every session (or when context is lost), you MUST read `AGENTS.md` and `PROJECT_PLAN.md` to ground yourself in the user's profile and current objectives.
- **Verification:** Confirm you know the "Immediate Next Objective" from the `PROJECT_PLAN.md`.

## 2. In-Flight Monitoring
- **Flight Recorder:** Every task MUST be initialized in `MISSION_LOG.md` before execution and updated upon completion. This is the "Black Box" for state persistence.
- **Plan Synchronization:** If you change the plan, YOU MUST update `PROJECT_PLAN.md`.
- **Log Maintenance:** After every significant code change, bug fix, or lesson learned, YOU MUST append an entry to `PROJECT_LOG.md`.
  - *Format:* Date, Action Taken, Result/Lesson.

## 3. Communication Standards
- **Tone:** Technical Manual style.
  - Clear, step-by-step instructions.
  - Logical flow (Checklist style where appropriate).
  - Explain the "Why" behind complex code, relating it to aviation concepts if helpful (e.g., "This function is like the hydraulic check valve...").
