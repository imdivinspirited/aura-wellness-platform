import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useTranslation } from '@/lib/i18n';

/** Must match `Index.tsx` personal home query. */
export const PERSONAL_HOME_VIEW = 'you';

/**
 * Logo / brand click: go to standard home from inner pages; on `/` with a saved mood,
 * toggle between standard and personalized (`/?view=you`).
 */
export function useLogoHomeNavigation() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { currentMood } = useUserStore();
  const { t } = useTranslation();

  const hasMood = Boolean(currentMood);
  const isPersonal = new URLSearchParams(search).get('view') === PERSONAL_HOME_VIEW;
  const isOnHome = pathname === '/';

  const goHomeViaLogo = useCallback(() => {
    if (!hasMood) {
      navigate('/');
      return;
    }
    if (isOnHome) {
      navigate(isPersonal ? '/' : `/?view=${PERSONAL_HOME_VIEW}`);
    } else {
      navigate('/');
    }
  }, [hasMood, isOnHome, isPersonal, navigate]);

  const logoAriaLabel = useMemo(() => {
    if (hasMood && isOnHome) {
      return t('home.index.logoToggleAria' as 'home.index.logoToggleAria');
    }
    return t('nav.home' as 'nav.home');
  }, [hasMood, isOnHome, t]);

  return { goHomeViaLogo, logoAriaLabel };
}
