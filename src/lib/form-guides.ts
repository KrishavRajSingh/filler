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

const CAQH_PROVIEW: FormGuide = {
  slug: "caqh-proview",
  name: "CAQH ProView profile",
  title: "CAQH ProView: how to fill out your profile, section by section",
  description:
    "Step-by-step guide to the CAQH ProView provider profile (now DataSpring, powered by CAQH). Registration, the 12 profile sections, which health plans to authorize, supporting documents and re-attesting every 120 days.",
  datePublished: "2026-10-25",
  dateModified: "2026-10-25",
  intro: [
    "Many US health plans pull your credentialing data from CAQH ProView instead of sending you their own application. You fill in one profile, authorize the plans that may read it, attest that it's correct, and keep it current. It's free for providers.",
    "In June 2026 CAQH renamed itself DataSpring, powered by CAQH. Your login, profile and links didn't change, and the portal is still at proview.caqh.org. The first profile can take up to two hours, mostly because of practice locations, training and work history. This guide walks through each section and the places people get stuck."
  ],
  onlineForm: {
    label: "CAQH ProView (proview.caqh.org)",
    url: "https://proview.caqh.org/"
  },
  beforeYouStart: [
    "Your Type 1 NPI and your Social Security number.",
    "Every state license you hold or have held, plus DEA and state CDS registrations, Medicare and Medicaid numbers, and ECFMG or USMLE details if they apply.",
    "Schools, internship, residency and fellowship, with dates. A rotating or transitional year needs one entry per rotation.",
    "Each practice location: the practice name exactly as it appears on your claims (sometimes the W-9 name), street address, group NPI (Type 2), group Medicare and Medicaid numbers, tax ID, phone and office hours.",
    "Your malpractice policy: carrier, policy number, effective and expiration dates, coverage amount and the face sheet.",
    "Your work history with dates, and an explanation for any gap longer than 3 months.",
    "Scans of your license, DEA and CDS certificates and malpractice face sheet as PDF, TIF or JPEG."
  ],
  sections: [
    {
      title: "Registration",
      fields: [
        {
          label: "CAQH Provider ID",
          required: true,
          tip: "If a health plan or hospital added you, you get a Welcome Kit email with your ID. If not, click Register at proview.caqh.org and enter your name, provider type, primary practice state, date of birth, email and at least one ID number. CAQH emails you the ID and a link to finish."
        },
        {
          label: "Username, password and security questions",
          required: true,
          tip: "You pick three security questions. Keep the CAQH Provider ID somewhere safe; health plans ask for it."
        }
      ]
    },
    {
      title: "Personal information and professional IDs",
      fields: [
        {
          label: "Provider type, practice setting and practice states",
          required: true,
          tip: "Answer these first. They decide which questions you see later, including any state-specific credentialing questions, which appear in the same flow."
        },
        {
          label: "Mailing address",
          required: false,
          tip: "Use your practice's physical address. Health plans use it for their directories, so put a P.O. box only in the billing contact."
        },
        {
          label: "Email",
          required: true,
          tip: "Email is the required contact method. Re-attestation reminders go there."
        },
        {
          label: "SSN and NPI",
          required: true,
          tip: "Enter your Type 1 (individual) NPI here. The group's Type 2 NPI goes under the practice location."
        },
        {
          label: "Licenses and registrations",
          required: true,
          tip: "List every state medical license you hold or have held in the US or Canada, not only the current one. Add DEA, CDS, Medicare, Medicaid, ECFMG and USMLE where they apply, and upload the certificates."
        }
      ]
    },
    {
      title: "Education, training and specialties",
      fields: [
        {
          label: "Education",
          required: false,
          tip: "Professional school and undergraduate school, with dates."
        },
        {
          label: "Internship, residency, fellowship",
          required: false,
          tip: "Include programs you didn't finish. For a rotating or transitional year, enter each rotation separately with its specialty and dates."
        },
        {
          label: "Specialties and board certification",
          required: false,
          tip: "Primary, secondary and additional specialties come from the NUCC list. If yours is missing, pick the closest one and add yours under Areas of Other Interest. Board exam questions appear based on your answers."
        },
        {
          label: "Certifications",
          required: false,
          tip: "CPR, BLS, ACLS, ATLS, PALS, NRP and similar."
        }
      ]
    },
    {
      title: "Practice locations and hospital affiliations",
      fields: [
        {
          label: "Practice name and address",
          required: false,
          tip: "Use the name on your claims, so it matches what the health plan already has. This is usually not your own name. Use Copy to start a second location from the first."
        },
        {
          label: "Group NPI, tax ID, group Medicare and Medicaid",
          required: false,
          tip: "The group's numbers, not yours. ProView checks that the NPI, DEA and TIN you enter belong to the name on them and suggests a fix when they don't."
        },
        {
          label: "Hours, patients, coverage and contacts",
          required: false,
          tip: "Office hours, which patients you accept, covering colleagues, mid-level practitioners, office manager, billing contact and payment address."
        },
        {
          label: "Limitations, accessibility, services",
          required: false,
          tip: "Age or gender limits on your patients, ADA and public transport access, CLIA certificate and interpretation services."
        },
        {
          label: "Hospital affiliations",
          required: false,
          tip: "Whether you have hospital privileges, then your primary hospital and any others."
        }
      ]
    },
    {
      title: "Insurance, work history and references",
      fields: [
        {
          label: "Credentialing contact",
          required: false,
          tip: "Who the plans should contact, per practice location or hospital. Often your office's credentialing person."
        },
        {
          label: "Professional liability insurance",
          required: false,
          tip: "Carrier, policy number, original and current effective dates, expiration date, type and amount of coverage. If you're not insured, choose Not Insured; your health plan may ask for a letter of credit instead."
        },
        {
          label: "Malpractice insurance quotes",
          required: false,
          tip: "Answering Yes releases a copy of your whole profile to an insurance broker for quotes. Say no unless you want that."
        },
        {
          label: "Employment information",
          required: false,
          tip: "Current and previous employers with dates, and military service. If you haven't started a job yet, enter the expected start date. Explain any gap in full-time work longer than 3 months; some organizations want your full history since your degree."
        },
        {
          label: "Professional references",
          required: false,
          tip: "Names and contact details of peers who can vouch for you."
        }
      ]
    },
    {
      title: "Disclosure, authorize and attest",
      fields: [
        {
          label: "Disclosure questions",
          required: true,
          tip: "Standard and state-specific questions, plus disclosure of ownership."
        },
        {
          label: "Authorize",
          required: true,
          tip: "Global lets every organization that says you're affiliated, or joining, read your profile. You can instead name each one. CAQH doesn't sign you up with new plans: contact the plan, and it appears here once it adds you to its roster."
        },
        {
          label: "Review and attest",
          required: true,
          tip: "Fix every required fix on the Review tab, check the summary, then Attest. The profile is complete once your documents and the signed Authorization, Attestation and Release form are in."
        }
      ]
    }
  ],
  steps: [
    "Register at proview.caqh.org, or use the link in your Welcome Kit email, and note your CAQH Provider ID.",
    "Pick your provider type, practice setting and practice states first.",
    "Work through the 12 sections under Manage Information, clicking Save & Continue on every page.",
    "Upload your license, DEA and CDS certificates and malpractice face sheet under Documents.",
    "Authorize the health plans that may read your profile.",
    "Clear the required fixes on the Review tab, then attest.",
    "Give your CAQH Provider ID to each health plan you're joining. Re-attest every 120 days (180 in Illinois)."
  ],
  mistakes: [
    "Leaving a page without clicking Save & Continue. Go to previous section doesn't save, so that page's answers are lost.",
    "A practice name that doesn't match the name on your claims.",
    "Your individual NPI where the group's Type 2 NPI belongs, or the reverse.",
    "Unexplained gaps of more than 3 months in work history.",
    "Attesting without authorizing the plan you're joining, so it can't read the profile.",
    "Missing the 120-day re-attestation. The status turns to Expired Attestation."
  ],
  faqs: [
    {
      question: "Does CAQH ProView cost anything?",
      answer:
        "No. Providers don't pay to use it. DataSpring is owned by companies tied to the health plans that use the data, and that model pays for it."
    },
    {
      question: "Is CAQH now DataSpring?",
      answer:
        "Yes. CAQH became DataSpring, powered by CAQH, in June 2026. You don't need to do anything: your login, profile and saved links stay the same."
    },
    {
      question: "How often do I re-attest?",
      answer:
        "Every 120 days, or every 180 days if you practice in Illinois. CAQH sends a reminder. Update anything that changed, upload new documents, then Review and Attest again."
    },
    {
      question: "How long does it take?",
      answer:
        "Up to two hours for a first profile, longer with many locations or a long training and work history. After you attest, CAQH sends a confirmation email about 48 hours after your documents are received and approved."
    },
    {
      question: "Should I give my employer my CAQH login?",
      answer:
        "You don't have to. Many group practices ask so their credentialing staff can update and re-attest for you, but the profile holds your SSN, work history and documents. Ask whether the practice can use CAQH's Practice Manager, which lets its staff work on your profile from their own account. Otherwise keep the login, re-attest yourself when the reminder comes, and if you do share it, change the password when you leave."
    },
    {
      question: "How do I reach CAQH support?",
      answer:
        "Call 1-888-599-1771, Monday to Friday, 8 a.m. to 8 p.m. ET, or use chat after you log in. If a message looks suspicious, contact support before acting on it."
    },
    {
      question: "Can Filler fill my CAQH profile?",
      answer:
        "Filler fills the text fields and dropdowns of web forms from facts you save once: name, NPI, license numbers, schools, addresses, employers and dates. Yes/no answers, checkboxes, uploads and the attestation stay with you, and it never submits. Much of the profile repeats what you typed for NPPES and PECOS."
    }
  ],
  sources: [
    {
      label: "CAQH ProView Provider User Guide v1.1",
      url: "https://apps.keystonefirstpa.com/pdf/provider/credentialing/caqh/caqh-provider-user-guide.pdf"
    },
    {
      label: "DataSpring Clinician Q&A (June 2026)",
      url: "https://www.dataspring.com/hubfs/DataSpring%20Clinicians%20FAQs.pdf"
    },
    {
      label: "BCBS Illinois: CAQH ProView quick reference (180-day Illinois cycle)",
      url: "https://www.bcbsil.com/docs/provider/il/network/credentialing/PR-QuickRef.pdf"
    },
    {
      label: "CAQH ProView",
      url: "https://proview.caqh.org/"
    }
  ]
}

