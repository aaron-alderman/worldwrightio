# Bring your own agent

Explore what matters to you, build a world from your own material, and keep the source and knowledge to manage it yourself. This guide and its teaching material are free under the applicable licenses. Your chosen agent, subscription, inference and hosting may have their own costs.

Start with [exploring a question](#explore-the-corpus-with-a-question), [building a world](#build-your-first-small-world), [managing your work](#keep-your-world-and-agent-context-manageable) or [keeping costs down](#keep-costs-down-without-losing-the-result).

## Start with the tools you already have

You do not need a coding agent just to read and discuss public material. Use a chat tool that can open the relevant pages or repository files. If it cannot access them, supply a small relevant excerpt or file and retain its attribution. Ask the agent to say what it actually read; a link in a prompt does not prove access.

To build locally, use an agent that can work with files and run terminal commands in a project folder. The current Worldwright starter needs Node.js 22 or newer; Git is useful for getting the repository and recording your work. Worldwright's static build and preview do not require an LLM API key. Your agent provider's access and billing requirements are separate.

| Your aim | Give the agent |
| --- | --- |
| Explore an idea | A question, the relevant public source links or excerpts, and a read-only brief |
| Build a world | A local checkout, your own material, a small feature selection and a clear definition of done |
| Maintain a world | The saved source, project instructions, recent decisions and the change you want |

For an optional Codex route, follow the [official setup guide](https://learn.chatgpt.com/docs/quickstart), open the project folder and use its coding workflow. Codex recognizes project instructions in [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md). Other agents may use a different instruction mechanism; explicitly ask them to read the same project guidance. Check your provider's current account access, permissions and usage information rather than assuming a particular plan includes everything.

## Explore the corpus with a question

Start with [Aaron's current homepage](https://aaronalderman.com/index.html) or [Tidepool](../examples/tidepool/index.html). Aaron's site offers three distinct entrances: [Questions](https://aaronalderman.com/questions.html) begins with the questions he is living and building with, including his Christian starting point; [Threads](https://aaronalderman.com/gate.html) follows ideas across the collected work; [Atlas / Map](https://aaronalderman.com/atlas.html) offers places and connections. Choose the entrance that serves your own question. Aaron's personal commitments remain his attributed starting point, rather than a required identity for your world.

Project microsites are a separate layer on the homepage. Threads links to the [published corpus library](https://aaron-alderman.github.io/spin23-relational-geometry/edition-3/library/corpus/index.html). Its directory structure helps navigation; directory placement does not establish scientific status. Pick a relevant question, passage or document and its source/inspection links, then ask your agent to investigate that bounded question. Keep the published edition and source basis explicit rather than assuming every linked site is the same live checkout.

The [Worldwright repository](https://github.com/aaron-alderman/worldwrightio) is the framework and documentation hub. It includes attributed reference material; it is not a promise that the entire wider research corpus is present in that checkout. Tidepool is an original fictional example. Follow the actual source links for a claim, and keep unavailable or private material marked as unavailable.

Copy this brief and replace the bracketed parts:

```text
I want to understand [question] because [why it matters to me].
Start with [specific world page and source links]. Work read-only.
Tell me which sources you could actually open and read.
Separate source claims, fictional examples and your interpretations.
Show the exact file or passage behind important statements, including
scope, uncertainty, corrections and competing explanations.
Follow only the next relevant sources; do not ingest the whole corpus.
Finish with a plain-language explanation and the questions still open.
```

Ask follow-ups such as "What would change this explanation?", "Which connection is an analogy?" or "How might this apply to my situation?" A useful conversation can reveal that a connection fails. Read the important source yourself before relying on the interpretation. A build receipt or a successful software test does not establish a scientific claim.

## Build your first small world

Choose a purpose, an audience and a little material you have permission to use. Two or three places and a source are enough to begin. Reader and sources are the default small selection; maps, editors and other packs can come later when they serve a real purpose.

In a terminal, start from a directory where you want to keep the framework checkout. If you already have it, open that existing directory instead of cloning again.

```sh
git clone https://github.com/aaron-alderman/worldwrightio.git worldwright
cd worldwright
node --version
node tooling/compose-world.mjs worlds/my-world --features reader,sources
cd worlds/my-world
node build.mjs
node --test build.test.mjs
node serve.mjs
```

Use a new destination name if it already exists. Open the local URL printed by the preview server. Stop the server with Ctrl+C when you finish. These build, test and preview commands run inside your generated world. The framework repository has a separate, broader qualification suite.

These commands need Node, without an npm installation or dependency download. If npm is available, the equivalent package scripts are `npm run build`, `npm test` and `npm run dev`.

Give your coding agent a concrete brief:

```text
Read AGENTS.md, docs/operating-model.md, docs/bring-your-own-agent.md
and docs/composition.md in the Worldwright checkout.
Help me build [purpose] for [audience], using [my material].
Start with reader and sources and a few original places.
Use the composer and the existing source contracts. Keep the Temple
seed, admission checks and execution budget unchanged.
Author canonical source, never generated dist. Attribute sources and
keep fictional examples separate from evidence. Build, test, inspect
the local result and explain the files I will maintain.
Do not publish, connect paid services or spend money without my
explicit authorization. Stop when [small acceptance criteria] pass.
```

The [composition guide](composition.html) lists packs and their source contracts. [Tidepool](../examples/tidepool/index.html) demonstrates the kitchen sink; the [Night Seed Library](../examples/seed-library/index.html) demonstrates an original world using only reader, sources and claims. Use examples to understand the pattern and bring your own identity, writing and graphics.

## Know what you own and edit

| File or record | What it is for |
| --- | --- |
| source/world.rel | Identity, purpose, places, choices, sources and feature mounts |
| source/presentation.rel | Ordered presentation rules |
| Selected source/*.rel files | Pack-specific configuration |
| composition-receipt.json | Selected features, owned inputs, hashes and permissions at composition time |
| dist/build-receipt.json | Inputs, outputs and execution observations for a build |
| dist/ | Generated output; rebuild it from the source |

The current source files remain the authoring owners. A composition receipt records its creation basis; later source edits need a new build and current build receipt. Browser notes and remembered visits are local conveniences, separate from the world's authored source. They are not a backup of your project or a durable agent memory.

## Keep your world and agent context manageable

Save your world in its own repository or a reliable backup. The framework checkout ignores its worlds/ directory, so committing the framework does not back up the world you created there. Ask your agent to set up version control for the generated directory, check what will be included and save a known-good version before larger changes. Keep credentials, personal material you do not intend to publish and local state out of public commits.

Keep a short AGENTS.md or the equivalent instruction file in your own world. Record its purpose and audience, canonical source owners, build/test commands, allowed scope and spending/publication boundaries. Use brief working notes for current decisions, source references, known failures and the next small task. A new chat should be able to continue from those files without needing your entire conversation history.

For each change, state the result you want, review the source diff, run the relevant required checks and inspect the result. Commit a working version when appropriate. If a change fails, keep the diagnostic and return to a known-good source version rather than patching generated HTML until it looks right.

Use this maintenance brief:

```text
Read this world's AGENTS.md and current working notes.
Change only [specific result]. Identify the source owner first.
Preserve unrelated work. Show the diff, the checks run and any limits.
Update the working notes so another session can continue.
Do not publish or incur new charges without my explicit authorization.
```

## Add features and update deliberately

Before recomposition, save a complete known-good version, including custom assets and any local code changes. From the framework checkout, an existing composed world can add an atlas with:

```sh
node tooling/compose-world.mjs worlds/my-world --features reader,sources,atlas --replace
cd worlds/my-world
node build.mjs
node --test build.test.mjs
```

The composer preserves receipt-owned facts and assets for surviving selected owners. Removed packs and their payloads leave the new composition. Pack code is refreshed from the selected framework checkout; local edits to its process modules or other code are not promised to survive. Review the diff and use your backup to recover or deliberately reapply custom work. An explicit profile can replace retained source, so review profile files too.

For a framework update, record the version or commit you used, review the changes and try them in a separate directory before replacing your working world. Recomposition is not a universal migration or merge system. If you have a source-control conflict, ask the agent to explain and preserve both people's work before proceeding.

Publishing is a separate decision. Choose your own repository, host, domain, audience and budget; review the source and content that will become public. Local preview does not automatically provide a hosted subdomain or a managed API service.

## Keep costs down without losing the result

Begin with a budget for time, provider usage or spending, and a small completion test. Use the provider's real controls when available; an instruction in a chat is not a billing limit. If the agent cannot observe the cost, ask it to say so and agree on a bounded amount of work before checking the provider dashboard yourself.

### Use what you already have

Use the tools and access you already have; check their actual limits before buying more. BYO means you manage your own access and costs, not that every model call is free.

### Read focused context

Give the agent the relevant question and files. Search first and read the needed passages instead of attaching a whole repository or long chat history repeatedly.

### Verify mechanically

Start with the few packs you need. Use local builds, search and tests for mechanical checks instead of asking a model to repeatedly guess whether something works.

### Choose inference by its result

Match model capability to the task. Try lower-cost inference for well-bounded work and evaluate its result; use more capable inference when the task's ambiguity or consequences justify it. Fastest, cheapest and best are measured tradeoffs, not a universal model ranking.

### Agree when the task is done

Define what counts as done. Avoid repeated full rewrites, cosmetic churn and extra agents or tool calls that do not resolve a specific need. Run required checks, and repeat or broaden them when a change, failure or unresolved concern warrants it.

### Leave a small handover

Save small handover notes and working source versions so a future session can continue with focused context.

Compare real tasks by successful outcome, quality, elapsed time and total cost, including retries and corrections. A low token price can still lead to expensive rework. For Codex, usage varies with the model, task, context and tools; consult the [current official usage and pricing guidance](https://learn.chatgpt.com/docs/pricing) and your usage dashboard. This guide deliberately does not promise fixed plan allowances or quote model prices.

## If you get stuck

If a source cannot be opened, supply the relevant permitted excerpt and mark the limit. If a build fails, keep the command and first useful diagnostic and ask the agent to locate the owning source. If a destination exists, choose another directory or back up and deliberately recompose it. If a tool cannot write files or run commands, continue the read-only conversation or choose a coding environment with those capabilities.

You can do the work yourself with the free material. Paid hands-on setup and in-person training are optional help; voluntary fair contributions support the shared work. See [the operating model](operating-model.html).
