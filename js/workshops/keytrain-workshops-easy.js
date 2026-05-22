/**
 * Easy-level KeyTrain workshops — detailed core-concept teaching in plain language.
 */
import { workshop } from "./keytrain-workshop-factory.js";
import { interleaveConceptVisuals } from "./workshop-visual-catalog.js";
import { getEasyQuizTeaching } from "./easy-quiz-teaching.js";
import { prepareWorkshopQuiz } from "./prepare-workshop-quiz.js";

/**
 * @typedef {Object} EasyConcept
 * @property {string} title
 * @property {string[]} paragraphs
 * @property {string[]} [bullets]
 */

/**
 * @typedef {Object} EasyQuiz
 * @property {string} prompt
 * @property {{ id: string, text: string }[]} options
 * @property {string[]} correct
 * @property {string} explanation
 */

/**
 * @param {object} c
 */
function easy(c) {
  const q1 = prepareWorkshopQuiz(c.q1, c.id, "q1");
  const q2 = prepareWorkshopQuiz(c.q2, c.id, "q2");
  const q3 = prepareWorkshopQuiz(c.q3, c.id, "q3");
  /** @type {import('../workshop-runner.js').WorkshopStep[]} */
  const steps = [
    {
      id: "intro",
      type: "lesson",
      title: "What you will learn",
      paragraphs: [c.intro.what, c.intro.why, c.intro.like],
      bullets: c.topics.map((t) => `We will cover: ${t}`),
    },
    ...c.concepts.map((concept, i) => ({
      id: `concept-${i}`,
      type: /** @type {'lesson'} */ ("lesson"),
      title: concept.title,
      paragraphs: concept.paragraphs,
      bullets: concept.bullets,
    })),
    {
      id: "real-life",
      type: "lesson",
      title: "Real-life example",
      paragraphs: c.example.paragraphs,
      bullets: c.example.lessons,
    },
    {
      id: "check-1",
      type: "quiz",
      title: "Check your understanding (1)",
      prompt: q1.prompt,
      options: q1.options,
      correct: q1.correct,
      explanation: q1.explanation,
      ...getEasyQuizTeaching(c.id, "q1", q1),
    },
    {
      id: "check-2",
      type: "quiz",
      title: "Check your understanding (2)",
      prompt: q2.prompt,
      options: q2.options,
      correct: q2.correct,
      explanation: q2.explanation,
      ...getEasyQuizTeaching(c.id, "q2", q2),
    },
    {
      id: "habits",
      type: "checklist",
      title: "Habits that protect you every day",
      paragraphs: [
        "Good security is mostly steady habits—not one big heroic moment. Select each item below, then press Check selections to see whether each is recommended and why.",
      ],
      checklistCompleteMessage:
        "Every habit listed here is recommended. None are tricks—your job is to understand why each one protects you.",
      items: c.habits.map((h, i) => ({
        id: `h${i}`,
        label: h.label,
        detail: h.detail,
      })),
    },
    {
      id: "check-3",
      type: "quiz",
      title: "What would you do?",
      prompt: q3.prompt,
      options: q3.options,
      correct: q3.correct,
      explanation: q3.explanation,
      ...getEasyQuizTeaching(c.id, "q3", q3),
    },
    {
      id: "done",
      type: "summary",
      title: "You finished this lesson",
      paragraphs: [
        "You now know the core ideas for this topic. Medium workshops add workplace scenarios; Hard adds advanced technical drills.",
      ],
      bullets: c.takeaways,
    },
  ];

  return workshop({
    id: c.id,
    categoryId: c.id,
    level: "easy",
    title: c.title,
    code: c.code,
    tagline: "Easy — interactive diagrams plus clear explanations of how and why.",
    topics: c.topics,
    steps: interleaveConceptVisuals(c.id, steps),
  });
}

