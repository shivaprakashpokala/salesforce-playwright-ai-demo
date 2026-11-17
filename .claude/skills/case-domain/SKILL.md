---
name: case-domain
description: Business context for the Salesforce Case object in this org - what a case is, its fields, rules and priorities. Use when planning, writing or reviewing any test that touches cases.
---

# Cases: what a tester needs to know

## What a case is
A case is one customer problem, from first contact to resolution. Support agents
create it when a customer phones, emails or uses the web form, then work it until
it is solved. Each case gets an eight-digit Case Number that the customer quotes.

## The New Case form
| Section | Fields |
| --- | --- |
| Case Information | Status*, Priority, Contact Name, Case Origin*, Account Name, Type, Case Reason |
| Web Information | Web Email, Web Company, Web Name, Web Phone |
| Additional Information | Product, Engineering Req Number, Potential Liability, SLA Violation |
| Description Information | Subject, Description, Internal Comments |

\* required. The four Additional Information fields are custom fields.

## Picklist values
- **Status**: New (default), Working, Escalated. Closing a case is a separate action.
- **Priority**: High, Medium (default), Low.
- **Case Origin**: Phone, Email, Web. How the customer reached us.
- **Type**: Mechanical, Electrical, Electronic, Structural, Other.

## Business rules
1. A case cannot be saved without a Case Origin. We must always know how the
   customer contacted us. Salesforce shows "We hit a snag." and names the field.
2. A new case starts as Status New and Priority Medium unless the agent says otherwise.
3. Cancelling the form must leave nothing behind.
4. Escalating (Status = Escalated) is done from the record page and is recorded
   in the case feed as a status change.
5. Deleting a case asks for confirmation first.

## What matters most
- Anything that loses or corrupts a customer's case is High priority.
- A High priority or Escalated case that is not saved as such is High priority.
- Layout and wording problems are Low priority.

## Test data
- Give every test case a Subject starting with "PW Demo" so it is easy to find and remove.
- Use realistic descriptions (a generator that will not start), not lorem ipsum.
