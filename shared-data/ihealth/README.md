# Shared mock data for iHealth Platform modules

JSON here is the **canonical demo contract** between roles (patient, doctor, B2B).

Runtime UIs currently still read TypeScript modules under `lib/` for speed.
Keep these JSON files in sync when changing the demo star patient (Ava Jackson).
Sarah Johnson remains an additional full-chart clinician patient.

| File | Used by |
|------|---------|
| `patients.json` | Patient 1.1 + Doctor 2.1 |
| `verification_request.json` | Patient verification banner (FraudShield mock) |
