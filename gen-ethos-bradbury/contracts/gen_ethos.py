# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

@allow_storage
class AuditRecord:
    company_id: str
    verdict: str
    summary: str
    score_change: str
    slash_amount: u256

class AuditCompleted(gl.Event):
    def __init__(self, company: str, verdict: str, summary: str, /): ...

class AuditError(gl.Event):
    def __init__(self, company: str, error: str, /): ...

class CompanyRegistered(gl.Event):
    def __init__(self, company: str, target: str, /): ...

class GenEthos(gl.Contract):
    targets: TreeMap[str, str]
    company_owners: TreeMap[str, str]
    escrow_balances: TreeMap[str, u256]
    ethos_scores: TreeMap[str, u256]
    company_count: u256
    audit_history: DynArray[AuditRecord]
    depositor_amounts: TreeMap[str, u256]
    withdrawable_amounts: TreeMap[str, u256]
    company_audit_counts: TreeMap[str, u256]
    company_audit_verdicts: TreeMap[str, str]
    company_audit_summaries: TreeMap[str, str]
    company_audit_score_changes: TreeMap[str, str]
    company_audit_slash_amounts: TreeMap[str, u256]
    latest_verdicts: TreeMap[str, str]

    def __init__(self):
        self.company_count = u256(0)

    def _company_audit_key(self, company_id: str, audit_index: u256) -> str:
        return company_id + "|" + str(audit_index)

    def _append_audit_record(self, company_id: str, verdict: str, summary: str, score_change: str, slash_amount: u256):
        record = self.audit_history.append_new_get()
        record.company_id = company_id
        record.verdict = verdict
        record.summary = summary
        record.score_change = score_change
        record.slash_amount = slash_amount

        company_count = self.company_audit_counts.get(company_id, u256(0))
        audit_key = self._company_audit_key(company_id, company_count)
        self.company_audit_verdicts[audit_key] = verdict
        self.company_audit_summaries[audit_key] = summary
        self.company_audit_score_changes[audit_key] = score_change
        self.company_audit_slash_amounts[audit_key] = slash_amount
        self.company_audit_counts[company_id] = company_count + u256(1)
        self.latest_verdicts[company_id] = verdict

    @gl.public.write
    def register_company(self, company_id: str, target_reduction_percentage: str):
        if not company_id or len(company_id.strip()) == 0:
            raise gl.vm.UserError("company_id cannot be empty")
        existing = self.targets.get(company_id, "")
        if existing != "":
            raise gl.vm.UserError("Company already registered")
        owner = str(gl.message.sender_address)
        self.targets[company_id] = target_reduction_percentage
        self.company_owners[company_id] = owner
        self.escrow_balances[company_id] = u256(0)
        self.ethos_scores[company_id] = u256(100)
        self.company_audit_counts[company_id] = u256(0)
        self.latest_verdicts[company_id] = ""
        self.company_count += u256(1)
        CompanyRegistered(company_id, target_reduction_percentage).emit()

    @gl.public.write
    def deposit_escrow(self, company_id: str, amount: u256):
        existing = self.targets.get(company_id, "")
        if existing == "":
            raise gl.vm.UserError("Company not registered")
        owner = self.company_owners.get(company_id, "")
        caller = str(gl.message.sender_address)
        if owner == "" or caller != str(owner):
            raise gl.vm.UserError("Only the company owner can deposit escrow")
        if amount == u256(0):
            raise gl.vm.UserError("Amount must be greater than zero")
        self.escrow_balances[company_id] = self.escrow_balances.get(company_id, u256(0)) + amount
        dep_key = company_id + "|" + caller
        self.depositor_amounts[dep_key] = self.depositor_amounts.get(dep_key, u256(0)) + amount

    @gl.public.write
    def withdraw_compliant_unlock(self, company_id: str, amount: u256):
        existing = self.targets.get(company_id, "")
        if existing == "":
            raise gl.vm.UserError("Company not registered")
        owner = self.company_owners.get(company_id, "")
        caller = str(gl.message.sender_address)
        if owner == "" or caller != str(owner):
            raise gl.vm.UserError("Only the company owner can withdraw escrow")
        dep_key = company_id + "|" + caller
        if amount == u256(0):
            raise gl.vm.UserError("Amount must be greater than zero")
        withdrawable = self.withdrawable_amounts.get(dep_key, u256(0))
        if amount > withdrawable:
            raise gl.vm.UserError("Withdraw amount exceeds unlocked balance")
        deposited = self.depositor_amounts.get(dep_key, u256(0))
        if amount > deposited:
            raise gl.vm.UserError("Withdraw amount exceeds your deposited balance")
        self.withdrawable_amounts[dep_key] = withdrawable - amount
        self.depositor_amounts[dep_key] = deposited - amount

    @gl.public.write
    def request_audit(self, company_id: str, official_report_url: str, iot_sensor_url: str, ngo_watchdog_url: str):
        existing = self.targets.get(company_id, "")
        if existing == "":
            raise gl.vm.UserError("Company not registered")
        owner = self.company_owners.get(company_id, "")
        if owner == "":
            raise gl.vm.UserError("Company owner not found")
        caller = str(gl.message.sender_address)
        if caller != str(owner):
            raise gl.vm.UserError("Only the registering wallet can request audits")
        balance = self.escrow_balances.get(company_id, u256(0))
        if balance == u256(0):
            raise gl.vm.UserError("No escrow staked. Deposit GEN tokens first.")

        def _extract_host(url: str) -> str:
            lower_url = str(url).strip().lower()
            rest = lower_url.split("://", 1)[1]
            authority = rest.split("/", 1)[0]
            if "@" in authority:
                authority = authority.split("@", 1)[1]
            host = authority.split(":", 1)[0].strip()
            if host.startswith("[") and host.endswith("]"):
                host = host[1:-1]
            return host

        def _is_private_or_local_host(host: str) -> bool:
            if host == "" or host == "localhost" or host == "::1":
                return True
            if host.endswith(".local") or host.endswith(".internal") or host.endswith(".lan"):
                return True
            if host.startswith("127.") or host.startswith("10.") or host.startswith("192.168.") or host.startswith("169.254."):
                return True
            if host.startswith("172."):
                parts = host.split(".")
                if len(parts) >= 2 and parts[1].isdigit():
                    second = int(parts[1])
                    if second >= 16 and second <= 31:
                        return True
            if host.startswith("fc") or host.startswith("fd"):
                return True
            return False

        def _validate_source_url(raw_url: str, field_name: str, required: bool) -> str:
            url = str(raw_url).strip()
            if len(url) == 0:
                if required:
                    raise gl.vm.UserError(field_name + " is required")
                return ""
            lower_url = url.lower()
            if not lower_url.startswith("https://"):
                raise gl.vm.UserError(field_name + " must start with https://")
            if " " in url:
                raise gl.vm.UserError(field_name + " cannot contain spaces")
            host = _extract_host(url)
            if host == "":
                raise gl.vm.UserError(field_name + " has an invalid host")
            if _is_private_or_local_host(host):
                raise gl.vm.UserError(field_name + " must be a public URL")
            return url

        def _fetch_source(url: str):
            if url == "":
                return "[NOT PROVIDED]", 0, "not_provided"
            last_status = "fetch_error"
            for _ in range(2):
                try:
                    rendered = gl.nondet.web.render(url, mode="text")
                    rendered_text = ""
                    if rendered:
                        rendered_text = str(rendered).strip()
                    if len(rendered_text) > 0:
                        return rendered_text[:3000], 1, "ok"
                    last_status = "empty"
                except Exception:
                    last_status = "fetch_error"
            if last_status == "empty":
                return "[UNAVAILABLE OR EMPTY]", 0, "empty"
            return "[FETCH ERROR]", 0, "fetch_error"

        def _normalize_verdict(raw_verdict: str) -> str:
            upper_text = str(raw_verdict).strip().upper()
            cleaned = ""
            for ch in upper_text:
                if ("A" <= ch <= "Z") or ch == "_":
                    cleaned += ch
                elif ch == " " or ch == "-":
                    cleaned += "_"
            while "__" in cleaned:
                cleaned = cleaned.replace("__", "_")
            cleaned = cleaned.strip("_")
            if cleaned == "COMPLIANT":
                return "COMPLIANT"
            if cleaned == "MINOR_VIOLATION":
                return "MINOR_VIOLATION"
            if cleaned == "VIOLATION":
                return "VIOLATION"
            if cleaned == "INCONCLUSIVE":
                return "INCONCLUSIVE"
            return "INCONCLUSIVE"

        target = str(existing)
        cid = str(company_id)
        url1 = _validate_source_url(official_report_url, "official_report_url", True)
        url2 = _validate_source_url(iot_sensor_url, "iot_sensor_url", False)
        url3 = _validate_source_url(ngo_watchdog_url, "ngo_watchdog_url", False)

        consensus_principle = (
            "Two audit results are equivalent if the FIRST LINE exactly matches one allowed verdict token: "
            "COMPLIANT, MINOR_VIOLATION, VIOLATION, or INCONCLUSIVE. "
            "Minor textual differences in the second-line justification are acceptable."
        )

        def leader_audit_fn():
            report_text, report_ok, report_status = _fetch_source(url1)
            sensor_text, sensor_ok, sensor_status = _fetch_source(url2)
            ngo_text, ngo_ok, ngo_status = _fetch_source(url3)

            available_sources = report_ok + sensor_ok + ngo_ok
            if available_sources < 2:
                return (
                    "INCONCLUSIVE\n"
                    "Insufficient independent evidence sources (need at least 2). "
                    "source_status="
                    + report_status + ","
                    + sensor_status + ","
                    + ngo_status
                )

            prompt = (
                "You are a senior ESG (Environmental, Social, Governance) compliance auditor "
                "with expertise in detecting corporate greenwashing.\n\n"
                "COMPANY UNDER AUDIT: " + cid + "\n"
                "SELF-DECLARED EMISSION REDUCTION TARGET: " + target + "% reduction\n\n"
                "YOUR TASK:\n"
                "Analyze the three data sources below and determine whether the company's "
                "environmental claims are truthful, partially misleading, or fraudulent.\n\n"
                "HARD RULE:\n"
                "- You may output COMPLIANT, MINOR_VIOLATION, or VIOLATION only when at least TWO "
                "independent sources provide usable evidence.\n"
                "- If evidence is insufficient, output INCONCLUSIVE.\n\n"
                "GRADING CRITERIA:\n"
                "- COMPLIANT: Official claims are CONSISTENT with IoT data and NGO findings. "
                "No evidence of greenwashing. Emissions or sustainability metrics align with stated targets.\n"
                "- MINOR_VIOLATION: Some inconsistencies found, but not systematic fraud. "
                "Company may be exaggerating progress or missing targets by a small margin (<20%).\n"
                "- VIOLATION: Clear evidence that official claims CONTRADICT real-world data. "
                "Emissions are rising while the company claims reductions, OR NGO reports "
                "document active environmental harm, labor abuse, or cover-ups.\n"
                "- INCONCLUSIVE: Insufficient, conflicting, or inaccessible data to make a verdict.\n\n"
                "--- SOURCE 1: OFFICIAL COMPANY REPORT ---\n" + report_text + "\n\n"
                "--- SOURCE 2: INDEPENDENT / IoT REAL-WORLD DATA ---\n" + sensor_text + "\n\n"
                "--- SOURCE 3: NGO WATCHDOG INVESTIGATION ---\n" + ngo_text + "\n\n"
                "INSTRUCTIONS:\n"
                "1. On the FIRST LINE, output EXACTLY ONE of these four words (no punctuation):\n"
                "   COMPLIANT  |  MINOR_VIOLATION  |  VIOLATION  |  INCONCLUSIVE\n"
                "2. On the SECOND LINE, write your justification in EXACTLY 1 sentence (max 30 words). "
                "Be specific - cite the key contradiction or confirmation you found.\n"
                "3. Do NOT output anything else. No preamble, no bullet points, no markdown.\n"
            )
            return str(gl.nondet.exec_prompt(prompt))

        try:
            result = gl.eq_principle.prompt_comparative(
                leader_audit_fn,
                principle=consensus_principle,
            )
        except Exception as e:
            error_summary = ("Consensus failed: " + str(e))[:200]
            self._append_audit_record(company_id, "INCONCLUSIVE", error_summary, "0", u256(0))
            AuditError(cid, error_summary).emit()
            AuditCompleted(cid, "INCONCLUSIVE", error_summary).emit()
            return

        try:
            result_str = str(result)
            lines = []
            for ln in result_str.splitlines():
                stripped = ln.strip()
                if stripped:
                    lines.append(stripped)

            verdict = "INCONCLUSIVE"
            summary = "No details provided."

            if len(lines) > 0:
                verdict = _normalize_verdict(lines[0])

            if len(lines) > 1:
                summary = str(lines[1])[:200]

            current_balance = self.escrow_balances.get(company_id, u256(0))
            current_score = self.ethos_scores.get(company_id, u256(100))
            score_change = "0"
            slash = u256(0)

            if verdict == "COMPLIANT":
                # Reward: +10 score, unlock 10% escrow
                score_change = "+10"
                unlock = current_balance * u256(10) // u256(100)
                self.escrow_balances[company_id] = current_balance - unlock
                owner_dep_key = company_id + "|" + str(owner)
                current_withdrawable = self.withdrawable_amounts.get(owner_dep_key, u256(0))
                self.withdrawable_amounts[owner_dep_key] = current_withdrawable + unlock
                new_score = current_score + u256(10)
                if new_score > u256(1000):
                    new_score = u256(1000)
                self.ethos_scores[company_id] = new_score

            elif verdict == "MINOR_VIOLATION":
                # Warning: -10 score, slash 10% escrow
                score_change = "-10"
                slash = current_balance * u256(10) // u256(100)
                self.escrow_balances[company_id] = current_balance - slash
                owner_dep_key = company_id + "|" + str(owner)
                owner_deposit = self.depositor_amounts.get(owner_dep_key, u256(0))
                if owner_deposit > slash:
                    self.depositor_amounts[owner_dep_key] = owner_deposit - slash
                else:
                    self.depositor_amounts[owner_dep_key] = u256(0)
                if current_score >= u256(10):
                    self.ethos_scores[company_id] = current_score - u256(10)
                else:
                    self.ethos_scores[company_id] = u256(0)

            elif verdict == "VIOLATION":
                # Penalize: -30 score, slash 30% escrow
                score_change = "-30"
                slash = current_balance * u256(30) // u256(100)
                self.escrow_balances[company_id] = current_balance - slash
                owner_dep_key = company_id + "|" + str(owner)
                owner_deposit = self.depositor_amounts.get(owner_dep_key, u256(0))
                if owner_deposit > slash:
                    self.depositor_amounts[owner_dep_key] = owner_deposit - slash
                else:
                    self.depositor_amounts[owner_dep_key] = u256(0)
                if current_score >= u256(30):
                    self.ethos_scores[company_id] = current_score - u256(30)
                else:
                    self.ethos_scores[company_id] = u256(0)

            self._append_audit_record(company_id, verdict, summary, score_change, slash)

            AuditCompleted(cid, verdict, summary).emit()

        except Exception as e:
            error_summary = ("Post-processing error: " + str(e))[:200]
            self._append_audit_record(company_id, "INCONCLUSIVE", error_summary, "0", u256(0))
            AuditError(cid, error_summary).emit()
            AuditCompleted(cid, "INCONCLUSIVE", error_summary).emit()

    @gl.public.view
    def get_company_profile(self, company_id: str):
        existing = self.targets.get(company_id, "")
        if existing == "":
            return {"error": "Company not registered"}

        indexed_count = self.company_audit_counts.get(company_id, u256(0))
        indexed_count_int = int(indexed_count)
        audits = []

        if indexed_count_int > 0:
            latest_index = indexed_count - u256(1)
            audit_key = self._company_audit_key(company_id, latest_index)
            audits.append({
                "verdict": str(self.company_audit_verdicts.get(audit_key, "INCONCLUSIVE")),
                "summary": str(self.company_audit_summaries.get(audit_key, "No details provided.")),
                "score_change": str(self.company_audit_score_changes.get(audit_key, "0")),
                "slash_amount": int(self.company_audit_slash_amounts.get(audit_key, u256(0))),
            })

        owner = str(self.company_owners.get(company_id, ""))
        dep_key = company_id + "|" + owner
        withdrawable = self.withdrawable_amounts.get(dep_key, u256(0))

        return {
            "company_id": company_id,
            "target_reduction": existing,
            "owner": owner,
            "ethos_score": int(self.ethos_scores.get(company_id, u256(100))),
            "escrow_balance": int(self.escrow_balances.get(company_id, u256(0))),
            "withdrawable_amount": int(withdrawable),
            "audit_count": indexed_count_int,
            "latest_verdict": str(self.latest_verdicts.get(company_id, "")),
            "audit_history": audits,
        }

    @gl.public.view
    def get_company_audit_page(self, company_id: str, offset: u256, limit: u256):
        existing = self.targets.get(company_id, "")
        if existing == "":
            return {"error": "Company not registered"}

        total = self.company_audit_counts.get(company_id, u256(0))
        start = offset
        if start > total:
            start = total

        page_limit = limit
        if page_limit < u256(1):
            page_limit = u256(1)
        if page_limit > u256(50):
            page_limit = u256(50)

        end = start + page_limit
        if end > total:
            end = total
        has_next = end < total
        next_offset = int(end) if has_next else None

        items = []
        for i in range(int(start), int(end)):
            audit_key = self._company_audit_key(company_id, u256(i))
            items.append({
                "verdict": str(self.company_audit_verdicts.get(audit_key, "INCONCLUSIVE")),
                "summary": str(self.company_audit_summaries.get(audit_key, "No details provided.")),
                "score_change": str(self.company_audit_score_changes.get(audit_key, "0")),
                "slash_amount": int(self.company_audit_slash_amounts.get(audit_key, u256(0))),
            })

        return {
            "company_id": company_id,
            "offset": int(start),
            "limit": int(page_limit),
            "total": int(total),
            "items": items,
            "has_next": has_next,
            "next_offset": next_offset,
        }

    @gl.public.view
    def get_platform_stats(self):
        return {
            "total_companies": int(self.company_count),
            "total_audits": len(self.audit_history),
        }
