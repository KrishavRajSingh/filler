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

const DEA_REGISTRATION: FormGuide = {
  slug: "dea-registration-form-224",
  name: "DEA Form 224",
  title: "DEA registration (Form 224): how to fill it out, field by field",
  description:
    "Step-by-step guide to DEA Form 224, the new registration for practitioners, mid-level practitioners, pharmacies and clinics. Business activity, drug schedules 2 vs 2N, state license, liability questions, MATE training and the $888 fee.",
  datePublished: "2026-10-22",
  dateModified: "2026-10-22",
  intro: [
    "Before you can prescribe or dispense controlled substances in the US, you need a DEA registration for each state you practice in. New practitioners, mid-level practitioners, hospitals, clinics and retail pharmacies apply with DEA Form 224. Renewals use Form 224a.",
    "DEA only takes the application online now. This guide covers each section in the order the form asks for it, which fields people get wrong, and what to have ready so you can do it in one sitting."
  ],
  onlineForm: {
    label: "DEA Diversion Control online application",
    url: "https://apps.deadiversion.usdoj.gov/webforms2/spring/newLogin"
  },
  beforeYouStart: [
    "An active state license, plus the state controlled substance registration if your state requires one. DEA will not register you in a state until you meet that state's requirements.",
    "Your NPI, date of birth, professional degree, school and year of graduation. Practitioners and mid-level practitioners are asked for all of them.",
    "Your SSN if you register as an individual, or the business TIN if the registration is for a business.",
    "The address where you will practice and store controlled substances. You need a separate registration for each principal place of practice, and one per state.",
    "Proof for yourself that you finished at least 8 hours of training on opioid and other substance use disorders (MATE Act). You tick a box; DEA doesn't ask for the certificates, but keep them.",
    "A card for the $888 fee. It covers 3 years and isn't refundable."
  ],
  sections: [
    {
      title: "Applicant identification",
      fields: [
        {
          label: "Individual or business registration",
          required: true,
          tip: "Individual for a single practitioner (uses your SSN). Business for a hospital, clinic, pharmacy or other facility (uses the TIN)."
        },
        {
          label: "Name",
          required: true,
          tip: "Last name, then first and middle name, as they appear on your state license. For a business, the legal business or facility name."
        },
        {
          label: "SSN or TIN",
          required: true,
          tip: "Required under the Debt Collection Improvement Act. SSN for individuals, TIN for businesses."
        },
        {
          label: "Professional degree, school, graduation year, NPI, date of birth",
          required: true,
          tip: "Only for practitioners and mid-level practitioners. Pick the degree from the list (MD, DO, DDS, NP, PA and so on). Date of birth is MM-DD-YYYY."
        },
        {
          label: "Place of business",
          required: true,
          tip: "The practice address that goes on your certificate. DEA allows a home address, but that home then becomes a controlled premises open to inspection."
        },
        {
          label: "Mailing address, phones and email",
          required: true,
          tip: "Mailing address can differ from the practice address. Use one email you will keep: DEA sends renewal reminders there 60, 45, 30, 15 and 5 days before expiry."
        },
        {
          label: "Other DEA registration numbers",
          required: true,
          tip: "Yes or no. Say yes if you already hold a registration in another state or at another location."
        }
      ]
    },
    {
      title: "Business activity",
      fields: [
        {
          label: "Business activity",
          required: true,
          tip: "Pick one. Practitioner covers MD, DO, DDS, DMD, DPM and DVM. Mid-level practitioner covers NP, PA, OD, ND, RPH and others your state lets prescribe. Pharmacies, hospitals, clinics and teaching institutions each have their own box."
        }
      ]
    },
    {
      title: "Drug schedules",
      fields: [
        {
          label: "Schedules",
          required: true,
          tip: "Tick every schedule you will prescribe or handle: 2 (narcotic), 2N (non-narcotic, e.g. stimulants), 3, 3N, 4 and 5. Without 2N you can't prescribe stimulants such as amphetamine. Only tick what your state license allows."
        },
        {
          label: "Official order forms",
          required: false,
          tip: "Tick this if you will buy schedule 2 drugs yourself, for example to stock an office. Prescribing alone doesn't need it."
        }
      ]
    },
    {
      title: "State license",
      fields: [
        {
          label: "State license number, state and expiration date",
          required: true,
          tip: "Your professional license in the state of the place of business. If your state also issues a controlled substance registration, enter both numbers. An expired or pending license stops the application."
        }
      ]
    },
    {
      title: "Liability questions",
      fields: [
        {
          label: "Questions 1 to 5",
          required: true,
          tip: "All must be answered. They ask about controlled substance convictions, exclusion from Medicare or state health programs, surrendered or revoked DEA registrations, and state license discipline or probation. Question 5 is for corporations and partnerships; mark No if it doesn't apply."
        },
        {
          label: "Explanation of yes answers",
          required: false,
          tip: "For each yes: the date, location, nature and outcome of the incident. A yes doesn't mean denial. An unexplained yes, or a no that later turns out false, causes far more trouble."
        }
      ]
    },
    {
      title: "Fee, training attestation and certification",
      fields: [
        {
          label: "Fee exemption",
          required: false,
          tip: "Only for federal, state or local government officials and institutions. Another official has to certify it. Doesn't cover contractor-run institutions."
        },
        {
          label: "MATE Act training",
          required: true,
          tip: "A one-time checkbox that you've done 8 hours of substance use disorder training (or hold a qualifying board certification or degree). Practitioners who are only veterinarians are exempt."
        },
        {
          label: "Payment",
          required: true,
          tip: "$888 for 3 years for practitioners, pharmacies, hospitals and clinics. Non-refundable, so check the schedules and state before you pay."
        },
        {
          label: "Certification",
          required: true,
          tip: "You certify that everything is true. False information on the form is a federal crime (21 USC 843(d))."
        }
      ]
    }
  ],
  steps: [
    "Get your state license, and the state controlled substance registration if your state has one.",
    "Open the DEA Diversion online application and start a new Form 224.",
    "Choose individual or business, then enter your name, SSN or TIN, degree, school, graduation year, NPI and date of birth.",
    "Enter the place of business, mailing address, phone and the email DEA should use for renewal notices.",
    "Pick one business activity and tick every drug schedule you will handle, including 2N and 3N if you need them.",
    "Enter the state license number, state and expiration date.",
    "Answer all five liability questions and explain any yes.",
    "Tick the MATE training box, pay the $888 fee, certify and submit. Check your status later on DEA's registration status page."
  ],
  mistakes: [
    "Applying before the state license or state controlled substance registration is active.",
    "Ticking schedule 2 but not 2N, then being unable to prescribe stimulants.",
    "Using a home address without knowing it becomes an inspectable controlled premises.",
    "One registration for practices in two states. Each state needs its own.",
    "Leaving liability question 5 blank because it seems not to apply. Mark No.",
    "An email you'll stop checking. Renewal reminders go there, and handling controlled substances on an expired registration is illegal."
  ],
  faqs: [
    {
      question: "How much does a DEA registration cost?",
      answer:
        "$888 for 3 years for practitioners, mid-level practitioners, pharmacies, hospitals and clinics (21 CFR 1301.13). The fee is not refundable. Government officials and institutions can be fee-exempt."
    },
    {
      question: "What is the difference between schedule 2 and 2N?",
      answer:
        "Schedule 2 covers narcotics such as oxycodone. 2N is schedule 2 non-narcotic, such as amphetamine and methylphenidate. They are separate boxes, so tick both if you will prescribe both. The same split applies to 3 and 3N."
    },
    {
      question: "Do I need a separate DEA registration for each state?",
      answer:
        "Yes. A registration is tied to a state license and a principal place of practice, so practicing in two states needs two registrations."
    },
    {
      question: "Can I apply for a DEA number on paper?",
      answer:
        "No. Since 2022 DEA requires new applications and renewals to be submitted online."
    },
    {
      question: "How do I renew my DEA registration?",
      answer:
        "With Form 224a on the DEA renewal page. DEA emails reminders 60, 45, 30, 15 and 5 days before expiry. If you renew before it expires you can keep working until DEA decides. After a month past expiry you have to file a new Form 224."
    },
    {
      question: "Can Filler fill DEA Form 224 for me?",
      answer:
        "Filler fills the text fields and dropdowns of web forms from facts you save once: name, addresses, NPI, date of birth, license number. Checkboxes like the drug schedules, the liability questions, the training attestation and payment stay with you. It never submits."
    }
  ],
  sources: [
    {
      label: "DEA Form 224 (10-20), OMB 1117-0014",
      url: "https://www.reginfo.gov/public/do/DownloadDocument?objectID=111436701"
    },
    {
      label: "21 CFR 1301.13: registration categories and fees",
      url: "https://www.ecfr.gov/current/title-21/chapter-II/subchapter-B/part-1301/subject-group-ECFR0f5a129834f0129/section-1301.13"
    },
    {
      label: "DEA Diversion: obtain or renew a registration",
      url: "https://www.deadiversion.usdoj.gov/drugreg/registration.html"
    },
    {
      label: "DEA Diversion: registration Q&A",
      url: "https://www.deadiversion.usdoj.gov/faq/registration-faq.html"
    },
    {
      label: "DEA Diversion: MATE Act training Q&A",
      url: "https://www.deadiversion.usdoj.gov/faq/MATE_Act_faq.html"
    }
  ]
}

