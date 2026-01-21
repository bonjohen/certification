# **AZ-104 Microsoft Azure Administrator — Scenario-Based Study Companion**

## **Introduction**

The **AZ-104: Microsoft Azure Administrator** exam validates practical skills for implementing, managing, and monitoring core Azure services that keep workloads secure, available, and governable in production. The role is operational and decision-driven: given a requirement and constraints, you must choose the correct **identity and access controls**, **governance guardrails**, **storage and compute configurations**, **networking patterns**, and **monitoring/backup** strategies—and recognize common failure modes (scope mistakes, DNS pitfalls, policy blocks, logging gaps, and over-broad permissions).

This companion is aligned to how AZ-104 questions are commonly framed: short scenarios with real-world constraints (security boundaries, cost, blast radius, compliance, availability targets, and operational simplicity). It emphasizes **default best-fit choices**, **tradeoffs**, and **exam traps** rather than rote recall.

## **1\) RBAC Scope Selection**

**Question:** You must allow a support team to restart VMs and read VM metrics, but only in the `Prod-App1` resource group. They must not manage networking or IAM anywhere else. Where and how should you assign permissions?

**A) Minimum Acceptable Answer:** Assign an Azure RBAC role at the `Prod-App1` resource group scope.

**B) Complete Answer:** Assign permissions at the **resource group scope** (not subscription) to constrain blast radius. Use a built-in role that covers VM operations (e.g., VM Contributor) plus monitoring-read access if needed. Prefer assigning the role to an **Entra ID group**, not individual users.

**C) Deeper Knowledge Signal:**

* Scope inheritance means subscription-level assignments leak privileges to all RGs; avoid it unless required.

* “Contributor” is often too broad; choose the narrowest built-in role(s).

* If they need metrics/logs, ensure they also have access to the target Log Analytics workspace (workspace permissions are separate from resource permissions).

---

## **2\) Management Groups vs Subscriptions**

**Question:** Your org has 12 subscriptions (prod/non-prod across business units). You need a single place to apply baseline policies (tag requirements, region restrictions) and standard RBAC. What Azure construct should you use?

**A:** Management groups.

**B:** Use **management groups** to organize subscriptions and apply **Azure Policy** and **RBAC** at a higher scope so they inherit. Build a hierarchy like `Root -> Platform -> (Prod, NonProd) -> BU`.

**C:**

* Policies assigned at a management group inherit to child subscriptions unless excluded.

* Use initiatives for baseline policy sets (landing zone style).

* Watch out for “exception sprawl”: manage exemptions intentionally and track them.

---

## **3\) Policy: Enforce Tags**

**Question:** Finance requires every resource to have tags: `CostCenter`, `Owner`, `Env`. Noncompliant deployments must fail in prod, but only be reported in dev. How do you implement this?

**A:** Azure Policy with deny in prod and audit in dev.

**B:** Create a policy/initiative requiring tags; assign **deny** to the prod management group/subscriptions and **audit** to dev. Use separate assignments for prod vs dev.

**C:**

* “Append/modify” effects vary by resource type; don’t assume auto-tagging works everywhere (verify per resource).

* Policy failures surface as deployment failures; administrators must recognize policy as the root cause.

* Use policy exemptions sparingly with documented rationale.

---

## **4\) RBAC vs Azure Policy (Common Confusion)**

**Question:** A team wants to “prevent users from creating public IPs.” Another team wants to “prevent users from deleting VNets.” Which tool fits each requirement?

**A:** Use Azure Policy for preventing resource creation patterns; use RBAC for restricting delete actions.

**B:** **Azure Policy** is best for enforcing configuration/allowed SKUs/regions (“no public IP resource”). **RBAC** controls *actions* like delete; deny deletion by not granting delete permissions (and/or use resource locks for safety).

**C:**

* Policy blocks creation even if RBAC would allow it.

* Resource locks help prevent accidental deletion but are not a governance substitute for RBAC.

* Don’t misuse policy for permissioning; don’t misuse RBAC for configuration compliance.

---

## **5\) Break-Glass Access Design**

**Question:** You need an emergency access path if Entra Conditional Access is misconfigured and admins are locked out. What is the standard Azure approach?

**A:** Create break-glass accounts and protect them appropriately.

**B:** Maintain one or two **break-glass Entra accounts** with strong credentials stored securely, excluded from risky Conditional Access policies, and monitored with alerts.

**C:**

* Break-glass accounts should be rarely used and heavily monitored (sign-in alerts).

* Avoid assigning broad roles permanently; consider just-in-time/PIM if in scope (verify exam coverage).

* Ensure recovery procedures are documented and tested.

---

## **6\) Storage: Keys vs SAS vs Entra ID**

**Question:** A vendor needs upload access to a single blob container for 24 hours. You must be able to revoke access. What do you use?

**A:** SAS (preferably governed with a stored access policy).

**B:** Use a **SAS** scoped to the container with write-only permissions and short expiry; use a **stored access policy** (if suitable) to allow revocation without rotating account keys. Avoid sharing storage account keys.

**C:**

* Storage account keys grant full control; treat as high-risk secrets.

* SAS is time-bound and can be permission-scoped; still treat as a credential.

* If using Private Endpoint, ensure the vendor can reach it (or use public endpoint with network restrictions).

---

## **7\) Storage Networking: Public Endpoint Lockdown**

**Question:** A storage account must be accessible only from a specific VNet. No public internet access is allowed. What configuration do you apply?

**A:** Private Endpoint \+ disable public network access (or restrict via firewall rules), plus DNS.

**B:** Use **Private Endpoint** for the storage account (Blob, File, etc.) and restrict/disable public network access. Configure **Private DNS** so clients resolve the storage FQDN to the private IP.

**C:**

* DNS is the trap: if name resolution still returns the public endpoint, traffic won’t be private.

* Network rules alone don’t make it private; Private Endpoint changes routing.

* Verify service-specific settings for “public network access” toggles and required DNS zones.

---

## **8\) Storage Replication Choice**

**Question:** A workload needs higher availability within a region, but compliance prohibits data leaving the region. What replication option is usually appropriate?

