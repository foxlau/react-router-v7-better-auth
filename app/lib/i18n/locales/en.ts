import resource from "zod-i18n-map/locales/en/zod.json";

const translation = {
  title: "React Router(v7) <0/> with Better Auth",
  description:
    "This is a template that can be deployed on Cloudflare Workers, built with React Router v7 (Remix), Better Auth, Drizzle ORM, and D1.",
  common: {
    refresh: "Refresh",
    submit: "Submit",
    cancel: "Cancel",
    add: "Add",
    adding: "Adding...",
    delete: "Delete",
    deleting: "Deleting...",
    save: "Save",
    saving: "Saving...",
  },
  user: {
    name: "Name",
    token: "Token",
    email: "Email",
    password: "Password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
  },
  auth: {
    signIn: "Sign In",
    signingIn: "Signing in...",
    signInTitle: "Sign in to your account",
    signInWelcome: "Welcome back! Please sign in to continue.",
    signInWith: "Login with <0>{{name}}</0>",
    signUp: "Sign Up",
    signingUp: "Signing Up...",
    signUpContinue: "Or continue with",
    signUpTitle: "Create your account",
    signUpWelcome: "Welcome! Please fill in the details to get started.",
    signingUpSuccess:
      "Sign up successful! Please check your email for a verification link.",
    enterPassword: "Enter a unique password",
    signOut: "Sign Out",
    signingOut: "Signing Out...",
    forgotPasswordTitle: "Forgot your password?",
    forgotPasswordDescription:
      "Enter your email address and we will send you a password reset link.",
    enterEmail: "Enter your email",
    sendResetLink: "Send reset link",
    sendingResetLink: "Sending reset link...",
    sentLinkSuccess: "Password reset link sent to your email!",
    resetPasswordTitle: "Reset your password",
    resetPasswordDescription:
      "Enter your new password below, minimum 8 characters, maximum 32 characters.",
    resetPassword: "Reset Password",
    resettingPassword: "Resetting Password...",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    backSignIn: "Back to sign in",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    serviceAndPolicy:
      "By clicking continue, you agree to our <0>Terms of Service</0> and <1>Privacy Policy</1>.",
  },
  home: {
    title: "Home",
    start: "Get Started",
    star: "Star on Github",
  },
  todo: {
    title: "Todo List",
    today: "Today is",
    add: "Add a todo",
    noFound: "No todos found",
  },
  dashboard: {
    title: "Dashboard",
    welcome:
      "Welcome to your dashboard. Here you can manage your todos and account settings.",
    todo: {
      label: "Todo List",
      description: "Create and manage your todos",
    },
    account: {
      label: "Account Settings",
      description: "Manage your account settings",
    },
    admin: {
      label: "Admin Dashboard",
    },
  },
  account: {
    title: "Account",
    description: "Click avatar to change profile picture.",
    deleted: "Account deleted.",
    avatar: "Avatar",
    noAvatar: "No avatar to delete.",
    avatarDeleted: "Avatar deleted.",
    avatarUpdated: "Avatar updated.",
    nameEmail: "Name & Email address",
    currentSignIn: "Current sign in",
    signInAs: "You are signed in as",
    deleteAccount: "Delete account",
    permanentlyDeleteAccount: "Permanently delete your account.",
    confirmation: "Final confirmation",
    confirmationWarn:
      "This action cannot be undone. To confirm, please enter the email address",
  },
  appearance: {
    title: "Appearance",
    description:
      "Customize the appearance of the app. Automatically switch between day and night themes.",
  },
  connections: {
    title: "Connections",
    description: "You can connect your account to third-party services below.",
  },
  sessions: {
    title: "Sessions",
    description:
      "If necessary, you can sign out of all other browser sessions. Some of your recent sessions are listed below, but this list may not be complete. If you think your account has been compromised, you should also update your password.",
    noSessions: "No sessions found.",
    otherSignedOut: "Other sessions signed out successfully.",
  },
  password: {
    title: "Password",
    change: {
      title: "Change your password",
      description:
        "If you have already set your password, you can update it here. If you have forgotten your password, please reset it below.",
      success: "Password changed successfully! Other sessions revoked.",
      action:
        "Make changes to your password here. You can change your password and set a new password.",
    },
    reset: {
      title: "Reset your password",
      description:
        "If you have forgotten your password, you can reset it here. Alternatively, if have signed up via Github / Google and more, you can set your password here too.",
      success: "Password reset successfully! Please sign in again.",
    },
  },
  errors: {
    invalidData: "Invalid form data.",
    invalidIntent: "Invalid intent.",
    unexpected: "An unexpected error occurred.",
    loadingSessions: "Error loading sessions",
    signInFailed: "{{provider}} sign in failed.",
    invalidLoginMethod: "Invalid login method.",
    crashed: {
      title: "Oops! App Crashed 💥",
      description: "Please reload the page or try again later.",
    },
    notFound: {
      title: "Oops! Page Not Found.",
      description:
        "It seems like the page you're looking for does not exist or might have been removed.",
    },
  },
};

const zod = {
  custom: {
    ...translation.user,
    isRequired: "{{field}} is required.",
    passwordNotMatch: "New password and confirm password do not match.",
  },
  ...resource,
};

export default {
  translation,
  zod,
};
