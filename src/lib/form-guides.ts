export type FormGuideField = {
  label: string
  required: boolean
  tip: string
}

export type FormGuideSection = {
  title: string
  fields: FormGuideField[]
}

export type FormGuideFaq = {
  question: string
  answer: string
}

export type FormGuideSource = {
  label: string
  url: string
}

export type FormGuide = {
  slug: string
  /** Short form name used in breadcrumbs and CTAs, e.g. "NPI application". */
  name: string
  title: string
  description: string
  datePublished: string
  dateModified: string
  intro: string[]
  /** Where the form is filled online — the version Filler can fill. */
  onlineForm: { label: string; url: string }
  /** Paper/PDF alternative, if one exists. Filler does not fill PDFs. */
  paperForm?: { label: string; url: string; note: string }
  beforeYouStart: string[]
  sections: FormGuideSection[]
  steps: string[]
  mistakes: string[]
  faqs: FormGuideFaq[]
  sources: FormGuideSource[]
}

const NPI_APPLICATION: FormGuide = {
  slug: "npi-application",
  name: "NPI application",
  title: "NPI application: how to fill it out, field by field",
  description:
    "Step-by-step guide to the NPI application on NPPES. What every field asks, what to put for endpoint, taxonomy codes, Type 1 vs Type 2, and the paper CMS-10114 form.",
  datePublished: "2026-09-26",
  dateModified: "2026-09-26",
  intro: [
    "A National Provider Identifier (NPI) is the 10-digit number every HIPAA-covered health care provider uses on claims and records. You apply once through NPPES, the CMS enumeration system, and the number stays with you through job and address changes.",
    "The online application is the fastest route. This guide walks through each section of it, what each field actually wants, and the fields people get stuck on — especially taxonomy codes and the optional endpoint section."
  ],
  onlineForm: {
    label: "NPPES (nppes.cms.hhs.gov)",
    url: "https://nppes.cms.hhs.gov/"
  },
  paperForm: {
    label: "CMS-10114 paper form (PDF)",
    url: "https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms10114.pdf",
    note: "Mail the completed, signed form to CMS NPI Enumerator Services, Mail Stop DO-01-51, 7500 Security Blvd., Baltimore, MD 21244. Paper takes longer than applying online."
  },
  beforeYouStart: [
    "An Identity & Access (I&A) account. NPPES logs you in through I&A, so create that account first.",
    "Your entity type. Type 1 is an individual provider (physician, nurse, therapist, pharmacist — including sole proprietors). Type 2 is an organization (hospital, group practice, pharmacy, lab). An individual gets only one NPI.",
    "Your SSN, or ITIN if you are not eligible for an SSN. Your name and date of birth must match Social Security records. Without either, you need 2 proofs of identity.",
    "Your 10-digit taxonomy code for your specialty, plus your state license number and issuing state.",
    "Your business mailing address and primary practice location. Do not use your home address unless it is also your business address."
  ],
  sections: [
    {
      title: "Profile information (Type 1)",
      fields: [
        {
          label: "Legal name",
          required: true,
          tip: "Full legal first and last name. No initials or abbreviations. It must match SSA records if you give an SSN."
        },
        {
          label: "Other name",
          required: false,
          tip: "Former or professional names, such as a maiden name. Skip if you have only used one name."
        },
        {
          label: "SSN or ITIN",
          required: false,
          tip: "Optional, but strongly recommended. Without an SSN or ITIN you must send 2 proofs of identity and processing may be delayed. Use an ITIN only if you do not qualify for an SSN. Never enter an EIN here."
        },
        {
          label: "Date of birth",
          required: true,
          tip: "If you give an SSN, your name and date of birth must match Social Security records, or the application can be held for review."
        },
        {
          label: "Credential",
          required: false,
          tip: "Letters like MD, DO, RN, LCSW, PT. You can list more than one."
        }
      ]
    },
    {
      title: "Addresses",
      fields: [
        {
          label: "Mailing address",
          required: true,
          tip: "Where CMS can reach you about the application, with a phone number you actually answer."
        },
        {
          label: "Primary practice location",
          required: true,
          tip: "The address and phone of your main practice. This is public on the NPI Registry, so use a business address."
        },
        {
          label: "Secondary practice locations",
          required: false,
          tip: "Add other locations online. The paper form only takes one primary location."
        }
      ]
    },
    {
      title: "Taxonomy and licenses",
      fields: [
        {
          label: "Taxonomy code",
          required: true,
          tip: "A 10-character code for your provider type and specialty, e.g. 363LF0000X for a family nurse practitioner. Pick one as primary. Search the NUCC taxonomy list rather than guessing."
        },
        {
          label: "License number and state",
          required: true,
          tip: "Required for licensed practitioners. The same license can cover several taxonomies. Residents without a license can use the student taxonomy code."
        },
        {
          label: "Other identifiers",
          required: false,
          tip: "Existing health plan IDs such as a Medicaid number. Optional, and it helps payers match your records."
        }
      ]
    },
    {
      title: "Endpoints (Health Information Exchange)",
      fields: [
        {
          label: "Endpoint",
          required: false,
          tip: "Optional. An endpoint is a secure address other providers use to send you health data — a Direct messaging address or a FHIR URL, usually issued by your EHR vendor. It is not your regular email. If you do not have one, leave it blank and add it later."
        },
        {
          label: "Endpoint type and location",
          required: false,
          tip: "Only if you add an endpoint: pick the type (Direct, FHIR, REST, SOAP, other) and the practice location it belongs to."
        }
      ]
    },
    {
      title: "Contact person and certification",
      fields: [
        {
          label: "Contact person",
          required: true,
          tip: "Who CMS should contact with questions. This person also receives the NPI notification. Often the provider, or an office manager or credentialing specialist."
        },
        {
          label: "Certification",
          required: true,
          tip: "You attest the information is true and agree to report changes within 30 days."
        }
      ]
    }
  ],
  steps: [
    "Create an I&A account and log in to NPPES.",
    "Choose to apply for a new NPI and select Type 1 (individual) or Type 2 (organization).",
    "Fill the profile section: legal name, SSN or ITIN, date of birth.",
    "Enter your mailing address and primary practice location.",
    "Add your primary taxonomy code and license number with issuing state.",
    "Add an endpoint if your EHR gave you one. Otherwise skip it.",
    "Add a contact person, review everything, certify, and submit.",
    "Watch your email. NPPES emails the NPI to the contact person you listed once it is assigned, and you can confirm it on the NPI Registry."
  ],
  mistakes: [
    "Name or date of birth that does not match Social Security records.",
    "Using a home address as the practice location. It becomes public.",
    "Choosing a taxonomy that describes your credential instead of your specialty.",
    "Entering a personal email as an endpoint. Endpoints are secure exchange addresses, not email.",
    "Applying twice. An individual gets one NPI for life. Update the existing record instead.",
    "Forgetting to update NPPES within 30 days of a move or license change."
  ],
  faqs: [
    {
      question: "How long does an NPI application take?",
      answer:
        "Turnaround is typically 1 to 20 days. Applying online through NPPES is the fastest route. Paper applications take longer."
    },
    {
      question: "What do I put for endpoint on the NPI application?",
      answer:
        "The endpoint is optional. It is a secure address for exchanging health information, such as a Direct messaging address or FHIR URL from your EHR vendor. It is not your email. Leave it blank if you do not have one and add it later."
    },
    {
      question: "Is there a fee to apply for an NPI?",
      answer: "No. CMS does not charge to get an NPI, whether you apply online or on paper."
    },
    {
      question: "Type 1 or Type 2 NPI?",
      answer:
        "Type 1 is for individual providers, including sole proprietors. Type 2 is for organizations such as group practices, hospitals, and pharmacies. An incorporated individual can hold a Type 1 for themselves and a Type 2 for their corporation."
    },
    {
      question: "Can I still apply on paper?",
      answer:
        "Yes. Download CMS-10114, fill it in blue or black ink, sign it, and mail it to CMS NPI Enumerator Services in Baltimore. Online is faster."
    },
    {
      question: "Can Filler fill the NPI application for me?",
      answer:
        "Filler fills the online NPPES application from facts you save once — name, addresses, license, taxonomy — and you review every field before continuing. It does not submit forms and does not fill the paper PDF."
    }
  ],
  sources: [
    {
      label: "CMS-10114 NPI Application/Update Form and instructions",
      url: "https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms10114.pdf"
    },
    {
      label: "CMS: How to apply for an NPI",
      url: "https://www.cms.gov/medicare/regulations-guidance/administrative-simplification/how-apply"
    },
    {
      label: "CMS: there is no charge to get an NPI",
      url: "https://www.cms.gov/regulations-and-guidance/administrative-simplification/nationalprovidentstand/downloads/7-06july_message.pdf"
    },
    {
      label: "NUCC health care provider taxonomy code set",
      url: "https://taxonomy.nucc.org/"
    },
    {
      label: "NPI Registry",
      url: "https://npiregistry.cms.hhs.gov/"
    }
  ]
}

export const FORM_GUIDES: FormGuide[] = [NPI_APPLICATION]

export function getFormGuide(slug: string): FormGuide | undefined {
  return FORM_GUIDES.find((guide) => guide.slug === slug)
}
