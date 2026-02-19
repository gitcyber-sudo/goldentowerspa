# Error Code Registry: Golden Tower Spa (GTS) 🛡️

This document serves as the single source of truth for standardized error codes across the GTS application. 

> [!NOTE]
> **AI Protocol**: When implementing new error handling, future AI agents MUST:
> 1. Check this file for the next available ID.
> 2. Register new codes here immediately.
> 3. Use the format `[GTS-XXX]: Description`.

## Error Code Mapping

| Code | Functional Area | Component/Location | Description | Severity |
|:---|:---|:---|:---|:---|
| **GTS-101** | Global Auth | `src/context/AuthContext.tsx` | Critical failure during initial session check or initialization. | High |
| **GTS-102** | User Profile | `src/context/AuthContext.tsx` | Unexpected failure during User Profile lookup/fetch. | Medium |
| **GTS-201** | Services | `src/components/Services.tsx` | Failed to load the services menu from the database. | Medium |
| **GTS-301** | Authentication | `src/components/AuthModal.tsx` | General failure during Sign In or Sign Up attempt. | Medium |
| **GTS-401** | Booking | `src/hooks/useBooking.ts` | Failure during booking reservation submission to database. | High |

## Guidelines for New Codes

1.  **Prefix**: Always use `GTS-`.
2.  **Numbering**:
    *   `100-199`: Core Systems (Auth, Theme, Routing).
    *   `200-299`: Menu/Content Loading.
    *   `300-399`: User Interactions (Modals, Forms).
    *   `400-499`: Business Logic (Bookings, Payments).
    *   `500-599`: Specialist/Admin Protected Actions.
3.  **Searchability**: Ensure the code is wrapped in brackets `[GTS-XXX]` in the `console.error` and `logError` calls for maximum greppability.