const MEDICARE_ENROLLMENT_855I: FormGuide = {
  slug: "medicare-enrollment-cms-855i",
  name: "CMS-855I Medicare enrollment",
  title: "CMS-855I Medicare enrollment: how to fill it out, section by section",
  description:
    "Step-by-step guide to the CMS-855I Medicare enrollment application for physicians and non-physician practitioners. PECOS vs paper, specialty, practice locations, reassignment (4F), the CMS-588 EFT form and the 30-day billing window.",
  datePublished: "2026-10-23",
  dateModified: "2026-10-23",
  intro: [
    "To bill Medicare as a physician, nurse practitioner, physician assistant, therapist, psychologist or other eligible professional, you enroll with the CMS-855I. The same form handles revalidation, reactivation, changes, and reassigning your benefits to a group. The old CMS-855R reassignment form is gone; that now happens in section 4F of the 855I.",
    "You can file it online in PECOS or on paper. PECOS asks the same questions as the paper form, so this guide follows the paper sections and points out where people get stuck."
  ],
  onlineForm: {
    label: "PECOS (pecos.cms.hhs.gov)",
    url: "https://pecos.cms.hhs.gov/"
  },
  paperForm: {
    label: "CMS-855I paper form (PDF)",
    url: "https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855i.pdf",
    note: "The paper form must be typed, not handwritten. Mail it with original signatures and the supporting documents to the Medicare Administrative Contractor (MAC) for your state."
  },
  beforeYouStart: [
    "A Type 1 NPI. You need it before you enroll, and your name, SSN and date of birth must match NPPES and Social Security records exactly.",
    "An Identity & Access (I&A) account. PECOS uses the same I&A login as NPPES.",
    "Your state license number, effective date and issuing state, plus board certification and DEA registration if you have them.",
    "Your medical or professional school and year of graduation.",
    "Every practice location where you see Medicare patients, as a USPS street address (no P.O. boxes), and the date you saw or will see your first Medicare patient there.",
    "Bank details for Form CMS-588 (EFT) with a voided check or bank letter, unless you reassign all your payments to a group.",
    "If you join a group: the group's legal business name, TIN, NPI and PTAN for the reassignment in section 4F."
  ],
  sections: [
    {
      title: "Section 1: Basic information",
      fields: [
        {
          label: "Reason for submitting",
          required: true,
          tip: "Pick one: new enrollee, moving from order-and-certify only to full enrollment, enrolling with another MAC, revalidation, reactivation, change of information, or voluntary termination. A new grad joining a group is a new enrollee."
        },
        {
          label: "What information is changing",
          required: false,
          tip: "Only for changes. Tick every area that changes. Sections 1, 2A, 3 and 15 are always required on top of the section that changes."
        }
      ]
    },
    {
      title: "Section 2: Personal identifying information",
      fields: [
        {
          label: "Name, SSN, date of birth",
          required: true,
          tip: "Must match your Social Security record and NPPES exactly. Check the middle initial and suffix."
        },
        {
          label: "PTAN and NPI",
          required: true,
          tip: "NPI is required. The PTAN is your Medicare billing number; leave it blank if this is your first enrollment."
        },
        {
          label: "School and year of graduation",
          required: true,
          tip: "Your medical school, or your training institution if you are not an MD."
        },
        {
          label: "License, certification and DEA",
          required: true,
          tip: "License number, effective date and state for your primary specialty, and whether it's a compact license. For a national certification, write \"all\" as the state. Tick Not Applicable where you don't have one."
        },
        {
          label: "Accepting new patients",
          required: false,
          tip: "Optional. Your answer shows in Medicare's provider directory."
        },
        {
          label: "Correspondence and medical record addresses",
          required: true,
          tip: "Where the MAC writes to you. It can't be a billing agency's or management company's address. Tick the box to reuse it for medical record requests."
        },
        {
          label: "Specialty",
          required: true,
          tip: "Physicians mark one primary (P) and any secondary (S) specialties in 2G. Non-physicians pick exactly one type in 2H (NP, PA, CRNA, clinical social worker, PT and so on). A second primary specialty needs its own 855I."
        }
      ]
    },
    {
      title: "Section 3: Final adverse legal actions",
      fields: [
        {
          label: "Adverse legal action history",
          required: true,
          tip: "Felonies in the past 10 years, some misdemeanors, license revocations or suspensions, OIG exclusions, debarments and Medicaid terminations. Report them even if expunged or under appeal. If none apply, answer No and move on."
        }
      ]
    },
    {
      title: "Section 4: Business information",
      fields: [
        {
          label: "Private practice or reassignment",
          required: true,
          tip: "Pick one box. If you only work for a group and reassign all benefits to it, you fill in 4F and skip most of the form."
        },
        {
          label: "Business structure (4A)",
          required: false,
          tip: "Only for your own practice. Sole owners of a PC, PA or LLC give its legal business name, TIN and Type 2 NPI, matching what they used for that NPI. Sole proprietors choose to be paid under their SSN or EIN."
        },
        {
          label: "Practice locations (4B)",
          required: false,
          tip: "Every location where you treat Medicare patients in this MAC's area, including telehealth distant sites. Locations in another MAC's area need a separate 855I sent to that MAC. If you only do house calls, you can list your home address and explain in 4E."
        },
        {
          label: "Special payments address (4C)",
          required: false,
          tip: "Payments go by EFT, so this is only where remittance notices are mailed. Tick a box to reuse the practice or correspondence address."
        },
        {
          label: "Medical records storage (4D)",
          required: false,
          tip: "Only if records are kept somewhere other than the practice location. For electronic records, name the system or vendor."
        },
        {
          label: "Reassignment of benefits (4F)",
          required: false,
          tip: "Lets a group bill and get paid for your services. Enter the group's legal business name, TIN, PTAN and NPI. You sign 15B and the group's authorized official signs 15C. Both of you must be enrolled, or enrolling at the same time."
        }
      ]
    },
    {
      title: "Sections 6 to 13: Staff, billing agency, documents, contact",
      fields: [
        {
          label: "Managing employee (6)",
          required: false,
          tip: "Anyone who runs the day-to-day operations of your private practice. Tick \"I am the managing employee\" if that's you. Skip it if you reassign everything."
        },
        {
          label: "Billing agency (8)",
          required: false,
          tip: "The company that submits your claims, if you use one. Its address can't be your correspondence address."
        },
        {
          label: "Supporting documents (12)",
          required: true,
          tip: "The CMS-588 EFT form with a voided check or bank letter, IRS CP-575 if you enroll a business, CMS-460 if you want to be a participating provider, and papers for any adverse action."
        },
        {
          label: "Contact person (13)",
          required: false,
          tip: "Optional. The person the MAC calls about this application, often a credentialing specialist. They can't discuss anything else in your Medicare record."
        }
      ]
    },
    {
      title: "Section 15: Certification and signature",
      fields: [
        {
          label: "Signature",
          required: true,
          tip: "Only you can sign, and you can't delegate it. A reassignment also needs the group official's signature in 15C."
        }
      ]
    }
  ],
  steps: [
    "Get your NPI and check that your name, SSN and date of birth match NPPES and Social Security.",
    "Sign in to PECOS with your I&A account and start a new enrollment, or download the CMS-855I to file on paper.",
    "Choose the reason for submitting, then fill in your identity, license, school and specialty.",
    "Answer the adverse legal action questions in section 3.",
    "Choose private practice, reassignment or both, and add each practice location or the group in 4F.",
    "Add a managing employee and billing agency if they apply, and a contact person if you want one.",
    "Attach the CMS-588 EFT form and other supporting documents, then sign.",
    "Answer any request from your MAC within 30 days. Once approved you get a PTAN and can bill from your effective date."
  ],
  mistakes: [
    "A name, SSN or date of birth that doesn't match NPPES or Social Security.",
    "A P.O. box as the practice location. It must be a street address where you treat patients.",
    "Applying after you've started seeing Medicare patients. Billing starts at the filing date, and you can only bill back 30 days before it.",
    "Listing practice locations outside your MAC's area on the same application.",
    "Forgetting the CMS-588 EFT form, or the group's signature in 15C on a reassignment.",
    "Missing revalidation. It comes every 5 years, and a missed date can deactivate your billing privileges."
  ],
  faqs: [
    {
      question: "Is there an application fee for the CMS-855I?",
      answer:
        "No. The Medicare application fee in 42 CFR 424.514 applies to institutional providers. Physicians and non-physician practitioners enrolling as individuals don't pay it."
    },
    {
      question: "When can I start billing Medicare?",
      answer:
        "Your effective date is the later of the date you filed an application that was then approved, or the date you started seeing patients at the new location. You can bill for services up to 30 days before that date (42 CFR 424.520(d) and 424.521)."
    },
    {
      question: "Do I still need the CMS-855R to join a group?",
      answer:
        "No. CMS discontinued the CMS-855R. Reassignments now go in section 4F of the CMS-855I, signed by you and the group's authorized official."
    },
    {
      question: "How often do I revalidate?",
      answer:
        "Every 5 years. CMS posts due dates on the Medicare Revalidation List up to 7 months ahead, and your MAC sends a notice about 3 to 4 months before. Miss it and your payments can be held or your billing privileges deactivated."
    },
    {
      question: "How fast do I have to report changes?",
      answer:
        "Within 30 days for adverse legal actions and practice location changes, and within 90 days for anything else (42 CFR 424.516(d))."
    },
    {
      question: "Can Filler fill the CMS-855I for me?",
      answer:
        "Filler fills the text fields and dropdowns of web forms like PECOS from facts you save once: name, NPI, license, school, addresses. Yes/no questions, checkboxes, uploads and the signature stay with you, and it never submits. It doesn't fill the paper PDF."
    }
  ],
  sources: [
    {
      label: "CMS-855I Medicare enrollment application (05/23), OMB 0938-1355",
      url: "https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855i.pdf"
    },
    {
      label: "42 CFR 424.514: application fee (institutional providers)",
      url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-424/subpart-P/section-424.514"
    },
    {
      label: "42 CFR 424.516: reporting changes",
      url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-424/subpart-P/section-424.516"
    },
    {
      label: "42 CFR 424.521: retrospective billing",
      url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-424/subpart-P/section-424.521"
    },
    {
      label: "CMS: Medicare revalidations",
      url: "https://www.cms.gov/medicare/enrollment-renewal/providers-suppliers/revalidations"
    },
    {
      label: "PECOS",
      url: "https://pecos.cms.hhs.gov/"
    }
  ]
}

export const FORM_GUIDES: FormGuide[] = [
  NPI_APPLICATION,
  DEA_REGISTRATION,
  MEDICARE_ENROLLMENT_855I
]

export function getFormGuide(slug: string): FormGuide | undefined {
  return FORM_GUIDES.find((guide) => guide.slug === slug)
}
