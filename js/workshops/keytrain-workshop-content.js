/**
 * Interactive workshop curricula for KeyTrain's ten training categories.
 * @typedef {import('../workshop-runner.js').KeytrainWorkshop} KeytrainWorkshop
 * @typedef {import('../workshop-runner.js').WorkshopStep} WorkshopStep
 */

/**
 * @param {Partial<KeytrainWorkshop> & Pick<KeytrainWorkshop, 'id'|'title'|'code'|'tagline'|'topics'|'steps'>} w
 * @returns {KeytrainWorkshop}
 */
function workshop(w) {
  return {
    estimatedMinutes: Math.max(12, w.steps.length * 2),
    ...w,
  };
}

/** @type {Record<string, KeytrainWorkshop>} */
export const KEYTRAIN_WORKSHOPS = {
  "keytrain-identity-access": workshop({
    id: "keytrain-identity-access",
    title: "Identity & Access Security",
    code: "KT-IAS",
    tagline: "Authentication, MFA, privileges, and credential hygiene.",
    topics: ["Authentication", "MFA", "Privilege escalation", "Account misuse", "Credential abuse"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Why identity is the front door",
        paragraphs: [
          "Most breaches start with a valid identity—stolen password, reused session, or over-privileged account. Defenders focus on who is requesting access, from where, and whether that access still makes sense.",
        ],
        bullets: [
          "Authentication proves who you are (password, certificate, biometrics).",
          "Authorization decides what you may do after authentication.",
          "Continuous validation beats one-time login at the front door.",
        ],
      },
      {
        id: "mfa",
        type: "lesson",
        title: "Multi-factor authentication (MFA)",
        paragraphs: [
          "MFA combines something you know, have, or are. It blocks most password-spray and phishing reuse because the attacker lacks the second factor.",
        ],
        bullets: [
          "Prefer phishing-resistant methods (FIDO2 / passkeys) for privileged users.",
          "Enforce MFA on remote access, admin consoles, and email.",
          "Recovery codes and SMS are better than nothing—but weaker than app or hardware tokens.",
        ],
      },
      {
        id: "quiz-mfa",
        type: "quiz",
        title: "Quick check: MFA",
        prompt:
          "A help-desk ticket asks you to approve an MFA push you did not initiate while you are logged in at your desk. What is the best first action?",
        options: [
          { id: "a", text: "Approve it so the ticket can close" },
          { id: "b", text: "Deny the push and report a suspected compromise" },
          { id: "c", text: "Share your MFA device with a teammate to test" },
          { id: "d", text: "Disable MFA to stop the notifications" },
        ],
        correct: ["b"],
        explanation:
          "Unexpected MFA prompts are a classic sign of stolen credentials. Deny, report, and rotate passwords with security.",
      },
      {
        id: "privilege",
        type: "lesson",
        title: "Least privilege & escalation paths",
        paragraphs: [
          "Privilege escalation turns a normal user into an admin—through misconfiguration, stolen tokens, or abuse of service accounts.",
        ],
        bullets: [
          "Grant role-based access; review quarterly.",
          "Separate admin accounts from daily-driver accounts.",
          "Monitor for new local admins, shadow roles, and impossible travel.",
        ],
      },
      {
        id: "scenario-admin",
        type: "quiz",
        title: "Scenario: new local administrator",
        prompt:
          "Overnight, a standard workstation account appears in the local Administrators group on a finance laptop. No change ticket exists. What should you do first?",
        options: [
          { id: "a", text: "Remove the group membership and close the ticket" },
          { id: "b", text: "Isolate the host, preserve logs, and escalate to incident response" },
          { id: "c", text: "Reboot the laptop and continue monitoring" },
          { id: "d", text: "Reset the user's email password only" },
        ],
        correct: ["b"],
        explanation:
          "Unexpected local admin rights may indicate compromise. Contain, collect evidence, then remediate with IR procedures.",
      },
      {
        id: "habits",
        type: "checklist",
        title: "Daily identity habits",
        paragraphs: ["Use this checklist as a team discussion prompt:"],
        items: [
          { id: "h1", label: "Use unique passwords with a manager", detail: "Stops credential stuffing." },
          { id: "h2", label: "Lock screen when away", detail: "Prevents session hijack at the desk." },
          { id: "h3", label: "Question unexpected admin rights", detail: "Report without self-removing evidence." },
          { id: "h4", label: "Rotate API keys and service passwords", detail: "Treat secrets like production data." },
        ],
      },
      {
        id: "quiz-creds",
        type: "quiz",
        title: "Credential abuse",
        prompt:
          "Which practice best reduces credential abuse from phishing?",
        options: [
          { id: "a", text: "Password complexity rules only (no MFA)" },
          { id: "b", text: "MFA plus security awareness on reporting phish" },
          { id: "c", text: "Posting passwords in an internal wiki" },
          { id: "d", text: "Disabling account lockout" },
        ],
        correct: ["b"],
        explanation: "Layered controls—MFA, reporting, and rapid revocation—limit abuse of stolen credentials.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Treat identity as ongoing verification, not a one-time login.",
          "Investigate unexpected MFA prompts and privilege changes immediately.",
          "Pair least privilege with monitoring and user reporting culture.",
        ],
      },
    ],
  }),

  "keytrain-email-security": workshop({
    id: "keytrain-email-security",
    title: "Email Security",
    code: "KT-EMS",
    tagline: "Phishing, spoofing, attachments, and business email compromise.",
    topics: ["Phishing", "Spoofing", "Malicious attachments", "BEC"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Email as the #1 delivery channel",
        paragraphs: [
          "Email crosses trust boundaries every day. Attackers abuse urgency, authority, and familiarity to make users click, reply, or wire funds.",
        ],
        bullets: [
          "Phishing steals credentials or installs malware.",
          "Spoofing forges sender identity (display name, domain, or both).",
          "BEC targets payments and data using social engineering, not always malware.",
        ],
      },
      {
        id: "signals",
        type: "lesson",
        title: "Spotting phishing signals",
        bullets: [
          "Mismatched URLs (hover before click).",
          "Generic greetings and odd grammar.",
          "Requests to bypass process (gift cards, wire transfers, secrecy).",
          "Attachments you did not expect (.html, .zip, macro docs).",
        ],
      },
      {
        id: "quiz-phish",
        type: "quiz",
        title: "Quick check: suspicious link",
        prompt:
          'An email from "IT Support" says your mailbox is full and links to http://mail-fix-login.example-verify.io. What is the safest action?',
        options: [
          { id: "a", text: "Click the link and sign in quickly" },
          { id: "b", text: "Use the report-phish button and delete the message" },
          { id: "c", text: "Forward the email to coworkers for opinions" },
          { id: "d", text: "Reply asking if it is legitimate" },
        ],
        correct: ["b"],
        explanation:
          "Unknown domains mimicking IT are phishing. Report through official tools—do not engage or spread the message.",
      },
      {
        id: "spoof",
        type: "lesson",
        title: "Spoofing & authentication",
        paragraphs: [
          "Email authentication (SPF, DKIM, DMARC) helps receivers detect forged senders. Users still must read headers and context when something feels wrong.",
        ],
        bullets: [
          "Display names can lie—check the actual address.",
          "External banners exist for a reason.",
          "When in doubt, verify via a known phone number or ticket system.",
        ],
      },
      {
        id: "scenario-bec",
        type: "quiz",
        title: "Scenario: wire transfer change",
        prompt:
          "The CFO's assistant emails AP to change wire instructions to a new bank account, marked urgent and confidential. The message comes from a look-alike domain. What should AP do?",
        options: [
          { id: "a", text: "Process immediately to avoid delaying payroll" },
          { id: "b", text: "Call the CFO on a known number to verify out-of-band" },
          { id: "c", text: "Reply to the email asking for confirmation" },
          { id: "d", text: "Forward the new bank details to the vendor" },
        ],
        correct: ["b"],
        explanation:
          "BEC wire changes require out-of-band verification with a trusted contact—never trust email alone.",
      },
      {
        id: "attachments",
        type: "checklist",
        title: "Safe attachment habits",
        items: [
          { id: "a1", label: "Preview unexpected files in sandbox where available" },
          { id: "a2", label: "Block macros unless business-required" },
          { id: "a3", label: "Scan USB and downloads with endpoint tools" },
          { id: "a4", label: "Report malware attachments to security" },
        ],
      },
      {
        id: "quiz-bec",
        type: "quiz",
        title: "BEC awareness",
        prompt: "Which control best reduces business email compromise losses?",
        options: [
          { id: "a", text: "Dual approval for payment changes plus callback verification" },
          { id: "b", text: "Larger mailbox quotas" },
          { id: "c", text: "Disabling spam filters" },
          { id: "d", text: "Shared finance passwords" },
        ],
        correct: ["a"],
        explanation: "Process controls (dual control, callbacks) stop fraudulent payment redirects.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Slow down on urgency and authority in email.",
          "Report phishing; never test suspicious links in production.",
          "Verify financial changes through a separate trusted channel.",
        ],
      },
    ],
  }),

  "keytrain-data-protection": workshop({
    id: "keytrain-data-protection",
    title: "Data Protection",
    code: "KT-DP",
    tagline: "Classification, encryption, DLP, media, and backups.",
    topics: ["Sensitive data", "Encryption", "DLP", "Removable media", "Backups"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Know your data",
        paragraphs: [
          "You cannot protect what you have not classified. Label data by sensitivity and apply controls that match risk—public, internal, confidential, regulated.",
        ],
        bullets: [
          "PII, PHI, and payment data trigger legal and contractual duties.",
          "Minimize collection—only keep what processes require.",
          "Retention limits reduce breach impact.",
        ],
      },
      {
        id: "encrypt",
        type: "lesson",
        title: "Encryption essentials",
        bullets: [
          "Encrypt data at rest on laptops, databases, and object storage.",
          "Use TLS for data in transit—no sensitive data over unencrypted channels.",
          "Manage keys separately from ciphertext (KMS/HSM).",
        ],
      },
      {
        id: "quiz-classify",
        type: "quiz",
        title: "Classification decision",
        prompt:
          "A spreadsheet with employee SSNs is stored on an unencrypted USB drive for a conference demo. What is the primary risk?",
        options: [
          { id: "a", text: "Slow USB read speed" },
          { id: "b", text: "Uncontrolled sensitive data exposure if the drive is lost" },
          { id: "c", text: "Spreadsheet file size" },
          { id: "d", text: "Missing antivirus on the projector" },
        ],
        correct: ["b"],
        explanation: "Sensitive data on unencrypted removable media is a high-impact loss scenario.",
      },
      {
        id: "dlp",
        type: "lesson",
        title: "Data loss prevention (DLP)",
        paragraphs: [
          "DLP policies detect sensitive patterns leaving the org—email, cloud uploads, endpoints. They warn or block based on policy.",
        ],
        bullets: [
          "Tune rules to reduce false positives.",
          "Educate users on why uploads were blocked.",
          "Pair DLP with access controls on SaaS sharing links.",
        ],
      },
      {
        id: "scenario-dlp",
        type: "quiz",
        title: "Scenario: cloud upload block",
        prompt:
          "DLP blocks you from uploading a customer export to a personal cloud folder. The export is required for an approved project. What should you do?",
        options: [
          { id: "a", text: "Rename the file to bypass DLP" },
          { id: "b", text: "Use the approved corporate storage and ticket exception process" },
          { id: "c", text: "Email the export to your personal account" },
          { id: "d", text: "Disable endpoint security" },
        ],
        correct: ["b"],
        explanation: "Follow approved data paths—exceptions exist so security can log and protect data.",
      },
      {
        id: "media",
        type: "checklist",
        title: "Removable media & sharing",
        items: [
          { id: "m1", label: "Encrypt laptops and mobile devices" },
          { id: "m2", label: "Avoid personal cloud for work data" },
          { id: "m3", label: "Shred or wipe media before disposal" },
          { id: "m4", label: "Use corporate file shares with access logging" },
        ],
      },
      {
        id: "backup",
        type: "quiz",
        title: "Backups & recovery",
        prompt: "Why are offline or immutable backups critical for ransomware defense?",
        options: [
          { id: "a", text: "They speed up internet browsing" },
          { id: "b", text: "Attackers cannot encrypt or delete what they cannot reach" },
          { id: "c", text: "They remove need for MFA" },
          { id: "d", text: "They replace patch management" },
        ],
        correct: ["b"],
        explanation: "Isolated backups let you restore without paying ransom when production is encrypted.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Classify before you store, share, or ship data.",
          "Encrypt at rest and in transit; protect keys.",
          "Use approved channels when DLP blocks a transfer.",
        ],
      },
    ],
  }),

  "keytrain-endpoint-security": workshop({
    id: "keytrain-endpoint-security",
    title: "Endpoint Security",
    code: "KT-EPS",
    tagline: "Malware, ransomware, processes, persistence, and AV health.",
    topics: ["Malware", "Ransomware", "Process analysis", "Persistence", "AV status"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Endpoints are where users meet attackers",
        paragraphs: [
          "Laptops and desktops run email, browsers, and USB—common entry points. Endpoint tools detect, contain, and sometimes roll back malicious activity.",
        ],
      },
      {
        id: "malware",
        type: "lesson",
        title: "Malware & ransomware patterns",
        bullets: [
          "Malware steals, spies, or provides remote access.",
          "Ransomware encrypts files and demands payment—often after lateral movement.",
          "Double extortion exfiltrates data before encryption.",
        ],
      },
      {
        id: "quiz-ransom",
        type: "quiz",
        title: "Ransomware first response",
        prompt:
          "A user reports files renamed with a .locked extension and a ransom note on the desktop. What is the best immediate step?",
        options: [
          { id: "a", text: "Pay the ransom from petty cash" },
          { id: "b", text: "Disconnect the host from the network and notify security" },
          { id: "c", text: "Delete the ransom note and continue working" },
          { id: "d", text: "Reinstall the browser only" },
        ],
        correct: ["b"],
        explanation: "Isolate to stop spread; incident response handles scope, backups, and restoration.",
      },
      {
        id: "process",
        type: "lesson",
        title: "Process & persistence basics",
        paragraphs: [
          "Attackers run malicious processes and hide them via startup folders, scheduled tasks, or registry run keys.",
        ],
        bullets: [
          "Unknown processes with network connections deserve scrutiny.",
          "Compare hashes to threat intelligence when tooling allows.",
          "Document before killing processes—IR may need memory captures.",
        ],
      },
      {
        id: "scenario-persist",
        type: "quiz",
        title: "Scenario: suspicious startup entry",
        prompt:
          "Autoruns shows a new entry launching PowerShell from a temp folder at logon. The user's AV is disabled. What should you do?",
        options: [
          { id: "a", text: "Ignore if the machine feels fast" },
          { id: "b", text: "Treat as compromise; isolate and engage IR" },
          { id: "c", text: "Delete temp files only" },
          { id: "d", text: "Enable guest account for balance" },
        ],
        correct: ["b"],
        explanation: "Persistence plus disabled AV is a strong compromise signal—contain and investigate.",
      },
      {
        id: "av",
        type: "checklist",
        title: "Keep defenses healthy",
        items: [
          { id: "e1", label: "Verify AV/EDR shows protected status" },
          { id: "e2", label: "Install security updates promptly" },
          { id: "e3", label: "Do not disable security tools without approval" },
          { id: "e4", label: "Report odd pop-ups or browser extensions" },
        ],
      },
      {
        id: "quiz-av",
        type: "quiz",
        title: "AV status",
        prompt: "Why is an endpoint with disabled AV high risk to the whole network?",
        options: [
          { id: "a", text: "It uses more CPU" },
          { id: "b", text: "It can spread malware internally without detection" },
          { id: "c", text: "It cannot receive email" },
          { id: "d", text: "It invalidates software licenses" },
        ],
        correct: ["b"],
        explanation: "One unprotected host can become a pivot for lateral movement and ransomware.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Isolate suspected ransomware quickly.",
          "Investigate persistence and disabled security products.",
          "Keep EDR/AV running and patched.",
        ],
      },
    ],
  }),

  "keytrain-network-security": workshop({
    id: "keytrain-network-security",
    title: "Network Security",
    code: "KT-NET",
    tagline: "IDS/IPS, anomalies, beaconing, ARP/DNS abuse, and inspection.",
    topics: ["IDS/IPS", "Ports", "Beaconing", "ARP", "DNS tunneling", "Traffic inspection"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Networks move the attack",
        paragraphs: [
          "After initial access, attackers traverse networks, exfiltrate data, and maintain command-and-control (C2). Monitoring traffic patterns catches what endpoints miss.",
        ],
      },
      {
        id: "ids",
        type: "lesson",
        title: "IDS / IPS in plain language",
        bullets: [
          "IDS detects suspicious traffic and alerts.",
          "IPS can block matching flows inline.",
          "Tune signatures to reduce noise; investigate critical alerts first.",
        ],
      },
      {
        id: "quiz-ids",
        type: "quiz",
        title: "IDS alert triage",
        prompt:
          "An IPS blocks outbound traffic to a rare destination on port 443 from a server that should only talk to an internal database. What does this suggest?",
        options: [
          { id: "a", text: "Normal backup traffic" },
          { id: "b", text: "Possible C2 or data exfiltration worth investigating" },
          { id: "c", text: "User browsing social media" },
          { id: "d", text: "Printer discovery" },
        ],
        correct: ["b"],
        explanation: "Unexpected outbound connections from servers often indicate compromise or misconfiguration.",
      },
      {
        id: "beacon",
        type: "lesson",
        title: "Beaconing & DNS tunneling",
        paragraphs: [
          "Beaconing is regular, low-volume C2 check-ins. DNS tunneling encodes data in DNS queries to bypass firewalls.",
        ],
        bullets: [
          "Look for steady intervals to the same rare domain.",
          "DNS queries with long random subdomains are suspicious.",
          "Baseline normal DNS volume per subnet.",
        ],
      },
      {
        id: "scenario-arp",
        type: "quiz",
        title: "Scenario: ARP spoofing symptoms",
        prompt:
          "Users on one VLAN report SSL certificate warnings for internal sites and sluggish access. ARP tables show duplicate MACs for the gateway. Likely issue?",
        options: [
          { id: "a", text: "ARP spoofing / MITM on the segment" },
          { id: "b", text: "Correct patch Tuesday behavior" },
          { id: "c", text: "Low disk space on DNS" },
          { id: "d", text: "Expired Wi-Fi password" },
        ],
        correct: ["a"],
        explanation: "Duplicate gateway MACs and cert warnings suggest man-in-the-middle on the LAN.",
      },
      {
        id: "inspect",
        type: "checklist",
        title: "Traffic inspection habits",
        items: [
          { id: "n1", label: "Segment critical systems from user subnets" },
          { id: "n2", label: "Log DNS and proxy traffic centrally" },
          { id: "n3", label: "Investigate new listening ports on servers" },
          { id: "n4", label: "Escalate repeated IPS hits on the same host" },
        ],
      },
      {
        id: "quiz-dns",
        type: "quiz",
        title: "DNS tunneling clue",
        prompt: "Which pattern is most indicative of DNS tunneling?",
        options: [
          { id: "a", text: "Short queries to common CDNs" },
          { id: "b", text: "High volume of long random subdomains to one domain" },
          { id: "c", text: "Occasional NTP lookups" },
          { id: "d", text: "MX records for mail routing" },
        ],
        correct: ["b"],
        explanation: "Encoded payloads often appear as lengthy, entropy-rich subdomains queried repeatedly.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Server outbound traffic deserves scrutiny.",
          "Beaconing and DNS anomalies may indicate C2.",
          "Segment networks and centralize logs for correlation.",
        ],
      },
    ],
  }),

  "keytrain-system-hygiene": workshop({
    id: "keytrain-system-hygiene",
    title: "System Hygiene",
    code: "KT-SYS",
    tagline: "Patching, updates, configuration drift, and unsupported OSs.",
    topics: ["Patching", "Outdated software", "Config drift", "Compliance", "Unsupported OS"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Hygiene prevents opportunistic attacks",
        paragraphs: [
          "Many incidents exploit known vulnerabilities on unpatched systems or default configurations left unchanged for years.",
        ],
      },
      {
        id: "patch",
        type: "lesson",
        title: "Patch & update management",
        bullets: [
          "Prioritize internet-facing and privileged systems.",
          "Test patches in non-prod when possible, but do not defer critical CVEs indefinitely.",
          "Track compliance dashboards and failed maintenance windows.",
        ],
      },
      {
        id: "quiz-patch",
        type: "quiz",
        title: "Patch priority",
        prompt:
          "A critical RCE patch was released yesterday for your VPN concentrator. Maintenance is scheduled next month. Best action?",
        options: [
          { id: "a", text: "Wait for the monthly window without escalation" },
          { id: "b", text: "Emergency change to patch internet-facing VPN ASAP" },
          { id: "c", text: "Disable VPN instead of patching" },
          { id: "d", text: "Postpone until next year" },
        ],
        correct: ["b"],
        explanation: "Internet-facing RCE flaws are emergency-level; accelerate approved emergency patching.",
      },
      {
        id: "drift",
        type: "lesson",
        title: "Configuration drift",
        paragraphs: [
          "Drift happens when manual changes, snowflake servers, or shadow IT diverge from hardened baselines.",
        ],
        bullets: [
          "Use infrastructure-as-code and golden images.",
          "Audit with configuration management tools.",
          "Revert unauthorized changes through change control.",
        ],
      },
      {
        id: "scenario-os",
        type: "quiz",
        title: "Unsupported operating system",
        prompt:
          "A lab device still runs Windows 7 on the corporate LAN for legacy software. What is the primary security concern?",
        options: [
          { id: "a", text: "No security patches from the vendor" },
          { id: "b", text: "Slower boot time" },
          { id: "c", text: "Lower screen resolution" },
          { id: "d", text: "Incompatible fonts" },
        ],
        correct: ["a"],
        explanation: "Unsupported OS versions no longer receive fixes—treat as critical risk; isolate or replace.",
      },
      {
        id: "habits",
        type: "checklist",
        title: "Hygiene checklist",
        items: [
          { id: "s1", label: "Reboot after patch cycles when required" },
          { id: "s2", label: "Remove local admin rights from daily use" },
          { id: "s3", label: "Document exceptions with expiry dates" },
          { id: "s4", label: "Retire systems that cannot be patched" },
        ],
      },
      {
        id: "quiz-drift",
        type: "quiz",
        title: "Drift detection",
        prompt: "Which practice best limits configuration drift?",
        options: [
          { id: "a", text: "Manual SSH tweaks without tickets" },
          { id: "b", text: "Standard images plus automated compliance scans" },
          { id: "c", text: "Shared root passwords" },
          { id: "d", text: "Disabling logging to save disk" },
        ],
        correct: ["b"],
        explanation: "Golden images and continuous compliance checks keep systems aligned to baselines.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Patch internet-facing and privileged systems urgently.",
          "Remove or isolate unsupported OS instances.",
          "Detect drift with automation, not annual audits alone.",
        ],
      },
    ],
  }),

  "keytrain-application-security": workshop({
    id: "keytrain-application-security",
    title: "Application Security",
    code: "KT-APP",
    tagline: "Secure coding, vulnerabilities, exploits, and SAST.",
    topics: ["Vulnerable apps", "Insecure coding", "Exploits", "SAST"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Applications process your data",
        paragraphs: [
          "Web and internal apps handle authentication, business logic, and databases. Flaws here bypass network controls because traffic looks legitimate.",
        ],
      },
      {
        id: "owasp",
        type: "lesson",
        title: "Common weakness themes",
        bullets: [
          "Injection (SQL, command, LDAP).",
          "Broken authentication and session management.",
          "Sensitive data exposure and misconfigured APIs.",
          "Missing authorization checks on objects (IDOR).",
        ],
      },
      {
        id: "quiz-inject",
        type: "quiz",
        title: "Injection awareness",
        prompt:
          'A search box returns database errors when you type `" OR 1=1 --`. What should developers have used?',
        options: [
          { id: "a", text: "Parameterized queries / prepared statements" },
          { id: "b", text: "Bigger error messages" },
          { id: "c", text: "Longer passwords only" },
          { id: "d", text: "Disable HTTPS" },
        ],
        correct: ["a"],
        explanation: "Parameterized queries separate code from data, blocking classic SQL injection.",
      },
      {
        id: "sast",
        type: "lesson",
        title: "SAST & secure SDLC",
        paragraphs: [
          "Static analysis scans source for dangerous patterns before release. Combine with code review and dependency scanning.",
        ],
        bullets: [
          "Fix high/critical findings before merge when possible.",
          "Track third-party library CVEs (SBOM).",
          "Threat model features that handle money or PII.",
        ],
      },
      {
        id: "scenario-auth",
        type: "quiz",
        title: "Scenario: broken access control",
        prompt:
          "Changing the URL from /invoice/1001 to /invoice/1002 shows another customer's invoice without a new login prompt. This is:",
        options: [
          { id: "a", text: "Insecure direct object reference (authorization flaw)" },
          { id: "b", text: "Normal caching" },
          { id: "c", text: "DNS issue" },
          { id: "d", text: "Hardware failure" },
        ],
        correct: ["a"],
        explanation: "Access must be enforced server-side per object—URL guessing must not leak data.",
      },
      {
        id: "dev",
        type: "checklist",
        title: "Developer habits",
        items: [
          { id: "d1", label: "Store secrets in vaults, not code" },
          { id: "d2", label: "Validate input on the server" },
          { id: "d3", label: "Use HTTPS everywhere" },
          { id: "d4", label: "Run SAST/dependency scans in CI" },
        ],
      },
      {
        id: "quiz-sast",
        type: "quiz",
        title: "When to run SAST",
        prompt: "When is static analysis most valuable?",
        options: [
          { id: "a", text: "Only after a breach" },
          { id: "b", text: "During development/CI before deployment" },
          { id: "c", text: "Never, it is always wrong" },
          { id: "d", text: "Only on printers" },
        ],
        correct: ["b"],
        explanation: "Shift-left testing catches flaws when they are cheapest to fix.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Enforce authorization on every object access.",
          "Parameterize queries; validate server-side input.",
          "Integrate SAST and dependency scanning into CI.",
        ],
      },
    ],
  }),

  "keytrain-financial-security": workshop({
    id: "keytrain-financial-security",
    title: "Financial Security",
    code: "KT-FIN",
    tagline: "Fraud indicators, integrity, workflows, and invoice manipulation.",
    topics: ["Fraud", "Accounting integrity", "Workflows", "Invoice manipulation"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Financial processes attract fraud",
        paragraphs: [
          "Attackers target wire transfers, payroll, and vendor payments because one successful change can move real money.",
        ],
      },
      {
        id: "fraud",
        type: "lesson",
        title: "Fraud indicators",
        bullets: [
          "Urgent secrecy requests around payments.",
          "New bank details without formal vendor onboarding.",
          "Round-dollar transfers to unfamiliar countries.",
          "Duplicate invoices with slightly altered amounts.",
        ],
      },
      {
        id: "quiz-wire",
        type: "quiz",
        title: "Wire change verification",
        prompt: "Best control before changing a vendor's bank account in the ERP?",
        options: [
          { id: "a", text: "Email reply from the vendor only" },
          { id: "b", text: "Callback to a known contact plus dual approval" },
          { id: "c", text: "First person free" },
          { id: "d", text: "Posting on social media" },
        ],
        correct: ["b"],
        explanation: "Out-of-band verification and segregation of duties stop BEC-style payment fraud.",
      },
      {
        id: "integrity",
        type: "lesson",
        title: "Accounting integrity",
        paragraphs: [
          "Systems of record should produce audit trails—who approved, when, from which IP, and what changed.",
        ],
        bullets: [
          "Separate duties: requester ≠ approver ≠ payer.",
          "Monitor after-hours or bulk exports of GL data.",
        ],
      },
      {
        id: "scenario-invoice",
        type: "quiz",
        title: "Scenario: duplicate invoice",
        prompt:
          "Two invoices from the same vendor with identical amounts arrive—one by mail, one by email PDF. What should AP do?",
        options: [
          { id: "a", text: "Pay both to stay friendly" },
          { id: "b", text: "Match to PO/receipts and verify with vendor before any payment" },
          { id: "c", text: "Pay the email only because it is faster" },
          { id: "d", text: "Forward to IT" },
        ],
        correct: ["b"],
        explanation: "Duplicate invoice fraud is common—validate against contracts and vendor contacts.",
      },
      {
        id: "workflow",
        type: "checklist",
        title: "Workflow protections",
        items: [
          { id: "f1", label: "Dual approval over threshold amounts" },
          { id: "f2", label: "Vendor master changes logged and reviewed" },
          { id: "f3", label: "Payroll change alerts to HR and security" },
          { id: "f4", label: "Reconcile bank statements daily" },
        ],
      },
      {
        id: "quiz-segregation",
        type: "quiz",
        title: "Segregation of duties",
        prompt: "Why should the person who creates a vendor not approve payments to that vendor?",
        options: [
          { id: "a", text: "Prevents single-person fraud paths" },
          { id: "b", text: "Slows email" },
          { id: "c", text: "Increases CPU usage" },
          { id: "d", text: "Required by font licensing" },
        ],
        correct: ["a"],
        explanation: "Splitting roles forces collusion for fraud and enables detective controls.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Verify payment changes out-of-band.",
          "Use dual control and audit trails on master data.",
          "Treat duplicate or urgent invoices as suspicious until validated.",
        ],
      },
    ],
  }),

  "keytrain-physical-security": workshop({
    id: "keytrain-physical-security",
    title: "Physical Security",
    code: "KT-PHY",
    tagline: "Access control, device theft, badges, and CCTV concerns.",
    topics: ["Unauthorized access", "Device theft", "Badges", "CCTV"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Physical access enables digital breach",
        paragraphs: [
          "Unlocked doors, tailgating, and stolen laptops bypass strong firewalls. Physical controls are part of cybersecurity.",
        ],
      },
      {
        id: "access",
        type: "lesson",
        title: "Access control & tailgating",
        bullets: [
          "Badge in, badge out—do not hold doors for unknown people.",
          "Challenge visitors without escorts.",
          "Secure server rooms and wiring closets.",
        ],
      },
      {
        id: "quiz-tailgate",
        type: "quiz",
        title: "Tailgating",
        prompt:
          "Someone in a delivery uniform asks you to hold the secure door because their hands are full. You do not recognize them. What should you do?",
        options: [
          { id: "a", text: "Hold the door—uniforms are enough" },
          { id: "b", text: "Ask them to use visitor check-in or contact security" },
          { id: "c", text: "Give them your badge" },
          { id: "d", text: "Ignore and walk away silently" },
        ],
        correct: ["b"],
        explanation: "Verify visitors through official processes—tailgating is a common intrusion path.",
      },
      {
        id: "devices",
        type: "lesson",
        title: "Device theft & desk hygiene",
        paragraphs: [
          "Laptops, badges, and printed reports left unattended are easy targets. Encryption limits damage if hardware is stolen.",
        ],
        bullets: [
          "Cable-lock laptops in semi-public areas.",
          "Do not leave sensitive printouts on printers.",
          "Report lost badges immediately to deactivate.",
        ],
      },
      {
        id: "scenario-theft",
        type: "quiz",
        title: "Scenario: stolen laptop",
        prompt:
          "A laptop was stolen from a locked car trunk containing cached customer exports. The disk is encrypted with corporate MDM. Primary concern?",
        options: [
          { id: "a", text: "Battery life" },
          { id: "b", text: "Data exposure if encryption or session keys are weak; report incident" },
          { id: "c", text: "Wi-Fi driver version" },
          { id: "d", text: "Screen brightness" },
        ],
        correct: ["b"],
        explanation: "Treat as potential data breach—confirm encryption state, remote wipe, and legal obligations.",
      },
      {
        id: "cctv",
        type: "checklist",
        title: "Physical awareness",
        items: [
          { id: "p1", label: "Challenge unknown persons in secure areas" },
          { id: "p2", label: "Lock workstations when away" },
          { id: "p3", label: "Report broken cameras or doors" },
          { id: "p4", label: "Escort visitors at all times" },
        ],
      },
      {
        id: "quiz-badge",
        type: "quiz",
        title: "Badge hygiene",
        prompt: "Why must lost badges be reported immediately?",
        options: [
          { id: "a", text: "So they can be deactivated before cloning/use" },
          { id: "b", text: "To update wallpaper" },
          { id: "c", text: "For parking decals only" },
          { id: "d", text: "HR calendar sync" },
        ],
        correct: ["a"],
        explanation: "Quick revocation prevents unauthorized physical access.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Prevent tailgating; verify visitors.",
          "Encrypt devices; report theft promptly.",
          "Treat physical access as part of security culture.",
        ],
      },
    ],
  }),

  "keytrain-compliance-governance": workshop({
    id: "keytrain-compliance-governance",
    title: "Compliance & Governance",
    code: "KT-CG",
    tagline: "HIPAA, policies, audits, documentation, and risk alignment.",
    topics: ["HIPAA", "Policies", "Audit readiness", "Documentation", "Risk management"],
    steps: [
      {
        id: "intro",
        type: "lesson",
        title: "Compliance maps controls to obligations",
        paragraphs: [
          "Regulations and frameworks (HIPAA, SOC 2, ISO 27001) describe what must be protected and how to demonstrate due care.",
        ],
      },
      {
        id: "hipaa",
        type: "lesson",
        title: "HIPAA basics (health data)",
        bullets: [
          "PHI includes identifiers plus health information.",
          "Minimum necessary—limit access to what the job needs.",
          "Business associates need contracts (BAAs).",
          "Report breaches per policy and regulatory timelines.",
        ],
      },
      {
        id: "quiz-phi",
        type: "quiz",
        title: "Minimum necessary",
        prompt:
          "A clinician asks for a full export of all patients to troubleshoot a printer. What is the compliant approach?",
        options: [
          { id: "a", text: "Send full export via personal email" },
          { id: "b", text: "Provide the minimum de-identified or scoped data needed with approval" },
          { id: "c", text: "Post export on public wiki" },
          { id: "d", text: "Share credentials so they can self-serve all data" },
        ],
        correct: ["b"],
        explanation: "HIPAA minimum necessary limits PHI disclosure to what is required for the task.",
      },
      {
        id: "policy",
        type: "lesson",
        title: "Policy adherence & documentation",
        paragraphs: [
          "Policies are useless if unknown. Training, attestations, and evidence collection prove you followed them during audits.",
        ],
        bullets: [
          "Keep versioned policies accessible.",
          "Log exceptions with risk acceptance.",
          "Retain evidence: tickets, approvals, scan reports.",
        ],
      },
      {
        id: "scenario-audit",
        type: "quiz",
        title: "Audit readiness",
        prompt:
          "An auditor requests proof that terminated users lose access within 24 hours. Best evidence?",
        options: [
          { id: "a", text: "Verbal assurance" },
          { id: "b", text: "IAM deprovisioning logs tied to HR termination tickets" },
          { id: "c", text: "Screensaver settings" },
          { id: "d", text: "Coffee machine logs" },
        ],
        correct: ["b"],
        explanation: "Correlate HR dates with automated access removal logs for defensible audit trails.",
      },
      {
        id: "risk",
        type: "checklist",
        title: "Governance habits",
        items: [
          { id: "c1", label: "Complete annual security training" },
          { id: "c2", label: "Follow change management for production" },
          { id: "c3", label: "Document exceptions with owners and dates" },
          { id: "c4", label: "Report incidents within required timeframes" },
        ],
      },
      {
        id: "quiz-risk",
        type: "quiz",
        title: "Risk management alignment",
        prompt: "Why link security findings to a risk register?",
        options: [
          { id: "a", text: "Prioritize remediation by business impact and likelihood" },
          { id: "b", text: "Hide problems" },
          { id: "c", text: "Avoid patching" },
          { id: "d", text: "Replace logging" },
        ],
        correct: ["a"],
        explanation: "Risk registers help leadership fund fixes based on measurable business risk.",
      },
      {
        id: "wrap",
        type: "summary",
        title: "Key takeaways",
        bullets: [
          "Apply minimum necessary for regulated data.",
          "Keep evidence for audits—not after-the-fact stories.",
          "Align technical fixes with documented risk decisions.",
        ],
      },
    ],
  }),
};

/** @type {string[]} */
export const KEYTRAIN_WORKSHOP_IDS = Object.keys(KEYTRAIN_WORKSHOPS);

/** @returns {KeytrainWorkshop[]} */
export function listKeytrainWorkshops() {
  return Object.values(KEYTRAIN_WORKSHOPS).sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * @param {string} id
 * @returns {KeytrainWorkshop|null}
 */
export function getKeytrainWorkshop(id) {
  return KEYTRAIN_WORKSHOPS[id] ?? null;
}
