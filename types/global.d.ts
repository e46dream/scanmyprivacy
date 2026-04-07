// Global type extensions for Navigator
declare global {
  interface Navigator {
    globalPrivacyControl?: {
      signal?: {
        aborted?: boolean;
      };
    };
  }
}
