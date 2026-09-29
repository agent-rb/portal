# Explore opens an open-source chat

Research date: 29 September 2026.

## Shipped

Explore links to `/explore`. The thread is assistant-ui, styled with this portal's type and colors. Replies stream from the free anonymous model in `visitorAssistant.model` (`pollinations/openai`, gpt-oss-20b). There is no API key and no charge, so the $5 monthly budget is not spent by this chat. A paid model string in that field is refused. The conversation stays in the browser tab.

Explore should open a chat. The thread itself should come from an existing open-source kit. This portal should own the page, the theme, and the model route.

Nothing in this note is built yet. No package, route, or button change lands until these slices are accepted.

## Verdicts

1. **UI: [assistant-ui](https://github.com/assistant-ui/assistant-ui).** Use its thread primitives and style them with this portal's classes. Do not drop in the stock ChatGPT skin unchanged.
2. **Runtime: Vercel AI SDK, through assistant-ui's free local runtime.** One in-memory thread per browser tab. [Assistant Cloud](https://www.assistant-ui.com/docs/runtimes/concepts/threads) stays out. It is the paid path for hosted history.
3. **Explore: a link to `/explore`.** The "Stay tuned" label stays only when `visitorAssistant.enabled` is false.

## What the button does today

[`src/components/sections/hero.tsx`](../../src/components/sections/hero.tsx) is already a client component. Explore does not navigate. The click sets `held` and replaces the label with `contentConfig.hero.action.message`, which is "Stay tuned".

[`src/config/agents.ts`](../../src/config/agents.ts) already describes the assistant that button should reach:

- `visitorAssistant.enabled` is true
- model string is `openai/gpt-4o-mini`
- rate limit is 20 requests per 60 seconds

There is no `/explore` page, no chat component, and no `app/api` route. `package.json` has no AI SDK and no chat UI. There is no `components.json`, so shadcn is not initialized.

## Why assistant-ui

The acceptable bar was a ChatGPT-shaped thread (composer, streaming markdown, stop, scroll-follow), a client island, MIT or Apache-2.0, and theming from the tokens already in [`src/app/globals.css`](../../src/app/globals.css).

| Kit | License | What you get | Fit |
| --- | --- | --- | --- |
| assistant-ui `@assistant-ui/react` | MIT, copyright AgentbaseAI | Thread, composer, streaming, cancel, empty state, in-memory runtime | Adopt the primitives |
| AI Elements | Apache-2.0 | shadcn copies of conversation, message, prompt input, wired to `useChat` | Decline for this repo |
| prompt-kit | MIT | Small shadcn blocks: prompt input, message, markdown, scroll button | Decline for the first thread |
| Vercel AI Chatbot template | MIT reference app | A whole Next.js chat product | Checklist only |

assistant-ui meets the behavior bar in the library rather than in code we would write. [`LocalRuntime`](https://www.assistant-ui.com/docs/runtimes/custom/local-runtime) keeps messages, cancellation, and a single thread in memory after you supply one `run` function. [`ThreadPrimitive`](https://www.assistant-ui.com/docs/primitives/thread) is the scrollable transcript, empty state, and scroll-to-bottom control, and the docs say the layout and styling are ours. The AI SDK adapter `@assistant-ui/react-ai-sdk` connects that runtime to `useChat` and a streaming route. Current docs target AI SDK v6.

That is enough for one public visit. Multi-thread history is a later choice. The free runtime does not require Assistant Cloud.

### Why the others lost

**AI Elements** is the right kit inside a project that already uses shadcn. Components are copied in with the shadcn CLI, and the registry expects shadcn's CSS-variable theme. This portal's colors live as its own custom properties (`--bg-primary`, `--text-primary`, `--accent`). Initializing shadcn would add a second set of primitives (button, input, tooltip) beside the ones this site already styles by hand. The chat would then have to be translated back onto the portal tokens.

**prompt-kit** has the same prerequisite. The [install path](https://github.com/ibelick/prompt-kit) is `npx shadcn@latest add prompt-kit/[component]` after shadcn itself is set up. The pieces are real (prompt input, message, markdown, scroll button) and the license is MIT. They do not include the thread runtime. Streaming, stop, and retry would still be written here. That is the wheel the button was not supposed to reinvent.

**The Vercel chatbot template** is a behavior reference: streaming markdown, a composer, and a route that calls `streamText`. Merging that app into this repo would replace the portal's layout and theme.

These are complete products or the wrong stack, so they do not open from Explore:

- LibreChat, Open WebUI, and LobeChat are hosted ChatGPT applications. They would be a second site.
- CopilotKit is an in-app agent shell, larger than one public thread.
- Chainlit is a Python server. This site is Next.js 16.

## How Explore should be wired

Checked against the Next.js 16 route-handler guide in `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`. A route file supports `POST`. A route file cannot sit in the same folder as a `page.tsx`. The chat page and the stream handler are different segments, so that rule is satisfied.

```text
src/components/sections/hero.tsx          Link to /explore, or "Stay tuned" when disabled
src/app/(portal)/explore/page.tsx         Server page, navbar and footer from the portal layout
src/components/explore/thread.tsx         "use client" assistant-ui thread
src/app/api/chat/route.ts                 POST, streams the model reply
```

[`src/app/(portal)/layout.tsx`](../../src/app/(portal)/layout.tsx) already wraps children with the navbar and footer. `/explore` belongs in that group so the chat is a portal page, not a second chrome.

The home page stays a Server Component. The hero is already `"use client"`, so changing the button to a link does not add a client boundary. When `visitorAssistant.enabled` is false, the control stays a button, shows "Stay tuned", and does not navigate. Leaving the chat and returning home then shows "Explore" again, because the label is no longer local state on the hero.

The browser must not choose the model. `route.ts` reads `agentConfig.visitorAssistant.model` and ignores any model field on the request. The provider key stays in an environment variable.

The rate limit in config is 20 requests per 60 seconds. The config does not say per visitor. The route has to count by client address, or one busy client can spend the whole window for everyone. A limited response returns a status the thread can show, and the composer stays usable for a retry.

The first version stores nothing. Refreshing the tab clears the thread. That matches `LocalRuntime` without cloud.

### Look

The thread uses the portal type, the existing color tokens, and the same column width as the other portal pages (`max-w-3xl` on the home hero, `max-w-5xl` on the catalog). The composer is the existing pill, not a stock ChatGPT input. Assistant and visitor messages are text on the canvas. Code blocks use the mono font already loaded in the root layout.

assistant-ui's registry `Thread` ships with its own Tailwind look. Using that file unchanged would put a second visual system on the page. The implementation composes `ThreadPrimitive` and passes portal classes. The registry thread is only the list of behaviors to keep: multiline composer, Enter to send, Shift+Enter for a newline, stop while a reply is streaming, scroll that follows the reply, and an empty state before the first message.

Streaming markdown must not move focus on every token. The composer label is explicit. The hero's current `aria-live` swap is the wrong pattern for a stream and goes away with the button.

## Cost

The UI packages are free. The model is not.

OpenAI lists gpt-4o-mini at $0.15 per million input tokens and $0.60 per million output tokens ([model page](https://developers.openai.com/api/docs/models/gpt-4o-mini)). `costBudgetPerMonth` is $5.

A short public reply, about 2,000 input tokens and 500 output tokens, is about $0.0006. Five dollars covers on the order of 8,000 such replies a month. A visitor who hits the rate limit for a full minute spends about a cent. The limit stops a burst. It does not, by itself, stop a month of bursts from crossing $5. The route should stop calling the model once that shared monthly budget is spent, and the thread should say so.

The model string `openai/gpt-4o-mini` is the gateway form already used everywhere in `agentConfig`. The route uses that string. It does not hardcode a different model to save money unless the budget note is updated first.

## What the kit owns, and what config owns

| Concern | Owner |
| --- | --- |
| Thread, composer, streaming display, stop, scroll, empty state | assistant-ui primitives |
| Colors, type, column, pills | portal classes and `globals.css` |
| Model, on/off, rate limit | `agentConfig.visitorAssistant` |
| Monthly budget | `agentConfig.costBudgetPerMonth` (shared across agents) |
| System prompt and the assistant's name | `contentConfig`, when the first slice needs a sentence of instruction |
| Accounts, saved transcripts, Assistant Cloud | out of scope |

## Follow-on slices

1. **Route and button.** Explore links to `/explore` when the assistant is enabled. The page renders inside the portal layout. No model call yet.
2. **Themed thread.** Client component built from assistant-ui primitives, using portal classes. Empty state and composer are enough to judge the look.
3. **Streaming route with the rate limit.** `POST /api/chat` calls the configured model, streams tokens into the thread, refuses a client-supplied model name, and enforces 20 requests per 60 seconds per address. It also stops once `costBudgetPerMonth` is spent.
4. **Empty and error states.** Empty thread before the first message, a failed reply, and a rate-limited or budget reply, each with a retry that leaves the composer usable.

Each slice is shippable on its own. Slice 3 is the first one that needs an API key and can spend the $5 budget.
