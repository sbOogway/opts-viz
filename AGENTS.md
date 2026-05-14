## Workflow Rules for AI Agent

### Don't
- Do NOT run `npm`, `npx`, `vite`, or any Node.js commands — user handles dev server.
- Do NOT run `git` commands — user handles commits.
- Do NOT create new files unless explicitly requested — prefer editing existing ones.
- Do NOT add comments to code or write README/doc files unless asked.
- Do NOT add emojis to files.

### Do
- Answer concisely — short messages, no preamble/postamble.
- Use `edit` for code changes, `read` to understand context before editing.
- Read AGENTS.md at session start to recall workflow rules.
- Keep changes minimal and focused on the specific request.
- When referencing code, use `file:line` notation.

### Code Style
- Light DOM (`createRenderRoot() { return this }`).
- Native HTML `<select>`/`<input>` — no Shoelace form controls.
- Lit + Plotly.js for components.
- No explanatory comments in source code.

### Project Reminders
- Edit files in `src/` — these are the source files.
