# Lessons Learned with Claude

This project was built primarily by guiding Claude to implement the features. The goal was to work as hands-off as possible, in order to understand the model's capabilities and limitations. The following are some of the observations and lessons from this experiment.

## Temporary Files

It is very eager to create temporary scripts, and just as eager to delete them afterwards, making it difficult to review its actions. I added instructions telling it to commit the temporary scripts. A more robust solution would be tool-use hooks that deny creating temporary files outside the repo and require approval before deleting files.

## Getting Stuck

Sometimes it gets stuck with a problem that could be resolved more easily by doing it manually. For example, it struggled to make some screenshots with Playwright because it couldn't locate the specific element to navigate to the next screen. I updated the corresponding skill to use the codegen feature of Playwright to let it have a programmatic recording of the clicks.

## Unfamiliar Salesforce XML

It also struggled with some of Salesforce's XML components that are likely less represented in its training data and where Salesforce rejects any incorrect content without providing much guidance on how to fix it. In that case, it's better to perform the steps manually to let it retrieve the component afterward.

## Legacy Syntax

It tends to use legacy Apex test methods and LWC conditional directives. I added instructions to CLAUDE.md telling it to use the modern variants instead. It would be better to scope these as rules limited to the Apex and LWC folders, so they're only loaded into context when needed.

## Em Dashes

It loves to use em dashes. I created a git hook to block commits that contain one. The humanize skill could also be worth including, to rewrite typical AI writing style.