**A:** Zone-redundant storage (ZRS), region-dependent.

**B:** Choose **ZRS** for intra-region zone redundancy (if supported in that region/account kind). Avoid GRS/GZRS because they replicate to a paired region (data leaves region boundary).

**C:**

* Replication support varies by region and account type—verify availability.

* Understand tradeoffs: cost vs durability/availability vs read-access patterns.

* For DR requirements across regions, compliance constraints must explicitly allow it.

---

## **9\) Blob Lifecycle Management**

**Question:** You store logs in Blob. After 30 days, they should move to cooler storage; after 180 days, delete. How do you implement this?

**A:** Blob lifecycle management rules.

**B:** Configure **lifecycle management** on the storage account/container to tier blobs after 30 days and delete after 180 days.

**C:**

* Ensure rules match blob types (block/page/append) and prefixes/tags.

* Tiering behavior and costs differ by access tier; verify if rehydration latency matters.

* If using immutability/legal hold, lifecycle deletion may be blocked.

---

## **10\) Azure Files Identity Access**

**Question:** A Windows fleet must mount a file share using identity-based auth (no keys embedded). What’s the Azure-native approach?

**A:** Azure Files with identity integration (Entra ID / AD DS-based), depending on environment.

**B:** Use **Azure Files** with an identity-based model (options depend on your directory integration). Configure the appropriate identity provider and assign permissions so clients authenticate without storage keys.

**C:**

* The exact identity integration path depends on whether you use Entra Kerberos / AD DS / AAD DS; verify current supported modes.

* NTFS ACLs and share-level permissions can both apply; understand where enforcement occurs.

* Network path (private endpoint vs public) affects client connectivity.

---

## **11\) VM Availability Decision**

**Question:** A business-critical VM must remain available during planned maintenance and reduce single-datacenter risk. What deployment pattern should you choose?

**A:** Use Availability Zones (if region supports); otherwise use Availability Set.

**B:** Prefer **Availability Zones** for higher resilience across datacenters. If zones aren’t available, use an **Availability Set** for fault/update domain separation.

**C:**

* Zone support is regional; verify per region.

* Availability Sets reduce rack-level correlated failure but not datacenter-level outages.

* For multi-VM apps, place dependencies (LB, disks, IPs) in compatible zone patterns.

---

## **12\) VM Sizing Under Constraints**

**Question:** A VM hits CPU saturation at peak. Budget allows minimal spend increase. What are the two primary scaling options, and what’s the usual “first move”?

**A:** Scale up (bigger size) or scale out (more instances). First move often scale up for a single VM.

**B:** For a single VM app, **scale up** (resize SKU) is usually quickest. For horizontally scalable apps, **scale out** using multiple instances behind a load balancer (often VMSS).

**C:**

* Scale up can require reboot/downtime depending on SKU change constraints (verify).

* Scale out requires statelessness or externalized state.

* Watch quotas/region capacity constraints.

---

## **13\) VMSS vs Multiple Standalone VMs**

**Question:** You need 20 identical web servers with autoscaling and uniform configuration. Should you deploy individual VMs or a VM Scale Set?

**A:** VM Scale Set.

**B:** Use **VMSS** to manage a fleet: uniform config, autoscale rules, health-based instance repair, and easier rolling upgrades.

**C:**

* VMSS is best for stateless tiers; stateful workloads complicate scaling.

* Rolling upgrades and instance reimage patterns differ from standalone VMs; understand operational model.

* Verify any per-orchestration-mode limits/behaviors.

---

## **14\) VM Disk Choice: Performance Issue**

**Question:** A VM shows high disk latency and queue depth. You suspect the disk tier is too low. What Azure changes are typically relevant?

**A:** Upgrade disk tier/SKU, consider striping, and confirm caching settings.

**B:** Evaluate managed disk performance tier (e.g., Standard vs Premium), ensure the VM size supports required IOPS/throughput, and review disk caching configuration where applicable. Consider multiple data disks with striping if needed.

**C:**

* VM size caps storage throughput; changing disk alone may not fix it.

* OS disk vs data disk patterns differ; don’t put heavy data on OS disk by accident.

* Exact IOPS/throughput numbers are SKU-specific—verify in official docs.

---

## **15\) VM Extension for Configuration**

**Question:** You must run a one-time bootstrap script on 100 VMs after deployment. What feature is commonly used?

**A:** Custom Script Extension.

**B:** Use the **Custom Script Extension** (or equivalent automation mechanism) to execute scripts post-deployment at scale; in VMSS, apply extension as part of the model.

**C:**

* Handle idempotency: extension retries can rerun scripts.

* Store scripts securely (e.g., storage with SAS, or repo) and restrict access.

* Verify extension timeout/retry behavior in official docs.

---

## **16\) VM Backup Requirement**

**Question:** You must backup VMs nightly and retain 30 days. What service do you use and where do you configure policy?

**A:** Azure Backup with a Recovery Services vault; set a backup policy.

**B:** Use **Azure Backup** via a **Recovery Services vault**, create a **backup policy** for nightly backups and 30-day retention, and enable protection on target VMs.

**C:**

* Understand soft delete and deletion protection behaviors (operational recovery implications).

* Verify retention granularity and supported schedules per workload type.

* RBAC to vault and backup operations is separate from VM permissions.

---

## **17\) Network Segmentation with Subnets**

**Question:** You have a VNet with `web`, `app`, `data` tiers. You need to restrict `web -> data` directly but allow `web -> app -> data`. How do you enforce this?

**A:** NSGs applied to subnets (and/or NICs), allowing required flows only.

**B:** Apply **NSGs** to the `web`, `app`, and `data` subnets with explicit allow rules for required ports between tiers and denies for disallowed direct traffic.

**C:**

* NSGs are evaluated by priority; “first match wins.”

* Default rules allow VNet traffic unless overridden; you must add explicit denies/controls.

* Use Application Security Groups (ASGs) to avoid IP-based rule sprawl (verify exam depth).

---

## **18\) NSG Troubleshooting**

**Question:** A VM cannot be reached on TCP/443 from the internet. Public IP exists. What’s your systematic check order?

