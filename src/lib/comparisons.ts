// Comparison pages (/vs/<slug>, /alternatives/simplify-copilot, /best/job-application-autofill).
// Facts about other tools come from their own sites and 2026 reviews, checked in October 2026.
// Where prices were only reported by third parties, the copy says "reported".

export type ComparisonRow = {
  feature: string
  filler: string
  them: string
}

export type Comparison = {
  slug: string
  name: string
  site: string
  /** One line for lists: what the tool is. */
  oneLine: string
  title: string
  description: string
  summary: string[]
  rows: ComparisonRow[]
  /** Where the other tool is the better pick. */
  better: string[]
  /** Where Filler is the better pick. */
  ours: string[]
  faqs: { question: string; answer: string }[]
}

export const CHECKED = "2026-10-23"

const ACCOUNT_ROW = (them: string): ComparisonRow => ({
  feature: "Account needed",
  filler: "No. Your profile stays in your browser",
  them
})

const ANY_FORM_ROW = (them: string): ComparisonRow => ({
  feature: "Works outside job sites",
  filler: "Yes: Google Forms, signups, applications, any web form",
  them
})

const SUBMIT_ROW = (them: string): ComparisonRow => ({
  feature: "Who presses Submit",
  filler: "You, after checking every field",
  them
})

export const COMPARISONS: Comparison[] = [
  {
    slug: "simplify",
    name: "Simplify Copilot",
    site: "simplify.jobs",
    oneLine: "job-application autofill with a job board and tracker; Simplify+ adds AI writing",
    title: "Filler vs Simplify Copilot: free autofill without an account",
    description:
      "Filler or Simplify Copilot? Both autofill job applications for free. Simplify needs an account and sells Simplify+ (reported $39.99/month); Filler needs no account and fills any web form.",
    summary: [
      "Simplify Copilot is the best-known job application autofill. It's free, but it needs a Simplify account, and its AI writing sits in Simplify+, reported at $39.99 a month (or $19.99 a week).",
      "Filler fills the same repeat questions from a profile kept in your browser, with no account, and also works on forms that aren't job applications."
    ],
    rows: [
      { feature: "Autofill price", filler: "Free", them: "Free" },
      ACCOUNT_ROW("Yes, a Simplify account"),
      {
        feature: "AI answers to custom questions",
        filler: "Job Hunt Pass, $5 for 30 days, never renews (coming soon)",
        them: "Simplify+, reported $39.99/month or $19.99/week"
      },
      ANY_FORM_ROW("Built for job applications"),
      { feature: "Job board and application tracker", filler: "No", them: "Yes" },
      SUBMIT_ROW("You (an Autopilot beta submits for some Simplify+ members)")
    ],
    better: [
      "You want a job board, saved jobs and an application tracker in the same tool.",
      "You already use Simplify and are happy with an account holding your data."
    ],
    ours: [
      "You don't want an account or your profile on someone else's server.",
      "You also fill forms that aren't job applications: Google Forms, signups, registrations.",
      "You want AI help for a few weeks without a monthly subscription."
    ],
    faqs: [
      {
        question: "Is Simplify Copilot free?",
        answer:
          "Its autofill is free with a Simplify account. Reviews report Simplify+ (AI resume and answer writing) at $39.99 a month, $19.99 a week or $89.99 for three months. Check simplify.jobs for current prices."
      },
      {
        question: "Can I use Filler and Simplify together?",
        answer:
          "Yes, but turn one off on a given form so they don't fill the same fields twice."
      },
      {
        question: "Is Filler affiliated with Simplify?",
        answer: "No. Simplify is a trademark of its owner."
      }
    ]
  },
  {
    slug: "jobright",
    name: "Jobright",
    site: "jobright.ai",
    oneLine: "AI job matching with an autofill extension; free tier limits daily autofills",
    title: "Filler vs Jobright: autofill without daily limits or a subscription",
    description:
      "Filler or Jobright? Jobright is an AI job-matching app whose free plan reportedly caps autofill; Turbo is reported at $39.99/month. Filler autofills any form, free, no account.",
    summary: [
      "Jobright is an AI job search app: it recommends jobs, tailors resumes and has an autofill extension. Reviews report the free plan caps one-click autofill at a few a day, with unlimited use on Turbo at about $39.99 a month.",
      "Filler only does the filling, with no daily cap and no account."
    ],
    rows: [
      { feature: "Autofill price", filler: "Free, no daily cap", them: "Free plan reportedly capped (about 4 a day); unlimited on Turbo" },
      ACCOUNT_ROW("Yes"),
      {
        feature: "Paid plan",
        filler: "Job Hunt Pass, $5 for 30 days, never renews (coming soon)",
        them: "Turbo, reported $39.99/month"
      },
      { feature: "Job matching and resume tailoring", filler: "No", them: "Yes" },
      ANY_FORM_ROW("Built for job applications"),
      SUBMIT_ROW("You")
    ],
    better: [
      "You want an app that finds and ranks jobs for you and rewrites your resume per job.",
    ],
    ours: [
      "You already know where you're applying and only want the forms filled.",
      "You apply to more than a handful of jobs a day and don't want a cap or a subscription.",
      "You don't want an account."
    ],
    faqs: [
      {
        question: "Does Jobright limit autofill on the free plan?",
        answer:
          "Reviews in 2026 report a cap of about 4 one-click autofills a day on the free plan, with unlimited autofill on Turbo. Jobright shows its plans inside the app, so check there."
      },
      {
        question: "Is Filler affiliated with Jobright?",
        answer: "No. Jobright is a trademark of its owner."
      }
    ]
  },
  {
    slug: "magical",
    name: "Magical",
    site: "getmagical.com",
    oneLine: "text expander and autofill for repetitive work across many apps",
    title: "Filler vs Magical: form autofill that reads the question",
    description:
      "Filler or Magical? Magical is a text expander and workflow autofill for teams; Filler fills web forms from one saved profile, free, no account.",
    summary: [
      "Magical is a text expander with autofill: you build snippets and shortcuts, and it moves data between tabs and apps. It suits support, sales and recruiting teams who repeat the same steps all day. Its pricing has changed over time; check getmagical.com for the current plans.",
      "Filler doesn't use snippets. You save one profile, open a form, click Fill, and it matches each question to your details, even when the label is worded differently."
    ],
    rows: [
      { feature: "How you set it up", filler: "Save one profile", them: "Build snippets and shortcuts" },
      ACCOUNT_ROW("Yes"),
      { feature: "Text expansion in any text box", filler: "No", them: "Yes" },
      { feature: "Moves data between tabs and apps", filler: "No", them: "Yes" },
      ANY_FORM_ROW("Yes"),
      { feature: "Price", filler: "Free", them: "See getmagical.com (plans have changed)" }
    ],
    better: [
      "You type the same replies all day and want text shortcuts everywhere.",
      "Your team moves data from one app into another as a daily workflow."
    ],
    ours: [
      "You fill forms (applications, signups, Google Forms) and don't want to build snippets.",
      "You want something that works the first time, with no account."
    ],
    faqs: [
      {
        question: "Is Filler a text expander?",
        answer:
          "No. Filler fills whole forms from your saved profile. If you want typed shortcuts that expand into text, Magical or Text Blaze are built for that."
      },
      {
        question: "Is Filler affiliated with Magical?",
        answer: "No. Magical is a trademark of its owner."
      }
    ]
  },
  {
    slug: "lazyapply",
    name: "LazyApply",
    site: "lazyapply.com",
    oneLine: "auto-apply bot that submits applications in bulk",
    title: "Filler vs LazyApply: autofill you check, not an auto-apply bot",
    description:
      "Filler or LazyApply? LazyApply submits applications for you in bulk on paid plans. Filler fills the form for free and you check every answer before you submit.",
    summary: [
      "LazyApply is an auto-apply bot: it fills and submits applications in bulk, mostly on LinkedIn, Indeed and similar boards. It's paid, with plans reported from about $99, and reviews often complain about generic answers.",
      "Filler fills the form and stops. You read every field and press Submit yourself, so each application still looks like you wrote it."
    ],
    rows: [
      { feature: "Price", filler: "Free", them: "Paid plans, reported from about $99" },
      SUBMIT_ROW("The bot, in bulk"),
      ACCOUNT_ROW("Yes"),
      ANY_FORM_ROW("Built for job boards"),
      { feature: "Applications per day", filler: "As many as you fill", them: "Plan-limited, built for volume" },
      { feature: "Risk to your job-board account", filler: "None: nothing is automated after you click Fill", them: "Heavy automation may break some sites' terms" }
    ],
    better: [
      "You want volume above everything and are fine with a bot submitting for you."
    ],
    ours: [
      "You want every application checked by you before it goes out.",
      "You don't want to pay for a bot or risk your LinkedIn account.",
      "You also fill forms that aren't job applications."
    ],
    faqs: [
      {
        question: "Does Filler submit applications for me?",
        answer:
          "No, on purpose. It fills the fields, then you check them and press Submit. Recruiters can tell generic bot answers apart."
      },
      {
        question: "Is Filler affiliated with LazyApply?",
        answer: "No. LazyApply is a trademark of its owner."
      }
    ]
  }
]

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((comparison) => comparison.slug === slug)
}
