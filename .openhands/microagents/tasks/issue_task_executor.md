---
type: task
name: issue_task_executor
description: Executes tasks defined in GitHub issues by analyzing the codebase, performing specified actions, updating progress, and verifying code integrity.
---

## Purpose

Automate the execution of task lists defined in GitHub issues, ensuring that each step is performed accurately and efficiently.

## Workflow Steps

1. **Retrieve Issue Content**: Access the specified GitHub issue and parse its content to understand the tasks outlined.
2. **Analyze Codebase**: Examine the relevant parts of the codebase to determine the current state and identify necessary changes.
3. **Execute Tasks**: Perform each task as defined in the issue, making code modifications as needed.
4. **Update Progress**: Reflect the completion status of each task within the GitHub issue, providing updates or comments as appropriate.
5. **Verify Code Integrity**: Run syntax checks and build processes to ensure that the codebase remains functional after changes.
6. **Report Results**: Summarize the actions taken and their outcomes, noting any issues encountered during the process.
