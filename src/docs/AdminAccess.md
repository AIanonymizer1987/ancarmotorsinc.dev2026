# Accessing the Hidden Admin Dashboard

    The project includes a hidden admin dashboard reachable at the route:

    - /admin

    Access steps:
    1. Open the application in your browser.
    2. Sign in at the Login page: /login
       - Use the seeded admin credentials (created automatically on first load):
         - Email: admin@ancarmotors.com
         - Password: adminpass
    3. After successful sign-in, navigate to /admin (enter the URL directly or paste it in the address bar).
       - The Admin page is protected: only the seeded admin account (admin@ancarmotors.com) can access it. Non-admin users will see the Not Found page.
    
    Notes:
    - The admin account is seeded automatically by the AuthProvider into localStorage on first app load.
    - LocalStorage keys of interest:
      - Users list: `ancar_users_v1`
      - Current signed-in user: `ancar_current_user_v1`
      - Vehicles: `ancar_vehicles_v1`
      - Orders: `ancar_orders_v1`
    - If you lose the seeded admin user, you can remove `ancar_users_v1` from localStorage and refresh the app — the admin account will be re-seeded on the next AuthProvider initialization.