**A:** NSG inbound rules, effective security rules, NIC/subnet association, then route and OS firewall.

**B:** Check **effective NSG rules** (subnet \+ NIC), confirm inbound 443 is allowed, verify no higher-priority deny, confirm VM is listening and OS firewall allows 443, and ensure routing/NAT is correct.

**C:**

* Many failures are “shadowed” rules (broad deny with higher priority).

* Subnet NSG and NIC NSG both apply; most restrictive outcome wins.

* Don’t forget app-level listener configuration and health probes if behind a load balancer.

---

## **19\) UDR Forced Tunneling**

**Question:** Security requires all outbound internet traffic from a subnet to go through a network appliance. How do you implement this?

**A:** User-defined routes (UDR) to an NVA as next hop.

**B:** Create a **route table** with a default route (0.0.0.0/0) pointing to the **virtual appliance** next hop, associate it with the subnet, and ensure the NVA can forward traffic.

**C:**

* Asymmetric routing can break flows; ensure return path matches.

* Verify NVA IP forwarding settings and any required SNAT/NAT configuration.

* Confirm no conflicting routes (system vs UDR) override expected behavior.

---

## **20\) VNet Peering Use Case**

**Question:** Two VNets in the same region must communicate privately with low latency. No encryption requirement. What is the default best-fit?

**A:** VNet peering.

**B:** Use **VNet peering** for private connectivity over the Microsoft backbone with minimal latency and no gateway overhead.

**C:**

* Don’t assume transitive routing across multiple peerings; design explicitly.

* For hub/spoke, evaluate gateway transit and “use remote gateway” settings (verify details).

* Verify peering limits and address space overlap constraints.

---

## **21\) Hub/Spoke DNS Trap**

**Question:** You deploy Private Endpoints in a spoke VNet but name resolution from workloads still returns public IPs. What’s the likely missing piece?

**A:** Private DNS zone linkage/forwarding.

**B:** You likely need **Private DNS zones** linked to the spoke VNets (or DNS forwarding from hub) so the service FQDN resolves to the private endpoint address.

**C:**

* Private Endpoint without correct DNS often behaves “public” from the client perspective.

* Central DNS in hub requires conditional forwarders or resolver patterns (verify).

* Validate with `nslookup`/resolver checks from the workload subnet.

---

## **22\) Load Balancer vs Application Gateway**

**Question:** You need TLS termination, path-based routing, and WAF for multiple web apps. Which service?

**A:** Application Gateway (WAF).

**B:** Choose **Application Gateway** with **WAF** for L7 HTTP/S routing, TLS termination, and security features.

**C:**

* Azure Load Balancer is L4 and won’t do URL routing or WAF.

* Health probe differences can cause “all backends down” surprises.

* Verify SKU/feature support (v2 vs older) in official docs.

---

## **23\) NAT for Outbound Stability**

**Question:** A web app hosted on VMs must call an external API that whitelists your source IP. Current outbound IP changes unpredictably when scaling. What’s the typical fix?

**A:** NAT Gateway (or a controlled egress pattern).

**B:** Use a **NAT Gateway** on the subnet (or another controlled egress design) to provide stable outbound IPs for the VMs, especially when scaling.

**C:**

* Stable outbound requires controlling the SNAT path; don’t assume public IP on VM equals outbound IP.

* Ensure route tables don’t divert traffic around your NAT path.

* Verify any SNAT port exhaustion patterns for high connection rates.

---

## **24\) VPN Gateway vs ExpressRoute (Conceptual)**

**Question:** You need private connectivity from on-prem to Azure with predictable performance and higher throughput requirements. Which is typically preferred?

**A:** ExpressRoute.

**B:** Use **ExpressRoute** for private, dedicated connectivity; use **VPN Gateway** when internet-based encrypted tunnels are sufficient and quicker/cheaper.

**C:**

* ExpressRoute introduces provider/circuit operational dependencies.

* VPN is easier but performance varies with internet conditions.

* Verify SKU constraints and routing (BGP) requirements.

---

## **25\) Monitoring: Metrics vs Logs**

**Question:** You need near-real-time alerting when VM CPU \> 90% for 10 minutes. Should you use logs or metrics?

**A:** Metrics alert.

**B:** Use an **Azure Monitor metric alert** for CPU; metrics are purpose-built for threshold alerting with low latency.

**C:**

* Logs are better for deep diagnostics and query-based detections.

* Ensure correct aggregation (avg/max) and evaluation window.

* Verify minimum metric granularity for the resource type.

---

## **26\) Monitoring: Centralized Troubleshooting**

**Question:** A production incident requires correlating NSG flow failures, VM events, and platform incidents. What Azure services/features should be in place?

**A:** Azure Monitor \+ Log Analytics \+ diagnostic settings \+ Service Health.

**B:** Route logs via **diagnostic settings** to **Log Analytics**, use Azure Monitor for alerts and dashboards, and check **Service Health/Resource Health** during incidents.

**C:**

* Without diagnostic settings, many resource logs won’t be collected.

* Separate platform incidents from resource misconfiguration quickly.

* Retention and cost controls depend on table plans—verify in official docs.

---

## **27\) Alert Noise Control**

**Question:** Your alert triggers every minute and spams on-call during sustained high CPU. What change reduces noise while staying responsive?

**A:** Use stateful alerting / adjust frequency and suppression.

**B:** Configure the alert to be **stateful** (fires once until resolved), and tune evaluation frequency and window to match the signal.

**C:**

* Alert tuning is as important as the threshold; poorly tuned alerts create operational failure.

* Use action groups with appropriate routing (email/SMS/webhook) and escalation.

* Verify alert rule type-specific behavior (metric vs log vs activity).

---

## **28\) Activity Log Alerting (Control-Plane Changes)**

**Question:** Security wants alerts when someone creates role assignments or modifies NSGs. Where do you detect this?

**A:** Activity Log alerts.

**B:** Use **Activity Log**\-based alerts for control-plane operations (role assignment changes, resource write/delete actions).

**C:**

