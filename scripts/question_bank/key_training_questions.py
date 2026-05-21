"""Scenario-style MCQs for KeyTrain's Key Training categories."""

from __future__ import annotations

# Each entry: (stem, correct option text, [wrong...], explanation)
QuestionTemplate = tuple[str, str, list[str], str]

QUESTIONS_BY_DOMAIN: dict[str, list[QuestionTemplate]] = {
    "authentication": [
        (
            "A help desk ticket reports repeated lockouts for one user after they traveled. Logs show failed logins from two countries within minutes. What is the BEST first response?",
            "Treat as potential credential compromise: force password reset, revoke sessions, and verify MFA enrollment",
            [
                "Disable the account permanently without investigation",
                "Ignore lockouts if the user confirms they remember their password",
                "Share the user's password hash with the manager to verify identity",
            ],
            "Impossible-travel patterns suggest stolen credentials; reset and session revocation limit abuse while MFA reduces replay risk.",
        ),
        (
            "Your org is rolling out passwordless sign-in for contractors. Which control MOST directly reduces phishing of static passwords?",
            "Phishing-resistant authenticators (FIDO2 / passkeys) bound to the identity provider",
            [
                "Longer password complexity rules only",
                "Annual security awareness posters",
                "Shared contractor kiosk accounts",
            ],
            "Passwordless FIDO2 resists credential phishing; complexity alone does not stop real-time proxy attacks.",
        ),
        (
            "SSO logs show an application accepting SAML assertions after certificate rollover, but only for one legacy app. What should you verify FIRST?",
            "The service provider metadata and signing certificate trust store match the new IdP certificate",
            [
                "Whether users cleared browser cache",
                "If the app supports biometric unlock on mobile",
                "DNS TTL for the marketing site",
            ],
            "SAML trust breaks when SP metadata is stale; certificate mismatch is the typical root cause after IdP rotation.",
        ),
    ],
    "mfa": [
        (
            "An executive refuses hardware tokens but approves SMS codes for banking-style apps. Which risk should you document in the exception?",
            "SIM-swap and SS7 attacks can bypass SMS OTP without attacking the application directly",
            [
                "SMS messages are always encrypted end-to-end",
                "Hardware tokens cannot be used on laptops",
                "MFA fatigue only affects push notifications",
            ],
            "SMS OTP is better than nothing but is not phishing-resistant; SIM swap is a known bypass path.",
        ),
        (
            "Users report MFA push approval prompts they did not initiate. What is the BEST immediate mitigation?",
            "Enforce number matching or phishing-resistant MFA and investigate for password spray preceding pushes",
            [
                "Disable MFA globally for 24 hours",
                "Increase session timeout to 30 days",
                "Allow users to approve pushes from unknown locations",
            ],
            "Unsolicited pushes indicate MFA fatigue attacks; number matching and investigating spray reduce success rates.",
        ),
        (
            "During a tabletop, the team must choose MFA for privileged break-glass accounts. What is the MOST appropriate design?",
            "Hardware tokens stored in a physical safe with dual control and separate from daily user MFA",
            [
                "Same SMS OTP as standard users for simplicity",
                "Shared TOTP seed in a wiki page",
                "No MFA on break-glass to speed recovery",
            ],
            "Break-glass accounts need strongest factors and procedural controls; shared seeds defeat MFA purpose.",
        ),
    ],
    "privilege-escalation": [
        (
            "A junior analyst discovers they can add themselves to a cloud admin group via a misconfigured automation role. What is the BEST remediation sequence?",
            "Remove excessive permissions from the role, audit CloudTrail for prior abuse, and enforce least privilege on CI pipelines",
            [
                "Promote the analyst to admin so they can monitor themselves",
                "Delete all automation in the environment",
                "Publish the role ARN in the team chat for transparency",
            ],
            "Fix the permission path, then determine if the flaw was exploited; CI roles are a common escalation vector.",
        ),
        (
            "Endpoint EDR flags PowerShell downloading a script that modifies local admin group membership. Which indicator BEST supports privilege escalation?",
            "Use of a living-off-the-land binary to run unsigned code that adds a new local administrator",
            [
                "User opened a PDF brochure",
                "Scheduled Windows Update reboot",
                "Antivirus definition update",
            ],
            "Adding local admins via LOLBins is classic escalation after initial access.",
        ),
        (
            "A service account in Active Directory has unconstrained delegation. Why is this a critical escalation risk?",
            "Compromise of the service account can yield Kerberos TGTs usable against other hosts",
            [
                "It only affects password expiration policy",
                "It disables NTLM company-wide",
                "It encrypts all file shares automatically",
            ],
            "Unconstrained delegation allows TGT theft and lateral movement—high severity misconfiguration.",
        ),
    ],
    "account-misuse": [
        (
            "HR terminates an employee, but their SaaS account stays active two weeks because provisioning is manual. Which control gap does this illustrate?",
            "Joiner-mover-leaver process failure and lack of automated deprovisioning tied to HRIS",
            [
                "Insufficient MFA on printers",
                "Missing patch Tuesday calendar",
                "Overly strict DLP on USB drives",
            ],
            "Stale accounts are a top misuse vector; HR-driven deprovisioning closes the window.",
        ),
        (
            "Shared credentials for a production monitoring dashboard are posted in a team channel. What is the BEST replacement?",
            "Individual accounts with RBAC, optional break-glass procedure, and secrets removed from chat history",
            [
                "Rotate the shared password monthly without changing practice",
                "Add the password to the email signature for visibility",
                "Disable logging to reduce evidence",
            ],
            "Shared accounts prevent attribution; RBAC and individual identity restore accountability.",
        ),
        (
            "Audit finds contractors using former employees' accounts. What policy enforcement MOST directly stops this?",
            "Periodic access reviews and automated disablement when employment status changes",
            [
                "Longer minimum password length only",
                "Blocking USB ports on laptops",
                "Increasing CCTV retention",
            ],
            "Access reviews and lifecycle automation address account sharing and ex-employee reuse.",
        ),
    ],
    "credential-abuse": [
        (
            "Dark web monitoring shows corporate emails in a breach dump. What is the FIRST technical action aligned to credential abuse defense?",
            "Force password reset and invalidate refresh tokens for affected identities",
            [
                "Block all outbound email for a week",
                "Disable TLS on the mail gateway",
                "Publish the dump internally for awareness",
            ],
            "Reset and token revocation contain reuse of stolen passwords and session artifacts.",
        ),
        (
            "Authentication logs show 40,000 failed logins against one legacy IMAP service from one ASN. Which attack type is MOST likely?",
            "Password spraying against a single protocol before attempting valid pairs elsewhere",
            [
                "ARP spoofing on the data center VLAN",
                "Physical tailgating at the front desk",
                "SAST false positive on a web app",
            ],
            "High-volume failures on one service suggest spray, often preceding targeted login attempts.",
        ),
        (
            "Developers store API keys in public GitHub repos. Which practice BEST reduces credential abuse long term?",
            "Secret scanning in CI/CD, pre-commit hooks, and short-lived scoped tokens",
            [
                "Rename repos to private after launch only",
                "Use one global API key for all microservices",
                "Disable Git entirely",
            ],
            "Prevention and rotation limit blast radius when keys leak; scanning catches commits early.",
        ),
    ],
    "phishing": [
        (
            "A user reports an email urging immediate payroll changes with a link to a look-alike domain. What should the SOC do FIRST?",
            "Quarantine similar messages, block the domain at the gateway, and reset credentials if the user submitted data",
            [
                "Reply-all warning employees not to click",
                "Wait for three more reports before acting",
                "Forward the email to personal Gmail for storage",
            ],
            "Containment (quarantine/block) and credential safety come before broad communication.",
        ),
        (
            "Your phishing simulation click rate dropped to zero after blocking all external links. What risk remains?",
            "Voice phishing (vishing) and attachment-based malware bypass link filtering",
            [
                "No risk remains; email is fully secure",
                "ARP cache poisoning on Wi-Fi",
                "Unsupported OS on printers only",
            ],
            "Link blocking does not stop vishing or weaponized attachments—defense must be layered.",
        ),
        (
            "An executive receives a QR code poster 'for IT Wi-Fi' in the parking garage. Which category does this BEST fit?",
            "Quishing (QR phishing) leading to credential harvesting",
            [
                "DNS tunneling exfiltration",
                "Patch management failure",
                "SAST finding in CI",
            ],
            "Malicious QR codes are a growing phishing channel outside email filters.",
        ),
    ],
    "spoofing": [
        (
            "Mail headers show SPF pass, DKIM fail, and DMARC none for a message impersonating the CEO. What improvement is MOST effective?",
            "Enforce DMARC p=reject with aligned DKIM for all executive domains",
            [
                "Disable SPF globally",
                "Allow any sender if subject contains 'urgent'",
                "Remove DKIM to simplify troubleshooting",
            ],
            "DMARC with alignment stops many spoofed From domains even when SPF alone passes via forwarders.",
        ),
        (
            "Users see internal display names matching a VP but the SMTP address is external. Which user-facing control helps?",
            "External sender banners and training to verify the actual email address",
            [
                "Increase font size in Outlook",
                "Disable all calendar invites",
                "Block PDF attachments from HR",
            ],
            "Display-name spoofing is common; banners and address verification reduce mistaken trust.",
        ),
        (
            "A VoIP caller ID shows your company's main number. What technical control reduces this spoofing vector?",
            "STIR/SHAKEN attestation on carrier trunks where supported",
            [
                "Disable MFA for call center staff",
                "Publish the main number on Instagram only",
                "Remove VLANs from the PBX",
            ],
            "STIR/SHAKEN improves caller ID integrity for voice spoofing on supported carriers.",
        ),
    ],
    "malicious-attachments": [
        (
            "An invoice attachment is a password-protected ZIP containing a .lnk file. What is the SAFEST handling step?",
            "Sandbox detonation in an isolated environment before any user execution",
            [
                "Ask the sender for the password in email reply",
                "Forward to finance to open on their desktop",
                "Rename the .lnk to .txt to neutralize it",
            ],
            "Password-protected archives bypass scanners; sandbox analysis avoids user execution risk.",
        ),
        (
            "Macro-enabled Excel arrives from an unknown vendor address. Which policy is BEST?",
            "Block macros from internet-origin files and use protected view",
            [
                "Allow macros if the spreadsheet has a logo",
                "Disable antivirus to speed opening",
                "Require users to enable editing on all attachments",
            ],
            "Office macros remain a common initial access path; blocking internet macros is baseline.",
        ),
        (
            "Email filter quarantined a PDF with embedded JavaScript. Why is this noteworthy?",
            "PDFs can launch actions or download second-stage payloads when opened in vulnerable readers",
            [
                "PDFs cannot contain active content",
                "JavaScript in PDF only affects printers",
                "Quarantine means the file is guaranteed safe",
            ],
            "Malicious PDF features are a documented attachment risk; quarantine is appropriate.",
        ),
    ],
    "bec": [
        (
            "Finance receives wire instructions changing bank details via email right before quarter close. What verification is REQUIRED?",
            "Out-of-band callback to a known number on file, not numbers in the email",
            [
                "Reply to the same thread asking 'Is this real?'",
                "Process if the logo matches",
                "Trust because the subject says 'CONFIDENTIAL'",
            ],
            "BEC wire fraud relies on urgency; verified voice callback stops many losses.",
        ),
        (
            "An attacker registers a domain one character off from your vendor. Which control reduces payment fraud?",
            "Vendor master data with approved domains and dual approval on banking changes",
            [
                "Single approver if under $50k",
                "Whitelist all .com domains",
                "Disable accounts payable entirely",
            ],
            "Look-alike domains are classic BEC; vendor controls and dual approval are key.",
        ),
        (
            "Legal notices a forged CEO email approving acquisition NDA sharing. Besides legal, who must be engaged FIRST?",
            "Security operations to hunt for mailbox rules forwarding and similar threads",
            [
                "Physical security for CCTV only",
                "Patch management team for WSUS",
                "Facilities for parking passes",
            ],
            "BEC often includes hidden inbox rules; SOC hunts prevent ongoing exfiltration.",
        ),
    ],
    "sensitive-exposure": [
        (
            "A public S3 bucket listing contains customer medical record filenames. What is the IMMEDIATE priority?",
            "Block public access, preserve logs, and initiate breach assessment per policy",
            [
                "Rename the bucket and keep it public",
                "Delete logs to save storage costs",
                "Post an apology tweet before containment",
            ],
            "Exposure of health data triggers containment and regulated breach workflows.",
        ),
        (
            "DLP alerts on a spreadsheet labeled 'Internal' leaving via personal webmail. Best FIRST step?",
            "Confirm classification, block transmission if policy requires, and interview user with HR guidance",
            [
                "Fire the user automatically",
                "Disable DLP to reduce noise",
                "Publish the file on the intranet",
            ],
            "Validate sensitivity and policy, then respond proportionally with HR/legal as needed.",
        ),
        (
            "Git history contains AWS keys for a retired project. What reduces future sensitive exposure?",
            "Rotate keys, purge secrets from history, and enable secret scanning on all repos",
            [
                "Make the repo private without rotation",
                "Add a README saying 'do not use keys'",
                "Ignore because the project is old",
            ],
            "Secrets in VCS remain reachable until rotated and removed; scanning prevents recurrence.",
        ),
    ],
    "encryption": [
        (
            "Laptops are stolen from a locked office; drives use BitLocker with TPM+PIN. Which data state is MOST protected?",
            "Data at rest on disk while powered off",
            [
                "Data in use while logged in and unlocked",
                "Data in transit inside the LAN only",
                "Printed documents in recycling",
            ],
            "Full-disk encryption protects at rest when off; logged-in sessions remain exposed.",
        ),
        (
            "A team proposes TLS 1.0 for legacy clients on an internet-facing API. What is the BEST security stance?",
            "Deprecate TLS 1.0/1.1 and document exceptions with compensating controls and timelines",
            [
                "Enable SSLv3 for compatibility",
                "Terminate TLS at the user's browser only",
                "Use self-signed certs without rotation",
            ],
            "Legacy TLS is broken; phased migration beats indefinite weak protocols on public APIs.",
        ),
        (
            "Database backups are copied to tape unencrypted for 'speed.' What risk should leadership accept if continuing?",
            "Physical loss of tapes exposes all backup contents without key compromise",
            [
                "No risk if tapes stay in the server room",
                "Encryption slows restores so it is never needed",
                "Cloud backups are automatically encrypted at rest always",
            ],
            "Offline media theft bypasses network controls; encryption at rest for backups is standard.",
        ),
    ],
    "dlp": [
        (
            "DLP blocks a nurse emailing treatment notes to a personal account for 'convenience.' Which outcome is correct?",
            "Block stands; offer approved secure transfer methods",
            [
                "Disable DLP for clinical staff",
                "Allow if the user is senior",
                "Forward blocked content to IT via CC",
            ],
            "HIPAA-aligned environments require controlling PHI egress; approved tools replace personal email.",
        ),
        (
            "Endpoint DLP generates many false positives on source code zips. What tuning is BEST?",
            "Scope policies to labeled repositories and exfil channels, not all zip creation",
            [
                "Turn off endpoint DLP entirely",
                "Alert on every file save",
                "Whitelist all developers permanently",
            ],
            "Effective DLP targets high-risk egress with context to limit alert fatigue.",
        ),
        (
            "A contractor pastes customer PII into a public ChatGPT session. Which combined control helps MOST?",
            "Browser DLP, acceptable-use policy, and enterprise AI gateway with logging",
            [
                "Block all HTTPS",
                "Remove contractor laptops",
                "Disable spelling checker",
            ],
            "GenAI paste is a new exfil path; technical and contractual controls together reduce risk.",
        ),
    ],
    "removable-media": [
        (
            "USB storage is disabled, but staff use phone charging cables that mount as MTP devices. What should you add?",
            "Device control policies blocking unauthorized portable storage classes",
            [
                "Allow all USB if labeled with asset tags",
                "Disable only Wi-Fi instead",
                "Remove antivirus to improve speed",
            ],
            "Charging-only vs data-capable USB requires device control, not just drive letters.",
        ),
        (
            "A found USB drive is plugged into a SOC analyst machine 'to see who lost it.' What is the SAFE procedure?",
            "Analyze only in a dedicated malware sandbox VM disconnected from production",
            [
                "Open on the analyst daily workstation",
                "Email the files to the whole team",
                "Insert into the domain controller to scan faster",
            ],
            "Unknown USBs are bait; sandbox isolation prevents accidental infection.",
        ),
        (
            "Marketing requests USB giveaways with preloaded brochures. Security concern to raise?",
            "Supply-chain integrity—USBs could be tampered before distribution",
            [
                "USBs are always read-only",
                "Brochures cannot contain malware",
                "HIPAA requires USB giveaways",
            ],
            "Preloaded media is a supply-chain risk; sourced devices and hashing matter.",
        ),
    ],
    "backups": [
        (
            "Ransomware encrypts production; backups exist but are on the same VLAN as servers. Likely failure mode?",
            "Ransomware deletes or encrypts online-connected backup shares",
            [
                "Backups automatically decrypt files",
                "Tape libraries on VLAN are immune without testing",
                "Snapshots cannot be targeted",
            ],
            "Immutable or offline backups are required; network-local copies often die with production.",
        ),
        (
            "Restore test last ran three years ago. Which risk is MOST acute?",
            "Backups may be corrupt or procedures untested when needed",
            [
                "Backups run too frequently",
                "RPO is automatically zero",
                "Encryption is impossible on tape",
            ],
            "Untested backups are a common disaster recovery gap.",
        ),
        (
            "A cloud admin can delete production and backup vaults with one role. Best fix?",
            "Separate backup admin role with MFA, immutability, and break-glass monitoring",
            [
                "One super-admin for speed",
                "Disable logging on backup API",
                "Store backups only on the admin laptop",
            ],
            "Backup integrity requires separation of duties and immutability features.",
        ),
    ],
    "malware": [
        (
            "EDR quarantines a signed driver loading from a temp folder. Next BEST step?",
            "Isolate host, collect timeline, and check for lateral movement indicators",
            [
                "Restore driver because it is signed",
                "Disable EDR to stop alerts",
                "Reimage without any logging",
            ],
            "Signed but anomalous drivers can be malicious; investigate before release.",
        ),
        (
            "Users download 'free PDF tools' from ads. Which control reduces malware installs?",
            "Application allowlisting and software center for approved tools",
            [
                "Block all internet indefinitely",
                "Disable Windows Defender",
                "Allow admin rights for all staff",
            ],
            "Allowlisting limits unsigned or unapproved installers common in droppers.",
        ),
        (
            "A Word doc with macros calls out to a paste site. Classification?",
            "Malware delivery attempting staged download",
            [
                "Benign marketing material",
                "Network beaconing only",
                "Physical tailgating",
            ],
            "Macro-to-external-download is classic malware staging.",
        ),
    ],
    "ransomware": [
        (
            "File servers show mass .encrypted extensions and a ransom note. FIRST action?",
            "Isolate affected segments and preserve volatile evidence per IR plan",
            [
                "Pay ransom immediately without documentation",
                "Reboot all domain controllers first",
                "Delete backups to free space",
            ],
            "Containment and evidence preservation precede recovery decisions.",
        ),
        (
            "Backups are immutable; leadership asks about paying ransom. Security recommendation?",
            "Restore from immutable backups and involve legal/law enforcement; payment does not guarantee decryption",
            [
                "Pay anonymously on personal card",
                "Publish decryption keys online",
                "Disable MFA to speed recovery",
            ],
            "Immutable backups are primary recovery; payment is uncertain and may fund crime.",
        ),
        (
            "Ransomware group threatens leak of stolen data. What does 'double extortion' imply?",
            "They may publish exfiltrated data even if you restore from backups",
            [
                "They encrypt twice with different algorithms only",
                "They only attack printers",
                "Backups are automatically safe from leak",
            ],
            "Exfiltration plus encryption means recovery does not eliminate leak risk.",
        ),
    ],
    "process-analysis": [
        (
            "An analyst sees powershell.exe spawning rundll32 with no window. What should they collect FIRST?",
            "Parent/child process tree, command line, and hash of loaded DLL",
            [
                "Only CPU fan speed",
                "User's last vacation dates",
                "Printer queue status",
            ],
            "Process lineage and command lines are core to endpoint investigation.",
        ),
        (
            "Task Manager shows a browser consuming CPU but Process Explorer shows no matching process. Likely explanation?",
            "Process hollowing or rootkit-style hiding—use EDR kernel telemetry",
            [
                "Normal GPU acceleration",
                "User imagination",
                "Patch Tuesday side effect only",
            ],
            "Discrepancies suggest advanced evasion; EDR kernel view is needed.",
        ),
        (
            "Which artifact BEST helps determine persistence via scheduled task creation?",
            "Windows Security Event ID 4698 and Task Scheduler operational log",
            [
                "DHCP lease log only",
                "CCTV timestamp",
                "Invoice PDF metadata",
            ],
            "Task creation events document persistence mechanisms.",
        ),
    ],
    "persistence": [
        (
            "Registry Run keys point to a random AppData executable after an email attachment. BEST remediation?",
            "Remove persistence entries, quarantine binary, and reimage if tampering is widespread",
            [
                "Delete only the email",
                "Disable Run keys globally forever",
                "Ignore if antivirus is green",
            ],
            "Persistence must be removed with the payload; reimage if integrity is uncertain.",
        ),
        (
            "A WMI event subscription recreates malware after reboot. Why is this effective persistence?",
            "WMI subscriptions can trigger payloads without classic Run key visibility",
            [
                "WMI only manages printers",
                "It encrypts backups automatically",
                "It blocks MFA enrollment",
            ],
            "WMI persistence is stealthy; hunters search for suspicious consumers.",
        ),
        (
            "Startup folder contains a shortcut to a remote SMB path. Risk?",
            "Logon triggers load of code from attacker-controlled share",
            [
                "Shortcuts are always harmless",
                "Only affects Linux servers",
                "Improves patch compliance",
            ],
            "Remote startup items pull code at user logon—common persistence.",
        ),
    ],
    "av-status": [
        (
            "20% of endpoints report outdated definitions for 14 days. BEST prioritized action?",
            "Identify update failures (proxy, service stopped) and enforce compliance via MDM",
            [
                "Uninstall antivirus to improve performance",
                "Disable updates during business hours permanently",
                "Exclude all servers from scanning",
            ],
            "Stale defs reduce detection; fix root cause of update failures.",
        ),
        (
            "A server excludes the entire C: drive from scanning for 'performance.' What risk acceptance is this?",
            "Malware can reside undetected on excluded volumes",
            [
                "Exclusions improve encryption strength",
                "AV scans cause guaranteed data loss",
                "Exclusions apply only to network traffic",
            ],
            "Broad exclusions create blind spots attackers target.",
        ),
        (
            "EDR shows 'protected' but Windows Defender is disabled via GPO conflict. What should you do?",
            "Reconcile GPO and EDR policy so one compliant agent is active and reporting",
            [
                "Leave both disabled if users complain",
                "Hide status in the console",
                "Disable logging to reduce tickets",
            ],
            "Conflicting policies cause false confidence; one managed agent should report health.",
        ),
    ],
    "ids-ips": [
        (
            "IPS blocks legitimate ERP traffic after a signature update. BEST immediate step?",
            "Tune or temporarily disable the specific signature with change control and monitor ERP",
            [
                "Disable IPS permanently",
                "Block all ERP users",
                "Turn off logging on IPS",
            ],
            "Signature tuning balances protection and availability; document changes.",
        ),
        (
            "IDS alerts on TLS encrypted traffic show 'possible C2' with no payload. Next action?",
            "Correlate with EDR, DNS logs, and JA3/SNI metadata—not block solely on alert title",
            [
                "Decrypt all employee HTTPS at home",
                "Ignore because TLS cannot be inspected",
                "Shut down the internet border",
            ],
            "Encrypted traffic needs multi-source correlation to avoid false positives.",
        ),
        (
            "Repeated alerts from one internal host scanning many ports on the subnet. Classification?",
            "Likely internal reconnaissance or worm propagation worth isolating",
            [
                "Normal backup behavior always",
                "Printer firmware update",
                "HIPAA documentation gap",
            ],
            "Internal port sweeps are suspicious and warrant host isolation and investigation.",
        ),
    ],
    "port-anomalies": [
        (
            "Firewall logs show outbound TCP 4444 from a workstation to an unknown IP. What is this commonly associated with?",
            "Metasploit default handler ports and reverse shells—treat as incident",
            [
                "Standard HTTPS browsing",
                "LDAP user authentication",
                "NTP time sync only",
            ],
            "Non-standard high ports outbound to rare IPs are classic C2 indicators.",
        ),
        (
            "A database server suddenly listens on port 3389 internally. BEST response?",
            "Verify authorized change; if none, isolate and hunt for lateral movement",
            [
                "Open 3389 to the internet for remote support",
                "Ignore if CPU is low",
                "Disable database encryption",
            ],
            "Unexpected RDP on database tiers suggests compromise or misconfiguration.",
        ),
        (
            "Netflow shows micro-bursts on port 53 to many external IPs. Consider?",
            "Possible DNS tunneling exfiltration—inspect query entropy and destinations",
            [
                "Normal email delivery",
                "Patch Tuesday only",
                "Badge reader maintenance",
            ],
            "Anomalous DNS volume/entropy can indicate tunneling.",
        ),
    ],
    "beaconing": [
        (
            "A host contacts one IP every 60 seconds with 200-byte HTTPS posts. Likely behavior?",
            "C2 beaconing with jittered interval—investigate process and block domain",
            [
                "Windows Update always",
                "User reading news",
                "Backup tape rotation",
            ],
            "Regular small outbound sessions are beacon patterns.",
        ),
        (
            "Proxy logs show failed CONNECT attempts every minute from malware sandbox? ",
            "Sandbox may be simulating beacon—ensure production hosts are not in same pattern",
            [
                "Proof HR is phishing",
                "DNSSEC misconfiguration only",
                "CCTV offline",
            ],
            "Distinguish test lab from production beaconing via asset context.",
        ),
        (
            "Which dataset BEST confirms beaconing vs user streaming video?",
            "Fixed byte counts at steady intervals to rare destinations",
            [
                "Variable large downloads to CDN during lunch",
                "Multicast discovery on LAN",
                "Broadcast ARP requests",
            ],
            "Beacons are rhythmic and uniform; streaming is bursty to CDNs.",
        ),
    ],
    "arp-spoofing": [
        (
            "Users report SSL warnings only on Wi-Fi in one office. Wireshark on a laptop shows duplicate MAC for the gateway. Diagnosis?",
            "ARP spoofing / MITM on local segment",
            [
                "Global DNS root compromise",
                "Expired HIPAA training",
                "Backup failure only",
            ],
            "Duplicate gateway MAC suggests LAN MITM, often via ARP poisoning.",
        ),
        (
            "Which switch feature mitigates ARP spoofing on access ports?",
            "Dynamic ARP Inspection (DAI) with DHCP snooping",
            [
                "Disable STP",
                "Open all VLANs to default",
                "Remove port security",
            ],
            "DAI validates ARP against trusted bindings.",
        ),
        (
            "An attacker on guest Wi-Fi intercepts traffic. BEST network segmentation fix?",
            "Client isolation and separate VLAN without route to corporate resources",
            [
                "Merge guest and corp VLANs",
                "Share admin passwords on guest SSID",
                "Disable WPA2 on guest",
            ],
            "Guest isolation limits MITM impact on corporate assets.",
        ),
    ],
    "dns-tunneling": [
        (
            "Long random subdomains query an unknown domain thousands of times per hour. Suspicion?",
            "DNS tunneling data exfiltration or C2",
            [
                "Normal CDN caching",
                "Legitimate MX failover",
                "Printer driver update",
            ],
            "High-entropy subdomains are a tunneling hallmark.",
        ),
        (
            "Which control detects DNS tunneling without full TLS break?",
            "DNS logging with entropy/threat intel and blocking of uncategorized DGA domains",
            [
                "Disable all DNS",
                "Use hosts file only on DC",
                "Allow any A record",
            ],
            "DNS analytics and threat feeds catch tunnel domains.",
        ),
        (
            "Exfil over DNS encodes data in TXT queries. BEST mitigation layer?",
            "Recursive resolver policies and egress filtering to approved resolvers only",
            [
                "Block TCP 443 instead only",
                "Remove all firewalls",
                "Email logs to personal accounts",
            ],
            "Forcing resolvers and monitoring TXT queries limits tunnel egress.",
        ),
    ],
    "traffic-inspection": [
        (
            "SOC needs visibility into TLS 1.3 east-west traffic. Practical approach?",
            "East-west metadata (SNI, JA3), EDR network events, and segmented mirror taps where allowed",
            [
                "Disable TLS 1.3 globally",
                "Trust all self-signed certs users install",
                "Stop logging to save disk",
            ],
            "Full decrypt is not always possible; metadata and EDR supplement inspection.",
        ),
        (
            "Netflow shows large outbound transfers at 3 a.m. to a cloud storage API. Next step?",
            "Identify process/user via EDR and verify against backup/job schedules",
            [
                "Assume backup and ignore",
                "Block all cloud globally",
                "Delete netflow to save space",
            ],
            "Validate against known jobs; anomalies may be exfiltration.",
        ),
        (
            "Encrypted traffic to a newly registered domain spikes after a phishing click. BEST correlation?",
            "Proxy, DNS, and EDR timelines within the same hour",
            [
                "CCTV only",
                "Invoice approval chain",
                "Patch catalog version",
            ],
            "Multi-log correlation links user action to C2 establishment.",
        ),
    ],
    "patching": [
        (
            "Critical CVE has exploit in the wild; patch available. Servers are 30 days behind. FIRST priority?",
            "Internet-facing and vulnerable services before internal file shares",
            [
                "Patch printers first always",
                "Wait for annual maintenance window only",
                "Disable patching to avoid reboots",
            ],
            "Risk-based prioritization focuses on exposure and exploitability.",
        ),
        (
            "Test environment lacks patches 'because it is not prod.' Risk?",
            "Attackers pivot from lab to prod via shared credentials and trusts",
            [
                "Test networks cannot be reached ever",
                "CVEs do not apply to VMs",
                "Patches break coffee machines only",
            ],
            "Unpatched labs are common pivot points.",
        ),
        (
            "WSUS shows 95% compliance but Nessus still flags missing KBs. Likely cause?",
            "Superseded updates not installed or wrong scan credentials / reboot pending",
            [
                "Nessus invents CVEs",
                "Patches remove antivirus",
                "Compliance is always 100% accurate",
            ],
            "Reconcile WSUS agent state with vuln scanner and pending reboots.",
        ),
    ],
    "outdated-software": [
        (
            "Inventory finds Java 8 on 400 endpoints for one legacy app. BEST approach?",
            "Isolate app in controlled network segment and plan upgrade or virtualization wrapper",
            [
                "Ignore because Java is popular",
                "Uninstall Java on all machines including servers needed",
                "Disable Windows Update instead",
            ],
            "Compensating controls plus migration beat ignoring EOL runtimes.",
        ),
        (
            "Browser extensions with broad permissions haven't updated in two years. Risk?",
            "Abandoned extensions become supply-chain targets",
            [
                "Extensions cannot access tabs",
                "Only mobile apps matter",
                "HIPAA bans browsers",
            ],
            "Stale extensions are a growing endpoint risk.",
        ),
        (
            "SCADA systems run Windows 7 embedded. Security recommendation?",
            "Network segmentation, monitoring, and documented exception with compensating controls",
            [
                "Connect SCADA to guest Wi-Fi",
                "Install consumer antivirus only and expose RDP",
                "Share one admin password",
            ],
            "Unsupported OS needs isolation and monitoring when upgrade is delayed.",
        ),
    ],
    "config-drift": [
        (
            "Terraform plan shows manual firewall holes on prod not in code. What does this indicate?",
            "Configuration drift undermining infrastructure as code guarantees",
            [
                "Improved security posture",
                "Automatic HIPAA compliance",
                "Faster MFA enrollment",
            ],
            "Manual changes bypass review; drift detection and import/remediation needed.",
        ),
        (
            "CIS benchmark scan: SSH PermitRootLogin yes on new cloud VMs. Fix?",
            "Enforce golden image / cloud-init baseline and continuous compliance scanning",
            [
                "Document as acceptable forever",
                "Disable SSH and use no remote access ever",
                "Share root password in chat",
            ],
            "Baselines and scanning prevent redeploy drift.",
        ),
        (
            "AD GPO reports different password policy on one OU. Likely impact?",
            "Weaker credentials on accounts in that OU attract spray attacks",
            [
                "Stronger encryption on Wi-Fi",
                "Automatic patch compliance",
                "No security effect",
            ],
            "Policy inconsistency creates weak pockets attackers target.",
        ),
    ],
    "update-compliance": [
        (
            "MDM shows 15% iOS devices below minimum OS. Enforcement action?",
            "Block corporate email and VPN until compliant or quarantined VLAN",
            [
                "Allow indefinitely with warning email",
                "Wipe all devices immediately without notice",
                "Disable MDM to reduce tickets",
            ],
            "Conditional access drives mobile compliance.",
        ),
        (
            "Servers miss updates because change freeze lasts six months. Risk acceptance should note?",
            "Accumulated critical CVE exposure for entire freeze period",
            [
                "Freezes guarantee zero incidents",
                "Attackers respect change freezes",
                "Updates are cosmetic only",
            ],
            "Long freezes need explicit risk sign-off and compensating monitoring.",
        ),
        (
            "Which metric BEST measures update compliance?",
            "% assets at or above mandated patch/OS baseline within SLA",
            [
                "Number of help desk tickets about fonts",
                "CCTV camera count",
                "Email volume per user",
            ],
            "Baseline adherence percentage is a standard compliance KPI.",
        ),
    ],
    "unsupported-os": [
        (
            "Vendor ends support for your firewall OS next month. Priority?",
            "Plan upgrade or replacement before EOS—no new CVE patches after",
            [
                "Buy extended support from eBay",
                "Disable logging to hide issues",
                "Expose management UI to internet",
            ],
            "EOS means unpatched vulnerabilities over time.",
        ),
        (
            "Windows Server 2012 R2 remains for one app. Compensating control?",
            "Isolate segment, deny internet egress, monitor closely, fund migration",
            [
                "Join to domain controllers directly on internet",
                "Enable RDP from any IP",
                "Stop backups to save money",
            ],
            "Unsupported servers need network containment and migration plan.",
        ),
        (
            "Medical devices run embedded OS with no vendor patches. BEST documentation?",
            "Risk register entry with network controls and vendor letter on support status",
            [
                "Assume HIPAA exempts all devices",
                "Connect devices to guest Wi-Fi for updates",
                "Disable all clinical networking",
            ],
            "Unsupported medical IoT requires documented risk and segmentation.",
        ),
    ],
    "vulnerable-apps": [
        (
            "WAF blocks SQLi on a public form; app team says 'WAF handles it.' Your concern?",
            "Defense in depth—fix input validation and parameterized queries at source",
            [
                "WAF replaces secure coding",
                "Disable WAF to reduce latency",
                "SQLi is only a network issue",
            ],
            "Relying solely on WAF leaves gaps when rules fail or traffic is internal.",
        ),
        (
            "Dependency scan shows log4j vulnerable library in three microservices. FIRST step?",
            "Identify versions in prod, upgrade or mitigate per vendor guidance, emergency change",
            [
                "Wait for annual pen test",
                "Hide scan results",
                "Delete microservices",
            ],
            "Known exploited vulns need rapid inventory and patching.",
        ),
        (
            "Legacy PHP 5.6 internet app cannot be retired yet. Control?",
            "Reverse proxy with modern TLS, WAF, and strict network ACL to app tier",
            [
                "Expose database port 3306 publicly",
                "Turn off authentication for speed",
                "Merge with Active Directory admin tier",
            ],
            "Compensating perimeter controls while planning retirement.",
        ),
    ],
    "insecure-coding": [
        (
            "Code review finds user input concatenated into OS commands. Fix?",
            "Use parameterized APIs or strict allowlists; never shell out with raw input",
            [
                "Escape only single quotes",
                "Add a comment 'sanitize later'",
                "Trust internal users only",
            ],
            "Command injection is prevented by avoiding shell concatenation.",
        ),
        (
            "JWTs are accepted with alg=none in a mobile API. Severity?",
            "Critical authentication bypass—enforce algorithm allowlist server-side",
            [
                "Low because mobile is encrypted",
                "Fixed by longer passwords only",
                "Not relevant to APIs",
            ],
            "JWT alg none is a known auth bypass pattern.",
        ),
        (
            "Secrets are hard-coded in a mobile app binary. BEST remediation?",
            "Remove secrets from client; use backend broker with short-lived tokens",
            [
                "Obfuscate variable names",
                "Use longer secret strings",
                "Publish app only on Fridays",
            ],
            "Client binaries are extractable; secrets belong server-side.",
        ),
    ],
    "exploits": [
        (
            "Threat intel lists active exploitation of a VPN appliance CVE. Action?",
            "Emergency patch or disconnect appliance per vendor advisory and IR plan",
            [
                "Wait for quarterly patch cycle",
                "Disable VPN and use telnet",
                "Post CVE on social media only",
            ],
            "Known exploited vulns need immediate vendor-guided response.",
        ),
        (
            "Pen test achieves domain admin via PrintNightmare-style vuln. Lesson?",
            "Patch print spooler services and restrict driver installation privileges",
            [
                "Disable printing forever",
                "Ignore if printers work",
                "Add users to Domain Admins for support",
            ],
            "Print subsystem bugs have been critical; privilege reduction matters.",
        ),
        (
            "Browser zero-day is announced; no patch for 48 hours. Mitigation?",
            "Enable enhanced protective mode, restrict browsing on sensitive assets, monitor IOCs",
            [
                "Uninstall all browsers",
                "Disable EDR",
                "Allow only IE6",
            ],
            "Temporary hardening and monitoring bridge zero-day windows.",
        ),
    ],
    "sast": [
        (
            "SAST pipeline fails build on hard-coded AWS keys in a feature branch. Correct outcome?",
            "Block merge until secrets removed and rotated if ever committed to default branch",
            [
                "Override because deadline is today",
                "Disable SAST permanently",
                "Move keys to comments",
            ],
            "SAST gating prevents secret leakage into production lineage.",
        ),
        (
            "Developers complain SAST has 10,000 findings. Prioritization approach?",
            "Focus on critical severity in attack surface paths; tune false positive rules",
            [
                "Ignore all findings",
                "Delete the codebase",
                "Run SAST only yearly",
            ],
            "Risk-based triage makes SAST sustainable.",
        ),
        (
            "SAST flags SSRF in a webhook feature. Why is this high risk?",
            "Server may fetch internal metadata URLs exposing cloud credentials",
            [
                "SSRF only affects CSS colors",
                "Webhooks cannot call URLs",
                "SAST never finds real bugs",
            ],
            "SSRF to cloud metadata is a common critical finding.",
        ),
    ],
    "fraud-indicators": [
        (
            "Accounting sees duplicate vendor invoices with slightly different bank info. Indicator?",
            "Possible vendor fraud or BEC—verify via known contacts",
            [
                "Normal ERP rounding",
                "Network beaconing",
                "Antivirus update",
            ],
            "Bank detail changes on invoices are classic fraud indicators.",
        ),
        (
            "Expense reports spike for gift cards before holidays. Control?",
            "Manager attestation and analytics for outlier patterns",
            [
                "Auto-approve all under $1M",
                "Disable finance department",
                "Publish all card numbers",
            ],
            "Gift card fraud is pattern-detectable with analytics.",
        ),
        (
            "Whistleblower reports kickbacks in procurement. Security role?",
            "Preserve digital evidence logs and support forensic imaging per legal",
            [
                "Delete emails to reduce clutter",
                "Post names on intranet",
                "Disable firewalls",
            ],
            "Fraud investigations need preserved logs and coordinated legal hold.",
        ),
    ],
    "accounting-integrity": [
        (
            "An admin can post and approve journal entries alone. Issue?",
            "Segregation of duties violation enabling financial statement fraud",
            [
                "Improved efficiency only",
                "Required for SOC 2 always",
                "HIPAA mandate",
            ],
            "SoD requires separate roles for posting vs approval.",
        ),
        (
            "Month-end adjustments lack supporting documentation in the share. Risk?",
            "Undetected manipulation of financial results",
            [
                "Faster close process only",
                "Better encryption",
                "No risk if CFO approves verbally",
            ],
            "Audit trails and documentation underpin accounting integrity.",
        ),
        (
            "GL export to Excel for 'analysis' bypasses ERP controls. Mitigation?",
            "Restrict exports and use controlled reporting cubes with logging",
            [
                "Email GL to all staff",
                "Disable ERP",
                "Share one password for finance",
            ],
            "Uncontrolled exports undermine integrity of source system.",
        ),
    ],
    "workflow-protection": [
        (
            "Wire transfers over $50k require two approvals in policy but ERP allows one. Fix?",
            "Configure system-enforced dual approval workflow matching policy",
            [
                "Lower threshold to $5M",
                "Remove approvals for speed",
                "Use personal Venmo",
            ],
            "Technical enforcement must mirror financial policy.",
        ),
        (
            "AP clerks can create vendors and pay them. BEST SoD change?",
            "Separate vendor master maintenance from payment initiation roles",
            [
                "Give everyone Domain Admin",
                "Disable logging",
                "Allow shared clerk login",
            ],
            "Creating vendors and paying is high-risk combined role.",
        ),
        (
            "Automated ACH file generation has no integrity check before upload. Add?",
            "Cryptographic signing or hash verification with dual review of file totals",
            [
                "Email ACH files to personal accounts",
                "Run at 3 a.m. without logs",
                "Disable bank callbacks",
            ],
            "Integrity controls prevent tampered payment files.",
        ),
    ],
    "invoice-manipulation": [
        (
            "PDF invoice totals do not match ERP line items but bank account matches a new vendor. Suspicion?",
            "Invoice manipulation fraud—halt payment and verify vendor",
            [
                "Normal OCR error only",
                "DNS tunneling",
                "Patch Tuesday",
            ],
            "Mismatch between documents and master data signals fraud.",
        ),
        (
            "Attacker inserts a fake line item via compromised AP mailbox rules. Detection?",
            "Hunt for hidden forwarding rules and compare invoice hashes to PO",
            [
                "Disable SPF",
                "Ignore mailbox rules",
                "Pay faster",
            ],
            "Mailbox rules are common in invoice fraud; PO matching catches changes.",
        ),
        (
            "Vendor portal credentials leaked. Financial control to activate?",
            "Force portal password reset and callback verification for any bank changes",
            [
                "Publish new password in email",
                "Disable two-person review",
                "Stop using vendors",
            ],
            "Portal compromise enables payment redirect fraud.",
        ),
    ],
    "unauthorized-access": [
        (
            "After-hours badge swipes in a data center from a terminated contractor badge. Action?",
            "Deactivate badge, review CCTV, and audit access logs for tailgating partners",
            [
                "Ignore if door locked",
                "Share badge with security guard",
                "Disable fire alarms",
            ],
            "Physical access logs must tie to active authorization.",
        ),
        (
            "A propped-open fire door alarm is muted for 'convenience.' Risk?",
            "Unauthorized entry and fire code violation",
            [
                "Improves cooling only",
                "Required for HIPAA Wi-Fi",
                "Stops phishing",
            ],
            "Prop alarms exist to prevent uncontrolled entry.",
        ),
        (
            "Visitor logs are blank but deliveries increased. Control gap?",
            "Lack of visitor management and escort policy enforcement",
            [
                "Too many CCTV cameras",
                "Excess MFA",
                "Over-patching servers",
            ],
            "Visitor procedures document who entered sensitive areas.",
        ),
    ],
    "device-theft": [
        (
            "Laptop stolen from a car; drive encrypted, device not managed. Concern?",
            "If logged in recently, data in use may be accessible; no remote wipe",
            [
                "Encryption useless",
                "Theft impossible on Mac",
                "HIPAA bans laptops",
            ],
            "MDM enables wipe and attestation; encryption helps at rest only.",
        ),
        (
            "Spare phones disappear from a stock room without inventory updates. Process fix?",
            "Asset tracking with check-in/out and alarm on high-value storage",
            [
                "Leave room unlocked for convenience",
                "Disable all mobile MDM",
                "Publish IMEI list publicly",
            ],
            "Inventory controls deter insider theft and aid recovery.",
        ),
        (
            "Stolen tablet had clinical app logged in. Immediate steps?",
            "Remote wipe via MDM, force session logout, breach assessment per HIPAA",
            [
                "Wait for user to buy replacement",
                "Post patient list online",
                "Disable encryption",
            ],
            "Mobile clinical theft requires wipe and PHI breach evaluation.",
        ),
    ],
    "badge-access": [
        (
            "Employees lend badges to coworkers. Policy fix?",
            "Anti-passback and disciplinary enforcement with role-based access reviews",
            [
                "Issue one badge per team",
                "Disable access logs",
                "Remove cameras",
            ],
            "Badge sharing breaks non-repudiation; technical anti-passback helps.",
        ),
        (
            "Access control system uses default vendor password on the controller. Risk?",
            "Remote unlock of doors and badge cloning via admin interface",
            [
                "Only affects lighting",
                "Improves MFA",
                "Required for PCI only",
            ],
            "Physical access controllers are critical infrastructure—change defaults.",
        ),
        (
            "Tailgating incidents rise at the main entrance. Mitigation?",
            "Mantraps or staffed reception with challenge of unbadged followers",
            [
                "Remove all doors",
                "Disable badges",
                "Open turnstiles 24/7",
            ],
            "Layered physical entry controls reduce tailgating.",
        ),
    ],
    "cctv": [
        (
            "CCTV retention is 7 days but incident discovered on day 10. Impact?",
            "Evidence may be lost—align retention to investigation and policy needs",
            [
                "Longer retention always illegal",
                "CCTV replaces SIEM",
                "HIPAA bans cameras",
            ],
            "Retention must meet investigative timelines.",
        ),
        (
            "Camera covers ATM area but blinds spot hides safe access. Issue?",
            "Gap in coverage allows undetected physical theft",
            [
                "Improves privacy for attackers",
                "Required by encryption standards",
                "Fixes patch management",
            ],
            "Camera placement should eliminate blind spots on high-value assets.",
        ),
        (
            "NVR firmware is three years old on the security VLAN. Recommendation?",
            "Patch or replace per vendor; segment NVR from corporate user VLANs",
            [
                "Expose NVR to internet for remote viewing",
                "Share admin password with vendors via email",
                "Disable authentication",
            ],
            "NVRs are targets; patching and segmentation reduce compromise risk.",
        ),
    ],
    "hipaa": [
        (
            "A clinic texts patient results via personal SMS. Violation concern?",
            "Likely PHI disclosure without BA agreement and secure channel",
            [
                "HIPAA only applies to banks",
                "SMS is always HIPAA compliant",
                "Encryption not required for health",
            ],
            "PHI needs approved channels and often BAAs with vendors.",
        ),
        (
            "Minimum necessary principle means what for a billing clerk?",
            "Access only PHI needed for billing tasks, not full medical records",
            [
                "Access all records for convenience",
                "Share charts on social media",
                "Disable audit logs",
            ],
            "Minimum necessary limits scope of PHI access by role.",
        ),
        (
            "Business associate agreement missing for cloud backup vendor storing ePHI. Risk?",
            "Regulatory liability and unclear breach notification duties",
            [
                "BAAs optional for encryption",
                "Only applies to EU GDPR",
                "Required only for fax",
            ],
            "BAAs define HIPAA obligations for vendors handling ePHI.",
        ),
    ],
    "policy-adherence": [
        (
            "Audit finds developers pushing code without peer review despite policy. Gap?",
            "Policy not enforced technically via branch protection",
            [
                "Policy too strict—delete it",
                "Git cannot enforce reviews",
                "HIPAA bans Git",
            ],
            "Technical controls enforce policy; paper alone fails.",
        ),
        (
            "Employees use personal cloud storage for work files against AUP. Response?",
            "DLP blocks, training, and approved enterprise sync alternative",
            [
                "Ignore until breach",
                "Publish AUP once without enforcement",
                "Disable all cloud globally including approved",
            ],
            "Adherence needs detectable enforcement and viable alternatives.",
        ),
        (
            "Policy requires annual security training; 40% overdue. Metric to report?",
            "Training completion rate by department with escalation to managers",
            [
                "Number of coffee cups in break room",
                "DNS TTL",
                "Printer toner level",
            ],
            "Completion metrics drive accountability for policy training.",
        ),
    ],
    "audit-readiness": [
        (
            "Auditors request sample of privileged access reviews; team has ad hoc emails only. Improvement?",
            "Central ticketing with evidence attachments and scheduled quarterly reviews",
            [
                "Delete emails before audit",
                "Forge timestamps",
                "Disable all admin accounts",
            ],
            "Repeatable evidence beats informal communication.",
        ),
        (
            "Log retention is 30 days but audit needs 90. Finding?",
            "Retention policy misaligned with compliance and investigation needs",
            [
                "Logs never matter",
                "Increase retention to 10 years without review",
                "Stop logging to save costs",
            ],
            "Retention must meet regulatory and investigative requirements.",
        ),
        (
            "Change records missing for emergency firewall rule during incident. Fix for next time?",
            "Post-incident change documentation within 24 hours per policy",
            [
                "Never document emergency changes",
                "Disable firewalls after incidents",
                "Share admin passwords in ticket",
            ],
            "Emergency changes still require retrospective documentation.",
        ),
    ],
    "documentation": [
        (
            "Network diagram last updated five years ago. Risk during incident?",
            "Delayed containment because responders lack accurate segmentation view",
            [
                "Diagrams are decorative only",
                "Improves antivirus",
                "Required for MFA only",
            ],
            "Current diagrams speed IR and audits.",
        ),
        (
            "IR playbooks exist but contacts are outdated after reorg. Priority?",
            "Update RACI and on-call numbers before next tabletop",
            [
                "Delete playbooks",
                "Use only social media for IR",
                "Wait for real incident",
            ],
            "Stale contacts waste critical minutes in breaches.",
        ),
        (
            "Data flow diagrams for PHI are missing for a new SaaS tool. Why needed?",
            "Shows where PHI transits for HIPAA risk analysis and BAAs",
            [
                "Only lawyers need diagrams",
                "SaaS has no data flows",
                "Diagrams replace encryption",
            ],
            "DFDs support risk assessments and vendor due diligence.",
        ),
    ],
    "risk-management": [
        (
            "A high-risk finding is accepted without expiration date. Problem?",
            "Risk acceptance becomes permanent bypass of remediation",
            [
                "Improves security posture",
                "Required for all low findings",
                "Automatically patches systems",
            ],
            "Time-bound acceptance forces periodic re-evaluation.",
        ),
        (
            "Third-party risk scores are collected but not tied to contract renewals. Gap?",
            "Risk management not integrated into procurement lifecycle",
            [
                "Scores replace all technical controls",
                "Vendors never pose risk",
                "HIPAA bans vendors",
            ],
            "TPRM should influence renewals and monitoring.",
        ),
        (
            "Annual risk register omits cloud misconfiguration threats. Update?",
            "Add CSPM findings and top cloud ATT&CK techniques to enterprise risk register",
            [
                "Delete cloud accounts",
                "Ignore cloud because it is virtual",
                "Only track physical risks",
            ],
            "Risk registers should reflect current attack surfaces including cloud.",
        ),
    ],
}
