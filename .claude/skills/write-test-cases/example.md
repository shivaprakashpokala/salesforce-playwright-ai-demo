# One good test case

| ID | Title | Preconditions | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-LOGIN-003 | Lock the account after five wrong passwords | A registered user exists and is not locked | 1. Open the login page 2. Enter the user's email 3. Enter the password "wrong-1" and select Sign in 4. Repeat step 3 four more times | "Your account is locked. Try again in 15 minutes." is shown and the Sign in button is disabled | High |

Why it is good: the title states the behaviour, each step is one action with exact
data, and the expected result quotes the message the user sees.