* Activity Log is subscription-scoped; ensure coverage across subscriptions.

* For deeper change context, route Activity Log to Log Analytics for queries.

* Don’t confuse with data-plane logs (different sources).

---

## **29\) Resource Locks**

**Question:** A team keeps accidentally deleting a critical VNet. You need a quick safety mechanism without redesigning IAM immediately. What do you apply?

**A:** Resource lock (CanNotDelete).

**B:** Apply a **CanNotDelete** lock to the VNet (or RG) to prevent deletion unless the lock is removed by someone authorized.

**C:**

* Locks are not a replacement for RBAC; they’re a guardrail.

* Locks can block automation/deployments that expect delete/replace operations.

* Ensure only a small set of admins can remove locks.

---

## **30\) Cost Management Guardrails**

**Question:** A subscription’s spend is spiking unexpectedly. You need an automated notification at 80% of monthly budget and hard stop is not allowed. What do you configure?

**A:** Budgets with alerts.

**B:** Use **Azure Budgets** to set thresholds (e.g., 80%) and notify via action groups/email; also use cost analysis to identify drivers.

**C:**

* Budgets alert; they typically don’t stop resource creation by themselves (use policy for enforcement).

* Tag governance enables cost attribution; enforce tags.

* Consider anomaly detection features if available (verify).

---

## **31\) Tag Strategy for Chargeback**

**Question:** Finance needs chargeback per department and environment. What’s the practical Azure approach?

**A:** Tagging \+ policy enforcement \+ cost reporting.

**B:** Implement a standard tag schema (`Dept`, `Env`, `App`, `Owner`, `CostCenter`), enforce with Azure Policy, and use Cost Management views grouped by tags.

**C:**

* Missing tags break chargeback reports; enforce early at landing zone stage.

* Some resources may not support tag inheritance the way you expect—verify.

* Use management group hierarchy to align reporting boundaries.

---

## **32\) Subscription Design**

**Question:** You must separate dev/test from prod to reduce blast radius and meet compliance. What’s the usual Azure design decision?

**A:** Separate subscriptions.

**B:** Use **separate subscriptions** for prod and non-prod (and possibly separate by business unit) so RBAC, policy, budgets, and quotas isolate environments.

**C:**

* Subscriptions are strong boundaries for access and billing; RGs are lifecycle boundaries.

* Policy inheritance via management groups keeps controls consistent.

* Quotas and provider registrations can differ per subscription—plan accordingly.

---

## **33\) Diagnosing “Deployment Failed”**

**Question:** An ARM deployment fails with a generic authorization error. The principal has Contributor on the RG. What’s a common hidden cause?

**A:** Policy deny or missing permissions on dependent resources (e.g., network, workspace).

**B:** Check whether **Azure Policy** denied the operation or whether the deployment needs permissions on a different scope/resource (e.g., subnet in shared VNet, Log Analytics workspace, key vault).

**C:**

* Many deployments touch resources outside the target RG (shared network, managed identities).

* Policy denies present as deployment failures; review policy compliance and activity logs.

* Least privilege assignments can require multiple targeted role grants across scopes.

---

## **34\) Key Vault Integration for Secrets**

**Question:** Apps running on VMs need to retrieve secrets without storing credentials on disk. What identity pattern is preferred?

**A:** Managed identity \+ Key Vault access.

**B:** Enable a **managed identity** on the VM/VMSS and grant it appropriate **Key Vault** access (RBAC or access policies depending on configuration) so the app can fetch secrets without embedded credentials.

**C:**

* “Identity exists” doesn’t mean “has permission”; you must grant Key Vault authorization.

* Network restrictions on Key Vault can block access; ensure private endpoint/DNS if locked down.

* Verify whether the exam expects RBAC vs access policy model for Key Vault in your version.

---

## **35\) Storage \+ Key Vault Pattern**

**Question:** You must eliminate storage account keys from application configuration while still accessing blobs. What approach is preferred?

**A:** Use Entra ID-based access (RBAC) instead of shared key.

**B:** Use **Entra ID** authentication for Blob access with appropriate RBAC roles; avoid shared key entirely. If any secrets remain (e.g., SAS), store them in Key Vault.

**C:**

* Entra ID access requires correct role assignment at the storage scope and compatible SDK/auth flows.

* SAS is still a credential; prefer identity-based access when possible.

* Verify the exact role needed (Blob Data Contributor/Reader, etc.).

---

## **36\) VM Patch Management Concept**

**Question:** You need a consistent patching approach across many VMs with reporting. What Azure-native option is commonly used?

**A:** Azure Update Management / Update Manager (verify current product naming).

**B:** Use Azure’s VM update/patch management capability (often integrated with Azure Monitor/automation) to schedule patches and report compliance.

**C:**

* Product names and feature sets evolve; verify the current “official” service and workflow.

* Patching differs for Windows vs Linux; confirm prerequisites (agents/extensions).

* Coordinate with maintenance windows and app availability requirements.

---

## **37\) Storage Immutability Requirement**

**Question:** Legal requires retention of certain blobs for 7 years with WORM semantics. What feature do you configure?

**A:** Immutable blob storage policy.

**B:** Configure **immutability** (time-based retention and/or legal hold) on the container to enforce WORM retention.

**C:**

* Immutability can block deletions and lifecycle rules.

* Ensure operational processes understand “cannot delete” behavior.

* Verify exact retention limits and lock states in official docs.

---

## **38\) Restore vs Recreate (Disaster Recovery Thinking)**

**Question:** A VM is corrupted after a bad change. You have backups. What’s the fastest likely recovery path?

**A:** Restore from backup (or restore disks) and redeploy.

**B:** Use **Azure Backup** to restore the VM (or restore disks) to a known good point-in-time, then validate network and dependencies.

**C:**

* Restore method choice depends on whether you need the whole VM or just data disks.

* Ensure you can restore into a quarantine network if security incident suspected.

* Verify recovery time depends on size, region, and storage performance.

---

## **39\) Diagnose Storage Access Denied**

**Question:** An app gets “403 Forbidden” accessing a blob. It uses Entra ID auth. What are the top likely causes?

