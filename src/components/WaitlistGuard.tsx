
import { ReactNode } from "react";

interface WaitlistGuardProps {
  children: ReactNode;
  requireVerified?: boolean;
  fallback?: ReactNode;
}

const WaitlistGuard = ({ children }: WaitlistGuardProps) => {
  // Always render children, regardless of waitlist status
  return <>{children}</>;
};

export default WaitlistGuard;
