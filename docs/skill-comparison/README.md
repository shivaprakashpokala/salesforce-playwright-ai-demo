# One request, without and with a Skill

The same request, word for word, was given to the same AI four times:
"Write test cases for this user story." followed by `docs/case-user-story.md`.

| | Without · run 1 | Without · run 2 | With Skill · run 1 | With Skill · run 2 |
| --- | --- | --- | --- | --- |
| Test cases | 13 | 17 | 14 | 14 |
| IDs | TC-01 | TC-01 | TC-CASE-001 | TC-CASE-001 |
| Layout | A summary table, then 13 step tables | 17 step tables under headings | One table, our seven columns | One table, our seven columns |
| Linked to criteria | In the summary | In a table at the end | Covers column | Covers column |
| Closing sections | Assumptions, Open questions | Traceability, Open questions | Coverage, Not covered, Questions for the BA | Coverage, Not covered, Questions for the BA |

- `without-skill.md`: run 1 without a Skill, exactly as returned.
- `with-skill.md`: run 1 with the `write-test-cases` Skill, exactly as returned.

The Skill is `.github/skills/write-test-cases/`. Try it yourself: ask an AI assistant
the same question in a folder without the Skill, then in this repository.