**A:** Missing RBAC role, wrong scope, or token/audience mismatch.

**B:** Confirm the principal has the correct **Blob Data** role at the right scope (container/account), confirm the app is requesting tokens for the correct resource audience, and confirm no network restriction blocks access.

**C:**

* Control-plane roles (Contributor) do not grant data-plane access; you need data roles.

* Private endpoint without DNS can cause unexpected pathing failures.

* If using SAS, validate expiry/permissions; if using keys, ensure correct key and rotation.

---

## **40\) “I Can Ping But Not Connect”**

**Question:** Two VMs in same VNet can ping but cannot connect on TCP/1433. What’s the most likely Azure control?

**A:** NSG rules.

**B:** ICMP ping success doesn’t prove TCP is allowed. Check **NSG inbound/outbound** rules for the subnets/NICs, and confirm OS firewall allows 1433\.

**C:**

* NSGs are L3/L4; protocol/port matters.

* Effective security rules view is faster than reading multiple NSGs manually.

* UDR/NVA can also affect flows; check effective routes if NSGs look correct.

---

## **41\) Private Endpoint vs Service Endpoint**

**Question:** You need private connectivity to a PaaS service and want the service to have a private IP in your VNet. Which do you choose?

**A:** Private Endpoint.

**B:** Choose **Private Endpoint** if you need a **private IP** in your VNet for the service. Service endpoints keep traffic on Microsoft backbone but do not give the service a private IP in your VNet.

**C:**

* Private Endpoint requires DNS alignment; service endpoints have different DNS implications.

* Network security posture differs; ensure you meet “no public endpoint” requirements.

* Verify service endpoint support by service type.

---

## **42\) Log Analytics Workspace Access**

**Question:** A user can view VM resources but cannot query logs in Log Analytics. Why, and what do you change?

**A:** Workspace permissions are separate; grant workspace access.

**B:** Grant the user appropriate permissions on the **Log Analytics workspace** (RBAC roles for Log Analytics) in addition to resource permissions.

**C:**

* Resource-level RBAC doesn’t automatically grant workspace query permission.

* Central workspaces often live in shared subscriptions; scope matters.

* Ensure least privilege: reader vs contributor vs analytics-specific roles (verify).

---

## **43\) Diagnostic Settings Coverage Gap**

**Question:** You have a Log Analytics workspace but see no NSG flow logs or storage logs. What’s the likely missing configuration?

**A:** Diagnostic settings.

**B:** Enable **diagnostic settings** (and any required flow log features) on the target resources to send logs/metrics to the workspace.

**C:**

* Not all logs are enabled by default.

* Destination choice (workspace vs storage vs event hub) affects queryability and cost.

* Verify resource-specific log categories and prerequisites.

---

## **44\) “I Need to See Who Changed This”**

**Question:** You must identify who modified an NSG rule yesterday. Where do you look?

**A:** Activity Log.

**B:** Use the **Activity Log** (subscription-level) to find the write operation for the NSG and identify the caller and timestamp.

**C:**

* For longer retention and querying, export Activity Log to Log Analytics.

* Data-plane logs won’t show control-plane NSG changes.

* Ensure the relevant subscription’s Activity Log is checked (multi-subscription environments).

---

## **45\) Resource Move: RG vs Subscription**

**Question:** You must move a set of resources to a new subscription for billing separation. What are the two key prechecks?

**A:** Validate move support and ensure dependencies/permissions across scopes.

**B:** Confirm the resource types support **move across subscriptions**, ensure all dependent resources can be moved together (or refactored), and ensure you have required permissions in both source and destination.

**C:**

* Some resources have move constraints (resource provider-specific); verify official docs.

* RBAC assignments and managed identities may need revalidation after move.

* Policy differences in destination subscription can block resources post-move.

---

## **46\) “Policy vs Lock” for Deletion Prevention**

**Question:** You need to prevent accidental deletion of a resource group, but admins still must be able to deploy within it. What’s the simplest control?

**A:** CanNotDelete lock on the RG.

**B:** Apply a **CanNotDelete** lock at the resource group scope; it prevents deletion while allowing normal operations.

**C:**

* Lock removal requires appropriate permissions; restrict who can remove it.

* Locks can block IaC that replaces resources via delete/recreate.

* Locks do not prevent destructive actions that don’t require delete (e.g., misconfig changes).

---

## **47\) Identity: Group-Based Access**

**Question:** You onboard 50 contractors for 3 months. They need Reader access to a subscription. What’s the operationally correct approach?

**A:** Use an Entra ID group assigned to Reader role at subscription scope.

**B:** Create an **Entra ID group** (e.g., `Contractors-SubA-Readers`) and assign **Reader** role at the subscription scope; add/remove users from the group as contractors change.

**C:**

* Group-based assignments reduce churn and audit complexity.

* Time-bound access can be handled via access reviews/PIM if used (verify exam expectations).

* Ensure contractors don’t get implicit access from other group memberships.

---

## **48\) Storage “Delete Protection” Mix-Up**

**Question:** A team believes enabling blob soft delete meets a strict WORM compliance requirement. Is that correct? What do you use instead?

**A:** No; use immutability for WORM.

**B:** Soft delete enables recovery from deletes/overwrites but does not enforce WORM. For compliance WORM, configure **immutable storage** policies (time-based retention/legal hold).

**C:**

* Soft delete retention is a window, not a compliance lock.

* Immutability changes operational behavior (no delete until retention ends).

* Verify legal hold vs time-based retention semantics for your compliance scenario.

---

## **49\) VM Access: Just Enough Exposure**

**Question:** Security forbids direct public RDP/SSH to VMs. Admins still need remote access. What’s the typical Azure approach?

**A:** Use a jump/bastion pattern (Azure Bastion or private access).

**B:** Use **Azure Bastion** (or a jump host in a protected subnet) so VMs have no public RDP/SSH exposure while admins connect through a controlled entry point.

**C:**

* Bastion changes the access path; NSG rules and subnet placement matter.

* Audit and conditional access can be applied at the access gateway layer.

* Verify Bastion SKU/features for required session types and scale.

