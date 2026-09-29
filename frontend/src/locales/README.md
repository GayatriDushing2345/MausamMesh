# MausamMesh Localization Manifest (i18n)

This directory contains the 11 official Indian language localization files for the MausamMesh Panchayat Weather Intelligence Platform.

## Language Coverage & Verification Status

| Code | Language | Native Name | Script | Status | Translation Review Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `en` | **English** | English | Latin | **Verified Ground Truth** | Master schema definition for all portal strings. |
| `hi` | **Hindi** | हिन्दी | Devanagari | **Verified IMD Terminology** | Verified with official IMD Agromet Bulletin standards (वर्षा, आर्द्रता, पूर्वानुमान). |
| `mr` | **Marathi** | मराठी | Devanagari | **Verified DAMU Terminology** | Standardised against Maharashtra Agromet / MPKV Rahuri bulletins. |
| `gu` | **Gujarati** | ગુજરાતી | Gujarati | *Needs Native Review* | Machine-drafted with agrometeorological terminology check. |
| `bn` | **Bengali** | বাংলা | Bengali | *Needs Native Review* | Machine-drafted with agrometeorological terminology check. |
| `ta` | **Tamil** | தமிழ் | Tamil | *Needs Native Review* | Machine-drafted with agrometeorological terminology check. |
| `te` | **Telugu** | తెలుగు | Telugu | *Needs Native Review* | Machine-drafted with agrometeorological terminology check. |
| `kn` | **Kannada** | ಕನ್ನಡ | Kannada | *Needs Native Review* | Machine-drafted with agrometeorological terminology check. |
| `ml` | **Malayalam** | മലയാളം | Malayalam | *Needs Native Review* | Machine-drafted with agrometeorological terminology check. |
| `pa` | **Punjabi** | ਪੰਜਾਬੀ | Gurmukhi | *Needs Native Review* | Machine-drafted with agrometeorological terminology check. |
| `or` | **Odia** | ଓଡ଼ିଆ | Odia | *Needs Native Review* | Machine-drafted with agrometeorological terminology check. |

## Fallback Chain Architecture
`Selected Language` $\rightarrow$ `Hindi (hi)` $\rightarrow$ `English (en)`

## Quality Enforcement
CI/Dev pipeline enforces 100% key parity via:
```bash
npm run i18n:check
```
