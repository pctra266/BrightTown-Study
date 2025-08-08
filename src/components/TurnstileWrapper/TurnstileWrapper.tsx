import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string | undefined;
  isExpired: () => boolean;
}

interface TurnstileWrapperProps {
  siteKey: string;
  onSuccess?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  onLoad?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  language?: string;
  disabled?: boolean;
}

const TurnstileWrapper = forwardRef<TurnstileRef, TurnstileWrapperProps>(
  ({ 
    siteKey, 
    onSuccess, 
    onError, 
    onExpire, 
    onLoad, 
    theme = 'auto', 
    size = 'normal',
    language = 'en',
    disabled = false 
  }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
      },
      getResponse: () => {
        return turnstileRef.current?.getResponse();
      },
      isExpired: () => {
        return turnstileRef.current?.isExpired() ?? false;
      },
    }));

    if (!siteKey) {
      console.warn('Turnstile site key is required');
      return null;
    }

    return (
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        onLoad={onLoad}
        options={{
          theme,
          size,
          language, // Use the language parameter
        }}
        style={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      />
    );
  }
);

TurnstileWrapper.displayName = 'TurnstileWrapper';

export default TurnstileWrapper;
