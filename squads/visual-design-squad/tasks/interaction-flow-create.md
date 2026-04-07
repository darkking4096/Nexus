---
task:
  id: interaction-flow-create
  name: Create User Interaction Flows
  description: |
    Document complete user interaction flows for the page/feature.
    Maps user journeys, decision points, feedback loops, edge cases.
    Output: Interaction flow diagrams and journey documentation
  agent: ux-interaction-designer
  status: available
  
inputs:
  - user-research: "From Uma (personas, pain points, goals)"
  - wireframe: "Page structure"
  - interaction-spec: "From interaction-design-spec task"
  - business-requirements: "Goals, KPIs, success metrics"

outputs:
  - flow-diagram: "User interaction flow diagram"
  - journey-map: "user-journey-map.md"
  - decision-trees: "Decision trees for complex flows"
  - edge-case-flows: "Edge cases and error flows"

elicit: true
elicit-format: |
  **Step 1: Happy Path**
  - What is the primary user goal on this page?
  - What are the steps to accomplish that goal?
  - What feedback does user need at each step?

  **Step 2: Decision Points**
  - Where does user make choices?
  - What are the possible outcomes?
  - How does flow change based on decisions?

  **Step 3: Error & Edge Cases**
  - What can go wrong? (validation errors, network issues, etc.)
  - How should user be notified?
  - What is the recovery path?

  **Step 4: Alternative Flows**
  - Are there alternative ways to accomplish the goal?
  - Keyboard shortcuts?
  - Mobile vs desktop differences?

dependencies:
  - requires: interaction-design-spec
  - optional-requires: uma-user-flows
  - blocks: []

checklist:
  - [ ] User research reviewed for goals/pain points
  - [ ] Primary happy path documented
  - [ ] Decision points identified
  - [ ] Alternative flows documented
  - [ ] Error flows specified
  - [ ] Edge cases identified and handled
  - [ ] Feedback patterns mapped to flow steps
  - [ ] Mobile vs desktop flows compared (if applicable)
  - [ ] Accessibility flows considered (keyboard navigation)
  - [ ] Flow diagrams created (visual representation)
  - [ ] Journey map formatted clearly
  - [ ] Recovery paths for errors defined
  - [ ] Ready for frontend implementation
  - [ ] Design/development alignment confirmed

tools-required:
  - flow-diagram-tool
  - user-journey-tool
  - figma-flows

success-criteria:
  - All user goals clearly mapped
  - Happy path is clear and logical
  - Error flows are defined
  - Edge cases are handled
  - Alternative paths documented
  - Flow diagrams are implementation-ready
  - No ambiguities in flow specifications
  - Accessibility flows included

time-estimate: "1-2 days"

example: |
  ### Output: User Interaction Flow

  ```
  User: "I want to sign up for the newsletter"
  
  START
    ↓
  [User sees newsletter form]
    ↓ (user enters email)
  [Email input focused]
    ↓ (user types valid email)
  [Email field filled, checkmark visible]
    ↓ (user clicks Subscribe button)
  [Button disabled, spinner shows]
    ↓ (server validates & confirms)
  [Success toast: "Check your email!"]
    ↓ (toast auto-dismisses after 3s)
  [Form resets]
  END ✅
  
  ERROR FLOW (invalid email):
    ↓ (user enters "invalid-email")
    ↓ (user clicks Subscribe)
  [Error message: "Please enter valid email"]
  [Error icon shows on input field]
  [User can retry]
    ↓ (corrects email)
  [Back to happy path]
  
  ERROR FLOW (network failure):
    ↓ (submit fails)
  [Error toast: "Network error. Retry?"]
  [Retry button available for 5 seconds]
    ↓ (user clicks Retry)
  [Back to loading state]
  [Retry succeeds]
  [Back to success state]
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