---

## **50\) End-to-End Scenario: Secure, Governed Landing Zone Slice**

**Question:** You’re asked to onboard a new application into Azure with: (1) enforced tags, (2) no public endpoints for storage, (3) least-privilege admin, (4) centralized logging, (5) budget alerts. Outline your default implementation choices.

**A:** Management group policy \+ private endpoint \+ RBAC groups \+ Log Analytics \+ budgets.

**B:**

* **Governance:** Management group \+ policy initiative enforcing tags and region/SKU constraints.

* **Storage:** Private Endpoint \+ private DNS; disable or restrict public network access.

* **Access:** Entra groups with RBAC at RG scope (network RG vs app RG separation).

* **Monitoring:** Diagnostic settings to centralized Log Analytics; alerts via action groups.

* **Cost:** Budget thresholds \+ tag-based reporting.

**C:**

* Biggest traps: DNS for Private Endpoints, policy denials breaking deployments, workspace permissions separate from resource RBAC.

* Ensure dependencies (shared VNet, shared workspace) don’t force broad permissions.

* Any numeric limits/retention defaults should be treated as “verify in official docs” unless you’ve confirmed for your tenant/exam version.

## **Core Features (Highly Descriptive, Based on the Q\&A Topics)**

### **1\) Identity, Authentication, and Authorization (Microsoft Entra ID \+ Azure RBAC)**

AZ-104 expects you to treat identity as the foundation of the control plane. **Microsoft Entra ID** provides identities (users, groups, apps/service principals, managed identities). **Azure RBAC** determines *what actions* those identities can perform on Azure resources. The exam repeatedly tests your ability to:

* Choose the correct **principal type** (prefer groups for humans; prefer managed identity for Azure-hosted workloads).

* Assign permissions at the correct **scope** (resource, resource group, subscription, management group) without over-permissioning.

* Understand that **control-plane permissions** (e.g., Contributor on a resource group) do not automatically grant **data-plane permissions** (e.g., reading blob data).

* Diagnose “it should work” access failures by checking **effective permissions**, scope inheritance, and missing access on dependent/shared resources (workspaces, subnets, vaults).

Typical pitfalls:

* Assigning at subscription scope “for convenience” (overscoped blast radius).

* Confusing “can manage the resource” with “can access the data inside the resource.”

* Forgetting that central/shared services (Log Analytics, hub VNets, Key Vault) require separate RBAC at their own scopes.

### **2\) Governance at Scale (Management Groups, Subscriptions, Resource Groups, Policy, Tags)**

Governance is where AZ-104 likes to hide trick questions. You must apply consistent controls across many subscriptions while preserving flexibility. The core feature set includes:

* **Management groups** as the hierarchy layer above subscriptions for consistent RBAC and policy inheritance.

* **Subscriptions** as hard boundaries for billing, quotas, and isolation (commonly used for prod vs non-prod separation).

* **Resource groups** as lifecycle boundaries (deploy/delete together), and also a practical boundary for least-privilege administration.

* **Azure Policy** as configuration enforcement (deny/audit/other effects), used to prevent drift and block noncompliant deployments.

* **Tags** as operational metadata (cost allocation, ownership, environment) that become meaningful only when consistently enforced.

Typical pitfalls:

* Using RBAC to solve configuration compliance (wrong tool).

* Applying policy at the wrong scope (e.g., only RG instead of the management group) and missing future deployments.

* Assuming “auto-tagging” works for all resource types (capabilities vary—verify per resource).

* Forgetting that policy denials appear as generic deployment failures unless you inspect compliance/activity logs.

### **3\) Storage Platform Fundamentals (Accounts, Access Models, Replication, Data Protection)**

Storage questions often revolve around controlling access safely and meeting compliance. The exam leans on these core capabilities:

* **Storage accounts** as the security \+ networking envelope for multiple services (Blob, Files, etc.).

* **Access models**:

  * Prefer **Entra ID** for identity-based access when possible.

  * Use **SAS** for delegated, time-bound, scoped access (especially for external parties).

  * Treat **account keys** as high-risk full-access secrets; rotate via two-key pattern when unavoidable.

* **Networking posture** for storage:

  * Restrict public exposure using firewall rules and/or disable public access where supported.

  * Use **Private Endpoints** for private IP-based access; make DNS correct or it won’t behave privately.

* **Replication choices** to match compliance boundaries (intra-region redundancy vs cross-region replication).

* **Data protection** options:

  * **Soft delete** and **versioning** for recovery from mistakes.

  * **Immutability (WORM)** for compliance retention, which changes operational deletion behavior.

  * **Lifecycle management** to tier and delete data by age/prefix/tags.

Typical pitfalls:

* Confusing soft delete (recoverability) with immutability (compliance WORM).

* Sharing keys instead of using SAS/Entra ID.

* Implementing private endpoints but leaving DNS unresolved (clients still hit public endpoints).

* Selecting replication that violates “data must not leave region.”

### **4\) Compute Operations (VMs, VM Scale Sets, Images, Extensions, Availability)**

Compute in AZ-104 is less about app development and more about operational correctness and availability. Core capabilities:

* **VM deployment and management**: sizing, disks, networking, boot diagnostics, and lifecycle operations.

* **Availability constructs**:

  * **Availability Zones** for datacenter-level resilience (where supported).

  * **Availability Sets** for fault/update domain separation when zones aren’t available.

* **VM Scale Sets (VMSS)** for fleets of identical instances with autoscaling and more uniform lifecycle management than standalone VMs.

* **Images** and standardization: using managed images / galleries for repeatable deployments.

* **Extensions** for post-deployment configuration and bootstrap automation.

Typical pitfalls:

* Trying to scale a stateful VM tier as if it were stateless.

* Fixing disk performance by changing disk tier while ignoring VM size throughput caps.

* Treating extensions as “run once” without designing for retries/idempotency.

* Confusing zones and availability sets (different failure domains and design implications).

### **5\) Networking Core Patterns (VNets, Subnets, NSGs, Routing, Peering, Egress Control)**

Networking questions are heavily trap-driven: priorities, effective rules, routing asymmetry, and DNS. Core capabilities:

