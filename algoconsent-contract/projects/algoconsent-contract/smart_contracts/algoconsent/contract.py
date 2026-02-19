from algopy import ARC4Contract, String, UInt64
from algopy.arc4 import abimethod


class AlgoConsent(ARC4Contract):

    consent_hash: String
    consent_active: UInt64
    audit_anchor: String

    @abimethod()
    def create(self, consent_hash: String) -> UInt64:
        self.consent_hash = consent_hash
        self.consent_active = UInt64(1)
        return UInt64(1)

    @abimethod()
    def revoke(self) -> UInt64:
        self.consent_active = UInt64(0)
        return UInt64(1)

    @abimethod()
    def anchor(self, audit_hash: String) -> UInt64:
        self.audit_anchor = audit_hash
        return UInt64(1)
