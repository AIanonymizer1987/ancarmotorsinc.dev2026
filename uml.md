graph TD
    A[User visits website] --> B{User logged in?}
    B -->|Yes| C[Access all features]
    B -->|No| D[Click Login/Register]
    D --> E{Existing user?}
    E -->|Yes| F[Enter email & password]
    E -->|No| G[Fill registration form]
    G --> G1[Enter name, email, phone, address, password]
    G1 --> H[Submit form]
    F --> H
    H --> I{Credentials valid?}
    I -->|No| J[Show error message]
    J --> F
    I -->|Yes| K[Generate JWT token]
    K --> L[Store in localStorage]
    L --> M[Redirect to Home]
    M --> N[Email verification prompt]
    N --> O{Verify email?}
    O -->|Yes| P[Send verification code/link]
    O -->|No| Q[Skip verification]
    P --> R[User verifies email]
    R --> S[Mark email as verified]
    S --> T[Access all features unlocked]