* **VNet and subnet design** for segmentation (web/app/data tiers) and delegated subnets when required.

* **NSGs** for L3/L4 filtering on NIC/subnet:

  * Priority ordering is decisive; first match wins.

  * Effective security rules matter more than what you think you configured.

* **User-Defined Routes (UDR)** to control next hops (NVA, forced tunneling) and to implement security routing patterns.

* **VNet peering** for private connectivity across VNets; used in hub/spoke patterns with attention to non-transitive assumptions.

* **Load distribution choices**:

  * L4 load balancing for TCP/UDP distribution.

  * L7 gateways when you need TLS termination, routing, WAF, etc.

* **Egress stability** using NAT patterns when external systems whitelist source IPs.

Typical pitfalls:

* “Ping works so port must work” (ICMP ≠ TCP/UDP permissions).

* Shadowed NSG rules due to priority mistakes.

* Asymmetric routing through NVAs causing “random” connection failures.

* Private Endpoint implemented without DNS integration (private networking doesn’t function as intended).

* Assuming peering transit or gateway behaviors without verifying configuration constraints.

### **6\) Observability and Operational Control (Azure Monitor, Log Analytics, Diagnostics, Alerts, Health)**

Monitoring in AZ-104 is about turning platform signals into actionable operations with minimal blind spots:

* **Azure Monitor** as the umbrella for metrics, logs, alerts, action groups, and dashboards.

* **Metrics vs logs** decision-making:

  * Metrics for fast threshold alerts and operational trends.

  * Logs for query-driven investigations, correlation, and deeper diagnostics.

* **Diagnostic settings** as the gate that routes resource logs/metrics into Log Analytics (or storage/event hub). Many logs do not appear until you configure this.

* **Log Analytics workspace** as centralized query store; access to query logs is controlled separately via workspace permissions.

* **Alerts** tuned to reduce noise: stateful behavior, evaluation windows, action group routing.

* **Service Health and Resource Health** for distinguishing platform incidents from local misconfigurations.

Typical pitfalls:

* Assuming logs “just show up” without diagnostic settings.

* Not granting workspace query permissions even when resource RBAC is correct.

* Using logs for simple threshold alerts (higher cost/latency than metrics) or metrics for deep forensic questions.

* Alert spam due to poorly tuned evaluation windows and non-stateful patterns.

### **7\) Backup, Recovery, and Safeguards (Azure Backup, Soft Delete, Locks)**

AZ-104 often tests whether you can implement guardrails that prevent operational disasters:

* **Azure Backup** for VM protection with policies and retention.

* **Soft delete / deletion protection** concepts for backup artifacts (protects against accidental/malicious deletion).

* **Resource locks** to prevent accidental deletes at critical scopes (resource or resource group).

* Practical recovery choices: restore full VM vs restore disks vs redeploy.

Typical pitfalls:

* Treating locks as a governance strategy instead of a last-line safety mechanism.

* Misunderstanding deletion workflows when soft delete is enabled.

* Not separating restore scenarios (data recovery vs full infrastructure recovery).


## **Glossary of Terms (Derived from the Q\&A Topics)**