const TEXAS_MEDICAID_ENROLLMENT: FormGuide = {
  slug: "texas-medicaid-provider-enrollment",
  name: "Texas Medicaid provider enrollment",
  title: "Texas Medicaid provider enrollment in PEMS: a step-by-step guide",
  description:
    "How to enroll as a Texas Medicaid provider through TMHP's PEMS: application types, NPI and taxonomy, the provider agreement, fingerprinting, site visits, the 30-day deficiency clock and revalidating every 5 years.",
  datePublished: "2026-10-26",
  dateModified: "2026-10-26",
  intro: [
    "To bill Texas Medicaid, or to join a Medicaid managed care plan in Texas, you first enroll with HHSC through PEMS, the Provider Enrollment and Management System run by TMHP. You can't contract with a Texas Medicaid health plan until this enrollment is approved.",
    "Once TMHP has everything it needs, the process typically takes up to 60 days. Applications get held up by deficiencies: a missing attachment, a license or Medicare record that doesn't match, or fingerprint proof that comes in late. This guide follows the order PEMS asks for things and points out where applications stall."
  ],
  onlineForm: {
    label: "PEMS (secure.tmhp.com/pems)",
    url: "https://secure.tmhp.com/pems/"
  },
  beforeYouStart: [
    "Your NPI from NPPES and the primary taxonomy code you attested there. TMHP shows only the code, not its description, so check yours first.",
    "Your Texas license or certification. PEMS won't accept it if it expires within 30 days.",
    "Your Medicare enrollment, if your provider type requires it. Name, NPI, SSN and practice addresses should match what Medicare has (for groups: name, TIN and addresses).",
    "The nine-digit federal tax ID and a W-9 whose legal name matches your other documents.",
    "For a group or facility: every owner with 5% or more, officers, directors and managing employees, each with an SSN or TIN and date of birth.",
    "For a corporation: the Texas Franchise Tax Account Status page and the Certificate of Formation or Filing (or an IRS 501(c)(3) letter instead of the franchise page).",
    "Scans of your license and any certificates as attachments."
  ],
  sections: [
    {
      title: "Start the request",
      fields: [
        {
          label: "TMHP account and login",
          required: true,
          tip: "Enroll Today on tmhp.com opens PEMS. Since July 2026 TMHP logins use IAMOnline with multi-factor authentication. The person who creates the request becomes its admin and gets the emails."
        },
        {
          label: "Request type",
          required: true,
          tip: "New Enrollment if the NPI has never been enrolled in Texas Medicaid. Existing Enrollment adds a location or program to an enrolled NPI. Reenrollment is for a disenrolled, terminated or excluded NPI, which also covers 24 months without claims. Revalidation renews your enrollment. Maintenance updates your details."
        },
        {
          label: "NPI type, programs and Enrolling As",
          required: true,
          tip: "Pick in this order: NPI type (Individual or Organization), then programs (Acute Care, CHIP, CSHCN, LTC, MTP and others), then Enrolling As: Facility Group, Performing Provider, or Individual Ordering, Referring or Prescribing (ORP)."
        }
      ]
    },
    {
      title: "Provider information",
      fields: [
        {
          label: "NPI and primary taxonomy",
          required: true,
          tip: "Individuals, performing providers and sole proprietors use an Individual NPI. Groups and facilities, even one with a single employee, use an Organization NPI. The taxonomy list comes from the codes HHSC approved for your provider type."
        },
        {
          label: "Legal name and tax ID",
          required: true,
          tip: "Enter the nine-digit federal tax ID. A corporation's name must match its Certificate of Formation and W-9 exactly. An individual can enroll under their own SSN or as an employee under the employer's tax ID."
        },
        {
          label: "Practice locations",
          required: true,
          tip: "Every physical address where you see patients. A site visit, if your risk level needs one, happens at these addresses, and Medicare's records are compared against them."
        },
        {
          label: "License and certifications",
          required: true,
          tip: "TMHP checks licenses itself with the Texas Medical Board, Board of Nursing, dental and optometry boards and a few others. If it can't verify yours, upload a copy or a letter from your board."
        }
      ]
    },
    {
      title: "Ownership and principals",
      fields: [
        {
          label: "Owner/Creditor/Principal entries",
          required: true,
          tip: "One entry for each 5% or more owner, officer, director, partner, managing employee and creditor, plus the on-site manager or medical director of each location. You can skip this if you're a performing provider joining a group that's already enrolled, or an individual or sole proprietor enrolling under your own SSN."
        },
        {
          label: "Disclosure of Ownership and Control Interest",
          required: true,
          tip: "Required for almost everyone except performing providers joining an enrolled group. If you also bill Medicare, give both programs the same owners and managing staff."
        }
      ]
    },
    {
      title: "Fees, agreement and attachments",
      fields: [
        {
          label: "Application fee",
          required: false,
          tip: "Only institutional providers pay it, and PEMS tells you at the end whether you owe it. It covers new enrollments, new locations, revalidation and reenrollment, and the amount changes every calendar year. An application that owes the fee isn't processed until it's paid."
        },
        {
          label: "HHSC Medicaid Provider Agreement",
          required: true,
          tip: "E-signed by the enrolling provider, or for an entity by a principal who can bind it. Signing certifies that the whole application, including every owner entry, is complete and correct."
        },
        {
          label: "Attachments",
          required: true,
          tip: "License copies if TMHP can't verify them, corporation documents, and for nurse-midwives and licensed midwives a Physician's Letter of Agreement for each physician."
        }
      ]
    },
    {
      title: "Screening after you submit",
      fields: [
        {
          label: "Fingerprinting (high-risk providers)",
          required: false,
          tip: "High-risk providers and anyone owning 5% or more need fingerprints. Wait for the letter with your six-digit service code before booking with IdentoGO (uenroll.identogo.com, 877-289-6114). Prints taken before you have the code mean deficiencies and paying again. It costs $10 a person, and the thermal receipt has to be uploaded to PEMS within 30 days."
        },
        {
          label: "Site visit",
          required: false,
          tip: "Depends on your risk level. If your Medicare record matches, TMHP may use Medicare's site visit. If not, a coordinator calls or emails to book one, or the visit is unannounced. Have a staff list, licenses, your DBA certificate and your complaint policy ready."
        }
      ]
    }
  ],
  steps: [
    "Check your NPI and taxonomy in NPPES, and your Medicare enrollment if your provider type needs one.",
    "Log in through TMHP and open PEMS from Enroll Today.",
    "Choose the request type, then NPI type, programs and Enrolling As.",
    "Fill in provider details, locations, license, and owner and principal entries.",
    "Attach the documents, pay the fee if PEMS says you owe it, and e-sign the provider agreement.",
    "Answer every deficiency within its deadline, and book fingerprints only after the service code letter arrives.",
    "Once approved, enroll with each Texas Medicaid managed care plan you want to join. Revalidate up to 180 days before your due date, usually every 5 years."
  ],
  mistakes: [
    "Leaving a draft too long. Drafts expire after 180 calendar days and can't be submitted.",
    "Missing a deficiency deadline. You get 30 days for fingerprint proof and 30 business days for other missing items before the application is closed.",
    "Getting fingerprinted before the service code letter arrives.",
    "A name, SSN, TIN or address that doesn't match Medicare's record, which can add a site visit.",
    "Applying with a license that expires within 30 days.",
    "Filing a New Enrollment for an NPI that was disenrolled. Use Reenrollment.",
    "Revalidating late. Revalidation has to reach Closed-Enrolled within 45 days after the due date or you're disenrolled."
  ],
  faqs: [
    {
      question: "How long does Texas Medicaid enrollment take?",
      answer:
        "TMHP says the whole process typically takes up to 60 days once it has all the information it needs. Exceptions, high-risk screening and provider types that need extra state approval take longer."
    },
    {
      question: "Do I have to be in Medicare first?",
      answer:
        "Certain provider types must enroll in Medicare before Texas Medicaid. HHSC can waive this for practices that will never see Medicare patients, such as pediatrics or OB/GYN."
    },
    {
      question: "How often do I revalidate?",
      answer:
        "Most providers have a five-year enrollment period; some have one or two years. Revalidation opens 180 days before the due date in PEMS, and your due date is on your welcome letter and in PEMS."
    },
    {
      question: "Is there an application fee?",
      answer:
        "Only for institutional providers, under the ACA. The amount changes each calendar year and PEMS tells you if you owe it. Individual practitioners don't pay it."
    },
    {
      question: "Who do I call for help?",
      answer:
        "The TMHP Contact Center at 1-800-925-9126, option 3, or provider.relations@tmhp.com. TMHP's YouTube channel has short PEMS videos on attachments, deficiencies, locations and signing."
    },
    {
      question: "Can Filler fill PEMS for me?",
      answer:
        "Filler fills text fields and dropdowns on web forms from facts you save once: legal name, NPI, tax ID, addresses, license numbers, owners and dates. Much of PEMS repeats what you already typed for NPPES, PECOS and CAQH. Yes/no answers, uploads, the fee and the e-signature stay with you, and Filler never submits anything."
    }
  ],
  sources: [
    {
      label: "Texas Medicaid Provider Procedures Manual, Section 1: Provider Enrollment (October 2026)",
      url: "https://www.tmhp.com/sites/default/files/file-library/resources/provider-manuals/tmppm/pdf-chapters/2026/2026-10-october/1_01_provider_enrollment.pdf"
    },
    {
      label: "TMHP: PEMS instructional site, start an application",
      url: "https://www.tmhp.com/topics/provider-enrollment/pems/start-application"
    },
    {
      label: "TMHP: How to apply",
      url: "https://www.tmhp.com/topics/provider-enrollment/how-apply-enrollment"
    },
    {
      label: "TMHP: Provider fingerprinting requirement FAQ",
      url: "https://www.tmhp.com/sites/default/files/file-library/topics/provider-enrollment/texas-medicaid-provider-fingerprinting-requirement-FAQ.pdf"
    },
    {
      label: "TMHP: ACA screening requirements (revised 12/15/2025)",
      url: "https://www.tmhp.com/sites/default/files/file-library/topics/provider-enrollment/ACA_Screening_Requirements.pdf"
    }
  ]
}

