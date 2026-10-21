export type AtsGuideFaq = {
  question: string
  answer: string
}

export type AtsGuide = {
  slug: string
  /** Applicant tracking system name, e.g. "Greenhouse". */
  name: string
  title: string
  description: string
  datePublished: string
  dateModified: string
  /** Where these application forms live, so readers can recognise one. */
  urlPattern: string
  /** One line for the hub page list. */
  summary: string
  intro: string[]
  /** What Filler filled on a live form when we tested it. */
  fills: string[]
  /** What it left for the applicant, and why. */
  leaves: string[]
  tips: string[]
  faqs: AtsGuideFaq[]
}

const TESTED = "2026-10-21"

export const ATS_GUIDES: AtsGuide[] = [
  {
    slug: "greenhouse",
    summary: "first and last name, email, phone, city and LinkedIn",
    name: "Greenhouse",
    title: "Greenhouse autofill: fill Greenhouse job applications in one click",
    description:
      "Free Chrome extension that fills Greenhouse job applications from a profile you save once: name, email, phone, location, LinkedIn. Tested on a live Greenhouse form.",
    datePublished: TESTED,
    dateModified: TESTED,
    urlPattern: "job-boards.greenhouse.io/<company>/jobs/<id> or boards.greenhouse.io",
    intro: [
      "Greenhouse runs the application form for thousands of tech companies. If a job link goes to job-boards.greenhouse.io or boards.greenhouse.io, you're filling the same form every time: first name, last name, email, phone, location, LinkedIn, then a few company questions.",
      "Filler fills the repeat parts from a profile you save once. You check the answers, attach your resume, and press Submit yourself."
    ],
    fills: [
      "First name and last name (split from the full name in your profile)",
      "Email",
      "Country and phone number",
      "Location (city)",
      "LinkedIn profile",
      "\"How did you hear about this job?\" when your profile has an answer"
    ],
    leaves: [
      "Resume and cover letter uploads. Filler never touches file uploads.",
      "Yes/no dropdowns such as work authorization and relocation. Greenhouse builds these as custom menus Filler can't open yet.",
      "Voluntary self-identification questions (gender, race, veteran status, disability). These are yours to answer, so Filler never guesses them.",
      "Long \"Why do you want to work here?\" questions, unless you've saved an answer Filler can reuse."
    ],
    tips: [
      "Save your full name once. Filler splits it into the separate first and last name boxes Greenhouse uses.",
      "Add a \"How did you hear about us\" answer to your profile; Greenhouse forms ask it constantly.",
      "Scroll the whole form after you click Fill. Greenhouse puts the dropdown questions and the self-identification section near the bottom."
    ],
    faqs: [
      {
        question: "How is this different from MyGreenhouse autofill?",
        answer:
          "MyGreenhouse is Greenhouse's own candidate account and only works on Greenhouse forms. Filler needs no account and uses the same profile on Lever, Ashby, Google Forms and other sites too. Use whichever you like; you review every field either way."
      },
      {
        question: "Will Filler submit my Greenhouse application?",
        answer: "No. Filler only fills fields. You read the form and press Submit yourself."
      },
      {
        question: "Do I need an account?",
        answer:
          "No. Filler has no account. Your profile is stored in your browser and is sent to Filler's server only when you click Fill, to work out which answer goes where."
      }
    ]
  },
  {
    slug: "lever",
    summary: "full name, pronouns, email, phone, current company and links",
    name: "Lever",
    title: "Lever autofill: fill Lever job applications in one click",
    description:
      "Free Chrome extension that fills Lever job applications (jobs.lever.co) from a profile you save once: name, email, phone, company, links, pronouns. Tested on a live Lever form.",
    datePublished: TESTED,
    dateModified: TESTED,
    urlPattern: "jobs.lever.co/<company>/<id>/apply",
    intro: [
      "Lever hosts application forms at jobs.lever.co. Every one starts with the same block: full name, pronouns, email, phone, current location, current company, then links to LinkedIn, GitHub and a portfolio.",
      "Filler fills that block from a profile you save once, in a few seconds. You attach your resume, check the answers, and press Submit yourself."
    ],
    fills: [
      "Full name",
      "Pronouns, when they're in your profile",
      "Email and phone",
      "Current location and current company",
      "LinkedIn, portfolio and other website links",
      "Country dropdowns"
    ],
    leaves: [
      "Resume upload. Filler never touches file uploads.",
      "Equal opportunity questions (gender, race, veteran status, disability). Filler leaves these for you.",
      "Consent checkboxes, such as permission to contact you about future roles.",
      "Links that aren't in your profile. Filler leaves the box empty instead of making one up."
    ],
    tips: [
      "Lever asks for your current company on most forms, so add it to your profile.",
      "Save your links (LinkedIn, GitHub, portfolio) as full URLs, starting with https://.",
      "Lever forms often end with an \"Additional information\" box. Save a short paragraph about yourself and Filler will reuse it there."
    ],
    faqs: [
      {
        question: "Does this work on every Lever job?",
        answer:
          "Filler reads the questions on the page, so it works on the standard Lever form and on most company-specific questions. If a field can't be answered from your profile, Filler leaves it empty."
      },
      {
        question: "Will Filler submit my Lever application?",
        answer: "No. Filler only fills fields. You read the form and press Submit yourself."
      },
      {
        question: "Is it free?",
        answer: "Yes. Filler is a free Chrome extension, with no account and no daily limit."
      }
    ]
  },
  {
    slug: "ashby",
    summary: "name, email, LinkedIn, location and answers you've saved",
    name: "Ashby",
    title: "Ashby autofill: fill Ashby job applications in one click",
    description:
      "Free Chrome extension that fills Ashby job applications (jobs.ashbyhq.com) from a profile you save once: name, email, LinkedIn, location. Tested on a live Ashby form.",
    datePublished: TESTED,
    dateModified: TESTED,
    urlPattern: "jobs.ashbyhq.com/<company>/<id>/application",
    intro: [
      "Ashby is the applicant tracking system behind many startups' job pages. Its application forms live at jobs.ashbyhq.com and start with name, email and profile links, followed by the company's own questions.",
      "Filler fills the standard fields from a profile you save once. You answer the company-specific questions, attach your resume, and press Submit yourself."
    ],
    fills: [
      "Name",
      "Email",
      "LinkedIn",
      "\"What country are you based in?\" and other location questions",
      "Long questions you've already answered before, when you saved that answer in your profile"
    ],
    leaves: [
      "Resume upload. Filler never touches file uploads.",
      "GitHub, X or other links that aren't in your profile. Filler leaves them empty instead of guessing.",
      "Open questions you've never answered, like \"What would you want to work on?\". Write those yourself.",
      "Referral and notice-period questions when your profile doesn't say."
    ],
    tips: [
      "Startups on Ashby often ask for GitHub and X. Add them to your profile if you have them.",
      "Save answers you're happy with, such as a short \"about me\" or why you like small teams. Filler reuses them when a similar question shows up."
    ],
    faqs: [
      {
        question: "Does Filler write my answers to Ashby's long questions?",
        answer:
          "Only from text you've saved. Filler won't invent experience you don't have, so new open-ended questions are left for you."
      },
      {
        question: "Will Filler submit my Ashby application?",
        answer: "No. Filler only fills fields. You read the form and press Submit yourself."
      },
      {
        question: "Do I need an account?",
        answer:
          "No. Your profile is stored in your browser. It's sent to Filler's server only when you click Fill, to match answers to questions."
      }
    ]
  }
]

export function getAtsGuide(slug: string): AtsGuide | undefined {
  return ATS_GUIDES.find((guide) => guide.slug === slug)
}
