import { EnvVarWarning } from "./env-var-warning";
import HeaderAuth from "./header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export function SignInOut() {
  return <>{!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}</>;
}
