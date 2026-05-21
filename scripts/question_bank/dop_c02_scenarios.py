"""
DOP-C02 scenario practice questions aligned to AWS Skill Builder practice exam topics.

Stems and distractors are paraphrased; correct answers and service choices match the
official DOP-C02 practice test item bank.
"""
from __future__ import annotations

from question_bank.common import RawQuestion

# domain, type, stem, options, correct, explanation, docs
DOP_SCENARIO_QUESTIONS: list[RawQuestion] = [
    (
        "config-management-iac",
        "multiple-choice",
        "A company deployed AWS resources with a CloudFormation template that listed only properties "
        "required to create each resource. Optional settings used service defaults, then operators changed "
        "those defaults outside the stack. That caused drift from the template. The team wants every "
        "property value maintained in the template, wants to detect out-of-band changes, and wants the stack "
        "restored to the template definition. Which solution meets these requirements with the LEAST "
        "implementation effort?",
        [
            (
                "a",
                "Update the template to set every property (including former defaults). Create a Lambda function "
                "that detects stack drift and updates the stack from the template. Schedule it daily with "
                "Amazon EventBridge.",
            ),
            (
                "b",
                "Create a Lambda function that detects drift on the existing stack and updates the stack using "
                "the current template. Invoke it on a daily schedule with Amazon EventBridge.",
            ),
            (
                "c",
                "Update the template to set every property (including former defaults). Use the "
                "cloudformation-stack-drift-detection-check AWS Config rule with automatic remediation via the "
                "AWS-UpdateCloudFormationStack Systems Manager Automation runbook.",
            ),
            (
                "d",
                "Use the cloudformation-stack-drift-detection-check AWS Config rule with automatic remediation "
                "via the AWS-UpdateCloudFormationStack Systems Manager Automation runbook only.",
            ),
        ],
        ["b"],
        "Scheduled DetectStackDrift plus redeploying the known template is the lowest-effort path. "
        "Fully enumerating every property and rolling out org-wide Config remediation is heavier.",
        [
            (
                "CloudFormation drift",
                "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html",
            ),
            (
                "DetectStackDrift",
                "https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_DetectStackDrift.html",
            ),
        ],
    ),
    (
        "resilient-cloud-solutions",
        "multiple-choice",
        "An application on Amazon EC2 instances in multiple Availability Zones pulls messages from an "
        "Amazon SQS queue. During bursts, backlog grows while average CPU on the Auto Scaling group stays low. "
        "Target tracking on average CPU does not scale out quickly enough. Which solution resolves this in the "
        "MOST reliable way?",
        [
            (
                "a",
                "Publish a custom Amazon CloudWatch metric: visible SQS messages divided by in-service instances. "
                "Scale the Auto Scaling group on that metric against an acceptable target.",
            ),
            (
                "b",
                "Place an Application Load Balancer in front of the group and scale on "
                "ALBRequestCountPerTarget.",
            ),
            (
                "c",
                "Change the target tracking policy to use the SQS NumberOfMessagesReceived metric instead of CPU.",
            ),
            (
                "d",
                "Lower the CPU target percentage and shorten the warm-up period on the existing policy.",
            ),
        ],
        ["a"],
        "Queue depth per running instance reflects worker backlog; CPU is a weak signal for queue consumers.",
        [
            (
                "SQS with Auto Scaling",
                "https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-using-sqs-queue.html",
            ),
            (
                "Custom metrics",
                "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html",
            ),
        ],
    ),
    (
        "monitoring-logging",
        "multiple-choice",
        "A DevOps engineer manages multiple accounts in AWS Organizations and must monitor selected service "
        "quotas daily in every account. Email alerts are required when usage reaches 80% of a quota. Which "
        "solution meets these requirements?",
        [
            (
                "a",
                "Enable trusted access between Service Quotas and Organizations. Create a CloudWatch alarm per "
                "needed service at 80% of quota utilization. Send Amazon SNS notifications when the alarm enters "
                "ALARM.",
            ),
            (
                "b",
                "Deploy a Lambda function in each account that calls DescribeTrustedAdvisorCheckResult and opens "
                "support cases for WARN quota checks. Schedule it daily from the management account over "
                "EventBridge.",
            ),
            (
                "c",
                "Enable Service Quotas trusted access and create 80% CloudWatch alarms, but route ALARM events "
                "through EventBridge instead of SNS.",
            ),
            (
                "d",
                "Refresh Trusted Advisor checks daily with Lambda and publish to SNS when checks report 80% usage.",
            ),
        ],
        ["a"],
        "Service Quotas integrates with Organizations and exposes utilization metrics for CloudWatch alarms; "
        "SNS is the standard notification channel.",
        [
            (
                "Service Quotas and Organizations",
                "https://docs.aws.amazon.com/servicequotas/latest/userguide/organizations.html",
            ),
            (
                "CloudWatch alarms",
                "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html",
            ),
        ],
    ),
    (
        "sdlc-automation",
        "multiple-response",
        "An application runs on EC2 behind an Application Load Balancer in an Auto Scaling group. AWS CodeDeploy "
        "performs blue/green deployments. Operators read application logs on instances and manually tell CodeDeploy "
        "to roll back when error rates are too high. Which TWO steps automate rollback? (Select TWO.)",
        [
            (
                "a",
                "Create a CloudWatch alarm on the ALB HTTPCode_Target_4XX_Count metric above a threshold.",
            ),
            (
                "b",
                "Configure the deployment group to monitor the alarm, fail the deployment, and roll back when the "
                "alarm enters ALARM.",
            ),
            (
                "c",
                "Use a scheduled Lambda every hour to roll back if an alarm is in ALARM.",
            ),
            (
                "d",
                "Publish to SNS on ALARM and configure CodeDeploy to subscribe to the topic for rollback.",
            ),
            (
                "e",
                "Send application logs to CloudWatch Logs, add a metric filter for error lines, and alarm on the "
                "error rate.",
            ),
        ],
        ["b", "e"],
        "CodeDeploy can tie rollback to deployment alarms; log metric filters catch errors that never appear as "
        "ALB HTTP codes.",
        [
            (
                "CodeDeploy alarms",
                "https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-sns-event-notifications.html",
            ),
            (
                "Log metric filters",
                "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html",
            ),
        ],
    ),
    (
        "config-management-iac",
        "multiple-choice",
        "A DevOps engineer launched Elastic Beanstalk with the EB CLI and added an .ebextensions file that sets "
        "the instance type to t3.medium. The environment picked up new environment variables but still runs "
        "t3.small instances. What is the most likely root cause?",
        [
            ("a", "Default service values cannot be overridden by .ebextensions."),
            (
                "b",
                "Values passed through the Elastic Beanstalk CLI/API (recommended values) take precedence over "
                ".ebextensions for settings such as instance type.",
            ),
            ("c", "Instance type cannot be configured in .ebextensions."),
            ("d", "The launching IAM principal lacks permission for t3.medium."),
        ],
        ["b"],
        "Precedence is direct environment/API settings, saved configuration, .ebextensions, then defaults. "
        "CLI launches can apply recommended values that win over extensions.",
        [
            (
                "Configuration precedence",
                "https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/AWSHowTo.EB.Environment.html",
            ),
        ],
    ),
    (
        "sdlc-automation",
        "multiple-choice",
        "Amazon API Gateway fronts Lambda for a REST API. Route 53 provides DNS. A new Lambda version is ready; "
        "10% of production traffic must hit the new functions for one week with no URL change for clients. "
        "What is the MOST operationally efficient deployment?",
        [
            (
                "a",
                "Deploy a new API stage and custom domain; use a simple Route 53 record to split 10%/90% traffic.",
            ),
            (
                "b",
                "Add a canary release on the existing production stage: 10% to the new Lambda integration and 90% "
                "to the current integration.",
            ),
            (
                "c",
                "Create a second API and second Route 53 domain; use weighted routing 10%/90%.",
            ),
            (
                "d",
                "Switch to Lambda proxy integration and route 10% of requests inside the function.",
            ),
        ],
        ["b"],
        "API Gateway canary deployments on the same stage shift traffic without client-side hostname changes.",
        [
            (
                "Canary release",
                "https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html",
            ),
        ],
    ),
    (
        "monitoring-logging",
        "multiple-choice",
        "JSON logs on EC2 include PII. A third party must troubleshoot application events without PII and "
        "without SSH to production. Which solution is MOST cost-effective?",
        [
            (
                "a",
                "Central syslog on EC2; AWS Batch copies filtered logs to Amazon S3 once per day.",
            ),
            (
                "b",
                "CloudWatch agent to CloudWatch Logs; Lambda writes all events to an always-on OpenSearch cluster; "
                "share OpenSearch Dashboards with the vendor.",
            ),
            (
                "c",
                "CloudWatch agent directly to Amazon Data Firehose; Lambda transformation drops non-event lines; "
                "deliver to S3.",
            ),
            (
                "d",
                "CloudWatch agent to CloudWatch Logs; subscription filter and Lambda write only application events "
                "to Amazon S3; grant the vendor S3 access.",
            ),
        ],
        ["d"],
        "Subscription filters can strip PII; S3 is cost-effective for episodic vendor review without always-on "
        "search infrastructure.",
        [
            (
                "Subscription filters",
                "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/SubscriptionFilters.html",
            ),
        ],
    ),
    (
        "incident-event-response",
        "multiple-choice",
        "AWS Organizations spans many accounts and Regions. The company needs automated detection and blocking "
        "when any S3 bucket (existing or new) becomes public via ACLs or bucket policies. Which solution meets "
        "this?",
        [
            (
                "a",
                "EventBridge global endpoints with replication to a security account; Lambda removes public access.",
            ),
            (
                "b",
                "Organization CloudTrail to a security-account bucket; EventBridge rules on that bus for all "
                "accounts.",
            ),
            (
                "c",
                "Enable S3 EventBridge notifications on every bucket for ACL and policy changes.",
            ),
            (
                "d",
                "AWS Config rule in each account (or organization) for public ACLs/policies with automated "
                "remediation via a Systems Manager Automation runbook.",
            ),
        ],
        ["d"],
        "Managed Config rules such as s3-bucket-level-public-access-prohibited detect public access; runbooks "
        "like AWS-DisableS3BucketPublicReadWrite remediate automatically.",
        [
            (
                "Config remediation",
                "https://docs.aws.amazon.com/config/latest/developerguide/remediation.html",
            ),
            (
                "s3-bucket-level-public-access-prohibited",
                "https://docs.aws.amazon.com/config/latest/developerguide/s3-bucket-level-public-access-prohibited.html",
            ),
        ],
    ),
    (
        "sdlc-automation",
        "multiple-choice",
        "Two CodePipeline flows build the same Git branch: one deploys to development, one to UAT. UAT shows a "
        "defect that does not appear in development at the same code version. How should the DevOps engineer "
        "ensure identical artifacts and identical environments?",
        [
            (
                "a",
                "Lambda validates artifacts; reuse one CodeBuild project in both pipelines; CodeDeploy deploys "
                "each environment.",
            ),
            (
                "b",
                "One pipeline builds to S3; S3 events invoke validation Lambda; two pipelines deploy from S3.",
            ),
            (
                "c",
                "Shared CodeBuild with different buildspec overrides per environment via --buildspec-override.",
            ),
            (
                "d",
                "Lambda compares artifact SHA-256 checksums across pipelines after the UAT build; both deployment "
                "stages use the same AWS CloudFormation template to provision environments.",
            ),
        ],
        ["d"],
        "One CloudFormation template keeps environments equivalent; checksum validation proves both pipelines "
        "shipped the same build output.",
        [
            (
                "CodePipeline artifacts",
                "https://docs.aws.amazon.com/codepipeline/latest/userguide/artifacts.html",
            ),
        ],
    ),
    (
        "sdlc-automation",
        "multiple-choice",
        "A SAM application has an API Gateway HTTP API and Lambda functions. Authentication must validate a "
        "custom HTTP header and token by calling a legacy service that is not OpenID Connect or SAML. Which "
        "mechanism should the team use?",
        [
            ("a", "Lambda authorizer"),
            ("b", "Amazon Cognito user pool"),
            ("c", "Amazon Cognito identity pool"),
            ("d", "API key for API Gateway"),
        ],
        ["a"],
        "A Lambda authorizer calls your existing auth service and returns an IAM policy for allow or deny.",
        [
            (
                "Lambda authorizers",
                "https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html",
            ),
        ],
    ),
    (
        "sdlc-automation",
        "multiple-choice",
        "A hybrid workload will use AWS CodeDeploy on on-premises servers. What is the MOST secure way to "
        "register targets and deploy with tag-based deployment groups?",
        [
            (
                "a",
                "IAM user access keys in a local credentials file; register instance IDs with the deployment group.",
            ),
            (
                "b",
                "IAM user access keys in a file; tag servers; tag-based deployment group.",
            ),
            (
                "c",
                "IAM role with STS AssumeRole; refresh credentials on a schedule; install the CodeDeploy agent; "
                "register on-premises instances; tag-based deployment group.",
            ),
            (
                "d",
                "Same as (c) but register a list of instance IDs instead of tags.",
            ),
        ],
        ["c"],
        "Temporary credentials from AssumeRole avoid long-lived keys; CodeDeploy deployment groups target tags.",
        [
            (
                "On-premises instances",
                "https://docs.aws.amazon.com/codedeploy/latest/userguide/instances-on-premises.html",
            ),
        ],
    ),
    (
        "resilient-cloud-solutions",
        "multiple-choice",
        "EC2 instances behind an ALB in an Auto Scaling group must register with an external auditing service before "
        "they process transactions. Which solution meets this?",
        [
            (
                "a",
                "Add a lifecycle hook to put new instances in Pending:Wait; run a registration script; complete "
                "the lifecycle action with CONTINUE or ABANDON.",
            ),
            (
                "b",
                "User data bootstrap script registers the instance; return a non-zero exit code on failure.",
            ),
            (
                "c",
                "EventBridge schedule every 5 minutes invokes Lambda to register any new instances.",
            ),
            (
                "d",
                "EventBridge rule on EC2 launch invokes Lambda to register asynchronously.",
            ),
        ],
        ["a"],
        "Lifecycle hooks block the Auto Scaling group until registration succeeds or the instance is abandoned.",
        [
            (
                "Lifecycle hooks",
                "https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html",
            ),
        ],
    ),
    (
        "config-management-iac",
        "multiple-response",
        "Legal documents live in Amazon S3. Users set LegalHold=true on some objects. The company must delete "
        "objects older than 90 days that are not on legal hold. Uploading apps cannot be changed to add tags on "
        "PUT. Which TWO steps meet the requirements? (Select TWO.)",
        [
            (
                "a",
                "Bucket policy denying PutObject unless s3:RequestObjectTag/LegalHold is true or false.",
            ),
            ("b", "Lifecycle expiration after 90 days with no tag filter."),
            (
                "c",
                "S3 event notification on object creation invokes Lambda to set LegalHold=false when the tag is "
                "missing.",
            ),
            (
                "d",
                "Bucket policy denying DeleteObject when s3:ExistingObjectTag/LegalHold is true.",
            ),
            (
                "e",
                "Lifecycle rule with filter LegalHold=false that expires objects older than 90 days.",
            ),
        ],
        ["c", "e"],
        "Lambda defaults the tag so lifecycle can filter; expiration with LegalHold=false skips held documents.",
        [
            (
                "Lifecycle filters",
                "https://docs.aws.amazon.com/AmazonS3/latest/userguide/intro-lifecycle-rules.html",
            ),
        ],
    ),
    (
        "incident-event-response",
        "multiple-choice",
        "Amazon ECS tasks enter STOPPED when an essential container exits with stoppedReason "
        "\"Essential container in task exited\". An SNS topic exists for email alerts. What should the engineer "
        "do next with the LEAST development effort?",
        [
            ("a", "Configure ECS cluster notification options for lastStatus STOPPED."),
            (
                "b",
                "Create an EventBridge rule on aws.ecs for STOPPED tasks with that stoppedReason; target the SNS "
                "topic.",
            ),
            ("c", "Lambda polls DescribeTasks on a schedule and publishes matching tasks to SNS."),
            ("d", "Set notifications=true on essential containers in the task definition."),
        ],
        ["b"],
        "EventBridge captures ECS task state changes natively; SNS delivers email without custom polling code.",
        [
            (
                "ECS events",
                "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_cwe_events.html",
            ),
        ],
    ),
    (
        "sdlc-automation",
        "multiple-choice",
        "A web API uses API Gateway, Lambda, DynamoDB, and ElastiCache for Redis OSS. How should a DevOps engineer "
        "deploy this with the MOST operational efficiency?",
        [
            ("a", "Deploy all infrastructure with one AWS Serverless Application Model (AWS SAM) template."),
            (
                "b",
                "Deploy everything with CloudFormation and custom resources for API, Lambda, and DynamoDB.",
            ),
            ("c", "CloudFormation for ElastiCache; SAM for the remaining components."),
            ("d", "CloudFormation template without the SAM transform."),
        ],
        ["a"],
        "SAM extends CloudFormation for serverless workloads in a single maintainable template.",
        [
            (
                "AWS SAM",
                "https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html",
            ),
        ],
    ),
    (
        "incident-event-response",
        "multiple-choice",
        "Development teams create EC2 instances, but some hosts do not use security-approved AMIs. The DevOps team "
        "needs automatic discovery and termination of noncompliant instances. What should they implement?",
        [
            ("a", "Approved AWS Service Catalog products only."),
            ("b", "SCP on an IAM group denying ec2:RunInstances unless the AMI is approved."),
            (
                "c",
                "AWS Config rule detecting noncompliant instances with remediation that terminates them.",
            ),
            ("d", "CloudFormation templates developers launch manually."),
        ],
        ["c"],
        "Config continuously evaluates instances; remediation can terminate hosts that violate the AMI rule.",
        [
            (
                "Config remediation",
                "https://docs.aws.amazon.com/config/latest/developerguide/remediation.html",
            ),
        ],
    ),
    (
        "config-management-iac",
        "multiple-choice",
        "EC2 instances behind an ALB drift because of launch-time differences and manual SSH changes. The company "
        "wants identical configuration at launch and over the instance lifetime. Which solution meets this?",
        [
            (
                "a",
                "Golden AMI per OS update; NewestInstance termination policy; disable console access; Systems "
                "Manager maintenance.",
            ),
            (
                "b",
                "Use the default AWS AMI and patch in user data on each launch; OldestLaunchConfiguration policy.",
            ),
            (
                "c",
                "Golden AMI; OldestLaunchConfiguration; double capacity then scale in; use AWS Config for emergency "
                "maintenance.",
            ),
            (
                "d",
                "Golden AMI per update; OldestLaunchConfiguration termination; double capacity then return to "
                "original size; disable OS console access; use AWS Systems Manager for maintenance.",
            ),
        ],
        ["d"],
        "Immutable AMIs plus replacing oldest instances removes drift; Systems Manager supports controlled changes "
        "without ad hoc SSH.",
        [
            ("AMI immutability", "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html"),
            (
                "Systems Manager",
                "https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html",
            ),
        ],
    ),
    (
        "sdlc-automation",
        "multiple-choice",
        "A public REST API’s Lambda now requires a language field in the JSON body. Only one production Lambda "
        "function should be maintained. Legacy clients omit language. How should the DevOps team deploy?",
        [
            ("a", "New API integrated with the new Lambda; keep the old API and Lambda unchanged."),
            (
                "b",
                "Integrate the existing API with the new Lambda and delete the old function immediately.",
            ),
            ("c", "New API for new clients; existing API unchanged so legacy calls still omit language."),
            (
                "d",
                "New API for clients that send language; add a mapping template on the existing API integration "
                "that injects \"language\": \"English\"; delete the old Lambda after cutover.",
            ),
        ],
        ["d"],
        "Mapping templates add defaults on the legacy stage while a new API serves explicit language values.",
        [
            (
                "Mapping templates",
                "https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html",
            ),
        ],
    ),
    (
        "reliability-resilience",
        "multiple-choice",
        "A stateless web tier on EC2 behind an ALB uses Amazon RDS for MySQL Multi-AZ. DR in a second Region must "
        "achieve RTO under 2 hours and RPO under 10 minutes, cost-effectively. Which DR design fits?",
        [
            (
                "a",
                "Elastic Beanstalk environment in the DR Region; swap environment URLs; promote a cross-Region read "
                "replica.",
            ),
            (
                "b",
                "Maintain current AMIs for the web tier in the DR Region; cross-Region RDS read replica; on "
                "disaster launch a CloudFormation stack, promote the replica, update DNS to the new load balancer.",
            ),
            (
                "c",
                "Hourly Lambda copies EBS and RDS snapshots to the DR Region; rebuild from snapshots on disaster.",
            ),
            (
                "d",
                "Active web tier in both Regions; Aurora global database with manual promotion in DR.",
            ),
        ],
        ["b"],
        "Cross-Region read replicas meet tight RPO; AMIs plus IaC in DR meet RTO without full active-active cost.",
        [
            (
                "Cross-Region read replicas",
                "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html",
            ),
            (
                "DR on AWS",
                "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html",
            ),
        ],
    ),
    (
        "sdlc-automation",
        "multiple-choice",
        "Python applications use Git, AWS CodeBuild, and AWS CodePipeline. The team needs automatic source review "
        "to find defects before compile. Which solution meets this?",
        [
            ("a", "Associate the Git repo with Amazon CodeGuru Profiler and review pull requests."),
            ("b", "Run CodeGuru Profiler in the CodeBuild prebuild phase."),
            ("c", "Associate the Git repository with Amazon CodeGuru Reviewer."),
            ("d", "Run CodeGuru Reviewer only in CodeBuild without associating the repository."),
        ],
        ["c"],
        "CodeGuru Reviewer analyzes pull requests for defects and best practices in Python and Java.",
        [
            (
                "CodeGuru Reviewer",
                "https://docs.aws.amazon.com/codeguru/latest/reviewer-ug/welcome.html",
            ),
        ],
    ),
    # Supplemental scenarios (exam-guide aligned; not from the 20-item practice set)
    (
        "config-management-iac",
        "multiple-choice",
        "Operators want every optional CloudFormation property defined in code and drift corrected by re-applying "
        "the full template, using managed governance rather than a custom Lambda scheduler. What should they add?",
        [
            ("a", "DetectStackDrift Lambda on a cron only"),
            ("b", "Stack policy denying updates"),
            (
                "c",
                "Explicit properties in the template plus AWS Config drift detection with "
                "AWS-UpdateCloudFormationStack remediation",
            ),
            ("d", "CloudTrail alone"),
        ],
        ["c"],
        "Config’s CloudFormation drift check plus the standard remediation runbook updates stacks to match templates.",
        [
            (
                "cloudformation-stack-drift-detection-check",
                "https://docs.aws.amazon.com/config/latest/developerguide/cloudformation-stack-drift-detection-check.html",
            ),
        ],
    ),
    (
        "monitoring-logging",
        "multiple-choice",
        "During a blue/green CodeDeploy cutover, target 5xx rates from the load balancer are not rising, but "
        "application log errors are. Which signal should drive automated rollback?",
        [
            ("a", "ALB HTTPCode_Target_5XX_Count alone"),
            ("b", "Deployment group linked to a log-derived error metric alarm"),
            ("c", "Manual SNS email to operators only"),
            ("d", "EC2 CPUUtilization alarm"),
        ],
        ["b"],
        "Application errors may appear only in logs; metric filters surface them to CodeDeploy alarms.",
        [
            (
                "CodeDeploy monitoring",
                "https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring.html",
            ),
        ],
    ),
    (
        "incident-event-response",
        "multiple-choice",
        "Security needs daily detection of public S3 buckets across many accounts without writing custom "
        "drift Lambdas per account. Which managed capability applies?",
        [
            ("a", "S3 Inventory only"),
            ("b", "Macie for every object daily"),
            (
                "c",
                "Organization-wide AWS Config conformance pack with public access rules and remediation",
            ),
            ("d", "CloudFront in front of all buckets"),
        ],
        ["c"],
        "Conformance packs roll Config rules and remediation to all accounts in the organization.",
        [
            (
                "Conformance packs",
                "https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html",
            ),
        ],
    ),
    (
        "reliability-resilience",
        "multiple-choice",
        "Chaos testing should inject EC2 stop failures in a non-production environment with guardrails. Which "
        "AWS service is purpose-built?",
        [
            ("a", "AWS Fault Injection Simulator experiment templates"),
            ("b", "Random SSH reboot scripts"),
            ("c", "Disable Auto Scaling"),
            ("d", "Delete the VPC"),
        ],
        ["a"],
        "FIS provides controlled fault injection experiments with safety controls.",
        [
            ("FIS", "https://docs.aws.amazon.com/fis/latest/userguide/fis-intro.html"),
        ],
    ),
]