/** @type {Record<string, import('../workshop-runner.js').KeytrainWorkshop>} */
export const EASY_WORKSHOPS = {
  "keytrain-identity-access": easy({
    id: "keytrain-identity-access",
    code: "KT-IAS",
    title: "Identity & Access Security",
    topics: [
      "Who is allowed to sign in",
      "Passwords and second checks (MFA)",
      "What you are allowed to do after sign-in",
      "Spotting stolen or misused accounts",
    ],
    intro: {
      what: "Identity and access security answers two questions: Who are you? And what are you allowed to do? Almost every computer system—email, banking, school portals, work apps—uses these ideas.",
      why: "Most real attacks do not break down the wall with movie-style hacking. They steal or guess a real login, then act as that person. Learning these basics helps you protect yourself and spot trouble early.",
      like: "Picture a building with a front desk. You show ID to enter (that is authentication). Your badge only opens certain doors (that is authorization). Security fails when someone else uses your ID or when your badge opens too many doors.",
    },
    concepts: [
      {
        title: "Core idea 1: Authentication (proving who you are)",
        paragraphs: [
          "Authentication is how a system checks that you are the real account holder. Common methods include a password, a code sent to your phone, a fingerprint, or a security key.",
          "A strong sign-in should be hard for a stranger to copy. A weak sign-in is easy to guess or steal—like a short password reused everywhere, or a password written on a sticky note.",
        ],
        bullets: [
          "Something you know — password, PIN.",
          "Something you have — phone, security key, smart card.",
          "Something you are — fingerprint or face (biometrics).",
          "Using more than one type at once is much safer than a password alone.",
        ],
      },
      {
        title: "Core idea 2: Multi-factor authentication (a second check)",
        paragraphs: [
          "Multi-factor authentication (MFA) means the system asks for a second proof after your password—for example a code on your phone or a tap to approve on an app.",
          "Even if someone steals your password from a fake website, they usually cannot finish sign-in without your phone or security key. That is why schools, banks, and employers push you to turn MFA on.",
        ],
        bullets: [
          "Approve only sign-in requests you started yourself.",
          "If your phone asks “Was this you?” and you were not signing in, choose Deny and tell IT or a trusted helper.",
          "Text message codes help, but app-based codes or security keys are often stronger.",
        ],
      },
      {
        title: "Core idea 3: Authorization (what you may do)",
        paragraphs: [
          "After you sign in, authorization decides what you can see or change. A student account should not change grades. A cashier should not move money without a manager.",
          "Least privilege means giving people only the access they need for their role—no extra admin powers “just in case.” When everyone is an admin, one stolen password can damage the whole organization.",
        ],
        bullets: [
          "Regular user — daily work only.",
          "Elevated / admin — rare, short tasks like installing software or changing settings.",
          "Service accounts — used by programs, not humans; must be watched carefully.",
        ],
      },
      {
        title: "Core idea 4: When accounts are misused",
        paragraphs: [
          "Account misuse means someone else is using your identity—maybe they phished your password, maybe they bought it online, maybe a coworker shared a login (which you should never do).",
          "Warning signs: password reset emails you did not request, new devices on your account list, files you did not create, or friends getting spam from your address.",
        ],
        bullets: [
          "Report odd sign-in alerts right away.",
          "Change passwords after a suspected breach (from a clean device if possible).",
          "Never share work or school logins—even with people you trust.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "Sam gets an email: “Your payroll password expires today—click here.” Sam clicks and types a password. An hour later, Sam’s phone shows “Approve sign-in from another country.” Sam did not try to sign in.",
      ],
      lessons: [
        "The email was phishing—it stole the password (authentication broken).",
        "The approval prompt was MFA doing its job—Sam should Deny and report.",
        "If Sam had approved, the attacker could have changed direct-deposit info (authorization abuse).",
      ],
    },
    q1: {
      prompt: "What is the difference between authentication and authorization?",
      options: [
        { id: "a", text: "Authentication proves who you are; authorization decides what you can access" },
        { id: "b", text: "They mean the same thing" },
        { id: "c", text: "Authorization is only for passwords" },
        { id: "d", text: "Authentication decides which files you can delete" },
      ],
      correct: ["a"],
      explanation: "You authenticate first (login), then the system authorizes each action (read email, pay invoice, etc.).",
    },
    q2: {
      prompt: "Why is MFA valuable even when you use a strong password?",
      options: [
        { id: "a", text: "Because passwords can still be phished or leaked; MFA adds a second hurdle" },
        { id: "b", text: "Because MFA removes the need for passwords" },
        { id: "c", text: "Because MFA makes the computer faster" },
        { id: "d", text: "Because MFA is only for managers" },
      ],
      correct: ["a"],
      explanation: "Attackers often get passwords from fake sites or data breaches. MFA blocks most of those logins.",
    },
    q3: {
      prompt: "A stranger online offers a prize if you share your password. Best response?",
      options: [
        { id: "a", text: "Share it—they said they are from support" },
        { id: "b", text: "Refuse; real support will not ask for your full password in chat" },
        { id: "c", text: "Share half the password" },
        { id: "d", text: "Post it publicly so others can warn you" },
      ],
      correct: ["b"],
      explanation: "Legitimate organizations use secure reset flows—they do not ask for your password in messages.",
    },
    habits: [
      { label: "Turn on MFA for email, banking, and work", detail: "Start with the accounts that matter most." },
      { label: "Use unique passwords (or a password manager)", detail: "One leak should not unlock every account." },
      { label: "Lock your screen when you step away", detail: "Windows+L or close the laptop lid." },
      { label: "Use a separate admin account only when needed", detail: "Daily browsing on a normal user account is safer." },
    ],
    takeaways: [
      "Authentication = who you are; authorization = what you may do.",
      "MFA is a second lock—deny surprise approval prompts.",
      "Least privilege limits damage when one account is stolen.",
      "Report password resets and sign-ins you did not start.",
    ],
  }),

  "keytrain-email-security": easy({
    id: "keytrain-email-security",
    code: "KT-EMS",
    title: "Email Security",
    topics: ["How email addresses work", "Phishing", "Malicious links and attachments", "Impersonation and payment fraud"],
    intro: {
      what: "Email is still the most common way criminals reach people at home and at work. This lesson explains how email really works, why fakes look real, and what to do before you click or pay.",
      why: "One rushed click can install malware, steal a password, or start a fraudulent wire transfer. Slowing down and checking sender details prevents most harm.",
      like: "Email is like a letter in an envelope anyone can re-label. The name on the outside (display name) can say “Bank” while the return address inside is completely different.",
    },
    concepts: [
      {
        title: "Core idea 1: Display names vs real addresses",
        paragraphs: [
          "The friendly name you see—like “IT Help Desk”—can be typed by the sender. It is not proof of who sent the message.",
          "Look at the actual email address after the name. Small typos (amaz0n.com, micr0soft.com) are deliberate tricks.",
        ],
        bullets: [
          "Internal company mail often comes from your organization’s domain.",
          "External mail should be treated more carefully, especially with links or attachments.",
        ],
      },
      {
        title: "Core idea 2: Phishing (fishing for your secrets)",
        paragraphs: [
          "Phishing emails try to scare or excite you so you act fast: “Account locked,” “You won a prize,” “Boss needs gift cards now.”",
          "They usually include a link to a fake login page or an attachment that runs harmful software when opened.",
        ],
        bullets: [
          "Urgent tone + request for password, payment, or codes = red flag.",
          "Generic greetings (“Dear customer”) are common in mass phishing.",
          "When unsure, open a browser yourself and type the real site address—do not use the email link.",
        ],
      },
      {
        title: "Core idea 3: Links and attachments",
        paragraphs: [
          "Hover over links (or long-press on phone) to preview the real destination before clicking.",
          "Unexpected attachments—especially .zip files, invoices you did not expect, or “resume.doc” from strangers—can carry viruses.",
        ],
        bullets: [
          "PDFs and Office documents can hide macros that run when you click Enable.",
          "If a coworker sends a odd attachment, call them on a known number to confirm.",
        ],
      },
      {
        title: "Core idea 4: Business email compromise (pretending to be the boss)",
        paragraphs: [
          "In business email compromise (BEC), criminals impersonate executives, vendors, or HR and ask for wire transfers, payroll changes, or gift cards.",
          "The message may look perfect because they researched names and timing—or because they took over a real mailbox.",
        ],
        bullets: [
          "Verify payment or bank-detail changes by phone using a number you look up—not one from the email.",
          "Use your organization’s report-phishing button when available.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "An accounts-payable clerk gets email from “CFO” at a look-alike domain asking to rush a wire to a new bank account before a deal closes.",
      ],
      lessons: [
        "Display name matched the CFO; address did not—always read the real address.",
        "Urgency and secrecy are social engineering tools.",
        "A two-minute callback to the CFO’s known mobile number would expose the fraud.",
      ],
    },
    q1: {
      prompt: "An email says “You won $500—click here!” from prize-winner@free-gift.biz. Safest action?",
      options: [
        { id: "a", text: "Click the link" },
        { id: "b", text: "Delete or report as junk without clicking" },
        { id: "c", text: "Reply with your bank login" },
        { id: "d", text: "Forward to everyone" },
      ],
      correct: ["b"],
      explanation: "Unknown domains + surprise prizes are classic phishing. Do not engage.",
    },
    q2: {
      prompt: "Why is verifying wire changes by phone (using a known number) important?",
      options: [
        { id: "a", text: "Email alone can be forged or hacked; phone to a trusted number confirms intent" },
        { id: "b", text: "Because email is always encrypted end-to-end" },
        { id: "c", text: "Because banks require faxes" },
        { id: "d", text: "Because phone calls are never recorded" },
      ],
      correct: ["a"],
      explanation: "Out-of-band verification breaks BEC attacks that look like real executives.",
    },
    q3: {
      prompt: "You were not expecting a spreadsheet attachment from a vendor. What should you do first?",
      options: [
        { id: "a", text: "Open it to see if it is interesting" },
        { id: "b", text: "Contact the vendor through a known channel to confirm they sent it" },
        { id: "c", text: "Disable antivirus" },
        { id: "d", text: "Post it on social media" },
      ],
      correct: ["b"],
      explanation: "Unexpected attachments are a common malware path—verify before opening.",
    },
    habits: [
      { label: "Read the real sender address, not just the display name", detail: "Typos matter." },
      { label: "Pause on urgency, fear, or surprise rewards", detail: "Scammers rush you so you skip checks." },
      { label: "Use report-phishing tools at work", detail: "Helps protect coworkers too." },
      { label: "Confirm money requests with a call you initiate", detail: "Never rely on email alone." },
    ],
    takeaways: [
      "Display names lie; check the actual email address.",
      "Phishing uses emotion and urgency—slow down.",
      "Verify attachments and payment changes out of band.",
    ],
  }),

  "keytrain-data-protection": easy({
    id: "keytrain-data-protection",
    code: "KT-DP",
    title: "Data Protection",
    topics: ["Sensitive data types", "Classification", "Encryption basics", "Safe sharing and storage", "Backups"],
    intro: {
      what: "Data protection is about treating information by how harmful it would be if the wrong person saw or changed it—not all data needs the same care, but some data can ruin lives or businesses if leaked.",
      why: "Photos, health records, grades, payroll, and customer lists all have value to criminals and competitors. You protect data by limiting who sees it, how it moves, and how long you keep it.",
      like: "Think of data like documents in a filing cabinet. Public flyers sit in the lobby. Medical charts stay in a locked room with a sign-in sheet.",
    },
    concepts: [
      {
        title: "Core idea 1: Types of sensitive data",
        paragraphs: [
          "Personal information includes names, addresses, birthdays, and ID numbers. Criminals combine small pieces to impersonate someone.",
          "Health information (PHI) and payment card data have extra legal rules at hospitals, clinics, and stores.",
          "Work secrets—contracts, designs, customer lists—belong to the organization and may require confidentiality even if not “personal.”",
        ],
        bullets: [
          "Public — safe to share widely (marketing pages).",
          "Internal — for staff only (meeting notes).",
          "Confidential / restricted — serious harm if leaked (SSN, diagnoses, salaries).",
        ],
      },
      {
        title: "Core idea 2: Classification (label before you share)",
        paragraphs: [
          "Classification means tagging data so everyone knows how to handle it. Many workplaces use labels like Public, Internal, Confidential.",
          "When you email or upload files, match the label to the audience—do not put confidential payroll on a public chat.",
        ],
        bullets: [
          "When in doubt, treat data as more sensitive, not less.",
          "Ask privacy or security teams if labeling is unclear.",
        ],
      },
      {
        title: "Core idea 3: Encryption (scrambling so strangers cannot read)",
        paragraphs: [
          "Encryption turns readable data into scrambled form that needs a key to open. It protects laptops if stolen and data traveling over the internet (HTTPS lock icon).",
          "A lost USB drive without encryption is like losing a readable diary on the bus.",
        ],
        bullets: [
          "At rest — full-disk encryption on laptops and phones.",
          "In transit — HTTPS websites, VPN for untrusted networks when your job provides one.",
          "Keys matter — encryption is weak if passwords are on sticky notes.",
        ],
      },
      {
        title: "Core idea 4: Sharing, DLP, and backups",
        paragraphs: [
          "Share through approved tools (company drive, patient portal)—not personal email or random cloud folders unless policy allows.",
          "Data loss prevention (DLP) systems can block risky uploads; if blocked, use the official path or ask for an exception.",
          "Backups let you recover from ransomware or accidental deletes—test that restores work, not just that backups exist.",
        ],
        bullets: [
          "Minimum necessary — share only what the task needs.",
          "Do not plug unknown USB devices into work machines.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "A volunteer copies a fundraiser spreadsheet with donor emails and credit card last-four digits onto a personal cloud folder to “work from home.”",
      ],
      lessons: [
        "Mixed sensitive types need stronger handling than a simple donor list.",
        "Personal cloud may lack company security and breach monitoring.",
        "Approved remote access keeps data inside controlled systems.",
      ],
    },
    q1: {
      prompt: "Why is a lost unencrypted laptop with customer data a serious incident?",
      options: [
        { id: "a", text: "Anyone with the laptop may read the data without knowing your password" },
        { id: "b", text: "Laptops are always slow" },
        { id: "c", text: "Screens use too much power" },
        { id: "d", text: "Wi-Fi names change" },
      ],
      correct: ["a"],
      explanation: "Encryption helps ensure thieves cannot simply copy files from the disk.",
    },
    q2: {
      prompt: "What does “minimum necessary” mean when sharing health information?",
      options: [
        { id: "a", text: "Share only the amount needed for the task—not entire records out of curiosity" },
        { id: "b", text: "Share everything to be helpful" },
        { id: "c", text: "Post records online for transparency" },
        { id: "d", text: "Let friends use your login" },
      ],
      correct: ["a"],
      explanation: "Privacy laws limit disclosure to what is required for care, billing, or approved work.",
    },
    q3: {
      prompt: "You find a USB drive in the parking lot. Best action?",
      options: [
        { id: "a", text: "Plug it into your PC to identify the owner" },
        { id: "b", text: "Hand it to security or IT without plugging it in" },
        { id: "c", text: "Share files with friends" },
        { id: "d", text: "Throw it away silently" },
      ],
      correct: ["b"],
      explanation: "Unknown USBs may auto-run malware—let trained staff handle them safely.",
    },
    habits: [
      { label: "Lock devices with PIN or biometrics", detail: "Protect data at rest." },
      { label: "Use approved file sharing at work", detail: "Avoid personal cloud for work data." },
      { label: "Label or ask about sensitivity before sending", detail: "Prevents accidental oversharing." },
      { label: "Back up important personal files too", detail: "Separate copy from ransomware reach." },
    ],
    takeaways: [
      "Not all data is equal—classify before you share.",
      "Encryption protects lost devices and web traffic.",
      "Minimum necessary reduces privacy harm.",
    ],
  }),

  "keytrain-endpoint-security": easy({
    id: "keytrain-endpoint-security",
    code: "KT-EPS",
    title: "Endpoint Security",
    topics: ["Endpoints defined", "Malware and ransomware", "Updates and antivirus", "Safe downloads", "Warning signs"],
    intro: {
      what: "An endpoint is any device you work on—laptop, desktop, phone, tablet. Endpoint security keeps that device healthy so attackers cannot use it as a doorway into your accounts or your employer’s network.",
      why: "You touch endpoints every day. Understanding malware, updates, and safe installs helps you avoid being the person who accidentally lets ransomware spread.",
      like: "Your device is a backpack you carry everywhere. Endpoint security is the habit of zipping it shut, not accepting mystery packages, and noticing if something inside feels wrong.",
    },
    concepts: [
      {
        title: "Core idea 1: What endpoints are",
        paragraphs: [
          "Servers live in data centers; endpoints live with people. Because endpoints browse the web and open email, they see more tricks than servers locked in a rack.",
          "One infected laptop can spread to file shares, email contacts, and backup drives if not stopped quickly.",
        ],
        bullets: [
          "Personal phones used for work email count too—follow mobile policies.",
          "Shared family PCs need extra care if also used for school or job tasks.",
        ],
      },
      {
        title: "Core idea 2: Malware and ransomware",
        paragraphs: [
          "Malware is any harmful software—spyware, remote control tools, password stealers.",
          "Ransomware encrypts your files and demands payment. Attackers may also steal data first (double extortion).",
        ],
        bullets: [
          "Common entry: malicious email attachment, fake download, or infected USB.",
          "Warning signs: files renamed, desktop background changed, pop-ups demanding payment.",
          "First response: disconnect from network, call IT—do not pay without guidance.",
        ],
      },
      {
        title: "Core idea 3: Updates and security software",
        paragraphs: [
          "Software vendors release updates to fix security holes. Delaying updates leaves known doors open.",
          "Antivirus and modern endpoint detection (EDR) watch for suspicious behavior—not just known virus names.",
        ],
        bullets: [
          "Restart when prompted after updates so fixes finish.",
          "Do not disable security tools unless IT instructs you for a specific test.",
        ],
      },
      {
        title: "Core idea 4: Safe installation habits",
        paragraphs: [
          "Download apps from official stores or vendor sites—not random “free player” buttons on video sites.",
          "Pirated software and game cheats often hide malware.",
          "Browser extensions can read web pages—only install extensions you trust.",
        ],
        bullets: [
          "If a site insists you disable security to continue, leave the site.",
          "Report strange slowness, new toolbars, or antivirus turned off.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "Jordan downloads a “PDF converter” from an ad. The installer also loads software that shows ads and later encrypts documents with a ransom note.",
      ],
      lessons: [
        "Free tools from ads are a common malware path.",
        "Early disconnect and IT involvement limit spread.",
        "Restoring from backup beats paying unknown criminals.",
      ],
    },
    q1: {
      prompt: "What is ransomware?",
      options: [
        { id: "a", text: "Malware that locks or encrypts files and demands payment to restore access" },
        { id: "b", text: "A type of strong password" },
        { id: "c", text: "A free cloud backup" },
        { id: "d", text: "An antivirus brand" },
      ],
      correct: ["a"],
      explanation: "Ransomware threatens availability of your data—backups and IR plans matter.",
    },
    q2: {
      prompt: "Why install updates promptly on endpoints?",
      options: [
        { id: "a", text: "Updates patch security holes attackers already know about" },
        { id: "b", text: "Updates remove the need for passwords" },
        { id: "c", text: "Updates are only for new emojis" },
        { id: "d", text: "Updates slow the internet" },
      ],
      correct: ["a"],
      explanation: "Exploit kits target unpatched systems within days of public fixes.",
    },
    q3: {
      prompt: "Files suddenly show .locked and a ransom note appears. First step?",
      options: [
        { id: "a", text: "Pay immediately in bitcoin" },
        { id: "b", text: "Disconnect from network and notify IT or a trusted helper" },
        { id: "c", text: "Ignore and keep emailing" },
        { id: "d", text: "Post screenshots publicly" },
      ],
      correct: ["b"],
      explanation: "Isolation stops spread; professionals assess backups and legal duties.",
    },
    habits: [
      { label: "Install updates and reboot when asked", detail: "Schedule if needed, but do not defer months." },
      { label: "Use official app stores and vendor sites", detail: "Avoid mystery download buttons." },
      { label: "Keep antivirus/EDR enabled", detail: "Report if status shows at risk." },
      { label: "Speak up early when behavior is odd", detail: "Slowness and pop-ups matter." },
    ],
    takeaways: [
      "Endpoints are where users meet attackers—stay vigilant.",
      "Ransomware needs fast isolation and professional help.",
      "Updates and trusted downloads are daily defense.",
    ],
  }),

  "keytrain-network-security": easy({
    id: "keytrain-network-security",
    code: "KT-NET",
    title: "Network Security",
    topics: ["What a network is", "Wi-Fi safety", "Firewalls and segmentation (simple)", "Suspicious traffic ideas", "Home router basics"],
    intro: {
      what: "A network connects devices so they can share printers, files, and the internet. Network security controls who can connect and what traffic is allowed—at home and at work.",
      why: "Attackers move from one computer to another across networks. Weak Wi-Fi, unknown gadgets plugged into the office, and flat networks make that movement easy.",
      like: "A network is hallways between rooms. You want locked doors between guest areas and offices, not one open hallway where anyone can walk into every room.",
    },
    concepts: [
      {
        title: "Core idea 1: Networks connect devices",
        paragraphs: [
          "Your home Wi-Fi, office LAN, and mobile data are all networks. Data travels in packets—like labeled envelopes.",
          "Routers and switches direct traffic; firewalls block or allow types of traffic based on rules.",
        ],
        bullets: [
          "IP address — like an apartment number for a device on the network.",
          "DNS — turns website names into addresses; attackers can abuse DNS if you use untrusted resolvers.",
        ],
      },
      {
        title: "Core idea 2: Wi-Fi and public networks",
        paragraphs: [
          "Password-protected WPA2/WPA3 home Wi-Fi is much better than open Wi-Fi where anyone nearby can listen.",
          "Public café or hotel Wi-Fi is convenient but not trustworthy for banking or work logins without extra protection (VPN if your employer provides one).",
        ],
        bullets: [
          "Forget public networks after use so your device does not auto-rejoin risky ones.",
          "Mobile data is often safer than open Wi-Fi for sensitive tasks.",
        ],
      },
      {
        title: "Core idea 3: Segmentation (don’t put everything in one bucket)",
        paragraphs: [
          "Segmentation splits networks so a virus on a guest laptop cannot reach payroll servers. Work VLANs, guest Wi-Fi, and IoT networks are often separated.",
          "At home, put smart gadgets on a guest network if your router supports it—so a compromised camera cannot reach your laptop shares.",
        ],
        bullets: [
          "Servers and databases usually live on protected segments with fewer people.",
          "Printers and TVs do not need the same access as finance systems.",
        ],
      },
      {
        title: "Core idea 4: Watching for odd network behavior",
        paragraphs: [
          "Security teams look for beaconing (a sick computer checking in with criminals regularly), unusual outbound connections, and ARP/DNS tricks on local networks.",
          "You help by reporting sudden outages, captive portal loops, or certificate warnings on internal sites.",
        ],
        bullets: [
          "Do not plug unknown “Wi-Fi boosters” or switches into work networks—ask IT.",
          "Certificate warnings on internal apps may mean interception—report, do not click through blindly.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "A contractor plugs a cheap router into the office network to get “better Wi-Fi,” but it is misconfigured and exposes file shares to the building guest network.",
      ],
      lessons: [
        "Unauthorized hardware changes the network map.",
        "IT approval ensures devices meet security settings.",
        "Segmentation limits how far mistakes reach.",
      ],
    },
    q1: {
      prompt: "Why is open public Wi-Fi risky for logging into your bank?",
      options: [
        { id: "a", text: "Others on the network may intercept or manipulate traffic" },
        { id: "b", text: "Banks close on weekends" },
        { id: "c", text: "Phones cannot use Wi-Fi" },
        { id: "d", text: "Passwords become stronger on public Wi-Fi" },
      ],
      correct: ["a"],
      explanation: "Use trusted networks, VPN when provided, or mobile data for sensitive logins.",
    },
    q2: {
      prompt: "What is network segmentation trying to achieve?",
      options: [
        { id: "a", text: "Limit how far an attacker or malware can move inside the organization" },
        { id: "b", text: "Make all devices share one password" },
        { id: "c", text: "Speed up video streaming only" },
        { id: "d", text: "Remove the need for firewalls" },
      ],
      correct: ["a"],
      explanation: "Separate zones protect critical systems from compromised laptops or IoT.",
    },
    q3: {
      prompt: "Unknown hardware labeled “free Wi-Fi booster” arrives for your desk. What should you do?",
      options: [
        { id: "a", text: "Plug it in immediately" },
        { id: "b", text: "Ask IT before connecting anything to the network" },
        { id: "c", text: "Give it to visitors" },
        { id: "d", text: "Hide it in a drawer forever" },
      ],
      correct: ["b"],
      explanation: "Rogue devices can open backdoors—inventory and approval matter.",
    },
    habits: [
      { label: "Change default router passwords at home", detail: "Use WPA2/WPA3 with a strong Wi-Fi password." },
      { label: "Prefer mobile data or VPN on public Wi-Fi", detail: "For banking and work." },
      { label: "Only IT-approved gear on work networks", detail: "No personal routers or hubs." },
      { label: "Report certificate warnings on internal sites", detail: "Could signal attack or misconfiguration." },
    ],
    takeaways: [
      "Networks connect risk as well as convenience—segment when possible.",
      "Public Wi-Fi is not a private office—choose connections wisely.",
      "Unauthorized hardware can undo other security work.",
    ],
  }),

  "keytrain-system-hygiene": easy({
    id: "keytrain-system-hygiene",
    code: "KT-SYS",
    title: "System Hygiene",
    topics: ["Patches and updates", "Supported software", "Configuration basics", "Removing unused programs", "Compliance with IT policy"],
    intro: {
      what: "System hygiene is ongoing care for computers and servers—like cleaning and maintenance so small problems do not become breaches.",
      why: "Attackers love old software with known holes. Snowflake systems nobody patches become the weak link ransomware uses to enter.",
      like: "Hygiene is brushing teeth and changing oil—not exciting, but it prevents painful emergencies.",
    },
    concepts: [
      {
        title: "Core idea 1: Patching (closing known holes)",
        paragraphs: [
          "Vendors publish patches when they learn about security flaws. Critical patches for internet-facing systems should not wait months.",
          "Patching includes operating systems, browsers, office apps, VPN clients, and firmware on routers.",
        ],
        bullets: [
          "Reboot when required—some fixes do not apply until restart.",
          "If you cannot patch, document why and isolate the system.",
        ],
      },
      {
        title: "Core idea 2: Unsupported and end-of-life software",
        paragraphs: [
          "When a vendor stops support, new holes will not be fixed—Windows 7, old Android versions, abandoned plugins.",
          "Keep legacy systems off the internet or inside heavily controlled networks.",
        ],
        bullets: [
          "Virtual machines running old software for one app need the same risk thinking.",
          "Replace or upgrade before compliance audits fail.",
        ],
      },
      {
        title: "Core idea 3: Configuration and drift",
        paragraphs: [
          "Secure configuration means turning off services you do not need, enabling logging, and using strong settings—not factory defaults.",
          "Drift happens when someone tweaks a server manually and forgets—automation and periodic scans keep systems aligned.",
        ],
        bullets: [
          "Default admin passwords on printers and IoT must be changed.",
          "Follow IT hardening guides instead of random internet tips.",
        ],
      },
      {
        title: "Core idea 4: Reducing attack surface",
        paragraphs: [
          "Uninstall programs you do not use—each program is code that might have bugs.",
          "Local administrator rights on daily accounts increase damage from one click.",
        ],
        bullets: [
          "Approve exceptions through change control with an expiry date.",
          "Inventory software so you know what to patch when CVEs appear.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "A lab machine runs old control software that cannot update. It stays on the corporate LAN with file sharing enabled.",
      ],
      lessons: [
        "Unsupported OS on a reachable network is a known risk.",
        "Isolate on a VLAN with firewall rules or move data via a jump box.",
        "Document risk acceptance with leadership sign-off.",
      ],
    },
    q1: {
      prompt: "Why is delaying critical security patches on a VPN appliance dangerous?",
      options: [
        { id: "a", text: "Attackers scan the internet for known flaws on VPNs within days" },
        { id: "b", text: "Patches make screens brighter" },
        { id: "c", text: "VPNs do not use the internet" },
        { id: "d", text: "Patches remove passwords" },
      ],
      correct: ["a"],
      explanation: "Internet-facing systems need emergency patching when remote code execution flaws appear.",
    },
    q2: {
      prompt: "What does end-of-life software mean for security?",
      options: [
        { id: "a", text: "The vendor will not release security fixes—risk keeps growing" },
        { id: "b", text: "The software becomes free" },
        { id: "c", text: "It automatically encrypts data" },
        { id: "d", text: "It runs faster" },
      ],
      correct: ["a"],
      explanation: "Plan migration or isolation—do not leave EOL systems exposed.",
    },
    q3: {
      prompt: "Your PC offers “Update ready—restart tonight.” You can spare five minutes tomorrow. Best choice?",
      options: [
        { id: "a", text: "Snooze forever" },
        { id: "b", text: "Allow the update and restart when convenient" },
        { id: "c", text: "Delete system files" },
        { id: "d", text: "Share your password" },
      ],
      correct: ["b"],
      explanation: "Routine patching closes holes before attackers exploit them.",
    },
    habits: [
      { label: "Apply updates on schedule", detail: "Do not ignore restart prompts for months." },
      { label: "Remove unused software", detail: "Shrinks attack surface." },
      { label: "Follow IT configuration standards", detail: "Avoid one-off risky tweaks." },
      { label: "Flag legacy systems for a plan", detail: "Replace, isolate, or accept risk formally." },
    ],
    takeaways: [
      "Patching fixes known doors—prioritize internet-facing gear.",
      "End-of-life software needs isolation or replacement.",
      "Hygiene is continuous, not a once-a-year project.",
    ],
  }),

  "keytrain-application-security": easy({
    id: "keytrain-application-security",
    code: "KT-APP",
    title: "Application Security",
    topics: ["How apps handle data", "Logins and sessions", "Permissions", "Input and links", "Safe use on shared devices"],
    intro: {
      what: "Application security focuses on programs and websites—how they store passwords, check permissions, and handle user input. Flaws here let attackers steal data even when the network is fine.",
      why: "You use dozens of apps. Knowing how sessions, permissions, and fake sites work helps you avoid giving away access accidentally.",
      like: "An app is a shop clerk. A secure app checks your ID every time you ask for something sensitive. A weak app hands your package to anyone who asks.",
    },
    concepts: [
      {
        title: "Core idea 1: Apps and your data",
        paragraphs: [
          "Applications read, store, and display data—messages, photos, health charts, money. They should only show your data to you.",
          "Cloud apps store data on servers elsewhere; you still must protect your login.",
        ],
        bullets: [
          "Read privacy policies for apps handling children’s or health data.",
          "Log out on shared devices—even “private” browsing is not enough alone.",
        ],
      },
      {
        title: "Core idea 2: Logins, sessions, and cookies",
        paragraphs: [
          "After you sign in, the app keeps a session so you are not asked every second. Sessions use cookies or tokens—like a wristband at an event.",
          "If someone steals your session, they may not need your password again until it expires—lock devices and log out on shared PCs.",
        ],
        bullets: [
          "“Remember me” on public computers is dangerous.",
          "Sign out of web apps, not just close the tab.",
        ],
      },
      {
        title: "Core idea 3: Permissions on phones and browsers",
        paragraphs: [
          "Apps request access to camera, contacts, location. Ask: does this app truly need that access to work?",
          "A simple flashlight app should not need your entire contact list.",
        ],
        bullets: [
          "Review permissions in phone settings periodically.",
          "Browser extensions can read pages—install only trusted extensions.",
        ],
      },
      {
        title: "Core idea 4: Unsafe input and fake sites",
        paragraphs: [
          "Attackers trick apps with malicious input—fake login pages, SQL injection in search boxes (developers must fix), links that run scripts.",
          "Users defend by typing addresses themselves, checking HTTPS, and refusing odd downloads from pop-ups.",
        ],
        bullets: [
          "Developers should validate input on the server; users should not paste unknown commands into terminals.",
          "IDOR means changing a number in the URL must not show another person’s records—that is a developer fix you can report if seen.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "A user stays logged into webmail on a library PC and walks away. The next visitor sends spam from their account and changes the recovery phone number.",
      ],
      lessons: [
        "Sessions stay alive until logout or timeout.",
        "Recovery changes can lock the real user out.",
        "Always log out on shared computers.",
      ],
    },
    q1: {
      prompt: "Why should a flashlight app requesting all contacts be denied?",
      options: [
        { id: "a", text: "It likely does not need contacts—could be collecting data improperly" },
        { id: "b", text: "Contacts make the light brighter" },
        { id: "c", text: "Phones require contacts for power" },
        { id: "d", text: "Permissions are decorative" },
      ],
      correct: ["a"],
      explanation: "Request only permissions that match the app’s real function.",
    },
    q2: {
      prompt: "You finished email on a shared computer. Best practice?",
      options: [
        { id: "a", text: "Close the tab only" },
        { id: "b", text: "Log out of the site and close the browser" },
        { id: "c", text: "Save password for the next stranger" },
        { id: "d", text: "Leave it open for convenience" },
      ],
      correct: ["b"],
      explanation: "Logout ends the session; closing tabs may leave you signed in.",
    },
    q3: {
      prompt: "Changing a link from /order/105 to /order/106 shows someone else’s order without a new login. This suggests:",
      options: [
        { id: "a", text: "The app is not checking authorization for each order (a serious flaw)" },
        { id: "b", text: "Normal caching" },
        { id: "c", text: "Better Wi-Fi" },
        { id: "d", text: "A printer issue" },
      ],
      correct: ["a"],
      explanation: "Each record access must be checked server-side—report to the service/provider.",
    },
    habits: [
      { label: "Log out on shared or kiosk devices", detail: "Libraries, hotels, trade shows." },
      { label: "Review app permissions yearly", detail: "Revoke what is not needed." },
      { label: "Install from official stores or vendor sites", detail: "Avoid cracked software." },
      { label: "Report apps that show other people’s data", detail: "Could be a major vulnerability." },
    ],
    takeaways: [
      "Sessions are valuable—protect devices and log out on shared PCs.",
      "Permissions should match app purpose.",
      "Authorization bugs are not your fault to fix, but report them.",
    ],
  }),

  "keytrain-financial-security": easy({
    id: "keytrain-financial-security",
    code: "KT-FIN",
    title: "Financial Security",
    topics: ["Payment fraud types", "Verification habits", "Segregation of duties", "Gift cards and wires", "Audit trails"],
    intro: {
      what: "Financial security protects money moving through invoices, payroll, cards, and online banking. Criminals target these flows because one successful trick can move thousands of dollars in minutes.",
      why: "Finance teams are trained, but anyone can receive a convincing fake invoice or family emergency text. Understanding core controls helps everyone spot fraud.",
      like: "Moving money is like handing over cash. You would not hand bills to a stranger who wore a convincing uniform—you would verify identity and amount.",
    },
    concepts: [
      {
        title: "Core idea 1: Common financial fraud types",
        paragraphs: [
          "Business email compromise changes payment instructions by email.",
          "Payroll fraud redirects direct deposit to another account.",
          "Invoice fraud sends fake bills or duplicates real ones.",
          "Gift card scams demand codes urgently—codes are untraceable cash.",
        ],
        bullets: [
          "Deepfake voice calls are emerging—still verify with known numbers.",
          "Romance and emergency family scams target individuals at home.",
        ],
      },
      {
        title: "Core idea 2: Out-of-band verification",
        paragraphs: [
          "Out-of-band means confirming through a different channel than the request arrived—call the vendor on a number from your records, not the email signature.",
          "Never trust a new bank account in an email until verified.",
        ],
        bullets: [
          "Small delays prevent large losses.",
          "Document who approved changes and when.",
        ],
      },
      {
        title: "Core idea 3: Segregation of duties",
        paragraphs: [
          "No single person should create a vendor, approve invoices, and send payments without oversight.",
          "Dual approval for amounts above a threshold catches mistakes and fraud.",
        ],
        bullets: [
          "Managers should review unusual round-dollar or rush requests.",
          "Reconcile bank statements regularly—automated alerts help.",
        ],
      },
      {
        title: "Core idea 4: Records and integrity",
        paragraphs: [
          "Financial systems should log changes—who edited vendor bank details, who exported payroll.",
          "Sudden large transfers to new countries or crypto wallets deserve extra scrutiny.",
        ],
        bullets: [
          "Gift card codes are like cash—treat photos of codes as money leaving the building.",
          "Report internal pressure to skip controls.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "Accounts payable receives a PDF invoice matching a real vendor but with a new bank account and a note “urgent—close books today.”",
      ],
      lessons: [
        "Layout can be copied from real invoices.",
        "Callback to the vendor’s known contact exposes many fakes.",
        "Dual approval slows fraud without blocking legitimate business.",
      ],
    },
    q1: {
      prompt: "Best control before paying a new vendor bank account from email?",
      options: [
        { id: "a", text: "Verify by phone using a number you look up, plus second approver if required" },
        { id: "b", text: "Pay faster to be polite" },
        { id: "c", text: "Reply to the email only" },
        { id: "d", text: "Post the invoice online" },
      ],
      correct: ["a"],
      explanation: "Email is not proof of bank change—verified voice or in-person process is.",
    },
    q2: {
      prompt: "Why are gift card codes especially risky in scams?",
      options: [
        { id: "a", text: "They spend like cash and are hard to trace or reverse" },
        { id: "b", text: "They expire passwords" },
        { id: "c", text: "They patch computers" },
        { id: "d", text: "They encrypt networks" },
      ],
      correct: ["a"],
      explanation: "Once codes leave your hands, recovery is unlikely—treat urgency as a red flag.",
    },
    q3: {
      prompt: "Text says “Nephew in jail—send gift cards now.” You have not spoken to your nephew. What now?",
      options: [
        { id: "a", text: "Buy cards and text codes" },
        { id: "b", text: "Call your nephew on a number you already know" },
        { id: "c", text: "Post the text publicly" },
        { id: "d", text: "Email your bank password" },
      ],
      correct: ["b"],
      explanation: "Family emergency scams exploit emotion—verify independently.",
    },
    habits: [
      { label: "Pause on urgent payment or secrecy requests", detail: "Scammers manufacture deadlines." },
      { label: "Use official approval paths at work", detail: "No side-channel wires." },
      { label: "Keep gift card and wire details private", detail: "Treat like physical cash." },
      { label: "Reconcile accounts you touch", detail: "Catch odd small tests before big thefts." },
    ],
    takeaways: [
      "Verify bank and payroll changes out of band.",
      "Segregation of duties blocks single-person fraud.",
      "Gift cards and wires need extra skepticism.",
    ],
  }),

  "keytrain-physical-security": easy({
    id: "keytrain-physical-security",
    code: "KT-PHY",
    title: "Physical Security",
    topics: ["Facility access", "Tailgating", "Device protection", "Visitors", "Environmental awareness"],
    intro: {
      what: "Physical security protects buildings, equipment, and people in the real world. Digital security fails if anyone can walk in and plug into the network or take a laptop.",
      why: "Tailgating, stolen badges, and unlocked screens cause real breaches. Physical habits are simple but only work if everyone follows them.",
      like: "Physical security is locks, badges, and awareness—the same reasons you lock your car and do not leave keys in the ignition.",
    },
    concepts: [
      {
        title: "Core idea 1: Controlled access",
        paragraphs: [
          "Badges, keys, and biometrics track who entered secure areas. Doors should close fully; propping doors defeats the system.",
          "Visitors sign in, get temporary badges, and are escorted—not wandering alone.",
        ],
        bullets: [
          "Secure areas include server rooms, labs, and HR offices—not just the front gate.",
          "After-hours access should match job needs and be logged.",
        ],
      },
      {
        title: "Core idea 2: Tailgating and social engineering",
        paragraphs: [
          "Tailgating is entering behind someone without badging yourself. Attackers may carry boxes or wear uniforms to look legitimate.",
          "Politely ask unknown people to badge in or visit the front desk—culture should support challenge, not embarrassment.",
        ],
        bullets: [
          "Do not lend your badge.",
          "Report doors that do not latch or cameras that are broken.",
        ],
      },
      {
        title: "Core idea 3: Protecting devices and media",
        paragraphs: [
          "Laptops, phones, and USB drives left in cars or cafes get stolen. Encryption limits data loss if hardware is taken.",
          "Clear-desk rules reduce sensitive papers visible to cleaners or visitors.",
          "Shred confidential paper instead of tossing in regular trash.",
        ],
        bullets: [
          "Cable-lock laptops in semi-public offices.",
          "Report theft immediately for remote wipe and password resets.",
        ],
      },
      {
        title: "Core idea 4: Environmental and supply chain awareness",
        paragraphs: [
          "Fire, flood, and power loss affect availability—know evacuation routes and where backups live.",
          "Unexpected hardware gifts or “free” network gear may hide implants—IT should inspect.",
        ],
        bullets: [
          "CCTV deters theft and helps investigations but needs privacy policies.",
          "Deliveries to server areas should match purchase orders.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "An attacker in a delivery vest follows an employee through a badge door and plugs a small device into an open network port in an empty meeting room.",
      ],
      lessons: [
        "Challenge or escort—even friendly tailgating opens risk.",
        "Unused ports can be disabled or monitored.",
        "Quick reporting triggers camera review and port shutdown.",
      ],
    },
    q1: {
      prompt: "Unknown person asks you to hold the secure door because “hands are full.” You do not know them. Best action?",
      options: [
        { id: "a", text: "Hold the door open without question" },
        { id: "b", text: "Ask them to badge in or check in at reception" },
        { id: "c", text: "Lend your badge" },
        { id: "d", text: "Ignore security forever" },
      ],
      correct: ["b"],
      explanation: "Use official visitor processes—tailgating is a top physical intrusion method.",
    },
    q2: {
      prompt: "Why lock your computer screen when stepping away for coffee?",
      options: [
        { id: "a", text: "Prevents others from using your open session to read or send data" },
        { id: "b", text: "Improves coffee flavor" },
        { id: "c", text: "Charges the battery faster" },
        { id: "d", text: "Updates the router" },
      ],
      correct: ["a"],
      explanation: "Screen lock is instant protection—like locking a door.",
    },
    q3: {
      prompt: "Why report a lost badge immediately?",
      options: [
        { id: "a", text: "So access can be disabled before someone else uses it" },
        { id: "b", text: "To get a new wallpaper" },
        { id: "c", text: "Badges never matter" },
        { id: "d", text: "HR only" },
      ],
      correct: ["a"],
      explanation: "Badges are keys—revoke fast to protect the building and data.",
    },
    habits: [
      { label: "Badge in yourself; do not tailgate others", detail: "Hold culture accountable kindly." },
      { label: "Lock screens and stow sensitive papers", detail: "Every time you leave the desk." },
      { label: "Escort visitors in secure zones", detail: "No wandering guests." },
      { label: "Report lost badges and broken doors same day", detail: "Facilities and security need quick notice." },
    ],
    takeaways: [
      "Physical access enables digital attacks—badge discipline matters.",
      "Screen lock and clear desk are quick wins.",
      "Challenge unknown people politely using policy.",
    ],
  }),

  "keytrain-compliance-governance": easy({
    id: "keytrain-compliance-governance",
    code: "KT-CG",
    title: "Compliance & Governance",
    topics: ["What compliance means", "Privacy laws overview", "Policies and training", "Evidence and audits", "Reporting incidents"],
    intro: {
      what: "Compliance means following laws, regulations, and company policies designed to protect people’s information and treat risk seriously. Governance is the structure—who decides, who checks, and how records are kept.",
      why: "Rules exist because data breaches hurt real people—lost jobs, identity theft, medical privacy violations. Training and documentation prove the organization tried to prevent harm.",
      like: "Compliance is the rulebook and referees in sports. Governance is making sure teams know the rules, coaches enforce them, and scores are recorded honestly.",
    },
    concepts: [
      {
        title: "Core idea 1: Laws and frameworks (plain overview)",
        paragraphs: [
          "HIPAA protects health information in the U.S. FERPA protects student education records. GDPR in Europe gives people rights over personal data.",
          "Industry standards like PCI DSS cover payment cards; organizations may also follow SOC 2 or ISO 27001 to show security maturity to customers.",
        ],
        bullets: [
          "You do not need to memorize every law—know which apply to your workplace.",
          "Contracts (BAAs with vendors) extend duties to partners who touch your data.",
        ],
      },
      {
        title: "Core idea 2: Policies and acceptable use",
        paragraphs: [
          "Policies translate law into daily rules—password length, approved cloud tools, social media on work devices.",
          "Signing acceptable use policies means you agree to follow them; ignorance is not a defense after training.",
        ],
        bullets: [
          "Keep policies where you can find them (intranet, handbook).",
          "Ask compliance or legal when a new tool is not on the approved list.",
        ],
      },
      {
        title: "Core idea 3: Minimum necessary and need-to-know",
        paragraphs: [
          "Only access records required for your job—curiosity about celebrities, neighbors, or ex-partners is forbidden in healthcare and many workplaces.",
          "Role-based access implements need-to-know technically; culture reinforces it.",
        ],
        bullets: [
          "Audit logs record lookups—assume your accesses can be reviewed.",
          "De-identify data when possible for analytics or testing.",
        ],
      },
      {
        title: "Core idea 4: Incidents, evidence, and risk registers",
        paragraphs: [
          "Report suspected breaches quickly—timelines matter for notification laws.",
          "Keep evidence: tickets, approvals, training completion, scan reports—not just verbal promises.",
          "Risk registers track issues, owners, and fixes so leadership prioritizes money and time.",
        ],
        bullets: [
          "Document exceptions with expiry dates and approvers.",
          "Post-incident reviews improve policies—blameless learning where possible.",
        ],
      },
    ],
    example: {
      paragraphs: [
        "A curious employee looks up a famous patient’s chart without treatment reason. Audit logs flag the access; privacy officer investigates.",
      ],
      lessons: [
        "Curiosity is not a valid purpose under HIPAA minimum necessary.",
        "Discipline and retraining follow policy.",
        "Logs make invisible browsing visible.",
      ],
    },
    q1: {
      prompt: "Coworker asks you to look up a celebrity’s health record “for fun.” You have billing access. What should you do?",
      options: [
        { id: "a", text: "Look it up quickly" },
        { id: "b", text: "Refuse—only access records needed for your authorized work" },
        { id: "c", text: "Post findings online" },
        { id: "d", text: "Share your login" },
      ],
      correct: ["b"],
      explanation: "Privacy laws limit access to job-related need—not entertainment.",
    },
    q2: {
      prompt: "Why do organizations require security training and keep completion records?",
      options: [
        { id: "a", text: "To show due care and teach consistent rules before incidents happen" },
        { id: "b", text: "Only to waste time" },
        { id: "c", text: "Because computers cannot learn" },
        { id: "d", text: "To replace firewalls" },
      ],
      correct: ["a"],
      explanation: "Training plus evidence helps in audits and lawsuits after breaches.",
    },
    q3: {
      prompt: "You think you emailed patient data to the wrong external address. First step?",
      options: [
        { id: "a", text: "Hide it and hope nobody notices" },
        { id: "b", text: "Report to privacy/security immediately per policy" },
        { id: "c", text: "Delete all email forever" },
        { id: "d", text: "Post an apology on social media" },
      ],
      correct: ["b"],
      explanation: "Early reporting starts containment and required notifications within legal clocks.",
    },
    habits: [
      { label: "Complete assigned compliance training on time", detail: "Rules change; refresh yearly." },
      { label: "Use only approved tools for sensitive data", detail: "No shadow IT with PHI or PII." },
      { label: "Ask before sharing when unsure", detail: "Privacy officers prefer questions to breaches." },
      { label: "Report mistakes and odd access fast", detail: "Speed helps victims and the organization." },
    ],
    takeaways: [
      "Compliance protects people—not just checkbox exercises.",
      "Minimum necessary and need-to-know guide daily choices.",
      "Report incidents early; evidence and training matter in audits.",
    ],
  }),
};
