Claude responded: You're right — this is empty because we just cleaned the files.

You're right — this is empty because we just cleaned the files. The migration only works when there's real content in them from actual work.

Here's the complete picture of how it works in practice on jobmatch:

Step 1 — Normal work session:

You ask claude.ai something about jobmatch
Chrome bot auto-copies the response
Ctrl+Shift+X writes it to claude-ai.md
/sync in Claude Code executes it
Hook auto-updates claude-state.md with every file write

After some real work, your files will look like:

claude-ai.md:
  Implement the job matching algorithm with scoring...

claude-state.md:
  ✓ 10:23:01 wrote src/matcher.py
  ✓ 10:23:04 wrote tests/test_matcher.py
  ✓ 10:25:11 wrote src/scorer.py

Step 2 — When chat gets long, regenerate:

claude-context.md:
  ## Last instructions sent to CLI
  Implement the job matching algorithm...

  ## Last 10 CLI actions
  ✓ wrote src/matcher.py
  ✓ wrote tests/test_matcher.py
  ✓ wrote src/scorer.py

  ## Resume prompt
  Read the above sections. Continue from where we left off.

Step 3 — Start fresh chat:

Copy claude-context.md contents
Paste into new claude.ai chat
AI instantly knows what was done and what's next

The files are empty right now because no real jobmatch work has flowed through syncbridge yet. Once you start using it on jobmatch, they'll fill up naturally.

Go use it on jobmatch — come back if anything feels broken.