const FLORIDA_MEDICAID_ENROLLMENT: FormGuide = {
  slug: "florida-medicaid-provider-enrollment",
  name: "Florida Medicaid provider enrollment",
  title: "Florida Medicaid provider enrollment: the Online Enrollment Wizard, step by step",
  description:
    "How to enroll as a Florida Medicaid provider with AHCA's Online Enrollment Wizard: full vs limited enrollment, the ATN, supporting documents, fingerprints through the Clearinghouse, site visits, the 21-day deficiency window and renewing every 3 or 5 years.",
  datePublished: "2026-10-29",
  dateModified: "2026-10-29",
  intro: [
    "Every provider who treats Florida Medicaid patients has to enroll with the Agency for Health Care Administration (AHCA), including providers who only join a Medicaid managed care plan's network. You apply online through the Online Enrollment Wizard on the Florida Medicaid Web Portal (portal.flmmis.com).",
    "The application isn't complete when you click submit in the Wizard. It's complete when every required document, including the signed provider agreement and your background screening, has been received and matched to the online application. Most delays come from that matching step, so this guide lists what to have ready before you open the Wizard."
  ],
  onlineForm: {
    label: "Online Enrollment Wizard (portal.flmmis.com, New Medicaid Providers)",
    url: "https://portal.flmmis.com/FLPublic/Provider_ProviderServices/Provider_Enrollment/Provider_Enrollment_NewMedicaidProviders/tabId/158/Default.aspx"
  },
  beforeYouStart: [
    "Your NPI. The Wizard checks it against NPPES, so the name and taxonomy there should already be right.",
    "Your Florida license. The name on the application has to match the name on the license.",
    "Proof of your tax ID: an IRS Letter 147C, Form SS-4 or W-9. Sole proprietors enroll under their SSN; corporations use their FEIN.",
    "A fingerprint-based background check that counts for Medicaid, for you and every person listed on the application.",
    "Your Medicare number if you're enrolled in Medicare, and your DEA certificate if you prescribe, order or administer drugs that need one.",
    "A bank letter or voided check for direct deposit.",
    "For a group or business: every owner with 5% or more, direct or indirect, and the managing employees, such as the administrator or medical director.",
    "An open, working practice location. Florida won't enroll a practice that isn't operating yet."
  ],
  sections: [
    {
      title: "Enrollment and application type",
      fields: [
        {
          label: "Enrollment type",
          required: true,
          tip: "Fully enrolled providers can see patients in both fee-for-service and managed care. Limited enrolled providers only work inside a Medicaid managed care plan's network. If you only order, refer or prescribe, you can enroll as an ordering or referring provider (ROPA)."
        },
        {
          label: "Application type",
          required: true,
          tip: "Sole proprietor, sole proprietor joining a group, group (more than one member), or facility or other business. Forming, joining or leaving a group also needs the Group Membership Authorization (AHCA Form 5000-1061)."
        },
        {
          label: "Provider type, specialty and taxonomy",
          required: true,
          tip: "Pick a provider type and at least one specialty with its taxonomy code. Picking a specialty counts as your attestation that you finished the training for it."
        }
      ]
    },
    {
      title: "Identifiers",
      fields: [
        {
          label: "Tax ID and entity type",
          required: true,
          tip: "An SSN makes you an Individual entity type and an FEIN makes you an Organizational one. You can't change the entity type after enrollment, so pick the tax ID you'll keep."
        },
        {
          label: "NPI",
          required: true,
          tip: "An individual gets one Medicaid ID with all service addresses under it. An organization signing the Institutional Provider Agreement needs a separate NPI for each service location."
        },
        {
          label: "License, DEA and Medicare number",
          required: true,
          tip: "Report the Florida license for your scope of practice. The DEA certificate is needed only if you handle drugs that require DEA registration, and the Medicare number only if you're Medicare-enrolled."
        }
      ]
    },
    {
      title: "Contact and locations",
      fields: [
        {
          label: "Email, phone and addresses",
          required: true,
          tip: "The application asks for an email, a phone number, and mailing, payment and service addresses. Report any change in writing within 30 days. Behavior analysis (provider type 39) rendering providers need their own email and phone in the Service Location panel, not the group's."
        },
        {
          label: "Service location",
          required: true,
          tip: "In-state providers need an office in Florida or within 50 miles of the border, and they have to see patients there unless their service policy allows care in the community or at a school."
        }
      ]
    },
    {
      title: "Ownership, agreement and documents",
      fields: [
        {
          label: "Ownership and affiliations",
          required: true,
          tip: "List every affiliate and everyone with a 5% or greater direct or indirect interest. If an owner is itself a company, list that company's owners too, unless it's publicly traded."
        },
        {
          label: "Florida Medicaid Provider Agreement",
          required: true,
          tip: "Sign the agreement that fits you: non-institutional, institutional, DME or crossover-only. A sole proprietor has to sign it personally. For a business, everyone with 5% or more signs, or one senior official or designated agent signs for all of them, with the document that names that agent attached."
        },
        {
          label: "Supporting documents and the ATN",
          required: true,
          tip: "The Wizard gives you an Application Tracking Number (ATN). Put it on every document you upload. Use the portal's Interactive Enrollment Checklist to see which documents your provider type needs; all of them have to be uploaded before the application can be submitted."
        }
      ]
    },
    {
      title: "Screening",
      fields: [
        {
          label: "Fingerprints",
          required: true,
          tip: "Everyone listed on the application submits fingerprints through the Care Provider Background Screening Clearinghouse. Some non-profits and public entities can file an exemption form (AHCA Forms 5000-1261 and 5000-1262)."
        },
        {
          label: "Site visit",
          required: false,
          tip: "Moderate- and high-risk provider types get a site visit before enrollment and at every renewal, and you have to be there for it. The location needs ADA parking and access, a sign readable from 20 feet, and posted hours and phone number. If you only treat patients in their homes, schools or nursing homes and list your home address, no visit is required."
        },
        {
          label: "Surety bond",
          required: false,
          tip: "Some moderate- and high-risk providers have to post a surety bond (AHCA Form 5000-1064), for example when applying within six months after a moratorium ends."
        }
      ]
    }
  ],
  steps: [
    "Check your NPI, taxonomy and license name so they match each other.",
    "Run the Interactive Enrollment Checklist on the Florida Medicaid Web Portal for your provider type.",
    "Open the Online Enrollment Wizard from New Medicaid Providers and choose your enrollment type, application type, provider type and specialty.",
    "Fill in identifiers, contact details, locations and owners, then write down the ATN.",
    "Upload every supporting document with the ATN on it, including the signed provider agreement and your background screening.",
    "Fix any deficiency within 21 days of the notice, and be at your location if a site visit is scheduled.",
    "After approval, renew every 5 years (non-institutional) or every 3 years (institutional, DME, crossover-only, ordering/referring and out-of-state providers)."
  ],
  mistakes: [
    "A name on the application that doesn't match the license.",
    "Applying before the practice is open. In-state providers have to be fully operational at the service location first.",
    "Uploading documents without the ATN, so they can't be matched to the application.",
    "Missing the 21-day deficiency deadline. A denied application has to start over as a new application.",
    "Enrolling under the wrong tax ID. The entity type can't be changed later.",
    "Letting the renewal date pass. Without renewal you can't be paid by fee-for-service or by a managed care plan.",
    "Not reporting a change of address, contact or ownership within 30 days. Ownership changes have to be reported before they happen."
  ],
  faqs: [
    {
      question: "Do I need to enroll if I only see patients through a Medicaid HMO?",
      answer:
        "Yes. Providers who only take part in a Florida Medicaid managed care plan's network enroll as limited enrolled providers. Full enrollment is for providers who also bill fee-for-service."
    },
    {
      question: "How often do I renew Florida Medicaid enrollment?",
      answer:
        "Non-institutional providers renew every five years. Institutional, DME, Medicare crossover-only, ordering or referring, and out-of-state providers renew every three years. Renew before the expiration date on your provider agreement."
    },
    {
      question: "How long do I have to fix a deficiency?",
      answer:
        "21 days from the date of the notice. After that the application is denied and you have to submit a new one."
    },
    {
      question: "Who needs fingerprints?",
      answer:
        "Everyone disclosed on the application, through the Care Provider Background Screening Clearinghouse. Some volunteer-run non-profits, local governments and school districts can file an exemption form instead."
    },
    {
      question: "Who do I call for help?",
      answer:
        "The Provider Enrollment Contact Center at 1-800-289-7799, option 4. It handles enrollment questions, address changes, changes of ownership and reenrollment."
    },
    {
      question: "Can Filler fill the Enrollment Wizard for me?",
      answer:
        "Filler fills text fields and dropdowns on web forms from facts you save once: legal name, NPI, tax ID, license number, addresses, phone, email and owners. Most of that is what you already typed for NPPES, PECOS and CAQH. Uploads, attestations and signatures stay with you, and Filler never submits anything."
    }
  ],
  sources: [
    {
      label: "Florida Medicaid Provider Enrollment Policy, February 2026 (Rule 59G-1.060, F.A.C., effective 4/8/2026)",
      url: "https://www.flrules.org/gateway/readRefFile.asp?refId=19181&filename=Florida%20Medicaid%20Provider%20Enrollment%20Policy%20February%202026.pdf"
    },
    {
      label: "Rule 59G-1.060, Provider Enrollment Policy",
      url: "https://www.flrules.org/gateway/ruleNo.asp?id=59G-1.060"
    },
    {
      label: "Florida Medicaid Web Portal: New Medicaid Providers",
      url: "https://portal.flmmis.com/FLPublic/Provider_ProviderServices/Provider_Enrollment/Provider_Enrollment_NewMedicaidProviders/tabId/158/Default.aspx"
    }
  ]
}

export const FORM_GUIDES: FormGuide[] = [
  NPI_APPLICATION,
  DEA_REGISTRATION,
  MEDICARE_ENROLLMENT_855I,
  CAQH_PROVIEW,
  TEXAS_MEDICAID_ENROLLMENT,
  FLORIDA_MEDICAID_ENROLLMENT
]

export function getFormGuide(slug: string): FormGuide | undefined {
  return FORM_GUIDES.find((guide) => guide.slug === slug)
}
