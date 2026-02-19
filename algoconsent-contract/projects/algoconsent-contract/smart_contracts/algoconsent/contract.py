from algopy import ARC4Contract, String, UInt64, Global
from algopy.arc4 import abimethod


class AlgoConsent(ARC4Contract):

    consent_hash: String
    consent_active: UInt64
    audit_anchor: String

    @abimethod()
    def create_consent(self, consent_hash: String) -> String:
        self.consent_hash = consent_hash
        self.consent_active = UInt64(1)
        return String("Consent created")

    @abimethod()
    def revoke_consent(self) -> String:
        self.consent_active = UInt64(0)
        return String("Consent revoked")

    @abimethod()
    def anchor_audit_hash(self, audit_hash: String) -> String:
        self.audit_anchor = audit_hash
        return String("Audit hash anchored")

    @abimethod()
    def get_consent_status(self) -> UInt64:
        return self.consent_active