**Action Group** — Azure Monitor notification/automation target set for alerts (email/SMS/webhook/etc.).  
 **Activity Log** — Subscription-level control-plane events (create/update/delete actions). Exam note: not the same as resource/data logs.  
 **Aggregation (Metrics)** — How metric values are summarized over time (avg/min/max/count). Exam note: wrong aggregation gives misleading alerts.  
 **Application Gateway** — Layer 7 load balancer for HTTP/S; supports TLS termination and optional WAF.  
 **ASG (Application Security Group)** — Logical grouping used in NSG rules instead of IP-based rules. Exam note: reduces rule sprawl.  
 **Availability Set** — VM placement across fault/update domains for resiliency within a datacenter boundary.  
 **Availability Zone** — Physically separate zone within a region; improves resilience against datacenter failures.  
 **Azure Backup** — Service for protecting workloads (including VMs) using vaults and policies.  
 **Azure Bastion** — Managed jump service for private RDP/SSH access to VMs without public exposure.  
 **Azure Monitor** — Platform for collecting metrics/logs and creating alerts/dashboards.  
 **Azure Policy** — Governance engine that audits/enforces resource configuration using policy definitions/initiatives.  
 **Azure RBAC** — Authorization system for Azure resource actions using roles assigned at scopes.  
 **Azure Resource Manager (ARM)** — Control-plane deployment and management layer for Azure resources.  
 **Budget (Cost Management)** — Spend threshold with alerting; not a hard enforcement mechanism by itself.  
 **CanNotDelete Lock** — Resource lock that blocks deletion unless removed. Exam note: useful safety guardrail; not a permissions model.  
 **Change Control** — Operational discipline for safe changes; in exam scenarios, often implied by policy/RBAC/locks.  
 **CMK (Customer-Managed Key)** — Encryption key controlled by customer (commonly in Key Vault). Exam note: increases responsibility for rotation/governance.  
 **Conditional Access** — Entra policy framework controlling sign-in conditions (MFA, location, device, risk).  
 **Control Plane** — Management operations (create/update/delete, RBAC, policy). Exam note: distinct from data plane.  
 **Contributor** — Built-in RBAC role for broad resource management; often too broad for least-privilege.  
 **Data Plane** — Operations on data inside services (blob read/write, file operations). Exam note: needs data roles, not just Contributor.  
 **Diagnostic Settings** — Configuration that sends resource logs/metrics to destinations (Log Analytics, storage, event hub).  
 **DNS Split-Brain** — Different DNS results inside vs outside network; common in Private Endpoint deployments.  
 **Effective Permissions** — The net result of all RBAC assignments at and above scope. Exam note: troubleshoot scope inheritance.  
 **Effective Routes** — The net routing table applied to a NIC/subnet (system \+ UDR \+ BGP).  
 **Effective Security Rules** — The net NSG rules applied (subnet \+ NIC). Exam note: fastest way to debug “why blocked.”  
 **Entra ID (Azure AD)** — Azure identity provider for users, groups, apps, and managed identities.  
 **Entra Group** — Group object used for scalable RBAC assignment. Exam note: prefer groups over individuals.  
 **ExpressRoute** — Private connectivity circuit between on-prem and Azure through a provider.  
 **Fault Domain** — Physical grouping of hardware; used in Availability Sets to reduce correlated failures.  
 **Firewall Rules (Storage)** — Storage network access restrictions by VNet/subnet/IP rules. Exam note: not the same as Private Endpoint.  
 **Forced Tunneling** — Routing pattern where outbound traffic is forced through on-prem/NVA.  
 **Gateway Transit** — Peering feature to allow spokes to use hub gateway (behavior depends on configuration; verify details).  
 **Health Probe** — Load balancer/gateway mechanism to determine backend health. Exam note: misconfigured probes mark all backends down.  
 **Hub-and-Spoke** — Network topology with shared services in hub and workloads in spokes; reduces duplication and centralizes control.  
 **ICMP** — Ping protocol. Exam note: ping success doesn’t imply TCP/UDP connectivity is allowed.  
 **Idempotency** — Safe re-execution without unintended side effects. Exam note: critical for scripts/extensions that may retry.  
 **Immutability (WORM)** — Storage policy preventing deletion/modification for retention period. Exam note: not the same as soft delete.  
 **Initiative (Policy)** — Bundle of multiple Azure Policy definitions assigned together.  
 **Key Vault** — Service for secrets/keys/certificates; commonly used with managed identity.  
 **Least Privilege** — Grant only the minimal permissions required to perform a task.  
 **Lifecycle Management (Blob)** — Rules to tier/delete blobs based on age/prefix/tags.  
 **Load Balancer (Azure)** — Layer 4 distribution for TCP/UDP.  
 **Log Analytics Workspace** — Central store for logs queried via KQL. Exam note: requires separate access permissions.  
 **Managed Disk** — Azure-managed disk resource attached to VMs.  
 **Managed Identity** — Azure-managed identity for workloads; avoids storing credentials.  
 **Management Group** — Hierarchy above subscriptions for consistent policy/RBAC inheritance.  
 **Metric Alert** — Alert type based on metrics thresholds over a window.  
 **NAT Gateway** — Managed egress service providing stable outbound IPs for subnets.  
 **Network Appliance (NVA)** — VM-based or third-party network device used for routing/firewalling; often a UDR next hop.  
 **Network Security Group (NSG)** — Layer 3/4 ACL applied at subnet/NIC.  
 **NSG Priority** — Rule ordering value where lower number is evaluated first; first match wins.  
 **Owner Role** — RBAC role with full management rights including permission delegation; high risk, restrict tightly.  
 **Peering** — Private connection between VNets. Exam note: don’t assume transitive connectivity.  
 **Private DNS Zone** — DNS zone used for private name resolution (critical with Private Endpoints).  
 **Private Endpoint** — Private IP interface in a VNet that maps to a PaaS resource; enables private access path.  
 **Private Link** — Azure feature family enabling private access to services via Private Endpoints.  
 **Public Endpoint** — Service endpoint accessible over internet; can be restricted but is still public-facing.  
 **Public IP** — Internet-routable IP resource; often restricted by policy in regulated environments.  
 **Quotas** — Per-subscription or per-region limits on resources/SKUs. Exam note: can block scaling even when design is correct.  
 **Recovery Services Vault** — Azure Backup vault construct used to manage policies and protected items.  
 **Region** — Geographic area containing Azure datacenters; zones are subdivisions within some regions.  
 **Resource** — Azure entity (VM, VNet, Storage account, etc.).  
 **Resource Group (RG)** — Container for related resources; lifecycle boundary and practical RBAC boundary.  
 **Resource Health** — Resource-specific health status.  
 **Resource Lock** — Safety control preventing delete/modify operations depending on lock type.  
 **Role Assignment** — Binding of a principal to a role at a scope.  
 **Role Definition** — A set of allowed actions (permissions) for Azure RBAC.  
 **Route Table (UDR)** — Custom routing rules applied to subnets.  
 **SAS (Shared Access Signature)** — Time-bound, permission-scoped token for delegated storage access.  
 **Scope (RBAC)** — Where a role assignment applies: management group, subscription, RG, or resource.  
 **Service Health** — Azure platform incident/advisory information.  
 **Soft Delete (Blob)** — Recoverability feature retaining deleted blobs for a retention window.  
 **Soft Delete (Backup)** — Retains deleted backup data for a retention window to protect against accidental/malicious deletion (behavior depends on config; verify).  
 **Stateful Alert** — Alert that fires once and remains active until resolved (reduces spam).  
 **Stateless Tier** — Workload tier that can be scaled out horizontally without data/session on instance.  
 **Storage Account** — Azure storage namespace and security boundary for blob/files/queue/table.  
 **Storage Keys** — Shared keys granting full data-plane access to a storage account; high-risk secret.  
 **Subscription** — Billing and isolation boundary; common unit for separating prod vs non-prod.  
 **Tag** — Key/value metadata used for cost allocation, ownership, and governance reporting.  
 **TLS Termination** — Decrypting TLS at gateway/load balancer; enables L7 routing and inspection.  
 **Transitive Connectivity** — Assumption that connectivity flows through intermediate peerings; generally not safe to assume (verify design).  
 **UDR (User-Defined Route)** — Route you create to override system routing decisions.  
 **Update Domain** — Maintenance grouping in Availability Sets to reduce simultaneous reboots.  
 **VM Extension** — Agent-based component for post-deployment configuration on a VM/VMSS.  
 **VM Scale Set (VMSS)** — Managed fleet of identical VMs supporting autoscale and uniform updates.  
 **VNet (Virtual Network)** — Private network boundary in Azure containing subnets and routing.  
 **WAF (Web Application Firewall)** — L7 protections commonly attached to Application Gateway.  
 **Workspace Permissions** — Separate RBAC required to query Log Analytics; not implied by resource access.  
 **Zone-Redundant** — Service deployed across zones within a region; support varies by service/SKU—verify.

